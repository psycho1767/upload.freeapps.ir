<div align="center">

<img src="logo.svg" width="100" />

# 🚀 Freeapps Uploader V2

**A free, open-source, encrypted file uploader with instant sharing.**

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![Version](https://img.shields.io/badge/version-2.0-purple.svg)](#)

[English](#-features) | [فارسی](#-ویژگی‌ها)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Client-side Encryption** | AES-256-GCM encryption via Web Crypto API — your password never leaves your browser |
| 📁 **Drag & Drop Upload** | Simply drag files or click to browse |
| ⏱️ **Auto Expiration** | Files expire after 1–7 days, then auto-delete |
| 🔑 **Password Protection** | Optional password lock on any file |
| 📊 **Storage Monitor** | Real-time server storage usage bar |
| 🌍 **Bilingual UI** | English & Farsi with RTL support |
| 🔤 **YekanBakh Font** | Beautiful Persian typography for Farsi mode |
| 🌙 **Dark / Light Mode** | Toggle between themes |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| ⚡ **Upload Progress** | Live speed, ETA, and progress bar |
| 🖼️ **Media Preview** | Auto-preview images, video, and audio in-browser |
| 📋 **Clipboard Paste** | Paste files directly from clipboard |
| 🗑️ **Auto Cleanup** | Expired files are automatically removed |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ **Backend** | ![Node](https://img.shields.io/badge/Node.js-18+-green) ![Express](https://img.shields.io/badge/Express-5-blue) ![Multer](https://img.shields.io/badge/Multer-2-orange) |
| 🎨 **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-orange) ![CSS3](https://img.shields.io/badge/CSS3-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow) |
| 🔐 **Encryption** | ![WebCrypto](https://img.shields.io/badge/Web_Crypto_API-AES--256--GCM-red) |
| 💾 **Storage** | JSON file-based database + local disk |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/psycho1767/upload.freeapps.ir.git

# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
node server.js
```

🌐 Open **http://localhost:3000** in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MAX_STORAGE` | `2147483648` | Max storage in bytes (default 2 GB) |

---

## 📁 Project Structure

```
upload.freeapps.ir/
├── server/
│   ├── server.js          # Express API server
│   ├── files.json         # File metadata database
│   ├── uploads/           # Encrypted file storage
│   ├── .env               # Environment config
│   └── package.json
├── index.html             # Main page
├── app.js                 # Client-side logic & encryption
├── style.css              # Theming & responsive styles
├── logo.svg               # App logo & favicon
├── yekan/                 # YekanBakh font (Farsi)
├── .gitignore
└── README.md
```

---

## 🔐 How Encryption Works

1. User enters a password
2. Key derived via **PBKDF2** (100,000 iterations, SHA-256)
3. File encrypted with **AES-256-GCM** on the client side
4. Encrypted blob sent to server — **server never sees the password**
5. On download, decryption happens in the browser

> ⚠️ If you lose your password, the file **cannot** be recovered.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a file |
| `GET` | `/api/file/:name` | Download a file |
| `GET` | `/api/info/:name` | Get file metadata |
| `GET` | `/api/storage-status` | Get storage usage |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file.

---

## 👨‍💻 Author

Built with ❤️ by [psycho1767](https://github.com/psycho1767)

---

<div dir="rtl">

---

# 🚀 آپلودر فری‌اپس نسخه ۲

**یک آپلودر رایگان، متن‌باز و رمزنگاری‌شده با اشتراک‌گذاری فوری.**

---

## ✨ ویژگی‌ها

| ویژگی | توضیحات |
|--------|---------|
| 🔒 **رمزنگاری سمت کلاینت** | رمزنگاری AES-256-GCM از طریق Web Crypto API — رمز عبور شما هرگز مرورگر را ترک نمی‌کند |
| 📁 **آپلود با کشیدن و رها کردن** | فایل‌ها را بکشید یا کلیک کنید تا انتخاب کنید |
| ⏱️ **انقضا خودکار** | فایل‌ها پس از ۱ تا ۷ روز منقضی شده و حذف می‌شوند |
| 🔑 **محافظت با رمز عبور** | قفل رمز عبور اختیاری روی هر فایل |
| 📊 **مانیتور فضای ذخیره‌سازی** | نوار نمایش مصرف فضای سرور به صورت لحظه‌ای |
| 🌍 **رابط دوزبانه** | انگلیسی و فارسی با پشتیبانی RTL |
| 🔤 **فونت یکان** | تایپوگرافی زیبای فارسی برای حالت فارسی |
| 🌙 **حالت تاریک / روشن** | جابه‌جایی بین تم‌ها |
| 📱 **کاملاً واکنش‌گرا** | کار روی دسکتاپ، تبلت و موبایل |
| ⚡ **پیشرفت آپلود** | سرعت زنده، زمان باقی‌مانده و نوار پیشرفت |
| 🖼️ **پیش‌نمایش رسانه** | پیش‌نمایش خودکار تصاویر، ویدیو و صدا در مرورگر |
| 📋 **چسباندن از کلیپ‌بورد** | فایل‌ها را مستقیماً از کلیپ‌بورد بچسبانید |
| 🗑️ **پاکسازی خودکار** | فایل‌های منقضی‌شده به صورت خودکار حذف می‌شوند |

---

## 🛠️ فناوری‌های استفاده‌شده

| لایه | فناوری |
|------|--------|
| 🖥️ **بک‌اند** | Node.js 18+ • Express 5 • Multer 2 |
| 🎨 **فرانت‌اند** | HTML5 • CSS3 • JavaScript ES2022 |
| 🔐 **رمزنگاری** | Web Crypto API — AES-256-GCM |
| 💾 **ذخیره‌سازی** | دیتابیس مبتنی بر JSON + دیسک محلی |

---

## 📦 نصب و راه‌اندازی

```bash
# کلون کردن مخزن
git clone https://github.com/psycho1767/upload.freeapps.ir.git

# رفتن به پوشه سرور
cd server

# نصب وابستگی‌ها
npm install

# ایجاد فایل .env
cp .env.example .env

# اجرای سرور
node server.js
```

🌐 مرورگر خود را باز کنید: **http://localhost:3000**

---

## ⚙️ متغیرهای محیطی

فایل `.env` را در پوشه `server/` ایجاد کنید:

| متغیر | پیش‌فرض | توضیحات |
|--------|---------|---------|
| `PORT` | `3000` | پورت سرور |
| `MAX_STORAGE` | `2147483646` | حداکثر فضا به بایت (پیش‌فرض ۲ گیگابایت) |

---

## 🔐 نحوه عملکرد رمزنگاری

1. کاربر رمز عبور را وارد می‌کند
2. کلید از طریق **PBKDF2** مشتق می‌شود (۱۰۰,۰۰۰ تکرار، SHA-256)
3. فایل با **AES-256-GCM** در سمت کلاینت رمزنگاری می‌شود
4. داده رمزنگاری‌شده به سرور ارسال می‌شود — **سرور رمز عبور را نمی‌بیند**
5. هنگام دانلود، رمزگشایی در مرورگر انجام می‌شود

> ⚠️ اگر رمز عبور خود را فراموش کنید، فایل **قابل بازیابی نیست**.

---

## 📡 اندپوینت‌های API

| متد | اندپوینت | توضیحات |
|-----|----------|---------|
| `POST` | `/api/upload` | آپلود فایل |
| `GET` | `/api/file/:name` | دانلود فایل |
| `GET` | `/api/info/:name` | دریافت اطلاعات فایل |
| `GET` | `/api/storage-status` | وضعیت فضای ذخیره‌سازی |

---

## 🤝 مشارکت

مشارکت شما خوشآمد است! مشکلات و درخواست‌های ادغام را آزادانه ارسال کنید.

1. مخزن را Fork کنید
2. شاخه خود را بسازید (`git checkout -b feature/amazing-feature`)
3.Commit کنید (`git commit -m 'افزودن قابلیت جدید'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request باز کنید

---

## 📄 مجوز

این پروژه تحت **مجوز ISC** است — فایل [LICENSE](LICENSE) را ببینید.

---

## 👨‍💻 سازنده

ساخته شده با ❤️ توسط [psycho1767](https://github.com/psycho1767)

</div>
