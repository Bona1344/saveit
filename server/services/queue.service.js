const path = require('path');
const { downloadMedia } = require('./ytdlp.service');
const { v4: uuidv4 } = require('uuid');

// In-memory job store (no Redis needed)
const jobs = new Map();

function setupWorker(tmpDir) {
  console.log('[Queue] In-memory job queue initialized (no Redis required).');
  // Worker is implicit — jobs are processed in addDownloadJob
  return { tmpDir: path.resolve(tmpDir) };
}

async function addDownloadJob(url, formatId, quality) {
  const jobId = uuidv4();

  jobs.set(jobId, {
    status: 'processing',
    progress: 10,
    result: null,
    error: null,
  });

  console.log(`[Queue] Added job ${jobId} for URL: ${url}`);

  // Process the download in the background (non-blocking)
  const tmpDir = path.resolve(process.env.TMP_DIR || './tmp');

  setImmediate(async () => {
    try {
      const job = jobs.get(jobId);
      if (job) job.progress = 30;

      console.log(`[Queue] Processing job ${jobId}...`);
      const outputFile = await downloadMedia(url, formatId, quality, tmpDir);

      const updatedJob = jobs.get(jobId);
      if (updatedJob) {
        updatedJob.status = 'done';
        updatedJob.progress = 100;
        updatedJob.result = { filename: outputFile };
      }

      console.log(`[Queue] Job ${jobId} completed: ${outputFile}`);

      // Auto-cleanup job from memory after 30 minutes
      setTimeout(() => {
        jobs.delete(jobId);
      }, 30 * 60 * 1000);
    } catch (err) {
      console.error(`[Queue] Job ${jobId} failed:`, err.message);
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.error = err.message;
      }
    }
  });

  return jobId;
}

async function getJobStatus(jobId) {
  const job = jobs.get(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  if (job.status === 'done') {
    return {
      status: 'done',
      filename: job.result?.filename || null,
    };
  }

  if (job.status === 'failed') {
    return {
      status: 'failed',
      error: job.error || 'Unknown error occurred',
    };
  }

  return {
    status: 'processing',
    progress: job.progress || 0,
  };
}

module.exports = { setupWorker, addDownloadJob, getJobStatus };
