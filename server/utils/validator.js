const http = require('http');
const https = require('https');

const PLATFORM_PATTERNS = [
  {
    name: "youtube",
    patterns: [
      /^(https?:\/\/)?(www\.)?youtube\.com\//i,
      /^(https?:\/\/)?(www\.)?youtu\.be\//i,
      /^(https?:\/\/)?(m\.)?youtube\.com\//i,
    ],
  },
  {
    name: "twitter",
    patterns: [
      /^(https?:\/\/)?(www\.)?twitter\.com\//i,
      /^(https?:\/\/)?(www\.)?x\.com\//i,
      /^(https?:\/\/)?(mobile\.)?twitter\.com\//i,
    ],
  },
  {
    name: "instagram",
    patterns: [/^(https?:\/\/)?(www\.)?instagram\.com\//i],
  },
  {
    name: "tiktok",
    patterns: [
      /^(https?:\/\/)?(www\.)?tiktok\.com\//i,
      /^(https?:\/\/)?(vm\.)?tiktok\.com\//i,
      /^(https?:\/\/)?(vt\.)?tiktok\.com\//i,
    ],
  },
  {
    name: "threads",
    patterns: [
      /^(https?:\/\/)?(www\.)?threads\.net\//i,
      /^(https?:\/\/)?(www\.)?threads\.com\//i,
    ],
  },
];

function isValidUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return false;
    }
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function getPlatform(url) {
  if (!url || typeof url !== "string") {
    return "unknown";
  }

  const trimmed = url.trim();

  for (const platform of PLATFORM_PATTERNS) {
    for (const pattern of platform.patterns) {
      if (pattern.test(trimmed)) {
        return platform.name;
      }
    }
  }

  return "unknown";
}

function isSupportedPlatform(url) {
  return getPlatform(url) !== "unknown";
}

function resolveUrl(url) {
  const shortened = [/vt\.tiktok\.com/i, /vm\.tiktok\.com/i, /t\.co/i];
  const isShort = shortened.some(p => p.test(url));
  if (!isShort) return Promise.resolve(url);

  console.log('[Resolver] Resolving:', url);
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('[Resolver] Resolved to:', res.headers.location);
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
      res.resume();
    });
    req.on('error', () => resolve(url));
    req.setTimeout(5000, () => { req.destroy(); resolve(url); });
  });
}

module.exports = { isValidUrl, getPlatform, isSupportedPlatform, resolveUrl };
