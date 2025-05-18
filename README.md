Event Reminder
A cloud-based application to manage events and reminders, showcasing AWS services like CloudFormation, API Gateway, Lambda, and Cognito. Users can sign up, log in, create events, set reminder times, and manage their events through a React frontend.

Features

User Authentication: Register and log in via Cognito.
Event Management: Create, read, update, delete (CRUD) events with title, date, and reminder time.
Frontend: Basic React UI to manage events and view event lists.
Security: Secure APIs with Cognito and restrict service access with IAM roles.

Tech Stack

Backend: Python (deployed to Lambda).
Frontend: React 
AWS Services:
DynamoDB: Store events (Free Tier: 25 GB storage, 25 WCUs/RCUs).
Lambda: Process CRUD logic (Free Tier: 1 million requests).
API Gateway: Expose REST APIs (Free Tier: 1 million requests).
Cognito: User authentication (Free Tier: 50,000 MAUs).
EventBridge: Trigger reminder checks (Free Tier: 5,000 events).
S3: Host React frontend (Free Tier: 5 GB storage, 20,000 GET requests).
IAM Roles: Secure cross-service access.
CloudFormation: Infrastructure as Code for deployment.



Architecture

Frontend (S3): React app sends HTTP requests to API Gateway for event CRUD and displays events.
Authentication (Cognito): Users authenticate, receiving JWT tokens to access APIs.
API Gateway: Exposes REST endpoints (/events/create, /events/list, etc.), secured by Cognito.
Lambda: Handles CRUD logic (e.g., write/read DynamoDB).
DynamoDB: Stores events with fields (user_id, event_id, title, event_date, reminder_time).
EventBridge: Triggers a Lambda function hourly to check for due reminders.
IAM Roles: Grants Lambda access to DynamoDB and restricts API Gateway to Cognito users.

Prerequisites

Python 3.13 or later
AWS CLI configured with credentials (~/.aws/credentials)
Node.js and npm for the React frontend
A valid AWS account with permissions to create resources (e.g., S3, Lambda, API Gateway, Cognito, DynamoDB, EventBridge, CloudFormation)

Deployment Steps
1. Set Up Python Environment and Install Dependencies
# Navigate to the project directory
cd event-reminder

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install the required Python package (boto3)
pip install boto3

2. Upload Lambda Functions to S3
# Run the upload script, specifying your S3 bucket
python3 upload_lambda_to_s3.py --bucket event-reminder-lambda-artifacts

This script packages and uploads the following Lambda functions to S3:

create_event
delete_event
check_reminders
update_event
list_events

3. Deploy Infrastructure with CloudFormation
# Navigate to the infrastructure directory
cd infrastructure

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file cfn-dev.yaml \
  --stack-name EventReminderStack \
  --capabilities CAPABILITY_IAM

This creates the necessary AWS resources (e.g., DynamoDB table, Lambda functions, API Gateway, Cognito User Pool).
4. Update Frontend Configuration
After deployment, you'll get outputs from CloudFormation (e.g., API Gateway URL, Cognito User Pool ID, and Client ID). Update the config.ts file in the source directory with these values.
Create a .env File
In the source directory, create a .env file to store environment variables:
VITE_API_URL=https://cviqvhve2i.execute-api.us-east-1.amazonaws.com/prod
VITE_USER_POOL_ID=us-east-1_kW988jGzj
VITE_USER_POOL_CLIENT_ID=11mmfnda5b44o0ejp1h7cs9q3


Build and Deploy the Frontend
# Navigate to the source directory
cd source

# Install dependencies
npm install

# Build the React app
npm run dev


Usage

Access the React frontend via the local host
Sign up or log in using Cognito authentication.
Create events by providing a title, event date, and reminder time.
View, update, or delete your events from the "Your Events" list.

Notes

Ensure your AWS credentials (~/.aws/credentials) are correctly configured before deployment.
The event-reminder-lambda-artifacts S3 bucket must exist before running the upload_lambda_to_s3.py script.

