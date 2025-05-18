import json
import boto3
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
scheduler = boto3.client('scheduler')
table_name = os.environ.get('TABLE_NAME', 'Events')
table = dynamodb.Table(table_name)

# CORS headers
cors_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

def lambda_handler(event, context):
    try:
        user_id = event['requestContext']['authorizer']['claims']['sub']
        event_id = event['pathParameters']['eventId']
        
        # Get schedule_name
        response = table.get_item(
            Key={'user_id': user_id, 'event_id': event_id}
        )
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Event not found'})
            }
        
        schedule_name = response['Item']['schedule_name']
        
        # Delete from DynamoDB
        table.delete_item(
            Key={'user_id': user_id, 'event_id': event_id}
        )
        
        # Delete EventBridge schedule
        try:
            scheduler.delete_schedule(Name=schedule_name)
        except scheduler.exceptions.ResourceNotFoundException:
            pass

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'Event deleted'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }

