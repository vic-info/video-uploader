import os
from pathlib import Path

# 检查是否在Docker环境中运行
IN_DOCKER = os.environ.get('IN_DOCKER', '0') == '1'

if IN_DOCKER:
    # Docker环境使用绝对路径
    CHUNK_DIR = Path("/app/temp_chunks")
    VIDEO_DIR = Path("/app/saved_videos")
else:
    # 本地开发环境使用相对路径
    BASE_DIR = Path(__file__).resolve().parent.parent
    CHUNK_DIR = BASE_DIR / "temp_chunks"
    VIDEO_DIR = BASE_DIR / "saved_videos"

# 自动创建目录（如不存在）
CHUNK_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)
