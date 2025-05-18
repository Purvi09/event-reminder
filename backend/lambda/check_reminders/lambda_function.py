import json
import boto3
import os
import logging

# Set up logging
logging.getLogger().setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', 'arn:aws:sns:<region>:<account-id>:ReminderNotifications')
TABLE_NAME = os.environ.get('TABLE_NAME', 'Events')

# CORS headers
cors_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

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
                'headers': cors_headers,
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
                'headers': cors_headers,
                'body': json.dumps({'error': 'Event not found'})
            }
        
        event_data = response['Item']
        event_description = event_data.get('event_description', '')
        event_time = event_data.get('event_time', 'Unknown time')
        
        # Send SNS notification
        message = (
            f"Reminder: {event_name} is upcoming!\n"
            f"Time: {event_time}\n"
            f"Description: {event_description}"
        )
        sns.publish(
            TopicArn=TOPIC_ARN,
            Message=message,
            Subject=f"Event Reminder: {event_name}"
        )
        logging.info(f"Sent SNS notification for event_id={event_id}")
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Reminder processed'})
        }
    except sns.exceptions.ClientError as e:
        logging.error(f"SNS error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f"SNS error: {str(e)}"})
        }
    except dynamodb.meta.client.exceptions.ClientError as e:
        logging.error(f"DynamoDB error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f"DynamoDB error: {str(e)}"})
        }
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }