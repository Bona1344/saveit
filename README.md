# SaveIt — Video & Media Downloader

A web app to download videos and images from YouTube, Twitter/X, Instagram, TikTok, and Threads.  
Paste a link → preview info → choose quality → download.

---

## Supported Platforms

| Platform    | Videos | Images | Audio |
| ----------- | ------ | ------ | ----- |
| YouTube     | ✅     | —      | ✅    |
| Twitter / X | ✅     | ✅     | ✅    |
| Instagram   | ✅     | ✅     | ✅    |
| TikTok      | ✅     | —      | ✅    |
| Threads     | ✅     | ✅     | ✅    |

---

## Prerequisites

Make sure the following are installed on your system:

1. **Node.js** (v18 or later) — [https://nodejs.org](https://nodejs.org)
2. **Python** (3.7+) — required by yt-dlp
3. **yt-dlp** — the media download engine
   ```bash
   pip install yt-dlp
   ```
4. **FFmpeg** — for merging video + audio streams
   - Windows: download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) and add to PATH
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`
5. **Redis** — for the job queue
   - Windows: use [Memurai](https://www.memurai.com/) or WSL
   - Mac: `brew install redis`
   - Linux: `sudo apt install redis-server`

---

## Installation

### 1. Clone the project

```bash
cd "vid downloader site"
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Running the App

You need **3 terminals** open:

### Terminal 1 — Start Redis

```bash
redis-server
```

On Windows (Memurai):

```bash
memurai-server
```

### Terminal 2 — Start the backend

```bash
cd server
node index.js
```

The server will start on `http://localhost:5000`.

### Terminal 3 — Start the frontend

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGIN=http://localhost:3000
TMP_DIR=./tmp
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## How It Works

1. **Paste Link** — Enter a video/post URL from any supported platform
2. **Choose Quality** — Preview title, thumbnail, and duration. Pick your format (video, audio, quality)
3. **Download** — The file is downloaded via yt-dlp in the background and served to you when ready

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Backend:** Node.js + Express.js
- **Media Engine:** yt-dlp (via child_process)
- **File Processing:** FFmpeg
- **Job Queue:** BullMQ + Redis
- **Rate Limiting:** express-rate-limit

---

## Project Structure

```
/server
  index.js              — Express app entry point
  /routes
    info.js             — POST /api/info
    download.js         — POST /api/download
    status.js           — GET /api/status/:jobId
  /services
    ytdlp.service.js    — yt-dlp integration
    queue.service.js    — BullMQ setup
  /utils
    cleanup.js          — tmp file cleanup
    validator.js        — URL validation
  /tmp                  — temp downloads (auto-created)

/client
  /app
    page.jsx            — main page
    layout.jsx          — root layout
    globals.css         — global styles + animations
  /components
    UrlInput.jsx        — URL input bar
    MediaCard.jsx       — media preview card
    FormatList.jsx      — quality selection grid
    ProgressBar.jsx     — download progress
    PlatformBadge.jsx   — platform color badge
  /lib
    api.js              — API utility functions
```

---

## License

For personal use only. Respect copyright laws.
