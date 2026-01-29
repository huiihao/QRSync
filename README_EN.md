# QRSync_Offline

<p align="center">
  <a href="README.md">简体中文</a> • <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20Browser-Implementation-brightgreen" alt="Pure Browser Implementation">
  <img src="https://img.shields.io/badge/Fully%20Offline-Working-blue" alt="Fully Offline Working">
  <img src="https://img.shields.io/badge/Chinese-Supported-orange" alt="Chinese Supported">
  <img src="https://img.shields.io/badge/English-Supported-blueviolet" alt="English Supported">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/github/stars/huiihao/QRSync_Offline?style=social" alt="GitHub Stars">
</p>

<p align="center">
  <b>QRSync_Offline</b> is a pure browser-based, fully offline file transfer tool that transmits files via QR code sequences without requiring a network connection.
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

**👉 [Click to visit QRSync_Offline](https://huiihao.github.io/QRSync_Offline/)**

> Download the repository archive. Once the page finishes loading JavaScript, you can disconnect from the network and use it offline.

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

1. Open the **[Sender](https://huiihao.github.io/QRSync_Offline/send/index.html)**
2. Click or drag to select the file to transfer
3. Adjust chunk size and QR code dimensions (optional)
4. Click the "Generate QR Codes" button
5. Display QR codes in sequence for the receiver to scan

**Sender Interface:**

📤

### Receiving Files

1. Open the **[Receiver](https://huiihao.github.io/QRSync_Offline/receiver/index.html)**
2. Click the "Start Scanning" button and allow camera permissions
3. Scan all data QR codes in sequence
4. Finally scan the filename QR code (orange border)
5. Click the "Reassemble File" button
6. Click "Download File" to save locally

**Receiver Interface:**

📥

---

## 🔧 Technical Principles

### Data Flow
