# Deployment Guide: Restaurant Frontend to AWS Elastic Beanstalk

This guide explains how to deploy the Restaurant Frontend application to AWS Elastic Beanstalk using Docker and AWS CLI.

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```

2. **Docker** installed and running
   ```bash
   docker --version
   docker info
   ```

3. **AWS Account** with appropriate permissions:
   - Elastic Beanstalk full access
   - ECR (Elastic Container Registry) full access
   - S3 access for deployment artifacts
   - EC2 access (for Elastic Beanstalk managed EC2 instances)

4. **Required AWS IAM Permissions**:
   - `elasticbeanstalk:*`
   - `ecr:*`
   - `s3:*` (for deployment artifacts)
   - `ec2:*` (for Elastic Beanstalk environments)
   - `iam:PassRole` (for Elastic Beanstalk service role)

## Quick Start

### 1. Configure Environment Variables (Optional)

Set these environment variables or edit the `deploy.sh` script:

```bash
export AWS_REGION="us-east-1"  
export EB_APP_NAME="restaurant-frontend"  # EB application name
export EB_ENV_NAME="restaurant-frontend-prod"  # EB environment name
```

### 2. Build and Deploy

Simply run the deployment script:

```bash
./deploy.sh
```

The script will:
1. Create ECR repository if it doesn't exist
2. Build Docker image
3. Push image to ECR
4. Create/update Elastic Beanstalk application
5. Create/update Elastic Beanstalk environment
6. Deploy the new version

### 3. Monitor Deployment

```bash
# Check environment status
aws elasticbeanstalk describe-environments \
  --application-name restaurant-frontend \
  --environment-names restaurant-frontend-prod \
  --region us-east-1 \
  --query 'Environments[0].[Status,Health,CNAME]' \
  --output table

# View environment events
aws elasticbeanstalk describe-events \
  --application-name restaurant-frontend \
  --environment-name restaurant-frontend-prod \
  --region us-east-1 \
  --max-items 20 \
  --output table
```

## Manual Deployment Steps

If you prefer to run commands manually:

### Step 1: Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name restaurant-frontend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

### Step 2: Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Build Docker Image

```bash
docker build -t restaurant-frontend:latest .
```

### Step 4: Tag and Push to ECR

```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/restaurant-frontend"

# Tag image
docker tag restaurant-frontend:latest ${ECR_REPO_URI}:latest

# Push to ECR
docker push ${ECR_REPO_URI}:latest
```

### Step 5: Create Elastic Beanstalk Application

```bash
aws elasticbeanstalk create-application \
  --application-name restaurant-frontend \
  --description "Restaurant Microservice Frontend" \
  --region us-east-1
```

### Step 6: Prepare Deployment Package

Update `Dockerrun.aws.json` with your ECR image URI:

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/restaurant-frontend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8081"
    }
  ]
}
```

Create deployment package:

```bash
zip deploy.zip Dockerrun.aws.json .ebextensions -r
```

### Step 7: Upload to S3 and Create Version

```bash
S3_BUCKET="elasticbeanstalk-us-east-1-${AWS_ACCOUNT_ID}"
VERSION_LABEL="v$(date +%Y%m%d%H%M%S)"

# Create S3 bucket if it doesn't exist
aws s3 mb s3://${S3_BUCKET} --region us-east-1 2>/dev/null || true

# Upload deployment package
aws s3 cp deploy.zip s3://${S3_BUCKET}/restaurant-frontend/${VERSION_LABEL}.zip

# Create application version
aws elasticbeanstalk create-application-version \
  --application-name restaurant-frontend \
  --version-label ${VERSION_LABEL} \
  --source-bundle S3Bucket=${S3_BUCKET},S3Key=restaurant-frontend/${VERSION_LABEL}.zip \
  --region us-east-1
```

### Step 8: Create or Update Environment

**For new environment:**

```bash
aws elasticbeanstalk create-environment \
  --application-name restaurant-frontend \
  --environment-name restaurant-frontend-prod \
  --solution-stack-name "64bit Amazon Linux 2 v3.4.16 running Docker" \
  --version-label ${VERSION_LABEL} \
  --region us-east-1
```

**For existing environment:**

```bash
aws elasticbeanstalk update-environment \
  --application-name restaurant-frontend \
  --environment-name restaurant-frontend-prod \
  --version-label ${VERSION_LABEL} \
  --region us-east-1
```

## Configuration Files

### Dockerfile

Multi-stage build:
- Stage 1: Builds the React/Vite application
- Stage 2: Production image with only necessary files

### Dockerrun.aws.json

Defines the Docker container configuration for Elastic Beanstalk.

### eb-config.json

Defines Elastic Beanstalk configuration

## Environment Variables

Set environment variables in Elastic Beanstalk:

```bash
aws elasticbeanstalk update-environment \
  --application-name restaurant-frontend \
  --environment-name restaurant-frontend-prod \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=VITE_API_BASE_URL,Value=https://your-api-domain.com \
  --region us-east-1
```

Or use the Elastic Beanstalk console:
1. Go to Elastic Beanstalk console
2. Select your environment
3. Configuration → Software → Environment properties
4. Add: `VITE_API_BASE_URL` = `https://your-api-domain.com`

**Important**: Since Vite builds at build time, you need to rebuild the Docker image with the correct API URL, or use runtime environment variable injection.

## Troubleshooting

### View Logs

```bash
# Get recent logs
aws elasticbeanstalk request-environment-info \
  --environment-name restaurant-frontend-prod \
  --info-type tail \
  --region us-east-1

# Retrieve logs after a few minutes
aws elasticbeanstalk retrieve-environment-info \
  --environment-name restaurant-frontend-prod \
  --info-type tail \
  --region us-east-1
```

### Check Container Logs

SSH into the EC2 instance (if enabled) or use EB CLI:

```bash
eb logs restaurant-frontend-prod
```

### Common Issues

1. **Port binding issues**: Ensure the container exposes port 8081 and Elastic Beanstalk is configured to forward traffic to this port.

2. **ECR authentication**: Make sure you're logged into ECR before pushing images.

3. **Permission errors**: Verify IAM roles and permissions for Elastic Beanstalk service role.

4. **Health check failures**: Check that the application is responding on port 8081 and the health check path is correct.

## Clean Up

To delete the environment:

```bash
aws elasticbeanstalk terminate-environment \
  --environment-name restaurant-frontend-prod \
  --region us-east-1
```

To delete the application:

```bash
aws elasticbeanstalk delete-application \
  --application-name restaurant-frontend \
  --terminate-env-by-force \
  --region us-east-1
```

To delete ECR repository:

```bash
aws ecr delete-repository \
  --repository-name restaurant-frontend \
  --force \
  --region us-east-1
```

## Additional Resources

- [AWS Elastic Beanstalk Docker Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker.html)
- [AWS CLI Elastic Beanstalk Commands](https://docs.aws.amazon.com/cli/latest/reference/elasticbeanstalk/)
- [ECR Documentation](https://docs.aws.amazon.com/ecr/)
