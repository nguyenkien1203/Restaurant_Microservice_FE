#!/bin/bash

# Deploy script for Elastic Beanstalk using AWS CLI and Docker
# This script builds a Docker image, pushes it to ECR, and deploys to Elastic Beanstalk

set -e  # Exit on error

# Configuration
APP_NAME="${EB_APP_NAME:-restaurant-frontend}"
ENV_NAME="${EB_ENV_NAME:-restaurant-frontend-prod}"
REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REPO_NAME="${APP_NAME}"
DOCKER_IMAGE_NAME="${ECR_REPO_NAME}:latest"
IMAGE_TAG="${IMAGE_TAG:-latest}"
S3_BUCKET="elasticbeanstalk-${REGION}-${AWS_ACCOUNT_ID}"

# EC2/Network Configuration (can be set via environment variables)
IAM_INSTANCE_PROFILE="${IAM_INSTANCE_PROFILE:-LabInstanceProfile}"
EC2_KEY_NAME="${EC2_KEY_NAME:-vockey}"
VPC_ID="${VPC_ID:-vpc-0be3bafeb062c5577}" 
SUBNETS="${SUBNETS:-subnet-07e1b6ff4b083475a,subnet-0a5d717f4c03d4308}"
SG_NAME="${SG_NAME:-${APP_NAME}-eb-sg}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Restaurant Frontend Deployment ===${NC}"

