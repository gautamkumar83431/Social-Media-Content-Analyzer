import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import Loader from '../components/Loader';
import { uploadFile } from '../services/api';

export default function UploadPage() {
  const [status, setStatus] = useState('idle');
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    setError(null);
    setStatus('uploading');
    try {
      const file = files[0];
      const resp = await uploadFile(file, (evt) => {});
      setUploaded(resp.data);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
      setStatus('error');
    }
  };

  return (
    <div className="page">
      <h2>Upload (PDF / Image)</h2>
      <FileDropzone onFiles={handleFiles} />
      <div style={{marginTop:12}}>
        {status === 'uploading' && <Loader text="Extracting text..." />}
        {status === 'done' && uploaded && (
          <div>
            <p><strong>File:</strong> {uploaded.filename}</p>
            <p><strong>Extracted text (first 400 chars):</strong></p>
            <pre className="excerpt">{uploaded.text.slice(0,400)}</pre>
            <p>Now go to <b>Analyze</b> page to run suggestions and save to history.</p>
          </div>
        )}
        {status === 'error' && <div className="error">Error: {error}</div>}
      </div>
    </div>
  );
}
