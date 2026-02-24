const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getCookiesPath } = require('../utils/cookies');
const { getPlatform } = require('../utils/validator');

function execPromise(command, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { maxBuffer: 1024 * 1024 * 50, timeout: timeoutMs }, (error, stdout, stderr) => {
      if (stderr) {
        console.log('[yt-dlp] stderr:', stderr.slice(0, 500));
      }
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// Get platform-specific yt-dlp flags
function getPlatformFlags(url) {
  const flags = [
    '--no-check-certificates',
    '--geo-bypass',
    '--user-agent', '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
  ];
  // Add cookies for platforms that need them
  const platform = getPlatform(url);
  const cookiesPath = getCookiesPath(platform);
  if (cookiesPath) {
    flags.push('--cookies', `"${cookiesPath}"`);
  }
  // YouTube: use nodejs runtime for NSIG decryption, and web player client
  if (/youtu(be\.com|\.be)/i.test(url)) {
    flags.push('--extractor-args', '"youtube:player_client=web"');
  }
  if (/tiktok\.com/i.test(url)) {
    flags.push('--extractor-args', '"tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com"');
    flags.push('--impersonate', 'chrome');
  }
  return flags.join(' ');
}

// Speed optimization flags for yt-dlp
function getSpeedFlags() {
  return [
    '--concurrent-fragments', '4',
    '--no-part',
    '--buffer-size', '16K',
    '--no-warnings',
  ].join(' ');
}

async function getInfo(url) {
  console.log('[yt-dlp] Fetching info for:', url);

  try {
    const platformFlags = getPlatformFlags(url);
    const command = `yt-dlp --dump-json --no-playlist ${platformFlags} "${url}"`;
    console.log('[yt-dlp] Command:', command);
    const stdout = await execPromise(command, 60000);
    const rawInfo = JSON.parse(stdout);

    console.log('[yt-dlp] Got info:', rawInfo.title);

    const formats = [];

    // Add "Best Quality" option at the top
    formats.push({
      format_id: 'best',
      label: 'Best Quality (Video + Audio)',
      ext: 'mp4',
      resolution: 'Best',
      filesize: null,
      hasVideo: true,
      hasAudio: true,
    });

    // Process available formats
    if (rawInfo.formats && Array.isArray(rawInfo.formats)) {
      const seen = new Set();

      for (const fmt of rawInfo.formats) {
        const resolution = fmt.resolution || fmt.height ? `${fmt.height || '?'}p` : null;
        const hasVideo = fmt.vcodec && fmt.vcodec !== 'none';
        const hasAudio = fmt.acodec && fmt.acodec !== 'none';

        if (!resolution || resolution === '?p' || (!hasVideo && !hasAudio)) {
          continue;
        }

        const key = `${resolution}-${fmt.ext}-${hasVideo}-${hasAudio}`;
        if (seen.has(key)) continue;
        seen.add(key);

        formats.push({
          format_id: fmt.format_id,
          label: `${resolution} ${fmt.ext ? fmt.ext.toUpperCase() : ''}${hasVideo && hasAudio ? '' : hasVideo ? ' (Video Only)' : ' (Audio Only)'}`.trim(),
          ext: fmt.ext || 'mp4',
          resolution: resolution,
          filesize: fmt.filesize || fmt.filesize_approx || null,
          hasVideo,
          hasAudio,
        });
      }
    }

    // Add audio-only option at the bottom
    formats.push({
      format_id: 'audio-only',
      label: 'Audio Only (MP3)',
      ext: 'mp3',
      resolution: 'Audio',
      filesize: null,
      hasVideo: false,
      hasAudio: true,
    });

    // Format duration
    let duration = null;
    if (rawInfo.duration) {
      const totalSeconds = Math.floor(rawInfo.duration);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        duration = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } else {
        duration = `${minutes}:${String(seconds).padStart(2, '0')}`;
      }
    }

    return {
      title: rawInfo.title || 'Untitled',
      thumbnail: rawInfo.thumbnail || null,
      duration: duration,
      uploader: rawInfo.uploader || rawInfo.channel || null,
      formats: formats,
    };
  } catch (err) {
    console.error('[yt-dlp] Error fetching info:', err.message);
    throw new Error(`Failed to fetch media info: ${err.message}`);
  }
}

async function downloadMedia(url, formatId, quality, outputDir) {
  console.log('[yt-dlp] Starting download:', { url, formatId, quality });

  const shortId = uuidv4().split('-')[0];
  const filename = `saveit_${shortId}`;
  let formatArg = '';

  if (quality === 'audio-only' || formatId === 'audio-only') {
    formatArg = '-f bestaudio --extract-audio --audio-format mp3';
  } else if (!formatId || formatId === 'best') {
    // Use single pre-merged file — no separate streams, no FFmpeg merge
    formatArg = '-f best';
  } else {
    // Use the specific format directly, fallback to best pre-merged
    formatArg = `-f ${formatId}/best`;
  }

  const outputTemplate = path.join(outputDir, `${filename}.%(ext)s`);
  const platformFlags = getPlatformFlags(url);
  const speedFlags = getSpeedFlags();

  const command = `yt-dlp ${formatArg} --no-playlist ${speedFlags} ${platformFlags} -o "${outputTemplate}" "${url}"`;

  console.log('[yt-dlp] Running command:', command);

  try {
    await execPromise(command, 300000);

    // Find the actual output file
    const files = fs.readdirSync(outputDir);
    const outputFile = files.find((f) => f.startsWith(filename));

    if (!outputFile) {
      throw new Error('Download completed but output file not found');
    }

    console.log('[yt-dlp] Download complete:', outputFile);
    return outputFile;
  } catch (err) {
    console.error('[yt-dlp] Download error:', err.message);
    throw new Error(`Download failed: ${err.message}`);
  }
}

module.exports = { getInfo, downloadMedia };
