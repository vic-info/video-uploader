from pathlib import Path

# 使用绝对路径
CHUNK_DIR = Path("/app/temp_chunks")
VIDEO_DIR = Path("/app/saved_videos")

# 自动创建目录（如不存在）
CHUNK_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
