# 🚀 Deploy Telegram Bot lên Render.com

## ✅ Ưu điểm Render cho Telegram Bot

- ✅ **Free tier** - Chạy bot 24/7 miễn phí
- ✅ **Auto HTTPS** - Không cần ngrok
- ✅ **Polling friendly** - Telegram bot dùng polling
- ✅ **Environment variables** - Bảo mật token
- ✅ **Auto deploy** - Connect GitHub

---

## 📋 Chuẩn bị (3 bước)

### **1. Push code lên GitHub**

```bash
cd "c:\Users\DUCANH\Downloads\Dự án mới\TAIVIDEO"
git init
git add .
git commit -m "Telegram video downloader bot"
git remote add origin https://github.com/YOUR_USERNAME/telegram-video-bot.git
git push -u origin main
```

### **2. Tạo account trên Render**

- Vào: https://render.com
- Sign up (free)
- Connect GitHub account

### **3. Cài yt-dlp trên Render**

Render cần **build script** để cài yt-dlp.

---

## 🔧 Deploy Steps

### **Bước 1: Tạo Web Service trên Render**

1. Dashboard → **New** → **Web Service**
2. Connect repository: `telegram-video-bot`
3. Cấu hình:
   - **Name:** `telegram-video-bot`
   - **Environment:** `Node`
   - **Build Command:** `npm install && chmod +x install-yt-dlp-render.sh && ./install-yt-dlp-render.sh`
   - **Start Command:** `node telegram-bot.js`
   - **Instance Type:** `Free`

### **Bước 2: Set Environment Variables**

Trong Render Dashboard → Environment:

```
TELEGRAM_BOT_TOKEN=8565066262:AAGPOuvwBBXg2AIsyZ-To8MNdsd03duUPRU
GEMINI_API_KEY=AIzaSyD5RyuCBy7_dMZI--Hp-u5d7Nr31j7R9YQ
PORT=10000
APP_URL=https://telegram-video-bot.onrender.com
```

### **Bước 3: Deploy**

- Click **Create Web Service**
- Đợi build (2-3 phút)
- Check logs: Bot phải show `✅ Bot is ready!`

---

## 📝 Lưu ý quan trọng

### **1. Health Check**

Render cần health check endpoint. Bot đã có sẵn polling nên OK.

### **2. yt-dlp trên Render**

File `install-yt-dlp-render.sh` sẽ tự động cài yt-dlp khi deploy.

### **3. Free tier limits**

- **Sleep after 15 min inactive** - Bot sẽ restart khi có message mới
- **750 hours/month** - Đủ chạy 24/7
- **RAM: 512MB** - Đủ cho bot này

### **4. Logs**

Xem logs real-time trong Render Dashboard để debug.

---

## 🎯 Sau khi deploy

Bot sẽ chạy 24/7 trên Render. Không cần máy tính bật!

**URL bot:** `https://telegram-video-bot.onrender.com`

---

## 🔄 Update bot

Khi sửa code:
```bash
git add .
git commit -m "Update bot"
git push
```

Render tự động deploy lại!

---

## ✅ Checklist

- [ ] Push code lên GitHub
- [ ] Create Render account
- [ ] Create Web Service
- [ ] Set environment variables
- [ ] Deploy
- [ ] Test bot trên Telegram
- [ ] Check logs

**Xong! Bot chạy 24/7 miễn phí!** 🚀
