const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Follow HTTP redirects and return the final response body.
 */
function fetchPage(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      }
    };

    const req = client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects <= 0) {
          return reject(new Error('Too many redirects'));
        }
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        console.log('[Threads] Redirect:', res.statusCode, '->', redirectUrl);
        res.resume();
        return fetchPage(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }

      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ body, status: res.statusCode, finalUrl: url }));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

/**
 * Download a file from a direct URL and save to disk.
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.threads.com/',
      }
    };

    const follow = (targetUrl, redirectsLeft = 5) => {
      const c = targetUrl.startsWith('https') ? https : http;
      c.get(targetUrl, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) return reject(new Error('Too many redirects'));
          res.resume();
          return follow(res.headers.location, redirectsLeft - 1);
        }

        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Download failed with status ${res.statusCode}`));
        }

        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', (err) => { fs.unlink(outputPath, () => {}); reject(err); });
      }).on('error', reject);
    };

    follow(url);
  });
}

/**
 * Extract video/image info from Threads page HTML.
 * Tries multiple strategies:
 * 1. og:video meta tag (direct video URL)
 * 2. og:image meta tag (for image posts)
 * 3. JSON-LD structured data
 * 4. Inline JSON state data
 */
function extractMediaFromHtml(html, pageUrl) {
  const result = {
    title: null,
    thumbnail: null,
    videoUrl: null,
    imageUrl: null,
    uploader: null,
    isVideo: false,
  };

  // Extract og:video (direct video URL)
  const ogVideoMatch = html.match(/<meta\s+property="og:video(?::url)?"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:video(?::url)?"/i);
  if (ogVideoMatch) {
    result.videoUrl = ogVideoMatch[1].replace(/&amp;/g, '&');
    result.isVideo = true;
    console.log('[Threads] Found og:video:', result.videoUrl.substring(0, 100) + '...');
  }

  // Extract og:image (thumbnail or image post)
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
  if (ogImageMatch) {
    result.thumbnail = ogImageMatch[1].replace(/&amp;/g, '&');
    if (!result.videoUrl) {
      result.imageUrl = result.thumbnail;
    }
  }

  // Extract title from og:title or <title>
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    || html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
  if (ogTitleMatch) {
    result.title = ogTitleMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  }

  // Extract og:description for fallback title
  if (!result.title) {
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
    if (ogDescMatch) {
      result.title = ogDescMatch[1].replace(/&amp;/g, '&').substring(0, 100);
    }
  }

  // Try extracting uploader from URL
  const uploaderMatch = pageUrl.match(/@([^/]+)/);
  if (uploaderMatch) {
    result.uploader = '@' + uploaderMatch[1];
  }

  // Fallback: look for video URLs in the HTML body (encoded or plain)
  if (!result.videoUrl) {
    // Look for .mp4 URLs in the page
    const mp4Match = html.match(/https?:\\\/\\\/[^"'\s]+\.mp4[^"'\s]*/g)
      || html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g);
    if (mp4Match && mp4Match.length > 0) {
      result.videoUrl = mp4Match[0].replace(/\\\//g, '/').replace(/&amp;/g, '&');
      result.isVideo = true;
      console.log('[Threads] Found mp4 URL in body:', result.videoUrl.substring(0, 100) + '...');
    }
  }

  // Fallback: look for video_versions in JSON
  if (!result.videoUrl) {
    const videoVersionsMatch = html.match(/"video_versions"\s*:\s*\[([^\]]+)\]/);
    if (videoVersionsMatch) {
      const urlMatch = videoVersionsMatch[1].match(/"url"\s*:\s*"([^"]+)"/);
      if (urlMatch) {
        result.videoUrl = urlMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
        result.isVideo = true;
        console.log('[Threads] Found video_versions URL:', result.videoUrl.substring(0, 100) + '...');
      }
    }
  }

  if (!result.title) {
    result.title = result.uploader ? `Threads post by ${result.uploader}` : 'Threads Post';
  }

  return result;
}

/**
 * Fetch info for a Threads post.
 * Returns the same shape as ytdlp.service.js getInfo().
 */
async function getThreadsInfo(url) {
  console.log('[Threads] Fetching info for:', url);

  // Normalize URL: ensure it starts with https://
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    const { body, finalUrl } = await fetchPage(url);
    console.log('[Threads] Page fetched, length:', body.length);

    const media = extractMediaFromHtml(body, finalUrl);

    if (!media.videoUrl && !media.imageUrl) {
      throw new Error('Could not find any media in this Threads post. The post may be private or contain only text.');
    }

    const formats = [];

    if (media.isVideo && media.videoUrl) {
      formats.push({
        format_id: 'best',
        label: 'Best Quality (Video)',
        ext: 'mp4',
        resolution: 'Best',
        filesize: null,
        hasVideo: true,
        hasAudio: true,
      });
    } else if (media.imageUrl) {
      formats.push({
        format_id: 'image',
        label: 'Image (Original)',
        ext: 'jpg',
        resolution: 'Original',
        filesize: null,
        hasVideo: false,
        hasAudio: false,
      });
    }

    return {
      title: media.title,
      thumbnail: media.thumbnail,
      duration: null,
      uploader: media.uploader,
      formats,
      _threadsVideoUrl: media.videoUrl,
      _threadsImageUrl: media.imageUrl,
    };
  } catch (err) {
    console.error('[Threads] Error:', err.message);
    throw new Error(`Failed to fetch Threads post: ${err.message}`);
  }
}

/**
 * Download media from a Threads post.
 * Returns the output filename.
 */
async function downloadThreadsMedia(url, formatId, quality, outputDir) {
  console.log('[Threads] Starting download:', { url, formatId, quality });

  // First get the info to find the media URL
  const info = await getThreadsInfo(url);

  const mediaUrl = info._threadsVideoUrl || info._threadsImageUrl;
  if (!mediaUrl) {
    throw new Error('No downloadable media found in this Threads post.');
  }

  const ext = info._threadsVideoUrl ? 'mp4' : 'jpg';
  const shortId = uuidv4().split('-')[0];
  const filename = `saveit_${shortId}.${ext}`;
  const outputPath = path.join(outputDir, filename);

  console.log('[Threads] Downloading media to:', outputPath);
  await downloadFile(mediaUrl, outputPath);

  if (!fs.existsSync(outputPath)) {
    throw new Error('Download completed but output file not found');
  }

  const stats = fs.statSync(outputPath);
  console.log('[Threads] Download complete:', filename, `(${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  return filename;
}

module.exports = { getThreadsInfo, downloadThreadsMedia };
