import json
import boto3
import os
import logging

# Set up logging
logging.getLogger().setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')
scheduler = boto3.client('scheduler')

# Environment variables
TABLE_NAME = os.environ['TABLE_NAME']
SES_SOURCE_EMAIL = os.environ['SES_SOURCE_EMAIL']

def lambda_handler(event, context):
    try:
        # Extract EventBridge payload
        user_id = event.get('user_id')
        event_id = event.get('event_id')
        event_name = event.get('event_name')
        
        if not all([user_id, event_id, event_name]):
            logging.error("Missing required fields in EventBridge payload")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid EventBridge payload'})
            }
        
        # Retrieve event from DynamoDB for full details
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(
            Key={'user_id': user_id, 'event_id': event_id}
        )
        
        if 'Item' not in response:
            logging.error(f"Event not found: user_id={user_id}, event_id={event_id}")
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Event not found'})
            }
        
        event_data = response['Item']
        event_description = event_data.get('event_description', '')
        event_time = event_data.get('event_time', 'Unknown time')
        user_email = event_data.get('email_id')
        
        if not user_email:
            logging.error(f"No email found for event_id={event_id}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No user email associated with event'})
            }

        # Send SES email
        message = (
            f"Reminder: {event_name} is upcoming!\n"
            f"Time: {event_time}\n"
            f"Description: {event_description}"
        )
        ses.send_email(
            Source=SES_SOURCE_EMAIL,
            Destination={'ToAddresses': [user_email]},
            Message={
                'Subject': {'Data': f"Event Reminder: {event_name}"},
                'Body': {
                    'Text': {'Data': message}
                }
            }
        )
        logging.info(f"Sent SES email for event_id={event_id} to {user_email}")
        
        # Delete the EventBridge schedule (for one-time reminders)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Reminder sent'})
        }
    except ses.exceptions.ClientError as e:
        logging.error(f"SES error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"SES error: {str(e)}"})
        }
    except dynamodb.meta.client.exceptions.ClientError as e:
        logging.error(f"DynamoDB error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"DynamoDB error: {str(e)}"})
        }
    except scheduler.exceptions.ClientError as e:
        logging.error(f"Scheduler error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f"Scheduler error: {str(e)}"})
        }
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
