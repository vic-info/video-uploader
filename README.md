# VIC LAB Video Uploader

### Prepare Python Env

Need Python 3.8+

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir saved_videos
mkdir temp_chunks
```

### Usage

#### for S3 uploader

Need to set S3 IAM secret in `~/.aws/credentials`

```
python uploader.py --file <dir/to/video>
```

### for uploader Web App

#### Docker

```
docker build -t video-uploader .
docker run -p 80:80 \
  -v $(pwd)/saved_videos:/app/saved_videos \
  -v $(pwd)/temp_chunks:/app/temp_chunks \
  video-uploader
```

#### Backend

```
source venv/bin/activate
uvicorn app.main:app --reload
```

#### Frontend

```
cd frontend
npm install
npm run dev
```
