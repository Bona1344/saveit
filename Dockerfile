FROM node:20-slim

# Install Python, pip, FFmpeg, git, and other dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl ca-certificates git && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies needed by yt-dlp extractors
RUN pip3 install --break-system-packages websockets requests brotli certifi mutagen pycryptodomex curl_cffi

# Install yt-dlp (nightly for latest site fixes including Twitter/X)
RUN curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Verify yt-dlp installation
RUN yt-dlp --version

WORKDIR /app

# Copy server package files and install deps
COPY server/package*.json ./
RUN npm install --production

# Copy server code
COPY server/ .

# Create tmp directory
RUN mkdir -p /app/tmp

EXPOSE 5000

CMD ["node", "index.js"]
