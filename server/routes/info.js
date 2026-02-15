const express = require('express');
const router = express.Router();
const { isValidUrl, getPlatform, isSupportedPlatform } = require('../utils/validator');
const { getInfo } = require('../services/ytdlp.service');

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    console.log('[Info] Received request for URL:', url);

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please enter a valid URL starting with http:// or https://' });
    }

    if (!isSupportedPlatform(url)) {
      return res.status(400).json({
        error: 'Unsupported platform. We support YouTube, Twitter/X, Instagram, TikTok, and Threads.',
      });
    }

    const platform = getPlatform(url);
    console.log('[Info] Detected platform:', platform);

    const info = await getInfo(url);

    console.log('[Info] Successfully fetched info:', info.title);

    return res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      platform: platform,
      formats: info.formats,
    });
  } catch (err) {
    console.error('[Info] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch media information. Please check the URL and try again.',
    });
  }
});

module.exports = router;
