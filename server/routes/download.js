const express = require('express');
const router = express.Router();
const { isValidUrl, isSupportedPlatform } = require('../utils/validator');
const { addDownloadJob } = require('../services/queue.service');

router.post('/', async (req, res) => {
  try {
    const { url, format_id, quality } = req.body;
    console.log('[Download] Received request:', { url, format_id, quality });

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    if (!isSupportedPlatform(url)) {
      return res.status(400).json({
        error: 'Unsupported platform.',
      });
    }

    const jobId = await addDownloadJob(url, format_id || null, quality || null);

    console.log('[Download] Job created:', jobId);

    return res.json({
      jobId: jobId,
      message: 'Download started',
    });
  } catch (err) {
    console.error('[Download] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to start download. Please try again.',
    });
  }
});

module.exports = router;
