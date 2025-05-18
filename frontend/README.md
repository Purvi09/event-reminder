# Event Reminder Frontend

A React-based frontend for the Event Reminder application, which allows users to manage events and receive reminders.

## Features

- User authentication (sign up, sign in, and sign out)
- Create events with reminders
- View a list of your events
- Edit and delete events
- User-friendly date and time selection
- Toast notifications for feedback

## Tech Stack

- React with TypeScript
- React Router for navigation
- AWS Amplify for authentication
- Axios for API calls
- React DatePicker for date/time selection
- React Toastify for notifications
- TailwindCSS for styling

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following environment variables:
   ```
   VITE_API_URL=<your-api-gateway-url>/prod
   VITE_USER_POOL_ID=<your-cognito-user-pool-id>
   VITE_USER_POOL_CLIENT_ID=<your-cognito-user-pool-client-id>
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Build for Production

```
npm run build
```

The build output will be in the `dist` directory, which can be deployed to AWS S3 for hosting.

## Deployment to S3

1. Build the application
2. Upload the contents of the `dist` directory to your S3 bucket
3. Configure the S3 bucket for static website hosting
4. Set the necessary CORS configuration
5. Set up CloudFront (optional, for HTTPS and better performance)

## Development Notes

- The frontend communicates with AWS API Gateway endpoints for CRUD operations
- Authentication is handled by AWS Cognito
- All API requests include the ID token from Cognito for authorization
