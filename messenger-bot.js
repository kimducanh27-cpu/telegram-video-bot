// ============================================
// MESSENGER BOT - Video Downloader Integration
// Automatically download and send videos when user sends links
// ============================================

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// Facebook Configuration
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'my_verify_token_123';
const FB_GRAPH_API = 'https://graph.facebook.com/v18.0';

// ============================================
// WEBHOOK VERIFICATION (GET)
// ============================================
function setupWebhookRoutes(app) {
    // Verify webhook with Facebook
    app.get('/webhook', (req, res) => {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
                console.log('✅ Webhook verified!');
                res.status(200).send(challenge);
            } else {
                console.log('❌ Webhook verification failed');
                res.sendStatus(403);
            }
        }
    });

    // ============================================
    // WEBHOOK RECEIVER (POST)
    // ============================================
    app.post('/webhook', (req, res) => {
        const body = req.body;

        if (body.object === 'page') {
            body.entry.forEach(entry => {
                const webhookEvent = entry.messaging[0];
                const senderId = webhookEvent.sender.id;

                if (webhookEvent.message) {
                    handleMessage(senderId, webhookEvent.message);
                }
            });

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    });
}

// ============================================
// MESSAGE HANDLER
// ============================================
async function handleMessage(senderId, message) {
    console.log(`📩 Message from ${senderId}:`, message.text);

    const messageText = message.text;

    if (!messageText) {
        return;
    }

    // Detect video URL
    const videoInfo = detectVideoURL(messageText);

    if (!videoInfo) {
        // No video URL found - send help message
        await sendTextMessage(senderId, 
            "👋 Chào bạn! Gửi link video để tôi tải về cho bạn.\n\n" +
            "✅ Hỗ trợ:\n" +
            "• YouTube\n" +
            "• TikTok\n" +
            "• Facebook\n\n" +
            "📝 Ví dụ: Gửi https://youtube.com/watch?v=xxx"
        );
        return;
    }

    // Video URL found - process download
    await sendTextMessage(senderId, `⏳ Đang tải video ${videoInfo.platform} 1080p...`);

    try {
        const videoPath = await downloadVideo(videoInfo.url, videoInfo.platform);
        
        if (!videoPath) {
            throw new Error('Download failed');
        }

        // Check file size
        const stats = fs.statSync(videoPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        
        console.log(`📦 Video size: ${fileSizeMB.toFixed(2)}MB`);

        if (fileSizeMB > 25) {
            // File too large for Messenger - send download link
            await sendTextMessage(senderId, 
                `⚠️ Video quá lớn (${fileSizeMB.toFixed(1)}MB > 25MB limit).\n\n` +
                `📥 Tải trực tiếp tại:\n${process.env.APP_URL || 'http://localhost:3000'}\n\n` +
                `Hoặc thử với quality thấp hơn (720p).`
            );
            
            // Cleanup
            fs.unlinkSync(videoPath);
            return;
        }

        // Send video
        await sendVideoMessage(senderId, videoPath);
        await sendTextMessage(senderId, `✅ Đã tải xong! Chất lượng: 1080p`);

        // Cleanup
        fs.unlinkSync(videoPath);

    } catch (error) {
        console.error('❌ Download error:', error.message);
        await sendTextMessage(senderId, 
            `❌ Lỗi khi tải video: ${error.message}\n\n` +
            `Vui lòng thử lại hoặc dùng link khác.`
        );
    }
}

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

    // Facebook
    const facebookRegex = /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com)\/(watch\/\?v=|video\.php\?v=|[a-zA-Z0-9.]+\/videos\/)?([0-9]+)/i;
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
        const tempFile = path.join(tempDir, `${platform}_${Date.now()}.mp4`);

        console.log(`📥 Downloading from ${platform}: ${url}`);

        // Build yt-dlp arguments for 1080p
        let formatString = '';
        
        if (platform === 'youtube') {
            // Prefer 1080p, fallback to 720p, then best
            formatString = 'bestvideo[height=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080][ext=mp4]+bestaudio/best[height<=1080]';
        } else {
            // For TikTok and Facebook, just get best quality
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

        const ytdlpProcess = spawn('yt-dlp', ytdlpArgs);

        let errorOutput = '';

        ytdlpProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log('yt-dlp:', data.toString());
        });

        ytdlpProcess.stdout.on('data', (data) => {
            console.log('yt-dlp:', data.toString());
        });

        ytdlpProcess.on('close', (code) => {
            if (code === 0 && fs.existsSync(tempFile)) {
                console.log('✅ Download completed:', tempFile);
                resolve(tempFile);
            } else {
                console.error('❌ yt-dlp failed:', errorOutput);
                reject(new Error('Download failed'));
            }
        });

        ytdlpProcess.on('error', (err) => {
            console.error('❌ yt-dlp error:', err);
            reject(new Error('yt-dlp not found. Please install yt-dlp.'));
        });

        // Timeout after 2 minutes
        setTimeout(() => {
            ytdlpProcess.kill();
            reject(new Error('Download timeout'));
        }, 120000);
    });
}

// ============================================
// SEND TEXT MESSAGE
// ============================================
async function sendTextMessage(senderId, text) {
    if (!FB_PAGE_ACCESS_TOKEN) {
        console.error('❌ FB_PAGE_ACCESS_TOKEN not set!');
        return;
    }

    try {
        await axios.post(`${FB_GRAPH_API}/me/messages`, {
            recipient: { id: senderId },
            message: { text: text }
        }, {
            params: { access_token: FB_PAGE_ACCESS_TOKEN }
        });
        
        console.log('✅ Text message sent');
    } catch (error) {
        console.error('❌ Error sending text:', error.response?.data || error.message);
    }
}

// ============================================
// SEND VIDEO MESSAGE
// ============================================
async function sendVideoMessage(senderId, videoPath) {
    if (!FB_PAGE_ACCESS_TOKEN) {
        console.error('❌ FB_PAGE_ACCESS_TOKEN not set!');
        return;
    }

    try {
        console.log('📤 Uploading video to Facebook...');

        const formData = new FormData();
        formData.append('recipient', JSON.stringify({ id: senderId }));
        formData.append('message', JSON.stringify({
            attachment: {
                type: 'video',
                payload: {
                    is_reusable: false
                }
            }
        }));
        formData.append('filedata', fs.createReadStream(videoPath));

        const response = await axios.post(
            `${FB_GRAPH_API}/me/messages`,
            formData,
            {
                params: { access_token: FB_PAGE_ACCESS_TOKEN },
                headers: formData.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('✅ Video sent successfully');
    } catch (error) {
        console.error('❌ Error sending video:', error.response?.data || error.message);
        throw error;
    }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
    setupWebhookRoutes
};
