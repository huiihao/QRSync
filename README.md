<p align="center">
  <img width="20%" height="20%" alt="QRSync_icon" src="https://github.com/user-attachments/assets/96008e19-31d0-4968-a644-dfdfec30fd53" />
</p>

<p align="center">
  <a href="README.md">简体中文</a> • <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Pure%20Browser-Implementation-brightgreen" alt="纯浏览器实现">
  <img src="https://img.shields.io/badge/Fully%20Offline-Working-blue" alt="完全离线工作">
  <img src="https://img.shields.io/badge/Chinese-Supported-orange" alt="中文支持">
  <img src="https://img.shields.io/badge/English-Supported-blueviolet" alt="英文支持">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/github/stars/huiihao/QRSync?style=social" alt="GitHub Stars">
</p>

<p align="center">
  <b>QRSync</b> — 纯浏览器实现、完全离线的孤岛文件传输工具。
</p>

<p align="center">
  通过二维码序列，在无网络、无 USB、无剪贴板、仅保留视觉界面的孤岛环境中传输任意文件。
</p>

<p align="center">
  <a href="#-在线体验">在线体验</a> •
  <a href="#-为什么选择-qrsync">为什么选择 QRSync</a> •
  <a href="#-功能特点">功能特点</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-技术原理">技术原理</a> •
  <a href="#-本地使用">本地使用</a>
</p>

---

## 🌐 在线体验

