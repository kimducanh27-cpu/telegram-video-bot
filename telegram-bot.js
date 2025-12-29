// ============================================
// TELEGRAM VIDEO DOWNLOADER BOT
// Automatically download and send videos when user sends links
// ============================================

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file!');
    console.error('Please add: TELEGRAM_BOT_TOKEN=your_bot_token');
    process.exit(1);
}

// Create bot instance with polling
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Express server for health check (prevents Render sleep)
const express = require('express');
const app = express();
const axios = require('axios');

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        bot: 'running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('🤖 Telegram Video Downloader Bot is running!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🌐 Health server running on port ${PORT}`);
});

// Auto self-ping to prevent Render sleep (every 10 minutes)
if (process.env.APP_URL && process.env.APP_URL.includes('render')) {
    console.log('⏰ Self-ping enabled for Render deployment');

    setInterval(async () => {
        try {
            const response = await axios.get(`${process.env.APP_URL}/health`);
            console.log(`✅ Self-ping: ${response.data.status} (uptime: ${Math.floor(response.data.uptime)}s)`);
        } catch (err) {
            console.log('❌ Self-ping failed:', err.message);
        }
    }, 10 * 60 * 1000); // Every 10 minutes
}

console.log('🤖 Telegram Video Downloader Bot is running...');
console.log('✅ Waiting for messages...');

// ============================================
// COMMAND: /start
// ============================================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎬 **Video Downloader Bot**

Chào mừng! Gửi link video để tôi tải về cho bạn.

✅ **Hỗ trợ:**
• YouTube (1080p)
• TikTok
• Facebook

📝 **Cách dùng:**
Chỉ cần gửi link video, tôi sẽ tự động tải và gửi lại cho bạn!

💡 **Ví dụ:**
\`https://youtube.com/watch?v=xxx\`

📊 **Giới hạn:** 50MB/video
    `;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    console.log(`👋 New user: ${msg.from.first_name} (${chatId})`);
});

// ============================================
// COMMAND: /help
// ============================================
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 **Hướng dẫn sử dụng**

**Các nền tảng hỗ trợ:**
• YouTube - Chất lượng 1080p
• TikTok - Best quality
• Facebook - Best quality

**Cách sử dụng:**
1. Gửi link video
2. Đợi bot tải (có thể mất 1-2 phút)
3. Nhận video!

**Lưu ý:**
• Video quá 50MB sẽ không gửi được
• Một số video có thể bị lỗi bản quyền

