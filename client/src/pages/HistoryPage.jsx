import React, { useEffect, useState } from 'react';
import { fetchHistory, deleteHistoryItem } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  useEffect(()=>{ load(); }, []);
  async function load() {
    try {
      const r = await fetchHistory();
      setHistory(r.data);
    } catch (e) { console.error(e); }
  }
  async function remove(id) {
    if(!window.confirm('Delete this item?')) return;
    try {
      await deleteHistoryItem(id);
      load();
    } catch (e) { console.error(e); }
  }
  return (
    <div className="page">
      <h2>History</h2>
      {history.length===0 ? <p>No saved analyses.</p> : (
        <div>
          {history.map(it => (
            <div key={it.id} className="history-item">
              <div className="h-title">
                <strong>{it.title}</strong>
                <small>{new Date(it.createdAt).toLocaleString()}</small>
                <button onClick={()=>remove(it.id)}>Delete</button>
              </div>
              <div>Score: {it.analysis.score} — {it.analysis.suggestions.join(' / ')}</div>
              <pre className="excerpt">{it.text.slice(0,400)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
