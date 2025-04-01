import os
from pathlib import Path
from fastapi import UploadFile
from .config import CHUNK_DIR, VIDEO_DIR

def save_chunk(upload_id: str, chunk_index: int, chunk_file: UploadFile):
    upload_path = CHUNK_DIR / upload_id
    upload_path.mkdir(parents=True, exist_ok=True)

    chunk_path = upload_path / f"{chunk_index}.part"

    with chunk_path.open("wb") as f:
        f.write(chunk_file.file.read())

    return str(chunk_path)

def merge_chunks(upload_id: str, filename: str, total_chunks: int) -> str:
    upload_path = CHUNK_DIR / upload_id
    output_path = VIDEO_DIR / filename

    with output_path.open("wb") as outfile:
        for i in range(total_chunks):
            chunk_file = upload_path / f"{i}.part"
            if not chunk_file.exists():
                raise FileNotFoundError(f"Missing chunk {i} for upload_id {upload_id}")
            with chunk_file.open("rb") as cf:
                outfile.write(cf.read())

    # 可选：清理临时分片目录
    for file in upload_path.glob("*.part"):
        file.unlink()
    upload_path.rmdir()

    return str(output_path)
