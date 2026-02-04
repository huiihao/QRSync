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
  <b>QRSync</b> is a pure browser-based, fully offline isolated file transfer tool that uses QR code sequences to transfer files in isolated environments with no network connection, USB devices disabled, clipboard disabled, or only visual interface provided.
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

**👉 [Visit QRSync](https://huiihao.github.io/QRSync/)**

> After downloading the repository zip file and loading the JavaScript, you can disconnect from the network and use it offline.

<div align="center">
  <img width="80%" alt="image" src="https://github.com/user-attachments/assets/fa9f4abb-217a-4cd9-8991-4e1be9d85cf4" />
</div>

---

## ✨ Features

| Feature | Description |
|------|------|
| 🌐 **Pure Browser Implementation** | No software installation required, no server support needed |
| 📶 **Fully Offline Operation** | Completely offline usage in isolated conditions |
| 🔒 **Data Integrity Verification** | Uses CRC32 checksum to ensure accurate data transmission |
| 📁 **Supports Any File Type** | Text, images, documents, compressed files, etc. |
| 🇨🇳 **Perfect Chinese Support** | Supports Chinese filenames, no garbled characters |
| 💾 **Resume Transfer** | Automatically saves receiving progress, no loss on page refresh |
| 📱 **Mobile-Optimized** | Optimized for mobile scanning scenarios |
| 🎨 **Beautiful Interface** | Minimalist design, clean and elegant |

---

## 📖 Usage

### Sending Files

1. Open the **[Sender Page](https://huiihao.github.io/QRSync/send/index.html)**
2. Click or drag to select the file to transfer
3. Adjust chunk size and QR code dimensions (optional)
4. Click the "Generate QR Codes" button
5. Display QR codes in order for the receiver to scan

**📤 Sender Interface:**

<div align="center">
<img width="70%" height="1040" alt="image" src="https://github.com/user-attachments/assets/9d414f06-e5d2-4359-9581-79d0a37b3801" />
</div>

### Receiving Files

1. Open the **[Receiver Page](https://huiihao.github.io/QRSync/receiver/index.html)**
2. Click the "Start Scanning" button and allow camera permissions
3. Scan all data QR codes in order
4. Finally scan the filename QR code (orange border)
5. Click the "Reassemble File" button
6. Click the "Download File" button to save locally

**📥 Receiver Interface:**

<div style="display: flex; justify-content: space-between; gap: 20px;">
  <img style="width: 48%; height: auto;" alt="Receiver Interface1" src="https://github.com/user-attachments/assets/5fde12d8-f772-496b-a50d-452062d8f0cc" />
  <img style="width: 48%; height: auto;" alt="Receiver Interface2" src="https://github.com/user-attachments/assets/616a5e40-ba18-45c4-9207-7e7c00244b6c" />
</div>

---

## 🔧 Technical Principles

### Data Flow

```
┌─────────────┐     Compress     ┌─────────────┐     Chunking    ┌─────────────┐
│  Original   │ ───────────────→ │  deflate    │ ───────────────→ │   Data      │
│    File     │                  │ compressed  │                  │   Chunks    │
└─────────────┘                  └─────────────┘                  └─────────────┘
                                                                          ↓
┌─────────────┐    Reassemble    ┌─────────────┐     Decompress   ┌─────────────┐
│ Complete    │ ←─────────────── │  Merged     │ ←─────────────── │  QR Code    │
│   File      │                  │   Data      │                  │ Transmission│
└─────────────┘                  └─────────────┘                  └─────────────┘
```

### QR Code Data Structure

**Data Chunks:**
```json
{
  "i": 0,           // Chunk index
  "t": 5,           // Total chunks
  "f": "ABC12",     // File fingerprint
  "h": "a3f9b",     // CRC32 checksum
  "d": "base64..."  // Data content
}
```

**Filename Chunk:**
```json
{
  "t": "fn",        // Type identifier
  "f": "XYZ89",     // File fingerprint
  "n": "base64...", // Encoded filename
  "s": 1024,        // File size
  "ts": 1234567890, // Timestamp
  "tc": 10,         // Total chunks
  "h": "abc12"      // CRC32 checksum
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
4. Open sender and receiver pages respectively

### Method 2: Local Server

```bash
# Clone the repository
git clone https://github.com/yourusername/QRSync.git

# Enter project directory
cd QRSync

# Start local server (Python 3)
python -m http.server 8080

# Or Node.js
npx serve .

# Access via browser at http://localhost:8080
```

---

## 📦 Project Structure

```
QRSync-Fixed/
├── index.html          # Entry page
├── send/
│   └── index.html      # Sender page
├── receiver/
│   └── index.html      # Receiver page
├── js/
│   ├── qrcode.min.js   # QR code generation library
│   ├── pako.min.js     # Compression library
│   ├── jszip.min.js    # ZIP packaging library
│   ├── FileSaver.min.js # File saving library
│   ├── zxing-library.min.js # QR code scanning library
│   ├── jsQR.js         # QR code recognition library
│   └── localforage.min.js # Local storage library
├── README.md           # Chinese documentation
├── README_EN.md        # English documentation
└── docs/
    └── PACKAGING.md    # Packaging instructions
```
> This project is purely frontend, no backend dependencies, all third-party libraries are locally prepared.

---

## 🛠️ Packaging as Executable

Refer to [docs/PACKAGING.md](docs/PACKAGING.md) for instructions on packaging this project as a standalone executable (Windows/Linux/macOS).

---

## ⚙️ Configuration

### Chunk Size

- **Range**: 400 - 1500 bytes
- **Default**: 800 bytes
- **Recommendation**: Smaller chunks improve scanning success rate but increase QR code count

### QR Code Dimensions

- **Range**: 256 - 600 pixels
- **Default**: 400 pixels
- **Recommendation**: Adjust based on screen size and scanning distance

---

## 📝 Notes

1. **Scanning Order**: Scan all data chunks in order, finally scan the filename QR code
2. **Chunk Size**: Recommended to keep default 600 bytes, too large chunks may cause QR code recognition failure
3. **File Size**: Recommended file size not exceeding 10MB, larger files will generate many QR codes
4. **Screen Brightness**: Ensure sender screen brightness is sufficient to improve scanning success rate
5. **Camera Focus**: Maintain appropriate distance between phone camera and screen for clear QR codes
6. **Checksum Failure**: If checksum fails, rescan that QR code

---

## 🔒 Privacy

- All data processed locally in browser, not uploaded to any server
- Receiving progress stored using browser's IndexedDB, no privacy leakage
- CRC32 checksum ensures data integrity
- File fingerprint mechanism prevents mixing different files

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

- Reference project [QRBridge](https://github.com/wallechfox/QRBridge) by [@wallechfox](https://github.com/wallechfox)
- [pako](https://github.com/nodeca/pako) - Fast zlib compression library
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) - QR code generation library
- [ZXing](https://github.com/zxing-js/library) - QR code scanning library
- [localForage](https://github.com/localForage/localForage) - Local storage library

---

<p align="center">
  Made with ❤️ by QRSync Team
</p>
