import urllib.request
import urllib.error
import zipfile
import boto3
from io import BytesIO

def lambda_handler(event, context):
    # Validate event exists
    if not event:
        raise Exception("Event is missing or empty")
    
    # Validate detail field exists
    if "detail" not in event:
        raise Exception("Event detail field is missing")
    
    detail = event.get("detail", {})
    
    # Validate detail is not empty
    if not detail:
        raise Exception("Event detail is empty")
    
    # Validate required fields exist in detail
    required_fields = ['CSV_URL', 'S3_BUCKET', 'S3_KEY']
    missing_fields = []
    
    for field in required_fields:
        if field not in detail or not detail.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        raise Exception(f"Missing required fields in event detail: {', '.join(missing_fields)}")
    
    # Extract variables from the `detail` field
    CSV_URL = detail.get('CSV_URL')
    S3_BUCKET = detail.get('S3_BUCKET')
    S3_KEY = detail.get('S3_KEY')

    # Download ZIP using urllib
    try:
        with urllib.request.urlopen(CSV_URL, timeout=10) as response:
            if response.status != 200:
                raise Exception(f"Failed to download file: {response.status}")
            zip_data = response.read()
    except urllib.error.URLError as e:
        raise Exception(f"Failed to download file: {str(e)}")

    # Extract CSV from ZIP
    with zipfile.ZipFile(BytesIO(zip_data)) as zip_ref:
        csv_files = [f for f in zip_ref.namelist() if f.endswith('.csv')]
        if not csv_files:
            raise Exception('No CSV file found in ZIP.')
        csv_filename = csv_files[0]
        csv_data = zip_ref.read(csv_filename)

    # Upload to S3 (overwrite if exists)
    s3 = boto3.client('s3')
    s3.put_object(Bucket=S3_BUCKET, Key=S3_KEY, Body=csv_data)

    return {
        'statusCode': 200,
        'body': f'CSV uploaded to s3://{S3_BUCKET}/{S3_KEY}'
    } 