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
  <b>QRSync</b> 是一个纯浏览器实现、完全离线的孤岛文件传输工具，通过二维码序列在没有网络连接/禁止USB设备/禁止剪贴板/只提供视觉界面的孤岛环境下传输文件。
</p>

<p align="center">
  <a href="#-在线体验">在线体验</a> •
  <a href="#-功能特点">功能特点</a> •
  <a href="#-使用方法">使用方法</a> •
  <a href="#-技术原理">技术原理</a> •
  <a href="#-本地使用">本地使用</a>
</p>


## 🌐 在线体验

**👉 [点击访问 QRSync](https://huiihao.github.io/QRSync/)**

> 下载本仓库压缩包，页面加载JavaScript完成后，即可断开网络离线使用。

<div align="center">
<!-- <img width="80%" alt="image" src="https://github.com/user-attachments/assets/af93481a-316c-4246-9631-1dfd7c282899" /> -->
  <img width="80%" alt="image" src="https://github.com/user-attachments/assets/90debdb9-1205-4e0b-9ab4-df1aad5f5357" />
</div>



## ✨ 功能特点

| 特性 | 说明 |
|------|------|
| 🌐 **纯浏览器实现** | 无需安装任何软件，无需服务器支持 |
| 📶 **完全离线工作** | 在孤岛条件下完全离线进行使用 |
| 🔒 **数据完整性校验** | 使用 CRC32 校验确保数据传输准确无误 |
| 📁 **支持任意文件类型** | 文本、图片、文档、压缩包等均可传输 |
| 🇨🇳 **完美中文支持** | 支持中文文件名，无乱码问题 |
| 💾 **断点续传** | 自动保存接收进度，刷新页面不丢失 |
| 📱 **移动端适配** | 针对手机扫描场景优化 |
| 🎨 **精美界面** | 简约风格设计，简洁优雅 |


## 📖 使用方法

### 发送文件

1. 打开 **[发送端](https://huiihao.github.io/QRSync/send/index.html)**
2. 点击或拖拽选择要传输的文件
3. 调整分片大小和二维码尺寸（可选）
4. 点击"生成二维码"按钮
5. 按顺序展示二维码供接收端扫描

**📤发送端界面：**

<div align="center">
<!-- <img width="70%" alt="image" src="https://github.com/user-attachments/assets/b2fe4202-e958-41d4-9720-6c30c2fd4970" /> -->
  <img width="70%" height="70%" alt="image" src="https://github.com/user-attachments/assets/9d414f06-e5d2-4359-9581-79d0a37b3801" />
</div>

### 接收文件

1. 打开 **[接收端](https://huiihao.github.io/QRSync/receiver/index.html)**
2. 点击"开始扫描"按钮，允许摄像头权限
3. 按顺序扫描所有数据二维码
4. 最后扫描文件名二维码（橙色边框）
5. 点击"重组文件"按钮
6. 点击"下载文件"保存到本地

**📥接收端界面：**

<div style="display: flex; justify-content: space-between; gap: 20px;">
  <!-- <img style="width: 48%; height: auto;" alt="Sender Interface" src="https://github.com/user-attachments/assets/903f79b1-7804-42f5-b15f-6dfc86b2fe1f" />
  <img style="width: 48%; height: auto;" alt="Receiver Interface" src="https://github.com/user-attachments/assets/5775618f-2c48-40c5-b99f-459b864a0c06" /> -->
  <img style="width: 48%; height: auto;" alt="Receiver Interface1" src="https://github.com/user-attachments/assets/5fde12d8-f772-496b-a50d-452062d8f0cc" />
  <img style="width: 48%; height: auto;" alt="Receiver Interface2" src="https://github.com/user-attachments/assets/616a5e40-ba18-45c4-9207-7e7c00244b6c" />
</div>



## 🔧 技术原理

### 数据流

```
┌─────────────┐     压缩      ┌─────────────┐     分片      ┌─────────────┐
│   原始文件   │ ───────────→ │  deflate压缩  │ ───────────→ │   数据分片   │
└─────────────┘              └─────────────┘              └─────────────┘
                                                                    ↓
┌─────────────┐     重组      ┌─────────────┐     解压      ┌─────────────┐
│   完整文件   │ ←─────────── │   合并数据   │ ←─────────── │  二维码传输  │
└─────────────┘              └─────────────┘              └─────────────┘
```

### 二维码数据结构

**数据分片：**
```json
{
  "i": 0,           // 分片索引
  "t": 5,           // 总分片数
  "f": "ABC12",     // 文件指纹
  "h": "a3f9b",     // CRC32 校验码
  "d": "base64..."  // 数据内容
}
```

**文件名分片：**
```json
{
  "t": "fn",        // 类型标识
  "f": "XYZ89",     // 文件指纹
  "n": "base64...", // 编码后的文件名
  "s": 1024,        // 文件大小
  "ts": 1234567890, // 时间戳
  "tc": 10,         // 总分片数
  "h": "abc12"      // CRC32校验码
}
```

### 核心技术

- **压缩算法**: [pako](https://github.com/nodeca/pako) (zlib/deflate)
- **二维码生成**: [qrcode.js](https://github.com/davidshimjs/qrcodejs)
- **二维码扫描**: [ZXing](https://github.com/zxing-js/library)
- **本地存储**: [localForage](https://github.com/localForage/localForage)
- **校验算法**: CRC32


## 💻 本地使用

### 方法一：直接下载

1. 下载本项目代码
2. 解压到任意文件夹
3. 双击 `index.html` 打开首页
4. 分别打开发送端和接收端即可使用

### 方法二：本地服务器

```bash
# 克隆仓库
git clone https://github.com/yourusername/QRSync.git

# 进入项目目录
cd QRSync

# 启动本地服务器（Python 3）
python -m http.server 8080

# 或 Node.js
npx serve .

# 浏览器访问 http://localhost:8080
```



## 📦 项目结构

```
QRSync-Fixed/
├── index.html          # 入口页面
├── send/
│   └── index.html      # 发送端
├── receiver/
│   └── index.html      # 接收端
├── js/
│   ├── qrcode.min.js   # 二维码生成库
│   ├── pako.min.js     # 压缩库
│   ├── jszip.min.js    # ZIP打包库
│   ├── FileSaver.min.js # 文件保存库
│   ├── zxing-library.min.js # 二维码扫描库
│   ├── jsQR.js         # 二维码识别库
│   └── localforage.min.js # 本地存储库
├── README.md           # 中文文档
├── README_EN.md        # 英文文档
└── docs/
    └── PACKAGING.md    # 打包说明
```
> 本项目为纯前端实现，无后端依赖，所有第三方库均本地准备。



## 🛠️ 打包为可执行文件

请参考 [docs/PACKAGING.md](docs/PACKAGING.md) 了解如何将本项目打包为独立的可执行文件（Windows/Linux/macOS）。



## ⚙️ 配置说明

### 分片大小

- **范围**: 400 - 1500 字节
- **默认值**: 800 字节
- **建议**: 较小的分片可提高扫描成功率，但会增加二维码数量

### 二维码尺寸

- **范围**: 256 - 600 像素
- **默认值**: 400 像素
- **建议**: 根据屏幕尺寸和扫描距离调整



## 📝 注意事项

1. **扫描顺序**: 请按顺序扫描所有数据分片，最后扫描文件名二维码
2. **分片大小**：建议保持默认600字节，过大的分片可能导致二维码无法识别
3. **文件大小**: 建议传输文件大小不超过 10MB，过大文件会生成大量二维码
4. **屏幕亮度**: 确保发送端屏幕亮度足够，以提高扫描成功率
5. **摄像头对焦**: 保持手机摄像头与屏幕适当距离，确保二维码清晰
6. **校验失败**: 如遇到校验失败，请重新扫描该二维码



## 🔒 隐私说明

- 所有数据仅在浏览器本地处理，不会上传到任何服务器
- 接收进度使用浏览器的 IndexedDB 存储，不会泄露隐私
- 使用 CRC32 校验确保数据完整性
- 文件指纹机制防止不同文件混淆



## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request



## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。



## 🙏 致谢

- 参考项目 [QRBridge](https://github.com/wallechfox/QRBridge) by [@wallechfox](https://github.com/wallechfox)
- [pako](https://github.com/nodeca/pako) - 快速 zlib 压缩库
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) - 二维码生成库
- [ZXing](https://github.com/zxing-js/library) - 二维码扫描库
- [localForage](https://github.com/localForage/localForage) - 本地存储库

---

<p align="center">
  Made with ❤️ by QRSync Team
</p>
