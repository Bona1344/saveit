/**
 * Convert cookie .txt files to base64 for Render env vars.
 * Usage: node encode_cookies.js <path-to-cookies.txt>
 * Output: copies base64 string to clipboard
 */
const fs = require('fs');
const { execSync } = require('child_process');

const file = process.argv[2];
if (!file) {
  console.log('Usage: node encode_cookies.js <path-to-cookies.txt>');
  console.log('Example: node encode_cookies.js twitter.txt');
  process.exit(1);
}

if (!fs.existsSync(file)) {
  console.log(`File not found: ${file}`);
  process.exit(1);
}

const content = fs.readFileSync(file);
const base64 = content.toString('base64');

// Copy to clipboard on Windows
execSync(`echo ${base64} | clip`);

console.log(`✓ Base64 encoded "${file}" and copied to clipboard!`);
console.log(`  Length: ${base64.length} characters`);
console.log(`\nNow paste this as the environment variable value in Render.`);