**👉 [点击访问 QRSync](https://huiihao.github.io/QRSync/)**

> 下载本仓库压缩包，页面加载完成后即可断开网络离线使用。

<div align="center">
  <img width="80%" alt="Screenshot" src="https://github.com/user-attachments/assets/90debdb9-1205-4e0b-9ab4-df1aad5f5357" />
</div>

---

## 💡 为什么选择 QRSync

> **孤岛环境**指没有网络连接、USB 设备被禁用、剪贴板被限制，仅保留屏幕和摄像头的极端场景。

| 场景 | QRSync 方案 |
|------|-------------|
| 🔌 内网隔离的服务器 | 手机扫描屏幕二维码即可传出文件 |
| 🏢 安全管控严格的办公环境 | 不依赖 USB、蓝牙、WiFi，纯视觉传输 |
| 📱 手机与电脑间的临时传文件 | 无需安装 App，打开浏览器即可互传 |
| 🚫 所有常规传输手段被禁用 | 二维码是最后可用的数据通道 |

**核心优势：**
- **零依赖** — 无需安装软件、无需服务器、无需网络
- **纯离线** — 所有数据处理在浏览器本地完成，不上传任何信息
- **跨平台** — 有浏览器就能用，Windows、macOS、Linux、Android、iOS 全覆盖

---

## ✨ 功能特点

| 特性 | 说明 |
|------|------|
| 🌐 **纯浏览器实现** | 无需安装任何软件，无需服务器支持，打开即用 |
| 📶 **完全离线工作** | 在隔绝网络的环境下正常使用，数据不出本地 |
| 🔒 **数据完整性校验** | CRC32 校验确保数据传输准确无误，分片级验证 |
| 📁 **支持任意文件类型** | 文本、图片、文档、压缩包均可传输 |
| 🇨🇳 **中文文件名完美支持** | 中文文件名无乱码，UTF-8 编码保证兼容性 |
| 💾 **断点续传** | 接收进度自动保存至 IndexedDB，刷新页面不丢失 |
| 📱 **移动端适配** | 针对手机摄像头扫描场景优化界面和交互 |
| 🎨 **精美简约界面** | 现代简约风格设计，操作流程清晰直观 |

---

## 🚀 快速开始

**发送方：** 打开 [发送端](https://huiihao.github.io/QRSync/sender/index.html) → 选择文件 → 点击「生成二维码」→ 按顺序展示二维码

**接收方：** 打开 [接收端](https://huiihao.github.io/QRSync/receiver/index.html) → 允许摄像头权限 → 按顺序扫描二维码 → 下载文件

---

## 📖 使用方法

### 📤 发送文件

1. 打开 **[发送端](https://huiihao.github.io/QRSync/sender/index.html)**
2. 点击或拖拽选择要传输的文件
3. 调整分片大小和二维码尺寸（可选，默认值适用于大多数场景）
4. 点击「生成二维码」按钮
5. 按顺序展示二维码供接收端扫描（可用自动播放，默认间隔 500ms）

<div align="center">
  <img width="70%" alt="Sender Interface" src="https://github.com/user-attachments/assets/9d414f06-e5d2-4359-9581-79d0a37b3801" />
</div>

### 📥 接收文件

1. 打开 **[接收端](https://huiihao.github.io/QRSync/receiver/index.html)**
2. 点击「开始扫描」按钮，允许摄像头权限
3. 按顺序扫描所有数据二维码
4. 最后扫描文件名二维码（橙色边框标识）
5. 点击「重组文件」按钮
6. 点击「下载文件」保存到本地

<div align="center">
  <img style="width: 48%;" alt="Receiver Interface 1" src="https://github.com/user-attachments/assets/5fde12d8-f772-496b-a50d-452062d8f0cc" />
  <img style="width: 48%;" alt="Receiver Interface 2" src="https://github.com/user-attachments/assets/616a5e40-ba18-45c4-9207-7e7c00244b6c" />
</div>

---

## 🔧 技术原理

### 数据流

```
 原始文件  ──[deflate 压缩]──▶  压缩数据  ──[分片]──▶  数据分片  ──[二维码编码]──▶  扫码传输
                                                                                      │
 完整文件  ◀──[合并重组]──  接收数据  ◀──[二维码解码]──  扫码接收  ◀──────────────────────┘
```

### 二维码数据结构

**数据分片：**
```json
{
  "i": 0,          // 分片索引
  "t": 5,          // 总分片数
  "f": "ABC12",    // 文件指纹
  "h": "a3f9b",    // CRC32 校验码
  "d": "base64…"   // 数据内容
}
```

**文件名分片：**
```json
{
  "t": "fn",       // 类型标识 (fn = 文件名)
  "f": "XYZ89",    // 文件指纹
  "n": "base64…",  // 编码后的文件名
  "s": 1024,       // 文件大小（字节）
  "ts": 1234567890,// Unix 时间戳
  "tc": 10,        // 总分片数
  "h": "abc12"     // CRC32 校验码
}
```

### 核心技术栈

| 用途 | 库 | 说明 |
|------|-----|------|
| 压缩算法 | [pako](https://github.com/nodeca/pako) | zlib/deflate 浏览器端实现 |
| 二维码生成 | [qrcode.js](https://github.com/davidshimjs/qrcodejs) | 纯 JS 二维码生成 |
| 二维码扫描 | [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) + [jsQR](https://github.com/cozmo/jsQR) | WASM 高速解码，失败时 jsQR 兜底；wasm 以 base64 内嵌以兼容 `file://` |
| 本地存储 | [localForage](https://github.com/localForage/localForage) | IndexedDB 异步存储 |
| 数据校验 | CRC32 | 分片完整性校验 |

---

## 💻 本地使用

### 方法一：直接打开

1. 下载本仓库代码并解压
2. 双击 `index.html` 打开首页
3. 分别打开发送端和接收端即可使用

### 方法二：本地服务器

```bash
git clone https://github.com/huiihao/QRSync.git
cd QRSync

# Python
python -m http.server 8080

# 或 Node.js
npx serve .

# 浏览器访问 http://localhost:8080
```

---

## 📦 项目结构

```
QRSync/
├── index.html                 # 入口页面
├── sender/
│   ├── index.html             # 发送端页面
│   ├── sender.css             # 发送端样式
│   └── sender.js              # 发送端逻辑（分片、生成、自动播放）
├── receiver/
│   ├── index.html             # 接收端页面
│   ├── receiver.css           # 接收端样式
│   └── receiver.js            # 接收端逻辑（扫码、校验、重组）
├── shared/
│   ├── theme.css              # 收发两端共享主题
│   └── utils.js               # 共享工具（CRC32、base64、协议编解码等）
├── js/
│   ├── qrcode.min.js          # 二维码生成库
│   ├── pako.min.js            # 压缩库
│   ├── jszip.min.js           # ZIP 打包库
│   ├── zxing-wasm-reader.js   # zxing-wasm 解码器
│   ├── zxing_reader_wasm_b64.js # wasm 二进制（base64 内嵌）
│   ├── jsQR.js                # 二维码识别兜底库
│   └── localforage.min.js     # 本地存储库
├── README.md                  # 中文文档
├── README_EN.md               # 英文文档
└── docs/PACKAGING.md          # 打包说明
```

> 本项目为纯前端实现，无后端依赖；页面、样式、逻辑已拆分为模块，第三方库均本地化部署。

---

## 🛠️ 打包为可执行文件

参考 [docs/PACKAGING.md](docs/PACKAGING.md) 了解如何将本项目打包为独立的可执行文件（Windows / Linux / macOS）。

---

## ⚙️ 配置说明

### 分片大小

| 参数 | 说明 |
|------|------|
| 范围 | 200 – 2100 字节 |
| 默认 | 2100 字节 |
| 建议 | 较小分片提高扫描成功率，但会增加二维码数量；较大分片可减少二维码数量，需配合更大显示尺寸 |

### 二维码尺寸

| 参数 | 说明 |
|------|------|
| 范围 | 600 – 2000 像素 |
| 默认 | 2000 像素 |
| 建议 | 根据屏幕尺寸调整，确保单码可完整展示于屏幕内 |

### 自动播放间隔

| 参数 | 说明 |
|------|------|
| 范围 | 100 – 60000 毫秒 |
| 默认 | 500 毫秒 |
| 建议 | 间隔过短易漏扫，过长则整体传输变慢；可按摄像头与屏幕条件微调 |

---

## 📝 注意事项

1. **扫描顺序** — 请按顺序扫描所有数据分片，最后扫描文件名二维码（橙色边框）
2. **分片大小** — 默认已为上限 2100 字节以减少二维码数量；若识别困难可适当调小，并保证二维码完整显示在屏幕内
3. **自动播放** — 默认间隔 500ms；漏片时可适当加大间隔，或暂停后用跳转控件补扫缺失分片
4. **文件大小** — 建议不超过 10MB，过大文件会生成大量二维码
5. **屏幕亮度** — 确保发送端屏幕亮度足够，以提高扫描成功率
6. **摄像头对焦** — 保持手机与屏幕适当距离，确保二维码清晰
7. **校验失败** — 如遇到校验失败，重新扫描该二维码即可

---

## 🔒 隐私说明

- 所有数据仅在浏览器本地处理，**不会上传到任何服务器**
- 接收进度使用浏览器 IndexedDB 存储，不涉及隐私泄露
- CRC32 校验确保数据完整性，文件指纹机制防止不同文件混淆

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- 参考项目 [QRBridge](https://github.com/wallechfox/QRBridge) by [@wallechfox](https://github.com/wallechfox)
- [pako](https://github.com/nodeca/pako) — 快速 zlib 压缩库
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) — 二维码生成库
- [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) — 基于 WASM 的二维码扫描
- [jsQR](https://github.com/cozmo/jsQR) — 二维码识别兜底
- [localForage](https://github.com/localForage/localForage) — 本地存储库

---

<p align="center">
  Made with ❤️ by QRSync Team
</p>
