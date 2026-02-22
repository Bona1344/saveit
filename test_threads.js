const https = require('https');

function fetchUrl(url) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
    };
    
    https.get(url, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log('Redirecting to:', res.headers.location);
            return fetchUrl(res.headers.location);
        }
        
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            console.log('Final Status:', res.statusCode);
            
            // Look for the JSON state block that contains the video URL
            const jsonMatch = body.match(/{"require":\[\["ScheduledApplyRequireElements",.*?\]\]}/);
            
            if (jsonMatch) {
                console.log('Found Threads JSON state block.');
                try {
                    // Try to find a direct mp4 link in the text
                    const urls = body.match(/https:\/\/[^"']+\.mp4[^"']*/g);
                    if (urls && urls.length > 0) {
                        // Filter out escaped slashes
                        const cleanUrls = urls.map(u => u.replace(/\\/g, ''));
                        console.log('Found video URLs:', cleanUrls.slice(0, 2));
                    } else {
                        console.log('No direct .mp4 URLs found in text.');
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e.message);
                }
            } else {
                console.log('Could not find Threads JSON state block.');
                const urls = body.match(/https:\/\/[^"']+\.mp4[^"']*/g);
                if (urls && urls.length > 0) {
                    const cleanUrls = urls.map(u => u.replace(/\\/g, ''));
                    console.log('Found video URLs anyway:', cleanUrls.slice(0, 2));
                }
            }
        });
    }).on('error', err => console.error(err));
}

fetchUrl('https://www.threads.net/@therealtoriabrooke/post/DU6dJFCEWOO');
