from pathlib import Path

# 基础路径
BASE_DIR = Path(__file__).resolve().parent.parent

# 临时保存分片的目录
CHUNK_DIR = BASE_DIR / "temp_chunks"

# 合并后视频保存目录
VIDEO_DIR = BASE_DIR / "saved_videos"

# 自动创建目录（如不存在）
CHUNK_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
