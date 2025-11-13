import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

export default function App(){
  return (
    <div className="app-root">
      <nav className="navbar">
        <h1>Social Media Content Analyzer</h1>
        <div className="nav-links">
          <Link to="/">Upload</Link>
          <Link to="/analyze">Analyze</Link>
          <Link to="/history">History</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<UploadPage/>} />
          <Route path="/analyze" element={<AnalyzePage/>} />
          <Route path="/history" element={<HistoryPage/>} />
          <Route path="/about" element={<AboutPage/>} />
        </Routes>
      </main>
    </div>
  );
}
