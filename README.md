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

### for uploader Web App

#### Docker

```
docker build --build-arg 'VITE_PASSWORD=<upload-precheck-passwd>' -t video-uploader .
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
echo "VITE_PASSWORD=<dev-passwd>" > ./frontend/.env
cd frontend
npm install
npm run dev
```
