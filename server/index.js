require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const infoRouter = require('./routes/info');
const downloadRouter = require('./routes/download');
const statusRouter = require('./routes/status');
const { setupWorker } = require('./services/queue.service');
const { startCleanupJob } = require('./utils/cleanup');
const { initCookies } = require('./utils/cookies');

const app = express();
const PORT = process.env.PORT || 5000;
const TMP_DIR = path.resolve(process.env.TMP_DIR || './tmp');
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

// Create tmp directory if it doesn't exist
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  console.log('[Server] Created tmp directory:', TMP_DIR);
}

// CORS configuration
const allowedOrigins = ALLOWED_ORIGIN === '*'
  ? true
  : [ALLOWED_ORIGIN, 'http://localhost:3000'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Trust proxy (Railway, Vercel, etc. run behind reverse proxies)
app.set('trust proxy', 1);

// Rate limiting: only on info & download endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again in a few minutes.',
  },
});

// Parse JSON bodies
app.use(express.json());

// Mount routes — rate limit only on info and download
app.use('/api/info', limiter, infoRouter);
app.use('/api/download', limiter, downloadRouter);
app.use('/api/status', statusRouter);

// Serve files with proper streaming (NO rate limiting)
app.get('/api/file/:filename', (req, res) => {
  const { filename } = req.params;
  const sanitized = path.basename(filename);
  const filePath = path.join(TMP_DIR, sanitized);

  console.log('[Server] File request:', filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(sanitized).toLowerCase();

    // Set proper headers for fast streaming
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      '.m4a': 'audio/mp4',
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitized}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file directly
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('[Server] Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file.' });
      }
    });
  } catch (err) {
    console.error('[Server] File serve error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to serve file.' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint — check yt-dlp status on Railway
app.get('/api/diag', async (req, res) => {
  const { exec } = require('child_process');
  const results = {};
  try {
    const version = await new Promise((resolve, reject) => {
      exec('yt-dlp --version', { timeout: 10000 }, (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout.trim());
      });
    });
    results.ytdlp_version = version;
  } catch (e) {
    results.ytdlp_error = e.message;
  }
  try {
    const ffmpegV = await new Promise((resolve, reject) => {
      exec('ffmpeg -version | head -1', { timeout: 5000 }, (err, stdout) => {
        if (err) reject(err);
        else resolve(stdout.trim());
      });
    });
    results.ffmpeg = ffmpegV;
  } catch (e) {
    results.ffmpeg_error = e.message;
  }
  results.node_version = process.version;
  results.tmp_dir = path.resolve(process.env.TMP_DIR || './tmp');
  results.tmp_exists = require('fs').existsSync(results.tmp_dir);
  results.cookies = {
    twitter_env: !!process.env.TWITTER_COOKIES_BASE64,
    instagram_env: !!process.env.INSTAGRAM_COOKIES_BASE64,
    twitter_file: require('fs').existsSync(require('path').join(results.tmp_dir, '../cookies/twitter.txt')),
    instagram_file: require('fs').existsSync(require('path').join(results.tmp_dir, '../cookies/instagram.txt')),
  };
  res.json(results);
});

app.get('/api/test-threads', async (req, res) => {
  const { exec } = require('child_process');
  const path = require('path');
  const tmpDir = path.resolve(process.env.TMP_DIR || './tmp');
  const cookiesFile = path.join(tmpDir, '../cookies/instagram.txt');
  const cmd = `yt-dlp --dump-json --no-playlist "https://www.threads.net/@therealtoriabrooke/post/DU6dJFCEWOO"`;
  
  exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
    res.json({
      cmd,
      error: error ? error.message : null,
      stdout: stdout ? stdout.slice(0, 500) : null, // Limit output
      stderr: stderr ? stderr : null
    });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] SaveIt backend running on http://localhost:${PORT}`);
  console.log(`[Server] Allowed origin: ${ALLOWED_ORIGIN}`);
  console.log(`[Server] Tmp directory: ${TMP_DIR}`);

  // Initialize cookies for Twitter/X and Threads
  initCookies();

  // Start the BullMQ worker
  try {
    setupWorker(TMP_DIR);
    console.log('[Server] Download worker initialized.');
  } catch (err) {
    console.error('[Server] Failed to initialize worker:', err.message);
  }

  // Start cleanup job
  startCleanupJob(TMP_DIR);
  console.log('[Server] Cleanup job initialized.');
});
