# 🤖 Telegram Video Downloader Bot

Telegram bot tự động tải video từ YouTube, TikTok, Facebook và gửi lại cho user.

## ✨ Features

- ✅ Auto-detect video URLs
- ✅ Download 1080p (best quality)
- ✅ Support: YouTube, TikTok, Facebook
- ✅ File size validation (50MB Telegram limit)
- ✅ Progress messages
- ✅ Error handling

## 🚀 Deploy to Render.com

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deploy

1. Fork this repo
2. Create new Web Service on Render.com
3. Set environment variables:
   - `TELEGRAM_BOT_TOKEN` - Your bot token from @BotFather
   - `GEMINI_API_KEY` - Your Gemini API key (optional)
4. Deploy!

See [RENDER_DEPLOY.md](RENDER_DEPLOY.md) for detailed instructions.

## 🏠 Local Development

### Requirements

- Node.js 14+
- yt-dlp

### Setup

```bash
# Install dependencies
npm install

# Install yt-dlp (Windows)
# Double-click install-yt-dlp.bat
# Or download from: https://github.com/yt-dlp/yt-dlp/releases

# Configure environment
cp .env.example .env
# Edit .env and add your TELEGRAM_BOT_TOKEN

# Run bot
node telegram-bot.js
# Or double-click start-telegram-bot.bat
```

### Environment Variables

- `TELEGRAM_BOT_TOKEN` - Required. Get from @BotFather
- `GEMINI_API_KEY` - Optional. For AI features
- `PORT` - Default: 3000
- `APP_URL` - Your app URL for large file links

## 📖 Usage

1. Start bot: `node telegram-bot.js`
2. Open Telegram, find your bot
3. Send video link (YouTube/TikTok/Facebook)
4. Bot downloads and sends video!

### Commands

- `/start` - Welcome message
- `/help` - Help guide
- Send video URL - Auto download

## 📁 Project Structure

```
telegram-video-bot/
├── telegram-bot.js          # Main bot code
├── package.json             # Dependencies
├── .env.example            # Environment template
├── Procfile                # Render config
├── install-yt-dlp-render.sh # yt-dlp install script
├── RENDER_DEPLOY.md        # Deploy guide
└── README.md               # This file
```

## 🛠️ Tech Stack

- Node.js + node-telegram-bot-api
- yt-dlp (video downloader)
- Telegram Bot API (polling)

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome!

## ⚠️ Disclaimer

For educational purposes only. Respect copyright and platform terms of service.