❓ Thắc mắc? Liên hệ admin!
    `;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// ============================================
// DETECT VIDEO URL
// ============================================
function detectVideoURL(text) {
    if (!text) return null;

    // YouTube
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/i;
    const youtubeMatch = text.match(youtubeRegex);
    if (youtubeMatch) {
        return {
            url: youtubeMatch[0],
            platform: 'youtube'
        };
    }

    // TikTok
    const tiktokRegex = /(https?:\/\/)?(www\.|vm\.|vt\.)?tiktok\.com\/([@a-zA-Z0-9_-]+\/video\/[0-9]+|[a-zA-Z0-9]+)/i;
    const tiktokMatch = text.match(tiktokRegex);
    if (tiktokMatch) {
        return {
            url: tiktokMatch[0],
            platform: 'tiktok'
        };
    }

    // Facebook - updated to support share links
    const facebookRegex = /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com)\/(watch\/\?v=|video\.php\?v=|share\/v\/|[a-zA-Z0-9.]+\/(videos|posts)\/)?([a-zA-Z0-9_-]+)/i;
    const facebookMatch = text.match(facebookRegex);
    if (facebookMatch) {
        return {
            url: facebookMatch[0],
            platform: 'facebook'
        };
    }

    return null;
}

// ============================================
// DOWNLOAD VIDEO 1080P
// ============================================
function downloadVideo(url, platform) {
    return new Promise((resolve, reject) => {
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `telegram_${platform}_${Date.now()}.mp4`);

        console.log(`📥 Downloading from ${platform}: ${url}`);

        // Build yt-dlp arguments for 1080p
        let formatString = '';

        if (platform === 'youtube') {
            // Use single stream format (no merging needed)
            formatString = 'best[ext=mp4]/best';
        } else {
            // For TikTok and Facebook
            formatString = 'best[ext=mp4]/best';
        }

        const ytdlpArgs = [
            '-f', formatString,
            '--merge-output-format', 'mp4',
            '-o', tempFile,
            '--no-playlist',
            '--no-warnings',
            '--no-check-certificate',
            url
        ];

        // Use local yt-dlp file (works on Windows and Linux)
        const ytdlpPath = fs.existsSync(path.join(__dirname, 'yt-dlp.exe'))
            ? path.join(__dirname, 'yt-dlp.exe')  // Windows
            : path.join(__dirname, 'yt-dlp');      // Linux/Render
        const ytdlpProcess = spawn(ytdlpPath, ytdlpArgs);

        let errorOutput = '';
        let stdOutput = '';

        ytdlpProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log('[yt-dlp stderr]:', data.toString());
        });

        ytdlpProcess.stdout.on('data', (data) => {
            stdOutput += data.toString();
            console.log('[yt-dlp stdout]:', data.toString());
        });

        ytdlpProcess.on('close', async (code) => {
            if (code === 0) {
                // Wait a bit for file to be fully written/merged
                console.log('⏳ Waiting for file to be merged...');

                // Check for file existence multiple times
                let attempts = 0;
                const maxAttempts = 10;

                while (attempts < maxAttempts) {
                    if (fs.existsSync(tempFile)) {
                        console.log('✅ Download completed:', tempFile);
                        resolve(tempFile);
                        return;
                    }

                    // Wait 500ms between checks
                    await new Promise(r => setTimeout(r, 500));
                    attempts++;
                }

                // File not found after waiting
                console.error('❌ File not found after yt-dlp completed:');
                console.error('Expected file:', tempFile);
                console.error('Exit code:', code);
                reject(new Error('Downloaded but file not found. yt-dlp may need ffmpeg to merge.'));
            } else {
                console.error('❌ yt-dlp failed:');
                console.error('Exit code:', code);
                console.error('Stderr:', errorOutput);
                console.error('Stdout:', stdOutput);
                reject(new Error(`Download failed (code ${code}). Check logs for details.`));
            }
        });

        ytdlpProcess.on('error', (err) => {
            console.error('❌ yt-dlp error:', err);
            reject(new Error('yt-dlp not found. Please install yt-dlp.'));
        });

        // Timeout after 3 minutes
        setTimeout(() => {
            ytdlpProcess.kill();
            reject(new Error('Download timeout (3 minutes)'));
        }, 180000);
    });
}

// ============================================
// MESSAGE HANDLER
// ============================================
bot.on('message', async (msg) => {
    // Ignore commands
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (!messageText) {
        return;
    }

    console.log(`📩 Message from ${msg.from.first_name}: ${messageText}`);

    // Detect video URL
    const videoInfo = detectVideoURL(messageText);

    if (!videoInfo) {
        // No video URL found
        bot.sendMessage(chatId,
            '❌ Không tìm thấy link video.\n\n' +
            'Gửi /help để xem hướng dẫn!'
        );
        return;
    }

    // Video URL found - start downloading
    const statusMsg = await bot.sendMessage(chatId,
        `⏳ Đang tải video ${videoInfo.platform} 1080p...\n\n` +
        `⏱️ Có thể mất 1-2 phút, vui lòng đợi!`
    );

    try {
        const videoPath = await downloadVideo(videoInfo.url, videoInfo.platform);

        if (!videoPath) {
            throw new Error('Download failed');
        }

        // Check file size
        const stats = fs.statSync(videoPath);
        const fileSizeMB = stats.size / (1024 * 1024);

        console.log(`📦 Video size: ${fileSizeMB.toFixed(2)}MB`);

        if (fileSizeMB > 50) {
            // File too large for Telegram
            await bot.sendMessage(chatId,
                `⚠️ Video quá lớn (${fileSizeMB.toFixed(1)}MB > 50MB limit).\n\n` +
                `Telegram không cho phép gửi video >50MB.\n` +
                `Bạn có thể tải trực tiếp tại:\n${process.env.APP_URL || 'http://localhost:3000'}`
            );

            // Cleanup
            fs.unlinkSync(videoPath);

            // Delete status message
            await bot.deleteMessage(chatId, statusMsg.message_id);
            return;
        }

        // Update status
        await bot.editMessageText(
            `📤 Đang gửi video (${fileSizeMB.toFixed(1)}MB)...`,
            {
                chat_id: chatId,
                message_id: statusMsg.message_id
            }
        );

        // Send video
        await bot.sendVideo(chatId, videoPath, {
            caption: `✅ Tải xong!\n📺 Platform: ${videoInfo.platform}\n📊 Size: ${fileSizeMB.toFixed(1)}MB`
        });

        console.log('✅ Video sent successfully');

        // Delete status message
        await bot.deleteMessage(chatId, statusMsg.message_id);

        // Cleanup
        fs.unlinkSync(videoPath);

    } catch (error) {
        console.error('❌ Error:', error.message);

        await bot.editMessageText(
            `❌ Lỗi: ${error.message}\n\n` +
            `Vui lòng thử lại hoặc gửi link khác.`,
            {
                chat_id: chatId,
                message_id: statusMsg.message_id
            }
        );
    }
});

// ============================================
// ERROR HANDLING
// ============================================
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

console.log('✅ Bot is ready! Send a video link to start downloading.');
