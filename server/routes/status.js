const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getJobStatus } = require('../services/queue.service');

const tmpDir = path.resolve(process.env.TMP_DIR || './tmp');

router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('[Status] Checking status for job:', jobId);

    const status = await getJobStatus(jobId);

    if (status.status === 'not_found') {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (status.status === 'done') {
      return res.json({
        status: 'done',
        downloadUrl: `/api/file/${status.filename}`,
        filename: status.filename,
      });
    }

    if (status.status === 'failed') {
      return res.json({
        status: 'failed',
        error: status.error,
      });
    }

    return res.json({
      status: 'processing',
      progress: status.progress,
    });
  } catch (err) {
    console.error('[Status] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to check job status.',
    });
  }
});

// Serve the actual downloaded file
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename to prevent directory traversal
    const sanitized = path.basename(filename);
    const filePath = path.join(tmpDir, sanitized);

    console.log('[File] Serving file:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    res.download(filePath, sanitized, (err) => {
      if (err) {
        console.error('[File] Error sending file:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file.' });
        }
      }
    });
  } catch (err) {
    console.error('[File] Error:', err.message);
    return res.status(500).json({ error: 'Failed to serve file.' });
  }
});

module.exports = router;
