const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
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
  const flags = [];
  if (/twitter\.com|x\.com/i.test(url)) {
    // Use guest token API for Twitter/X (no auth needed)
    flags.push('--extractor-args', '"twitter:api=graphql"');
    flags.push('--user-agent', '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"');
  }
  return flags.join(' ');
}

async function getInfo(url) {
  console.log('[yt-dlp] Fetching info for:', url);

  try {
    const platformFlags = getPlatformFlags(url);
    const command = `yt-dlp --dump-json --no-playlist ${platformFlags} "${url}"`;
    console.log('[yt-dlp] Command:', command);
    const stdout = await execPromise(command);
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

  const filename = `${uuidv4()}`;
  let ext = 'mp4';
  let formatArg = '';

  if (quality === 'audio-only' || formatId === 'audio-only') {
    formatArg = '-f bestaudio --extract-audio --audio-format mp3';
    ext = 'mp3';
  } else if (!formatId || formatId === 'best') {
    formatArg = '-f bestvideo+bestaudio/best --merge-output-format mp4';
  } else {
    formatArg = `-f ${formatId}+bestaudio/best --merge-output-format mp4`;
  }

  const outputTemplate = path.join(outputDir, `${filename}.%(ext)s`);
  const platformFlags = getPlatformFlags(url);

  const command = `yt-dlp ${formatArg} --no-playlist ${platformFlags} -o "${outputTemplate}" "${url}"`;

  console.log('[yt-dlp] Running command:', command);

  try {
    await execPromise(command);

    // Find the actual output file (yt-dlp may change extension)
    const fs = require('fs');
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
