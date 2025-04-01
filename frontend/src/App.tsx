import React, { useState } from 'react';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

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

      await fetch('http://localhost:8000/upload_chunk', {
        method: 'POST',
        body: formData,
      });

      setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    const mergeForm = new FormData();
    mergeForm.append('filename', filename);
    mergeForm.append('total_chunks', totalChunks.toString());
    mergeForm.append('upload_id', uploadId);

    const res = await fetch('http://localhost:8000/merge_chunks', {
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
