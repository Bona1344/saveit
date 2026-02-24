const https = require('https');
const fs = require('fs');

const urls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.threads.com/@therealtoriabrooke/post/DU6dJFCEWOO',
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ url });
    const req = https.request({
      hostname: 'saveit-backend.up.railway.app',
      path: '/api/info',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, res => {
      let chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ url, status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', e => resolve({ url, error: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  const results = [];
  for (const url of urls) {
    const r = await testUrl(url);
    results.push(r);
    console.log(`${r.status === 200 ? '✓' : '✗'} ${url} -> ${r.status}`);
  }
  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
  console.log('\nDone - see test_results.json');
})();
