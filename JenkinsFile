pipeline {
    agent any

    environment {
        BUCKET_NAME = 'event-reminder-lambda-artifacts'
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages {
        stage('Setup Python Environment') {
            steps {
                sh '''
                    python3 -m venv venv
                    source venv/bin/activate
                    pip install boto3
                '''
            }
        }

        stage('Upload Lambda Functions to S3') {
            steps {
                sh '''
                    source venv/bin/activate
                    python3 upload_lambda_to_s3.py --bucket $BUCKET_NAME
                '''
            }
        }

        stage('Deploy Infrastructure') {
            steps {
                dir('infrastructure') {
                    sh '''
                        aws cloudformation deploy \
                        --template-file cfn-dev.yaml \
                        --stack-name EventReminderStack \
                        --capabilities CAPABILITY_IAM
                    '''
                }
            }
        }
    }

    post {
        failure {
            echo "Deployment failed!"
        }
    }
}
