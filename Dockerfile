# 使用官方轻量 Python 镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装依赖相关工具
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app/ app/
COPY temp_chunks/ temp_chunks/
COPY saved_videos/ saved_videos/

# 确保目录存在（防止 volume mount 时找不到）
RUN mkdir -p temp_chunks saved_videos

# 启动 FastAPI 服务
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
