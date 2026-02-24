const https = require('https');
const fs = require('fs');

const BACKEND = 'saveit-backend.up.railway.app';
const THREADS_URL = 'https://www.threads.com/@therealtoriabrooke/post/DU6dJFCEWOO';

function apiCall(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BACKEND,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.headers['Content-Length'] = data.length;

    const req = https.request(options, res => {
      let chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(Buffer.concat(chunks).toString()) });
        } catch (e) {
          resolve({ status: res.statusCode, data: Buffer.concat(chunks).toString() });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Step 1: Fetch info
  console.log('=== Step 1: Fetch Threads info ===');
  const info = await apiCall('/api/info', 'POST', { url: THREADS_URL });
  console.log('Status:', info.status);
  if (info.status === 200) {
    console.log('Title:', info.data.title);
    console.log('Thumbnail:', info.data.thumbnail ? 'YES' : 'NO');
    console.log('Platform:', info.data.platform);
    console.log('Formats:', info.data.formats?.length || 0);
    if (info.data.formats) {
      info.data.formats.forEach(f => console.log('  -', f.label));
    }
  } else {
    console.log('ERROR:', JSON.stringify(info.data));
    return;
  }

  // Step 2: Start download
  console.log('\n=== Step 2: Start download ===');
  const dl = await apiCall('/api/download', 'POST', {
    url: THREADS_URL,
    format_id: 'best',
    quality: 'best'
  });
  console.log('Status:', dl.status);
  console.log('Job ID:', dl.data.jobId);

  if (!dl.data.jobId) {
    console.log('ERROR: No job ID returned');
    return;
  }

  // Step 3: Poll status
  console.log('\n=== Step 3: Poll download status ===');
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await apiCall(`/api/status/${dl.data.jobId}`, 'GET');
    console.log(`Poll ${i+1}: ${status.data.status}${status.data.filename ? ' -> ' + status.data.filename : ''}${status.data.error ? ' ERROR: ' + status.data.error : ''}`);
    
    if (status.data.status === 'done') {
      console.log('\n✓ DOWNLOAD COMPLETE:', status.data.filename);
      return;
    }
    if (status.data.status === 'failed') {
      console.log('\n✗ DOWNLOAD FAILED:', status.data.error);
      return;
    }
  }
  console.log('\n⚠ TIMEOUT: Download did not complete in 40 seconds');
}

main().catch(console.error);