# Resolve VITE_API_BASE_URL for Docker build (Vite bakes env vars at build time)
# Priority:
# 1) exported env var VITE_API_BASE_URL
# 2) .env file in repo (supports formats like: VITE_API_BASE_URL=..., with optional spaces/quotes)
if [ -z "${VITE_API_BASE_URL:-}" ] && [ -f ".env" ]; then
    VITE_API_BASE_URL_FROM_ENV_FILE=$(grep -E '^[[:space:]]*VITE_API_BASE_URL[[:space:]]*=' .env | tail -n 1 | sed -E 's/^[[:space:]]*VITE_API_BASE_URL[[:space:]]*=[[:space:]]*//; s/[[:space:]]*$//; s/^["'\''](.*)["'\'']$/\1/')
    if [ -n "${VITE_API_BASE_URL_FROM_ENV_FILE}" ]; then
        export VITE_API_BASE_URL="${VITE_API_BASE_URL_FROM_ENV_FILE}"
    fi
fi

if [ -n "${VITE_API_BASE_URL:-}" ]; then
    echo -e "${GREEN}Using VITE_API_BASE_URL for build: ${VITE_API_BASE_URL}${NC}"
else
    echo -e "${YELLOW}VITE_API_BASE_URL not set. Frontend will fall back to its default (likely http://localhost:8080).${NC}"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${BLUE}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

# Get AWS Account ID if not set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
ECR_REPO_URI="${ECR_REGISTRY}/${ECR_REPO_NAME}"

echo -e "${GREEN}Using AWS Account: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${GREEN}Using Region: ${REGION}${NC}"
echo -e "${GREEN}ECR Repository URI: ${ECR_REPO_URI}${NC}"

# Function to create or get security group
create_or_get_security_group() {
    # Send all status messages to stderr so they don't get captured
    echo -e "\n${BLUE}Creating/getting security group...${NC}" >&2
    
    # Get VPC ID from first subnet if not provided
    if [ -z "$VPC_ID" ]; then
        FIRST_SUBNET=$(echo "$SUBNETS" | cut -d',' -f1)
        echo -e "${BLUE}Auto-detecting VPC ID from subnet: ${FIRST_SUBNET}${NC}" >&2
        VPC_ID=$(aws ec2 describe-subnets \
            --subnet-ids "$FIRST_SUBNET" \
            --region "${REGION}" \
            --query 'Subnets[0].VpcId' \
            --output text 2>/dev/null || echo "")
        
        if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
            echo -e "${RED}Error: Could not determine VPC ID. Please set VPC_ID environment variable.${NC}" >&2
            exit 1
        fi
        echo -e "${GREEN}Detected VPC ID: ${VPC_ID}${NC}" >&2
    fi
    
    # Check if security group already exists
    SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${SG_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
        --region "${REGION}" \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ] && [ "$SG_ID" != "null" ]; then
        echo -e "${GREEN}Security group already exists: ${SG_ID}${NC}" >&2
    else
        echo -e "${YELLOW}Creating security group: ${SG_NAME}${NC}" >&2
        SG_ID=$(aws ec2 create-security-group \
            --group-name "${SG_NAME}" \
            --description "Security group for ${APP_NAME} Elastic Beanstalk environment" \
            --vpc-id "${VPC_ID}" \
            --region "${REGION}" \
            --query 'GroupId' \
            --output text)
        
        if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
            echo -e "${RED}Error: Failed to create security group${NC}" >&2
            exit 1
        fi
        
        echo -e "${GREEN}Security group created: ${SG_ID}${NC}" >&2
        
        # Add inbound rule to allow HTTP traffic from ALB
        # Note: Elastic Beanstalk will manage ALB security group rules automatically
        # This allows traffic from the VPC for health checks
        echo -e "${BLUE}Adding inbound rules...${NC}" >&2
        aws ec2 authorize-security-group-ingress \
            --group-id "${SG_ID}" \
            --protocol tcp \
            --port 8081 \
            --cidr 10.0.0.0/8 \
            --region "${REGION}" 2>/dev/null || echo -e "${YELLOW}Inbound rule may already exist${NC}" >&2
        
        # Allow traffic from same security group (for internal communication)
        aws ec2 authorize-security-group-ingress \
            --group-id "${SG_ID}" \
            --protocol tcp \
            --port 8081 \
            --source-group "${SG_ID}" \
            --region "${REGION}" 2>/dev/null || echo -e "${YELLOW}Self-referencing rule may already exist${NC}" >&2
    fi
    
    # Output only the SG_ID to stdout (this gets captured)
    echo "$SG_ID"
}

# Function to update eb-config.json with dynamic values
update_eb_config() {
    echo -e "\n${BLUE}Updating eb-config.json with dynamic values...${NC}"
    
    # Check if eb-config.json exists
    if [ ! -f "eb-config.json" ]; then
        echo -e "${YELLOW}eb-config.json not found, creating default...${NC}"
        cat > eb-config.json <<'EOF'
[]
EOF
    fi
    
    # Pass variables as environment variables to Python for safe handling
    IAM_INSTANCE_PROFILE_ESC="$IAM_INSTANCE_PROFILE" \
    EC2_KEY_NAME_ESC="$EC2_KEY_NAME" \
    SECURITY_GROUP_ID_ESC="$SECURITY_GROUP_ID" \
    SUBNETS_ESC="$SUBNETS" \
    python3 <<'PYTHON_SCRIPT'
import json
import os

# Read existing config
try:
    with open('eb-config.json', 'r') as f:
        config = json.load(f)
except:
    config = []

# Create a dictionary for quick lookup
config_dict = {item['Namespace'] + '|' + item['OptionName']: item for item in config}

# Function to update or add config option
def set_config(namespace, option, value):
    key = f"{namespace}|{option}"
    if key in config_dict:
        config_dict[key]['Value'] = value
    else:
        config_dict[key] = {
            "Namespace": namespace,
            "OptionName": option,
            "Value": value
        }

# Get values from environment variables
iam_instance_profile = os.environ.get('IAM_INSTANCE_PROFILE_ESC', '')
ec2_key_name = os.environ.get('EC2_KEY_NAME_ESC', '')
security_group_id = os.environ.get('SECURITY_GROUP_ID_ESC', '')
subnets = os.environ.get('SUBNETS_ESC', '')

# Update with dynamic values
if iam_instance_profile:
    set_config("aws:autoscaling:launchconfiguration", "IamInstanceProfile", iam_instance_profile)
if ec2_key_name:
    set_config("aws:autoscaling:launchconfiguration", "EC2KeyName", ec2_key_name)
if security_group_id:
    set_config("aws:autoscaling:launchconfiguration", "SecurityGroups", security_group_id)
if subnets:
    set_config("aws:ec2:vpc", "Subnets", subnets)
    set_config("aws:ec2:vpc", "ELBSubnets", subnets)

# Convert back to list
config = list(config_dict.values())

# Write updated config
with open('eb-config.json', 'w') as f:
    json.dump(config, f, indent=4)

print("Updated eb-config.json")
PYTHON_SCRIPT

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}eb-config.json updated successfully${NC}"
        echo -e "${BLUE}Security Group ID: ${SECURITY_GROUP_ID}${NC}"
        echo -e "${BLUE}IAM Instance Profile: ${IAM_INSTANCE_PROFILE}${NC}"
        echo -e "${BLUE}EC2 Key Name: ${EC2_KEY_NAME}${NC}"
    else
        echo -e "${RED}Error: Failed to update eb-config.json${NC}"
        exit 1
    fi
}

