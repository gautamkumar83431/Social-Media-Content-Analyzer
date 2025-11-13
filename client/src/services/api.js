import axios from 'axios';
const API = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 60000
});

export function uploadFile(file, onUploadProgress) {
  const fd = new FormData();
  fd.append('file', file);
  return API.post('/upload', fd, { headers: {'Content-Type':'multipart/form-data'}, onUploadProgress });
}

export function analyzeText(payload) {
  return API.post('/analyze', payload);
}

export function fetchHistory() {
  return API.get('/history');
}

export function deleteHistoryItem(id) {
  return API.delete(`/history/${id}`);
}
