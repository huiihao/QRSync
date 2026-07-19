<p align="center">
  <img width="20%" height="20%" alt="QRSync_icon" src="https://github.com/user-attachments/assets/96008e19-31d0-4968-a644-dfdfec30fd53" />
</p>

<p align="center">
  <a href="README.md">简体中文</a> • <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20Browser-Implementation-brightgreen" alt="Pure Browser Implementation">
  <img src="https://img.shields.io/badge/Fully%20Offline-Working-blue" alt="Fully Offline Working">
  <img src="https://img.shields.io/badge/Chinese-Supported-orange" alt="Chinese Supported">
  <img src="https://img.shields.io/badge/English-Supported-blueviolet" alt="English Supported">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/github/stars/huiihao/QRSync?style=social" alt="GitHub Stars">
</p>

<p align="center">
  <b>QRSync</b> — A pure browser-based, fully offline file transfer tool for air-gapped environments.
</p>

<p align="center">
  Transfer any file via QR code sequences in environments with no network, no USB, no clipboard — only a screen and a camera.
</p>

<p align="center">
  <a href="#-online-demo">Online Demo</a> •
  <a href="#-why-qrsync">Why QRSync</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-technical-principles">How It Works</a> •
  <a href="#-local-usage">Local Usage</a>
</p>

---

## 🌐 Online Demo