# Step 0: Create or get security group
SECURITY_GROUP_ID=$(create_or_get_security_group)

# Step 0.5: Update eb-config.json with dynamic values
update_eb_config

# Step 1: Create ECR repository if it doesn't exist
echo -e "\n${BLUE}Step 1: Checking ECR repository...${NC}"
if ! aws ecr describe-repositories --repository-names "${ECR_REPO_NAME}" --region "${REGION}" &> /dev/null; then
    echo -e "${YELLOW}Creating ECR repository: ${ECR_REPO_NAME}${NC}"
    aws ecr create-repository \
        --repository-name "${ECR_REPO_NAME}" \
        --region "${REGION}" \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256
    echo -e "${GREEN}ECR repository created${NC}"
else
    echo -e "${GREEN}ECR repository already exists${NC}"
fi

# Step 2: Login to ECR
echo -e "\n${BLUE}Step 2: Logging into ECR...${NC}"
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
echo -e "${GREEN}Logged into ECR${NC}"

# Step 3: Build Docker image
echo -e "\n${BLUE}Step 3: Building Docker image...${NC}"
if [ -n "${VITE_API_BASE_URL:-}" ]; then
    docker build --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL}" -t "${DOCKER_IMAGE_NAME}" .
else
    docker build -t "${DOCKER_IMAGE_NAME}" .
fi
echo -e "${GREEN}Docker image built successfully${NC}"

# Step 4: Tag Docker image
echo -e "\n${BLUE}Step 4: Tagging Docker image...${NC}"
docker tag "${DOCKER_IMAGE_NAME}" "${ECR_REPO_URI}:${IMAGE_TAG}"
docker tag "${DOCKER_IMAGE_NAME}" "${ECR_REPO_URI}:latest"
echo -e "${GREEN}Docker image tagged${NC}"

# Step 5: Push Docker image to ECR
echo -e "\n${BLUE}Step 5: Pushing Docker image to ECR...${NC}"
docker push "${ECR_REPO_URI}:${IMAGE_TAG}"
docker push "${ECR_REPO_URI}:latest"
echo -e "${GREEN}Docker image pushed to ECR${NC}"

# Step 6: Check if Elastic Beanstalk application exists
echo -e "\n${BLUE}Step 6: Checking Elastic Beanstalk application...${NC}"
APP_EXISTS=$(aws elasticbeanstalk describe-applications \
    --application-names "${APP_NAME}" \
    --region "${REGION}" \
    --query 'Applications[0].ApplicationName' \
    --output text 2>/dev/null || echo "None")

if [ "$APP_EXISTS" == "None" ] || [ -z "$APP_EXISTS" ]; then
    echo -e "${YELLOW}Creating Elastic Beanstalk application: ${APP_NAME}${NC}"
    if aws elasticbeanstalk create-application \
        --application-name "${APP_NAME}" \
        --description "Restaurant Microservice Frontend" \
        --region "${REGION}"; then
        echo -e "${GREEN}Elastic Beanstalk application created${NC}"
    else
        echo -e "${RED}Error: Failed to create Elastic Beanstalk application${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Elastic Beanstalk application exists${NC}"
fi

