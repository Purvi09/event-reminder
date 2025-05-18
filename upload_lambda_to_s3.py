#!/usr/bin/env python3
import os
import shutil
import tempfile
import subprocess
import boto3
import argparse
from pathlib import Path

def create_zip_file_with_deps(lambda_dir, output_dir, shared_requirements=None):
    """
    Create a zip file for a Lambda function with its dependencies.
    """
    lambda_name = os.path.basename(lambda_dir)
    zip_filename = f"{output_dir}/{lambda_name}.zip"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Remove existing zip if it exists
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
    
    # Create a temporary directory for packaging
    with tempfile.TemporaryDirectory() as tmp_dir:
        # Copy all Lambda function files to the temp directory
        for item in os.listdir(lambda_dir):
            src_path = os.path.join(lambda_dir, item)
            dst_path = os.path.join(tmp_dir, item)
            
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dst_path)
            else:
                shutil.copy2(src_path, dst_path)
        
        # Handle requirements
        requirements_file = os.path.join(tmp_dir, "requirements.txt")
        
        # If the function has its own requirements.txt, use that
        # Otherwise, use the shared requirements if provided
        if not os.path.exists(requirements_file) and shared_requirements:
            shutil.copy2(shared_requirements, requirements_file)
        
        # If we have requirements, install them
        if os.path.exists(requirements_file):
            package_dir = os.path.join(tmp_dir, "package")
            os.makedirs(package_dir, exist_ok=True)
            
            print(f"Installing dependencies for {lambda_name}...")
            # Install dependencies into the package directory
            subprocess.check_call([
                "pip", "install", 
                "-r", requirements_file,
                "--target", package_dir,
                "--no-cache-dir"
            ])
            
            # Move installed packages to the top level
            for item in os.listdir(package_dir):
                src = os.path.join(package_dir, item)
                dst = os.path.join(tmp_dir, item)
                
                if os.path.exists(dst):
                    if os.path.isdir(dst):
                        shutil.rmtree(dst)
                    else:
                        os.remove(dst)
                
                if os.path.isdir(src):
                    shutil.copytree(src, dst)
                else:
                    shutil.copy2(src, dst)
            
            # Remove the package directory and requirements file
            shutil.rmtree(package_dir)
            os.remove(requirements_file)
        
        # Create the zip file
        print(f"Creating zip file for {lambda_name}...")
        shutil.make_archive(
            base_name=os.path.splitext(zip_filename)[0],
            format='zip',
            root_dir=tmp_dir
        )
    
    return zip_filename

def upload_to_s3(zip_file, bucket_name, aws_profile=None):
    """
    Upload a zip file to an S3 bucket.
    """
    # Get file name without path
    file_name = os.path.basename(zip_file)
    s3_key = file_name
    
    # Create S3 client with specified profile if provided
    session = boto3.Session(profile_name=aws_profile) if aws_profile else boto3.Session()
    s3_client = session.client('s3')
    
    print(f"Uploading {file_name} to s3://{bucket_name}/{s3_key}...")
    s3_client.upload_file(
        Filename=zip_file,
        Bucket=bucket_name,
        Key=s3_key
    )
    
    return f"s3://{bucket_name}/{s3_key}"

def main():
    parser = argparse.ArgumentParser(description='Package and upload Lambda functions to S3')
    parser.add_argument('--bucket', required=True, help='S3 bucket name for Lambda artifacts')
    parser.add_argument('--profile', help='AWS CLI profile name to use')
    parser.add_argument('--lambda-dir', default='backend/lambda', help='Directory containing Lambda functions')
    parser.add_argument('--output-dir', default='dist', help='Directory for temporary zip files')
    parser.add_argument('--include-deps', action='store_true', help='Include dependencies in the Lambda packages')
    args = parser.parse_args()
    
    # Get list of Lambda function directories
    lambda_base_path = Path(args.lambda_dir)
    lambda_dirs = [d for d in lambda_base_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
    
    if not lambda_dirs:
        print(f"No Lambda function directories found in {args.lambda_dir}")
        return
    
    print(f"Found {len(lambda_dirs)} Lambda functions to process")
    
    # Find shared requirements file if it exists
    shared_requirements = os.path.join(args.lambda_dir, "requirements.txt")
    if not os.path.exists(shared_requirements):
        shared_requirements = None
    
    # Process each Lambda function
    for lambda_dir in lambda_dirs:
        # Create zip file with or without dependencies
        if args.include_deps:
            zip_file = create_zip_file_with_deps(str(lambda_dir), args.output_dir, shared_requirements)
        else:
            # Simple zip without dependencies
            lambda_name = os.path.basename(str(lambda_dir))
            zip_filename = f"{args.output_dir}/{lambda_name}.zip"
            os.makedirs(args.output_dir, exist_ok=True)
            
            if os.path.exists(zip_filename):
                os.remove(zip_filename)
                
            print(f"Creating simple zip file for {lambda_name}...")
            shutil.make_archive(
                base_name=os.path.splitext(zip_filename)[0],
                format='zip',
                root_dir=str(lambda_dir)
            )
            zip_file = zip_filename
        
        # Upload to S3
        s3_location = upload_to_s3(zip_file, args.bucket, args.profile)
        print(f"Successfully uploaded to {s3_location}")
    
    print("All Lambda functions have been packaged and uploaded to S3")

if __name__ == "__main__":
    main() 