**👉 [Visit QRSync](https://huiihao.github.io/QRSync/)**

> Download the repository, load the page, then disconnect — it works fully offline.

<div align="center">
  <img width="80%" alt="Screenshot" src="https://github.com/user-attachments/assets/90debdb9-1205-4e0b-9ab4-df1aad5f5357" />
</div>

---

## 💡 Why QRSync

> **Air-gapped environments** are systems with no network access, USB ports disabled, clipboard restricted — only the screen and camera remain available.

| Scenario | QRSync Solution |
|----------|-----------------|
| 🔌 Air-gapped internal servers | Scan QR codes on screen with a phone to extract files |
| 🏢 High-security office environments | No USB, Bluetooth, or WiFi needed — visual transfer only |
| 📱 Quick phone-to-PC file transfers | No app install required — works right in the browser |
| 🚫 All conventional transfer methods blocked | QR codes are the last available data channel |

**Core advantages:**
- **Zero Dependencies** — No software install, no server, no network required
- **Fully Offline** — All data processing happens locally in the browser, nothing is uploaded
- **Cross-Platform** — Works on any device with a browser: Windows, macOS, Linux, Android, iOS

---

## ✨ Features

| Feature | Description |
|------|------|
| 🌐 **Pure Browser Implementation** | No installation, no server — just open and use |
| 📶 **Fully Offline Operation** | Works in completely isolated environments, data never leaves the device |
| 🔒 **Data Integrity Verification** | CRC32 checksum per chunk ensures accurate transmission |
| 📁 **Any File Type** | Text, images, documents, archives — all supported |
| 🇨🇳 **Chinese Filename Support** | UTF-8 encoding guarantees no garbled characters |
| 💾 **Resumable Transfer** | Progress auto-saved to IndexedDB, survives page refresh |
| 📱 **Mobile Optimized** | UI and interactions tuned for phone camera scanning |
| 🎨 **Clean Modern UI** | Minimalist design with clear, intuitive workflow |

---

## 🚀 Quick Start

**Sender:** Open [Sender](https://huiihao.github.io/QRSync/sender/index.html) → Select file → Click "Generate QR Codes" → Display codes in order

**Receiver:** Open [Receiver](https://huiihao.github.io/QRSync/receiver/index.html) → Allow camera → Scan codes in order → Download file

---

## 📖 Usage

### 📤 Sending Files

1. Open the **[Sender Page](https://huiihao.github.io/QRSync/sender/index.html)**
2. Click or drag to select the file you want to transfer
3. Adjust chunk size and QR code dimensions (optional; defaults work for most cases)
4. Click "Generate QR Codes"
5. Display QR codes in order for the receiver to scan

<div align="center">
  <img width="70%" alt="Sender Interface" src="https://github.com/user-attachments/assets/9d414f06-e5d2-4359-9581-79d0a37b3801" />
</div>

### 📥 Receiving Files

1. Open the **[Receiver Page](https://huiihao.github.io/QRSync/receiver/index.html)**
2. Click "Start Scanning" and allow camera permissions
3. Scan all data QR codes in order
4. Finally scan the filename QR code (identified by an orange border)
5. Click "Reassemble File"
6. Click "Download File" to save locally

<div align="center">
  <img style="width: 48%;" alt="Receiver Interface 1" src="https://github.com/user-attachments/assets/5fde12d8-f772-496b-a50d-452062d8f0cc" />
  <img style="width: 48%;" alt="Receiver Interface 2" src="https://github.com/user-attachments/assets/616a5e40-ba18-45c4-9207-7e7c00244b6c" />
</div>

---

## 🔧 How It Works

### Data Flow

```
 Original File  ──[deflate compress]──▶  Compressed  ──[chunking]──▶  Data Chunks  ──[QR encode]──▶  Scan & Transfer
                                                                                                         │
 Complete File  ◀──[reassemble]──  Received Data  ◀──[QR decode]──  Scan & Receive  ◀─────────────────────┘
```

### QR Code Data Structure

**Data Chunks:**
```json
{
  "i": 0,          // Chunk index
  "t": 5,          // Total chunks
  "f": "ABC12",    // File fingerprint
  "h": "a3f9b",    // CRC32 checksum
  "d": "base64…"   // Data payload
}
```

**Filename Chunk:**
```json
{
  "t": "fn",       // Type identifier (fn = filename)
  "f": "XYZ89",    // File fingerprint
  "n": "base64…",  // Encoded filename
  "s": 1024,       // File size (bytes)
  "ts": 1234567890,// Unix timestamp
  "tc": 10,        // Total chunk count
  "h": "abc12"     // CRC32 checksum
}
```

### Core Technology Stack

| Purpose | Library | Notes |
|---------|---------|-------|
| Compression | [pako](https://github.com/nodeca/pako) | zlib/deflate in the browser |
| QR Generation | [qrcode.js](https://github.com/davidshimjs/qrcodejs) | Pure JS QR code rendering |
| QR Scanning | [ZXing](https://github.com/zxing-js/library) | Multi-format barcode scanner |
| Local Storage | [localForage](https://github.com/localForage/localForage) | Async IndexedDB wrapper |
| Data Integrity | CRC32 | Per-chunk checksum verification |

---

## 💻 Local Usage

### Method 1: Open Directly

1. Download and extract the repository
2. Double-click `index.html` to open the homepage
3. Navigate to sender and receiver pages as needed

### Method 2: Local Server

```bash
git clone https://github.com/huiihao/QRSync.git
cd QRSync

# Python
python -m http.server 8080

# or Node.js
npx serve .

# Open http://localhost:8080 in your browser
```

---

## 📦 Project Structure

```
QRSync/
├── index.html               # Entry page
├── sender/index.html        # Sender page
├── receiver/index.html      # Receiver page
├── js/
│   ├── qrcode.min.js        # QR code generation library
│   ├── pako.min.js          # Compression library
│   ├── jszip.min.js         # ZIP packaging library
│   ├── FileSaver.min.js     # File saving library
│   ├── zxing-library.min.js # QR code scanning library
│   ├── jsQR.js              # QR code recognition library
│   └── localforage.min.js   # Local storage library
├── README.md                # Chinese documentation
├── README_EN.md             # English documentation
└── docs/PACKAGING.md        # Packaging guide
```

> Pure frontend project — no backend dependencies, all third-party libraries are bundled locally.

---

## 🛠️ Packaging as Standalone Executable

See [docs/PACKAGING.md](docs/PACKAGING.md) for instructions on packaging this project as a standalone executable (Windows / Linux / macOS).

---

## ⚙️ Configuration

### Chunk Size

| Parameter | Value |
|-----------|-------|
| Range | 200 – 2100 bytes |
| Default | 600 bytes |
| Tip | Smaller chunks improve scan reliability but increase QR count; larger chunks reduce QR count and need a bigger display size |

### QR Code Dimensions

| Parameter | Value |
|-----------|-------|
| Range | 600 – 2000 pixels |
| Default | 800 pixels |
| Tip | Adjust to fit the full QR code on screen |

---

## 📝 Notes

1. **Scanning Order** — Scan all data chunks in order, ending with the filename QR code (orange border)
2. **Chunk Size** — Keep the default 600 bytes; oversized chunks may fail to scan
3. **File Size** — Recommended maximum 10MB; larger files produce many QR codes
4. **Screen Brightness** — Keep the sender screen at full brightness for best scan reliability
5. **Camera Focus** — Maintain an appropriate distance between camera and screen
6. **Checksum Failure** — If verification fails, simply rescan that QR code

---

## 🔒 Privacy

- All data is processed **locally in the browser** — nothing is ever uploaded
- Transfer progress is stored in the browser's IndexedDB, no privacy leakage
- CRC32 checksum and file fingerprinting prevent data corruption and cross-file mixing

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source under the [MIT](LICENSE) license.

---

## 🙏 Acknowledgments

- Reference project [QRBridge](https://github.com/wallechfox/QRBridge) by [@wallechfox](https://github.com/wallechfox)
- [pako](https://github.com/nodeca/pako) — Fast zlib compression
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) — QR code generation
- [ZXing](https://github.com/zxing-js/library) — QR code scanning
- [localForage](https://github.com/localForage/localForage) — Local storage

---

<p align="center">
  Made with ❤️ by QRSync Team
</p>
