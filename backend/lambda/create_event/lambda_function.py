import json
import boto3
import uuid
import os
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
scheduler = boto3.client('scheduler')
table_name = os.environ.get('TABLE_NAME', 'Events')
table = dynamodb.Table(table_name)

# Environment variables
SCHEDULER_ROLE_ARN = os.environ.get('SCHEDULER_ROLE_ARN', 'arn:aws:iam::<account-id>:role/SchedulerRole')
CHECK_REMINDERS_LAMBDA_ARN = os.environ.get('CHECK_REMINDERS_LAMBDA_ARN', 'arn:aws:lambda:<region>:<account-id>:function:CheckReminders')

# CORS headers
cors_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

def lambda_handler(event, context):
    try:
        print(event)
        user_id = event['requestContext']['authorizer']['claims']['sub']
        body = json.loads(event['body'])
        
        event_name = body.get('event_name')
        event_description = body.get('event_description', '')
        event_time = body.get('event_time')  
        reminder_time = body.get('reminder_time')  
        if not all([event_name, event_time, reminder_time]):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        try:
            datetime.fromisoformat(event_time.replace('Z', '+00:00'))
            reminder_datetime = datetime.fromisoformat(reminder_time.replace('Z', '+00:00'))
        except ValueError:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid datetime format'})
            }

        event_id = str(uuid.uuid4())
        schedule_name = f'reminder-{event_id}'

        table.put_item(
            Item={
                'user_id': user_id,
                'event_id': event_id,
                'event_name': event_name,
                'event_description': event_description,
                'event_time': event_time,
                'reminder_time': reminder_time,
                'schedule_name': schedule_name
            }
        )

        scheduler.create_schedule(
            Name=schedule_name,
            ScheduleExpression=f'at({reminder_time.replace("Z", "")})',
            Target={
                'Arn': CHECK_REMINDERS_LAMBDA_ARN,
                'RoleArn': SCHEDULER_ROLE_ARN,
                'Input': json.dumps({
                    'user_id': user_id,
                    'event_id': event_id,
                    'event_name': event_name
                })
            },
            ActionAfterCompletion='DELETE',
            FlexibleTimeWindow={'Mode': 'OFF'},
            State='ENABLED'
        )

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'event_id': event_id})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
