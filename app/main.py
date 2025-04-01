from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .upload import save_chunk, merge_chunks

app = FastAPI()

# 允许前端跨域请求（开发环境可用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_chunk")
async def upload_chunk(
    file: UploadFile,
    filename: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    upload_id: str = Form(...)
):
    try:
        path = save_chunk(upload_id, chunk_index, file)
        return {"status": "success", "saved_path": path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/merge_chunks")
async def merge_uploaded_chunks(
    filename: str = Form(...),
    total_chunks: int = Form(...),
    upload_id: str = Form(...)
):
    try:
        final_path = merge_chunks(upload_id, filename, total_chunks)
        return {"status": "success", "video_path": final_path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
