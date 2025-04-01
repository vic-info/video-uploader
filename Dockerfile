# 第一阶段：构建前端
FROM node:18-alpine as frontend-builder

# 设置前端工作目录
WORKDIR /frontend-build

# 复制前端项目文件
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# 第二阶段：Python后端
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装依赖相关工具和nginx
RUN apt-get update && apt-get install -y \
    build-essential \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# 复制前端构建产物
COPY --from=frontend-builder /frontend-build/dist /app/static

# 配置nginx
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    client_max_body_size 0;\n\
    \n\
    location / {\n\
        root /app/static;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location /upload_chunk {\n\
        proxy_pass http://localhost:8000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_read_timeout 600;\n\
        proxy_connect_timeout 600;\n\
        proxy_send_timeout 600;\n\
        proxy_request_buffering off;\n\
    }\n\
    \n\
    location /merge_chunks {\n\
        proxy_pass http://localhost:8000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_read_timeout 600;\n\
        proxy_connect_timeout 600;\n\
        proxy_send_timeout 600;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# 复制后端依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app/ app/

# 创建必要的目录
RUN mkdir -p /app/temp_chunks /app/saved_videos && \
    chmod 777 /app/temp_chunks /app/saved_videos

# 创建启动脚本
RUN echo '#!/bin/bash\n\
nginx\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh \
    && chmod +x /app/start.sh

# 暴露端口
EXPOSE 80

# 启动服务
CMD ["/app/start.sh"]