# Step 7: Check if Elastic Beanstalk environment exists
echo -e "\n${BLUE}Step 7: Checking Elastic Beanstalk environment...${NC}"
if ! aws elasticbeanstalk describe-environments --application-name "${APP_NAME}" --environment-names "${ENV_NAME}" --region "${REGION}" --query 'Environments[0]' &> /dev/null || [ "$(aws elasticbeanstalk describe-environments --application-name "${APP_NAME}" --environment-names "${ENV_NAME}" --region "${REGION}" --query 'Environments[0].Status' --output text 2>/dev/null)" != "Ready" ]; then
    echo -e "${YELLOW}Environment does not exist or is not ready. Creating environment...${NC}"
    
    # Create application version
    VERSION_LABEL="v$(date +%Y%m%d%H%M%S)"
    echo -e "${BLUE}Creating application version: ${VERSION_LABEL}${NC}"
    
    # Create a zip file with Dockerrun.aws.json
    cat > Dockerrun.aws.json <<EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "${ECR_REPO_URI}:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8081"
    }
  ],
  "Environment": [
    {
      "Name": "PORT",
      "Value": "8081"
    },
    {
      "Name": "NODE_ENV",
      "Value": "production"
    }
  ]
}
EOF
    
    # Create deployment package
    if [ -d ".ebextensions" ]; then
        zip -q deploy-${VERSION_LABEL}.zip Dockerrun.aws.json .ebextensions -r
    else
        zip -q deploy-${VERSION_LABEL}.zip Dockerrun.aws.json
    fi
    
    # Create S3 bucket for Elastic Beanstalk if it doesn't exist
    if ! aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
        echo -e "${YELLOW}Creating S3 bucket for Elastic Beanstalk: ${S3_BUCKET}${NC}"
        if [ "${REGION}" == "us-east-1" ]; then
            aws s3 mb "s3://${S3_BUCKET}" --region "${REGION}"
        else
            aws s3 mb "s3://${S3_BUCKET}" --region "${REGION}" --create-bucket-configuration LocationConstraint="${REGION}"
        fi
        
        # Configure bucket to allow ACLs (required by Elastic Beanstalk)
        echo -e "${BLUE}Configuring S3 bucket to allow ACLs...${NC}"
        aws s3api put-bucket-ownership-controls \
            --bucket "${S3_BUCKET}" \
            --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerPreferred}]' \
            --region "${REGION}" 2>/dev/null || echo -e "${YELLOW}Bucket ownership may already be configured${NC}"
        aws s3api put-bucket-acl \
            --bucket "${S3_BUCKET}" \
            --acl private \
            --region "${REGION}" 2>/dev/null || echo -e "${YELLOW}Bucket ACL may already be configured${NC}"
    else
        # Ensure existing bucket allows ACLs
        echo -e "${BLUE}Ensuring S3 bucket allows ACLs...${NC}"
        aws s3api put-bucket-ownership-controls \
            --bucket "${S3_BUCKET}" \
            --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerPreferred}]' \
            --region "${REGION}" 2>/dev/null || true
    fi
    
    # Upload to S3
    S3_KEY="${APP_NAME}/${VERSION_LABEL}.zip"
    echo -e "${BLUE}Uploading deployment package to S3...${NC}"
    aws s3 cp "deploy-${VERSION_LABEL}.zip" "s3://${S3_BUCKET}/${S3_KEY}" --region "${REGION}"
    
    # Create application version
    aws elasticbeanstalk create-application-version \
    --application-name "${APP_NAME}" \
    --version-label "${VERSION_LABEL}" \
    --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${S3_KEY}" \
        --description "Deployment ${VERSION_LABEL}" \
        --region "${REGION}"
    
    # Check environment status - create if it doesn't exist or is terminated
    ENV_STATUS=$(aws elasticbeanstalk describe-environments \
        --application-name "${APP_NAME}" \
        --environment-names "${ENV_NAME}" \
        --region "${REGION}" \
        --query 'Environments[0].Status' \
        --output text 2>/dev/null || echo "None")
    
    if [ "$ENV_STATUS" == "None" ] || [ "$ENV_STATUS" == "Terminated" ]; then
        echo -e "${BLUE}Creating Elastic Beanstalk environment...${NC}"
        
        # If environment was terminated, wait a moment for cleanup
        if [ "$ENV_STATUS" == "Terminated" ]; then
            echo -e "${YELLOW}Previous environment was terminated. Waiting 10 seconds before creating new one...${NC}"
            sleep 10
        fi
        
        # Build create-environment command
        CREATE_ENV_CMD="aws elasticbeanstalk create-environment \
            --application-name \"${APP_NAME}\" \
            --environment-name \"${ENV_NAME}\" \
            --solution-stack-name \"64bit Amazon Linux 2 v4.5.1 running Docker\" \
            --version-label \"${VERSION_LABEL}\" \
            --region \"${REGION}\""
        
        # Add option-settings if eb-config.json exists
        if [ -f "eb-config.json" ]; then
            echo -e "${BLUE}Using configuration from eb-config.json...${NC}"
            CREATE_ENV_CMD="${CREATE_ENV_CMD} --option-settings file://eb-config.json"
        else
            echo -e "${YELLOW}No eb-config.json found, using default settings...${NC}"
        fi
        
        # Execute the command
        eval "${CREATE_ENV_CMD}"
        
        echo -e "${YELLOW}Environment creation initiated. This may take 5-10 minutes...${NC}"
        echo -e "${BLUE}You can monitor the status with:${NC}"
        echo -e "  aws elasticbeanstalk describe-environments --application-name ${APP_NAME} --environment-names ${ENV_NAME} --region ${REGION}"
    else
        # Update existing environment (only if status is not Terminated)
        echo -e "${BLUE}Updating environment...${NC}"
        aws elasticbeanstalk update-environment \
            --application-name "${APP_NAME}" \
            --environment-name "${ENV_NAME}" \
            --version-label "${VERSION_LABEL}" \
            --region "${REGION}"
    fi
    
    rm -f "deploy-${VERSION_LABEL}.zip"
