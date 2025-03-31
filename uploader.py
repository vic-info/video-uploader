import boto3
import argparse
import os
from pathlib import Path
from datetime import datetime
from botocore.exceptions import ClientError

# ---------- 读取 ~/.aws/credentials 中的 key ----------
def load_keys_from_credentials():
    credentials_path = os.path.expanduser("~/.aws/credentials")
    with open(credentials_path, "r") as f:
        lines = f.readlines()
    access_key = lines[1].split("=")[1].strip()
    secret_key = lines[2].split("=")[1].strip()
    return access_key, secret_key

# ---------- 检查 S3 上是否存在同名文件 ----------
def s3_object_exists(s3, bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        else:
            raise

# ---------- 上传函数 ----------
def upload_to_s3(file_path, bucket, s3_key, access_key, secret_key):
    s3 = boto3.client(
        "s3",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

    if s3_object_exists(s3, bucket, s3_key):
        print(f"⚠️  S3 object already exists: s3://{bucket}/{s3_key}")
        print("❌ Upload aborted to avoid overwrite.")
        return

    print(f"📤 Uploading {file_path} → s3://{bucket}/{s3_key} ...")
    s3.upload_file(str(file_path), bucket, s3_key)
    print(f"✅ Upload complete: s3://{bucket}/{s3_key}")

# ---------- 主程序 ----------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload video to S3 (fail if exists)")
    parser.add_argument("--file", required=True, help="Path to video file")
    args = parser.parse_args()

    video_path = Path(args.file).expanduser().resolve()
    if not video_path.exists():
        print(f"❌ File not found: {video_path}")
        exit(1)

    try:
        access_key, secret_key = load_keys_from_credentials()
    except Exception as e:
        print(f"❌ Failed to load AWS credentials: {e}")
        exit(1)

    # 自动生成上传路径：uploads/YYYY-MM/filename
    now = datetime.utcnow()
    prefix = now.strftime("uploads/%Y-%m")
    bucket = "vic-lab"
    s3_key = f"{prefix}/{video_path.name}"

    upload_to_s3(video_path, bucket, s3_key, access_key, secret_key)
