import React, { useState } from 'react';
import { AUTH_CONFIG } from './config';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === AUTH_CONFIG.PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('密码错误');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setProgress(0);
    setStatus('');
  };

  const uploadFileInChunks = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('Uploading...');

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = crypto.randomUUID();
    const filename = file.name;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('filename', filename);
      formData.append('chunk_index', i.toString());
      formData.append('total_chunks', totalChunks.toString());
      formData.append('upload_id', uploadId);

      await fetch(`${API_BASE_URL}/upload_chunk`, {
        method: 'POST',
        body: formData,
      });

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    const mergeForm = new FormData();
    mergeForm.append('filename', filename);
    mergeForm.append('total_chunks', totalChunks.toString());
    mergeForm.append('upload_id', uploadId);

    const res = await fetch(`${API_BASE_URL}/merge_chunks`, {
      method: 'POST',
      body: mergeForm,
    });

    const result = await res.json();
    if (result.status === 'success') {
      setStatus('✅ Upload and merge completed!');
    } else {
      setStatus('❌ Failed to merge chunks');
    }

    setUploading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="upload-form">
          <h1 className="title">
            🔒 验证密码
          </h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="password-input"
            />
            {passwordError && <p className="status-text" style={{color: '#ff4444'}}>{passwordError}</p>}
            <button type="submit">
              验证
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="upload-form">
        <h1 className="title">
          🎬 Video Uploader
        </h1>

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <button
          onClick={uploadFileInChunks}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progress}% uploaded
        </div>

        <p className="status-text">{status}</p>
      </div>
    </div>
  );
}
