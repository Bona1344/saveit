FROM node:20-slim

# Install Python, pip, FFmpeg
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

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
