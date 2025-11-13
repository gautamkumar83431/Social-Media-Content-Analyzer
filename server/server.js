const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// util: read/write history
const HISTORY_FILE = path.join(__dirname, 'history.json');
function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8') || '[]');
  } catch (e) { return []; }
}
function writeHistory(arr) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// POST /api/upload -> accepts file, returns extracted text
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filepath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let extractedText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filepath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text || '';
    } else {
      // assume image -> OCR with tesseract
      const { data: { text } } = await Tesseract.recognize(filepath, 'eng', {
        logger: m => { /* progress logging - optional */ }
      });
      extractedText = text || '';
    }

    return res.json({
      filename: req.file.originalname,
      path: filepath,
      text: extractedText
    });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Simple heuristics analyzer
function analyzeTextHeuristics(text) {
  const plain = (text || '').replace(/\s+/g, ' ').trim();
  const words = plain.length ? plain.split(' ').length : 0;
  const sentences = plain.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = sentences ? Math.round(words / sentences) : 0;
  const lower = plain.toLowerCase();
  const posWords = ['good','great','amazing','love','excellent','awesome','happy','success'];
  const negWords = ['bad','hate','terrible','poor','angry','sad','problem','issue'];
  let pos=0, neg=0;
  posWords.forEach(w=>{ if(lower.includes(w)) pos++; });
  negWords.forEach(w=>{ if(lower.includes(w)) neg++; });
  const ctaMatches = (lower.match(/(click|buy|subscribe|follow|share|comment|visit)/g) || []).length;

  const suggestions=[];
  if(words < 30) suggestions.push('Post is short — add context or a question to boost engagement.');
  if(avgWordsPerSentence > 25) suggestions.push('Shorten long sentences to improve readability.');
  if(neg > pos) suggestions.push('Tone appears negative — consider softer phrasing for broader engagement.');
  if(ctaMatches === 0) suggestions.push('Add a clear call-to-action (ask to comment, share, or follow).');
  if(words > 280) suggestions.push('Consider trimming for short-form platforms or split into a thread.');

  const score = Math.max(0, Math.min(100, 60 + (pos-neg)*5 + Math.min(20, ctaMatches*5) - (avgWordsPerSentence-15)));
  return {
    wordCount: words,
    sentences,
    avgWordsPerSentence,
    positiveHints: pos,
    negativeHints: neg,
    ctaMatches,
    suggestions,
    score: Math.round(score)
  };
}

// POST /api/analyze -> accepts { title, text } -> returns analysis and saves history
app.post('/api/analyze', (req, res) => {
  try {
    const { title, text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text to analyze' });

    const analysis = analyzeTextHeuristics(text);
    const item = {
      id: uuidv4(),
      title: title || 'Untitled',
      text,
      analysis,
      createdAt: new Date().toISOString()
    };
    const h = readHistory();
    h.unshift(item);
    writeHistory(h);
    return res.json(item);
  } catch (err) {
    console.error('Analyze error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// GET /api/history -> return array
app.get('/api/history', (req, res) => {
  res.json(readHistory());
});

// DELETE /api/history/:id
app.delete('/api/history/:id', (req, res) => {
  const id = req.params.id;
  let h = readHistory();
  h = h.filter(item => item.id !== id);
  writeHistory(h);
  res.json({ ok: true });
});

// Serve uploads for debugging (not required)
app.use('/uploads', express.static(UPLOAD_DIR));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
