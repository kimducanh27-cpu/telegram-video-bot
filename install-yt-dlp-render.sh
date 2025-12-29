#!/bin/bash
# Install yt-dlp on Render.com

echo "📥 Installing yt-dlp..."

# Download yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp

# Make it executable
chmod +x yt-dlp

# Verify installation
./yt-dlp --version

echo "✅ yt-dlp installed successfully!"
