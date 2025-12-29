# 🤖 Hướng dẫn Setup Telegram Bot - CỰC ĐƠN GIẢN!

## ⚡ Tại sao Telegram tốt hơn Messenger?

✅ **Setup 1 phút** - Không cần Facebook Developer Console  
✅ **Không cần webhook** - Chạy local dễ dàng  
✅ **File lớn hơn** - 50MB vs 25MB  
✅ **Không cần ngrok** - Bot tự polling  
✅ **API đơn giản** - Dễ debug, dễ test  

---

## 🚀 Setup trong 3 bước

### **Bước 1: Tạo Bot trên Telegram (1 phút)**

1. **Mở Telegram**, tìm **@BotFather**
2. Gửi lệnh: `/newbot`
3. Đặt tên bot: `Video Downloader Bot`
4. Đặt username: `YourVideoDownloader_bot` (phải kết thúc bằng `_bot`)
5. **Copy Bot Token** - dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### **Bước 2: Thêm Token vào .env**

Mở file `.env` (hoặc tạo từ `.env.example`), thêm dòng:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**File .env hoàn chỉnh:**
```env
GEMINI_API_KEY=AIzaSyD5RyuCBy7_dMZI--Hp-u5d7Nr31j7R9YQ
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
PORT=3000
APP_URL=http://localhost:3000
```

### **Bước 3: Chạy Bot**

```bash
node telegram-bot.js
```

Sẽ thấy:
```
🤖 Telegram Video Downloader Bot is running...
✅ Waiting for messages...
✅ Bot is ready! Send a video link to start downloading.
```

---

## 🎯 Test Bot

1. **Tìm bot** trên Telegram (search username bạn đặt)
2. Click **"Start"** hoặc gửi `/start`
3. **Gửi link video:**
   ```
   https://youtube.com/watch?v=dQw4w9WgXcQ
   ```
4. **Bot sẽ:**
   - Reply: `⏳ Đang tải video youtube 1080p...`
   - Tải video (1-2 phút)
   - Gửi video vào chat
   - Reply: `✅ Tải xong! 📺 Platform: youtube`

---

## 📝 Các lệnh hỗ trợ

- `/start` - Chào mừng và hướng dẫn
- `/help` - Xem hướng dẫn chi tiết
- **Gửi link** - Tự động tải video

---

## 🎬 Platforms hỗ trợ

| Platform | Quality | Ghi chú |
|----------|---------|---------|
| **YouTube** | 1080p | Ưu tiên 1080p, fallback 720p |
| **TikTok** | Best | Chất lượng gốc |
| **Facebook** | Best | Chất lượng gốc |

---

## ⚠️ Giới hạn

- **Max file size:** 50MB (Telegram limit)
- **Timeout:** 3 phút/video
- Video quá lớn sẽ gửi thông báo thay vì file

---

## 🔧 Troubleshooting

### **Lỗi: TELEGRAM_BOT_TOKEN not found**
→ Chưa thêm token vào file `.env`

### **Bot không reply**
→ Check logs xem có lỗi không
→ Kiểm tra bot token đúng chưa

### **Download failed**
→ Đảm bảo `yt-dlp` đã cài đặt:
```bash
winget install yt-dlp
```

### **Video không gửi được**
→ File quá 50MB
→ Thử giảm quality hoặc video ngắn hơn

---

## 💡 Tips

1. **Chạy 24/7:** Deploy lên VPS/Render thay vì chạy local
2. **Multiple bots:** Có thể tạo nhiều bot với token khác nhau
3. **Logs:** Theo dõi console để debug

---

## 🆚 So sánh với Messenger

| Feature | Telegram | Messenger |
|---------|----------|-----------|
| Setup | 1 phút ✅ | 30 phút ❌ |
| Webhook | Không cần ✅ | Bắt buộc ❌ |
| Ngrok | Không cần ✅ | Bắt buộc ❌ |
| File limit | 50MB ✅ | 25MB |
| Development | Local ✅ | Cần public URL ❌ |

**→ Telegram đơn giản gấp 10 lần!** 🚀

---

## ✅ Xong!

Bot đã sẵn sàng! Chỉ cần:
1. Tạo bot qua @BotFather (1 phút)
2. Copy token vào .env
3. `node telegram-bot.js`
4. Test ngay!

**Dễ hơn nhiều so với Messenger đúng không?** 😊
