const fs = require('fs');
const path = require('path');

const COOKIES_DIR = path.join(__dirname, '..', 'cookies');
const TWITTER_COOKIES_FILE = path.join(COOKIES_DIR, 'twitter.txt');
const INSTAGRAM_COOKIES_FILE = path.join(COOKIES_DIR, 'instagram.txt');

function initCookies() {
  if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
  }

  if (process.env.TWITTER_COOKIES_BASE64) {
    try {
      const decoded = Buffer.from(process.env.TWITTER_COOKIES_BASE64, 'base64').toString('utf-8');
      fs.writeFileSync(TWITTER_COOKIES_FILE, decoded);
      console.log('[Cookies] Twitter cookies loaded.');
    } catch (err) {
      console.error('[Cookies] Failed to decode Twitter cookies:', err.message);
    }
  } else {
    console.log('[Cookies] No Twitter cookies configured.');
  }

  if (process.env.INSTAGRAM_COOKIES_BASE64) {
    try {
      let decoded = Buffer.from(process.env.INSTAGRAM_COOKIES_BASE64, 'base64').toString('utf-8');
      
      // Duplicate cookies for .threads.net domain (since yt-dlp visits threads.net)
      const threadsCookies = decoded.replace(/\.instagram\.com/g, '.threads.net');
      decoded += '\n' + threadsCookies;

      fs.writeFileSync(INSTAGRAM_COOKIES_FILE, decoded);
      console.log('[Cookies] Instagram cookies loaded.');
    } catch (err) {
      console.error('[Cookies] Failed to decode Instagram cookies:', err.message);
    }
  } else {
    console.log('[Cookies] No Instagram cookies configured.');
  }
}

function getCookiesPath(platform) {
  if (platform === 'twitter' && fs.existsSync(TWITTER_COOKIES_FILE)) {
    return TWITTER_COOKIES_FILE;
  }
  if (platform === 'instagram' && fs.existsSync(INSTAGRAM_COOKIES_FILE)) {
    return INSTAGRAM_COOKIES_FILE;
  }
  return null;
}

module.exports = { initCookies, getCookiesPath };
