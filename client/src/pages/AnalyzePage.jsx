import React, { useEffect, useState } from 'react';
import { analyzeText, fetchHistory } from '../services/api';
import Loader from '../components/Loader';
import './AnalyzePage.css';

export default function AnalyzePage() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(()=>{ refreshHistory(); }, []);
  async function refreshHistory() {
    try {
      const r = await fetchHistory();
      setHistory(r.data);
    } catch (e) { console.error(e); }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) return alert('Enter or paste text to analyze (or upload via Upload page).');
    setLoading(true);
    try {
      const res = await analyzeText({ title, text });
      setResult(res.data);
      await refreshHistory();
    } catch (e) {
      console.error(e);
      alert('Analyze failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <h2>Analyze</h2>
      <div>
        <input placeholder="Title (optional)" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div>
        <textarea placeholder="Paste extracted text or type content here..." value={text} onChange={e=>setText(e.target.value)} rows={8} />
      </div>
      <div>
        <button onClick={handleAnalyze}>Analyze & Save</button>
        {loading && <Loader />}
      </div>

      {result && (
        <div className="analysis">
          <h3>Result (Score: {result.analysis.score}/100)</h3>
          <p>Words: {result.analysis.wordCount} · Sentences: {result.analysis.sentences} · Avg words/sentence: {result.analysis.avgWordsPerSentence}</p>
          <h4>Suggestions</h4>
          <ul>
            {result.analysis.suggestions.map((s,i)=><li key={i}>{s}</li>)}
          </ul>
          <pre className="excerpt">{result.text.slice(0,500)}</pre>
        </div>
      )}

      <div style={{marginTop:20}}>
        <h3>Recent history (server)</h3>
        {history.length===0 ? <p>No history</p> : (
          <ul>
            {history.map(it=>(
              <li key={it.id}>
                <b>{it.title}</b> — {new Date(it.createdAt).toLocaleString()} — Score: {it.analysis.score}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
