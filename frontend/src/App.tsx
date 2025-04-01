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

    // Merge chunks
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
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow space-y-4">
      <h1 className="text-xl font-semibold">🎬 Video Uploader</h1>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="w-full"
      />

      <button
        onClick={uploadFileInChunks}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-full bg-green-500 rounded transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
}
