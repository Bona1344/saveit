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
app.use(
  cors({
    origin: [ALLOWED_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Rate limiting: max 20 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again in a few minutes.',
  },
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/api/info', infoRouter);
app.use('/api/download', downloadRouter);
app.use('/api/status', statusRouter);

// Serve files from the /api/file route
app.get('/api/file/:filename', (req, res) => {
  const { filename } = req.params;
  const sanitized = path.basename(filename);
  const filePath = path.join(TMP_DIR, sanitized);

  console.log('[Server] File request:', filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  res.download(filePath, sanitized, (err) => {
    if (err) {
      console.error('[Server] Error sending file:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file.' });
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

  // Start the BullMQ worker
  try {
    setupWorker(TMP_DIR);
    console.log('[Server] Download worker initialized.');
  } catch (err) {
    console.error('[Server] Failed to initialize worker:', err.message);
    console.error('[Server] Make sure Redis is running on localhost:6379');
  }

  // Start cleanup job
  startCleanupJob(TMP_DIR);
  console.log('[Server] Cleanup job initialized.');
});