else
    # Step 8: Deploy new version to existing environment
    echo -e "\n${BLUE}Step 8: Deploying new version...${NC}"
    
    VERSION_LABEL="v$(date +%Y%m%d%H%M%S)"
    
    # Create Dockerrun.aws.json with current ECR image
    cat > Dockerrun.aws.json <<EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "${ECR_REPO_URI}:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8081"
    }
  ],
  "Environment": [
    {
      "Name": "PORT",
      "Value": "8081"
    },
    {
      "Name": "NODE_ENV",
      "Value": "production"
    }
  ]
}
EOF
    
    # Create deployment package
    if [ -d ".ebextensions" ]; then
        zip -q deploy-${VERSION_LABEL}.zip Dockerrun.aws.json .ebextensions -r
    else
        zip -q deploy-${VERSION_LABEL}.zip Dockerrun.aws.json
    fi
    
    # Upload to S3
    S3_BUCKET="elasticbeanstalk-${REGION}-${AWS_ACCOUNT_ID}"
    S3_KEY="${APP_NAME}/${VERSION_LABEL}.zip"
    echo -e "${BLUE}Uploading deployment package to S3...${NC}"
    aws s3 cp "deploy-${VERSION_LABEL}.zip" "s3://${S3_BUCKET}/${S3_KEY}" --region "${REGION}"
    
    # Create application version
    echo -e "${BLUE}Creating application version: ${VERSION_LABEL}${NC}"
    aws elasticbeanstalk create-application-version \
        --application-name "${APP_NAME}" \
        --version-label "${VERSION_LABEL}" \
        --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${S3_KEY}" \
        --description "Deployment ${VERSION_LABEL}" \
        --region "${REGION}"
    
    # Update environment
    echo -e "${BLUE}Updating environment with new version...${NC}"
    aws elasticbeanstalk update-environment \
        --application-name "${APP_NAME}" \
        --environment-name "${ENV_NAME}" \
        --version-label "${VERSION_LABEL}" \
        --region "${REGION}"
    
    rm -f "deploy-${VERSION_LABEL}.zip"
    
    echo -e "${GREEN}Deployment initiated successfully!${NC}"
    echo -e "${BLUE}Monitor deployment status with:${NC}"
    echo -e "  aws elasticbeanstalk describe-environments --application-name ${APP_NAME} --environment-names ${ENV_NAME} --region ${REGION} --query 'Environments[0].[Status,Health]' --output table"
fi

# Get environment URL
echo -e "\n${BLUE}Getting environment URL...${NC}"
sleep 5
ENV_URL=$(aws elasticbeanstalk describe-environments \
    --application-name "${APP_NAME}" \
    --environment-names "${ENV_NAME}" \
    --region "${REGION}" \
    --query 'Environments[0].CNAME' \
    --output text 2>/dev/null || echo "N/A")

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Application Name: ${APP_NAME}${NC}"
echo -e "${GREEN}Environment Name: ${ENV_NAME}${NC}"
if [ "${ENV_URL}" != "N/A" ] && [ -n "${ENV_URL}" ]; then
    echo -e "${GREEN}Environment URL: http://${ENV_URL}${NC}"
fi
echo -e "\n${BLUE}To monitor the deployment:${NC}"
echo -e "  aws elasticbeanstalk describe-environments --application-name ${APP_NAME} --environment-names ${ENV_NAME} --region ${REGION}"
