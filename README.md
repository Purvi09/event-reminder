# Event Reminder ☁️
A cloud-based application to manage events and reminders, showcasing the power of AWS services like CloudFormation, API Gateway, Lambda, and Cognito. Users can sign up, log in, create events, set reminders, and manage their events through a sleek React frontend.

# ✨ Features

User Authentication: Securely register and log in via AWS Cognito.
<img width="1440" alt="Screenshot 2025-05-19 at 1 14 05 AM" src="https://github.com/user-attachments/assets/8a669586-e249-4da6-93e1-074ff3399dfd" />
Event Management: Create, read, update, and delete (CRUD) events with title, date, and reminder time.
<img width="1440" alt="Screenshot 2025-05-19 at 1 14 37 AM" src="https://github.com/user-attachments/assets/89737703-0d89-4b85-a4e3-b7afad51c95a" />
<img width="1440" alt="Screenshot 2025-05-19 at 1 15 07 AM" src="https://github.com/user-attachments/assets/97db5527-1c54-4687-8932-f40e422e33ea" />

Frontend: Intuitive React UI to manage events and view event lists.
Security: APIs secured with Cognito and service access restricted with IAM roles.


# 🛠️ Tech Stack
Backend

Python: Deployed to AWS Lambda for serverless processing.

Frontend

React: Modern, responsive UI for seamless user interaction.

# AWS Services

DynamoDB: Stores events (Free Tier: 25 GB storage, 25 WCUs/RCUs).
Lambda: Handles CRUD logic (Free Tier: 1M requests).
API Gateway: Exposes REST APIs (Free Tier: 1M requests).
Cognito: Manages user authentication (Free Tier: 50,000 MAUs).
EventBridge: Triggers reminder checks (Free Tier: 5,000 events).
S3: Hosts the React frontend (Free Tier: 5 GB storage, 20,000 GET requests).
IAM Roles: Secures cross-service access.
CloudFormation: Defines infrastructure as code for automated deployment.


# 🏗️ Architecture
The application follows a serverless architecture to ensure scalability and cost-efficiency:

Frontend (S3): React app sends HTTP requests to API Gateway for event CRUD and displays events.
Authentication (Cognito): Users authenticate and receive JWT tokens to access APIs.
API Gateway: Exposes REST endpoints (/events/create, /events/list, etc.), secured by Cognito.
Lambda: Processes CRUD logic, interacting with DynamoDB.
DynamoDB: Stores events with fields (user_id, event_id, title, event_date, reminder_time).
EventBridge: Triggers a Lambda function hourly to check for due reminders.
IAM Roles: Ensures secure access between services.



# 📋 Prerequisites
Before you begin, ensure you have:

Python 3.13 or later
AWS CLI configured with credentials (~/.aws/credentials)
Node.js and npm for the React frontend
A valid AWS account with permissions to create resources (e.g., S3, Lambda, API Gateway, Cognito, DynamoDB, EventBridge, CloudFormation)


# 🚀 Deployment Steps
Follow these steps to deploy the Event Reminder application:
1. Set Up Python Environment

a) Navigate to the project directory:

cd event-reminder

b) Create a virtual environment:

python3 -m venv venv

c) Activate the virtual environment:

source venv/bin/activate

d) Install the required Python package:

pip install boto3
2. Upload Lambda Functions to S3

Run the upload script, specifying your S3 bucket:

python3 upload_lambda_to_s3.py --bucket event-reminder-lambda-artifacts

This script packages and uploads the following Lambda functions:





create_event



delete_event



check_reminders



update_event



list_events

3. Deploy Infrastructure with CloudFormation

a) Navigate to the infrastructure directory:

cd infrastructure

b) Deploy the CloudFormation stack:

aws cloudformation deploy \
  --template-file cfn-dev.yaml \
  --stack-name EventReminderStack \
  --capabilities CAPABILITY_IAM

This creates all necessary AWS resources (e.g., DynamoDB table, Lambda functions, API Gateway, Cognito User Pool).

4. Update Frontend Configuration

After deployment, retrieve the CloudFormation outputs (e.g., API Gateway URL, Cognito User Pool ID, Client ID). Update the config.ts file in the source directory with these values.

Create a .env file in the source directory with the following:

VITE_API_URL=your-VITE_API_URL
VITE_USER_POOL_ID=your-VITE_USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=your-VITE_USER_POOL_CLIENT_ID

5. Build and Deploy the Frontend

a) Navigate to the source directory:

cd source

b) Install dependencies:

npm install

c) Build and run the React app locally:

npm run dev


# 🎉 Usage

Access the React frontend via the local host (e.g., http://localhost:5173).
Sign up or log in using Cognito authentication.
Create events by providing a title, event date, and reminder time.
View, update, or delete events from the "Your Events" list.


# 📝 Notes

Ensure your AWS credentials (~/.aws/credentials) are correctly configured before deployment.
The event-reminder-lambda-artifacts S3 bucket must exist before running the upload_lambda_to_s3.py script.
For production, upload the built React app to the S3 bucket created by CloudFormation.


🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

Happy event planning! 🎈
