import React, { useRef, useState } from 'react';
import './FileDropzone.css';  // ✅ Add this line

export default function FileDropzone({ onFiles }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length && onFiles) onFiles(files);
  };

  const handlePick = () => {
    const files = Array.from(inputRef.current.files || []);
    if (files.length && onFiles) onFiles(files);
  };

  return (
    <div>
      <div
        className={`dropzone ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current.click()}
      >
        <p>Drag & drop PDF or image files here, or click to pick</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        style={{ display: 'none' }}
        multiple
        onChange={handlePick}
      />
    </div>
  );
}
