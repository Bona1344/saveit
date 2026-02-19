const fs = require('fs');
const path = require('path');

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function cleanupTmpFiles(tmpDir) {
  const resolvedDir = path.resolve(tmpDir);

  if (!fs.existsSync(resolvedDir)) {
    console.log('[Cleanup] Tmp directory does not exist, skipping.');
    return;
  }

  const now = Date.now();
  let deletedCount = 0;

  try {
    const files = fs.readdirSync(resolvedDir);

    for (const file of files) {
      const filePath = path.join(resolvedDir, file);

      try {
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          const age = now - stats.mtimeMs;

          if (age > MAX_AGE_MS) {
            fs.unlinkSync(filePath);
            console.log(`[Cleanup] Deleted: ${file} (age: ${Math.round(age / 1000)}s)`);
            deletedCount++;
          }
        }
      } catch (err) {
        console.error(`[Cleanup] Error processing file ${file}:`, err.message);
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cleanup] Removed ${deletedCount} expired file(s).`);
    }
  } catch (err) {
    console.error('[Cleanup] Error scanning tmp directory:', err.message);
  }
}

function startCleanupJob(tmpDir) {
  console.log('[Cleanup] Starting cleanup job (every 5 minutes, files older than 10 minutes).');

  // Run once immediately
  cleanupTmpFiles(tmpDir);

  // Then run on interval
  const intervalId = setInterval(() => {
    cleanupTmpFiles(tmpDir);
  }, CLEANUP_INTERVAL_MS);

  return intervalId;
}

module.exports = { startCleanupJob, cleanupTmpFiles };
