#!/bin/bash

# Helper script for Elastic Beanstalk operations
# Usage: ./eb-helper.sh [command]

set -e

# Configuration (can be overridden with environment variables)
APP_NAME="${EB_APP_NAME:-restaurant-frontend}"
ENV_NAME="${EB_ENV_NAME:-restaurant-frontend-prod}"
REGION="${AWS_REGION:-us-east-1}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

function show_status() {
    echo -e "${BLUE}=== Environment Status ===${NC}"
    aws elasticbeanstalk describe-environments \
        --application-name "${APP_NAME}" \
        --environment-names "${ENV_NAME}" \
        --region "${REGION}" \
        --query 'Environments[0].[Status,Health,CNAME,VersionLabel,DateUpdated]' \
        --output table 2>/dev/null || echo -e "${RED}Environment not found${NC}"
}

function show_events() {
    echo -e "${BLUE}=== Recent Events ===${NC}"
    aws elasticbeanstalk describe-events \
        --application-name "${APP_NAME}" \
        --environment-name "${ENV_NAME}" \
        --region "${REGION}" \
        --max-items 10 \
        --query 'Events[*].[EventDate,Severity,Message]' \
        --output table
}

function show_logs() {
    echo -e "${BLUE}Requesting logs...${NC}"
    aws elasticbeanstalk request-environment-info \
        --application-name "${APP_NAME}" \
        --environment-name "${ENV_NAME}" \
        --info-type tail \
        --region "${REGION}"
    
    echo -e "${YELLOW}Waiting 5 seconds for logs to be available...${NC}"
    sleep 5
    
    aws elasticbeanstalk retrieve-environment-info \
        --application-name "${APP_NAME}" \
        --environment-name "${ENV_NAME}" \
        --info-type tail \
        --region "${REGION}" \
        --query 'EnvironmentInfo[*].[InfoType,Message]' \
        --output table
}

function show_url() {
    URL=$(aws elasticbeanstalk describe-environments \
        --application-name "${APP_NAME}" \
        --environment-names "${ENV_NAME}" \
        --region "${REGION}" \
        --query 'Environments[0].CNAME' \
        --output text 2>/dev/null)
    
    if [ -n "${URL}" ] && [ "${URL}" != "None" ]; then
        echo -e "${GREEN}Environment URL: http://${URL}${NC}"
    else
        echo -e "${RED}Environment URL not available${NC}"
    fi
}

function set_env_var() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}Usage: ./eb-helper.sh set-env KEY VALUE${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Setting environment variable: $1=$2${NC}"
    aws elasticbeanstalk update-environment \
        --application-name "${APP_NAME}" \
        --environment-name "${ENV_NAME}" \
        --option-settings \
            Namespace=aws:elasticbeanstalk:application:environment,OptionName="$1",Value="$2" \
        --region "${REGION}"
    
    echo -e "${GREEN}Environment variable set. Environment update initiated.${NC}"
}

function rebuild() {
    echo -e "${BLUE}Initiating environment rebuild...${NC}"
    aws elasticbeanstalk rebuild-environment \
        --environment-name "${ENV_NAME}" \
        --region "${REGION}"
    echo -e "${GREEN}Rebuild initiated${NC}"
}

function restart() {
    echo -e "${BLUE}Restarting application servers...${NC}"
    aws elasticbeanstalk restart-app-server \
        --environment-name "${ENV_NAME}" \
        --region "${REGION}"
    echo -e "${GREEN}Restart initiated${NC}"
}

function help() {
    echo -e "${BLUE}=== Elastic Beanstalk Helper ===${NC}"
    echo ""
    echo "Usage: ./eb-helper.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Show environment status"
    echo "  events      - Show recent environment events"
    echo "  logs        - Retrieve and show recent logs"
    echo "  url         - Show environment URL"
    echo "  set-env     - Set environment variable (requires KEY and VALUE)"
    echo "  rebuild     - Rebuild the environment"
    echo "  restart     - Restart application servers"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./eb-helper.sh status"
    echo "  ./eb-helper.sh set-env VITE_API_BASE_URL https://api.example.com"
    echo "  ./eb-helper.sh logs"
}

case "$1" in
    status)
        show_status
        ;;
    events)
        show_events
        ;;
    logs)
        show_logs
        ;;
    url)
        show_url
        ;;
    set-env)
        set_env_var "$2" "$3"
        ;;
    rebuild)
        rebuild
        ;;
    restart)
        restart
        ;;
    help|--help|-h|"")
        help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        help
        exit 1
        ;;
esac
