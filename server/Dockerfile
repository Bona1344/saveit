FROM node:20-slim

# Install Python, pip, FFmpeg, git, and other dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl ca-certificates git && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies needed by yt-dlp extractors
# websockets: required for Twitter/X
# requests: required for various extractors
# brotli: better compression support
# certifi: SSL certificates
RUN pip3 install --break-system-packages websockets requests brotli certifi mutagen pycryptodomex

# Install yt-dlp (nightly for latest site fixes including Twitter/X)
RUN curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Verify yt-dlp installation
RUN yt-dlp --version

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --production

# Copy server code
COPY . .

# Create tmp directory
RUN mkdir -p /app/tmp

EXPOSE 5000

CMD ["node", "index.js"]
