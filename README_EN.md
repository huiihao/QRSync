# QRSyncOffline

<p align="center">
  <a href="README.md">简体中文</a> • <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20Browser-Implementation-brightgreen" alt="Pure Browser Implementation">
  <img src="https://img.shields.io/badge/Fully%20Offline-Working-blue" alt="Fully Offline Working">
  <img src="https://img.shields.io/badge/Chinese-Supported-orange" alt="Chinese Supported">
  <img src="https://img.shields.io/badge/English-Supported-blueviolet" alt="English Supported">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/github/stars/huiihao/QRSyncOffline?style=social" alt="GitHub Stars">
</p>

<p align="center">
  <b>QRSyncOffline</b> is a pure browser-based, fully offline file transfer tool that transmits files via QR code sequences without requiring a network connection.
</p>

<p align="center">
  <a href="#-online-demo">Online Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-technical-principles">Technical Principles</a> •
  <a href="#-local-usage">Local Usage</a>
</p>

---

## 🌐 Online Demo

**👉 [Click to visit QRSyncOffline](https://huiihao.github.io/QRSyncOffline/)**

> Download the repository archive. Once the page finishes loading JavaScript, you can disconnect from the network and use it offline.

<div align="center">
<img width="80%" alt="image" src="https://github.com/user-attachments/assets/af93481a-316c-4246-9631-1dfd7c282899" />
</div>

---

## ✨ Features

| Feature | Description |
|------|------|
| 🌐 **Pure Browser Implementation** | No software installation required, no server needed |
| 📶 **Fully Offline Working** | Can be used completely without network connection |
| 🔒 **Data Integrity Check** | Uses CRC32 checksum to ensure accurate data transmission |
| 📁 **Supports Any File Type** | Text, images, documents, archives, etc. can all be transferred |
| 🇨🇳 **Perfect Chinese Support** | Supports Chinese filenames without garbled text issues |
| 💾 **Resume Transfer** | Automatically saves reception progress, no loss on page refresh |
| 📱 **Mobile Adaptation** | Optimized for mobile phone scanning scenarios |
| 🎨 **Elegant Interface** | Minimalist style design, simple and elegant |

---

## 📖 Usage

### Sending Files

1. Open the **[Sender](https://huiihao.github.io/QRSyncOffline/send/index.html)**
2. Click or drag to select the file to transfer
3. Adjust chunk size and QR code dimensions (optional)
4. Click the "Generate QR Codes" button
5. Display QR codes in sequence for the receiver to scan

**📤Sender Interface:**

<div align="center">
<img width="70%" alt="image" src="https://github.com/user-attachments/assets/b2fe4202-e958-41d4-9720-6c30c2fd4970" />
</div>

### Receiving Files

1. Open the **[Receiver](https://huiihao.github.io/QRSyncOffline/receiver/index.html)**
2. Click the "Start Scanning" button and allow camera permissions
3. Scan all data QR codes in sequence
4. Finally scan the filename QR code (orange border)
5. Click the "Reassemble File" button
6. Click "Download File" to save locally

**📥Receiver Interface:**

<div style="display: flex; justify-content: space-between; gap: 20px;">
  <img style="width: 48%; height: auto;" alt="Sender Interface" src="https://github.com/user-attachments/assets/903f79b1-7804-42f5-b15f-6dfc86b2fe1f" />
  <img style="width: 48%; height: auto;" alt="Receiver Interface" src="https://github.com/user-attachments/assets/5775618f-2c48-40c5-b99f-459b864a0c06" />
</div>

---

## 🔧 Technical Principles

### Data Flow

```
┌─────────────┐     Compress     ┌─────────────┐     Split      ┌─────────────┐
│  Raw File   │ ───────────────→ │ deflate Comp│ ──────────────→ │Data Chunks  │
└─────────────┘                  └─────────────┘                └─────────────┘
                                                                        ↓
┌─────────────┐     Reassemble   ┌─────────────┐    Decompress  ┌─────────────┐
│ Complete File│ ←─────────────── │ Merged Data │ ←────────────── │QR Code Trans│
└─────────────┘                  └─────────────┘                └─────────────┘
```

### QR Code Data Structure

**Data Chunk:**
```json
{
  "i": 0,           // Chunk index
  "t": 5,           // Total number of chunks
  "f": "ABC12",     // File fingerprint
  "h": "a3f9b",     // CRC32 checksum
  "d": "base64..."  // Data content
}
```

**Filename Chunk:**
```json
{
  "t": "fn",        // Type identifier
  "f": "ABC12",     // File fingerprint
  "n": "base64...", // Filename (Base64 encoded)
  "s": 1024,        // File size
  "tc": 5,          // Total number of data chunks
  "h": "c7d2e"      // CRC32 checksum
}
```

### Core Technologies

- **Compression Algorithm**: [pako](https://github.com/nodeca/pako) (zlib/deflate)
- **QR Code Generation**: [qrcode.js](https://github.com/davidshimjs/qrcodejs)
- **QR Code Scanning**: [ZXing](https://github.com/zxing-js/library)
- **Local Storage**: [localForage](https://github.com/localForage/localForage)
- **Checksum Algorithm**: CRC32

---

## 💻 Local Usage

### Method 1: Direct Download

1. Download the project code
2. Extract to any folder
3. Double-click `index.html` to open the homepage
4. Open the sender and receiver respectively to use

### Method 2: Local Server

```bash
# Clone repository
git clone https://github.com/yourusername/QRSyncOffline.git

# Enter project directory
cd QRSyncOffline

# Start local server (Python 3)
python -m http.server 8080

# Or Node.js
npx serve .

# Visit http://localhost:8080 in browser
```

---

## 📂 Project Structure

```
QRSyncOffline/
├── index.html           # Homepage entry
├── send/
│   └── index.html       # Sender
├── receiver/
│   └── index.html       # Receiver
└── README.md            # Project description
```

> This project is pure frontend implementation, with no backend dependencies. All third-party libraries are imported via CDN or prepared locally.

---

## ⚙️ Configuration

### Chunk Size

- **Range**: 400 - 1500 bytes
- **Default**: 800 bytes
- **Recommendation**: Smaller chunks improve scanning success rate but increase the number of QR codes

### QR Code Dimensions

- **Range**: 256 - 600 pixels
- **Default**: 400 pixels
- **Recommendation**: Adjust according to screen size and scanning distance

---

## 📝 Notes

1. **Scanning Order**: Scan all data chunks in order, and finally scan the filename QR code
2. **File Size**: Recommended file size is under 10MB, as large files will generate many QR codes
3. **Screen Brightness**: Ensure the sender's screen brightness is sufficient for better scanning success
4. **Camera Focus**: Keep an appropriate distance between the phone camera and screen to ensure QR codes are clear
5. **Checksum Failure**: If a checksum fails, rescan that QR code

---

## 🔒 Privacy Statement

- All data is processed locally in the browser and not uploaded to any server
- Reception progress is stored in the browser's IndexedDB and will not leak privacy
- Can be used offline after the page loads, ensuring data security

---

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

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

- [pako](https://github.com/nodeca/pako) - Fast zlib compression library
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) - QR code generation library
- [ZXing](https://github.com/zxing-js/library) - QR code scanning library
- [localForage](https://github.com/localForage/localForage) - Local storage library

---

<p align="center">
  Made with ❤️ by QRSyncOffline Team
</p>
