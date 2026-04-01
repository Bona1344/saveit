/**
 * Export YouTube cookies from Chrome to Netscape cookie format.
 * Chrome encrypts cookies, so we use yt-dlp's built-in browser cookie extraction.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'youtube_cookies.txt');

console.log('Exporting YouTube cookies from Chrome...');
console.log('NOTE: Close Chrome first, or this may fail!\n');

try {
  // Use yt-dlp to extract cookies from Chrome browser
  // yt-dlp has built-in support for reading Chrome's encrypted cookies
  const cmd = `yt-dlp --cookies-from-browser chrome --cookies "${OUTPUT_FILE}" --simulate "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`;
  console.log('Running:', cmd);
  execSync(cmd, { stdio: 'inherit', timeout: 30000 });
  
  if (fs.existsSync(OUTPUT_FILE)) {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    const lines = content.split('\n').filter(l => l.includes('youtube.com') || l.includes('.youtube.'));
    console.log(`\n✓ Exported ${lines.length} YouTube cookies to ${OUTPUT_FILE}`);
    
    // Base64 encode for Railway env var
    const base64 = fs.readFileSync(OUTPUT_FILE).toString('base64');
    const base64File = path.join(__dirname, 'youtube_cookies_base64.txt');
    fs.writeFileSync(base64File, base64);
    console.log(`✓ Base64 encoded version saved to ${base64File}`);
    console.log(`\nCopy the contents of ${base64File} and paste it as the YOUTUBE_COOKIES_BASE64 env var in Railway.`);
  } else {
    console.log('✗ Cookie file was not created');
  }
} catch (err) {
  console.error('Failed:', err.message);
  console.log('\nAlternative: Install "Get cookies.txt LOCALLY" Chrome extension:');
  console.log('https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc');
  console.log('Then export cookies from youtube.com and run:');
  console.log('  $bytes = [System.IO.File]::ReadAllBytes("path\\to\\cookies.txt")');
  console.log('  [Convert]::ToBase64String($bytes) | Set-Clipboard');
}
