# QRSync_Offline

<p align="center">
  <img src="https://img.shields.io/badge/纯浏览器-实现-brightgreen" alt="纯浏览器实现">
  <img src="https://img.shields.io/badge/完全离线-工作-blue" alt="完全离线工作">
  <img src="https://img.shields.io/badge/中文-支持-orange" alt="中文支持">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  <b>QRSync_Offline</b> 是一个纯浏览器实现的、完全离线的文件传输工具，通过二维码序列在没有网络连接的环境下传输文件。
</p>

<p align="center">
  <a href="#-在线体验">在线体验</a> •
  <a href="#-功能特点">功能特点</a> •
  <a href="#-使用方法">使用方法</a> •
  <a href="#-技术原理">技术原理</a> •
  <a href="#-本地使用">本地使用</a>
</p>

---

## 🌐 在线体验

**👉 [点击访问 QRSync_Offline](https://QRSync_Offline-demo.vercel.app)**

> 页面加载完成后，即可断开网络离线使用。

---

## ✨ 功能特点

| 特性 | 说明 |
|------|------|
| 🌐 **纯浏览器实现** | 无需安装任何软件，无需服务器支持 |
| 📶 **完全离线工作** | 页面加载后即可断开网络使用 |
| 🔒 **数据完整性校验** | 使用 CRC32 校验确保数据传输准确无误 |
| 📁 **支持任意文件类型** | 文本、图片、文档、压缩包等均可传输 |
| 🇨🇳 **完美中文支持** | 支持中文文件名，无乱码问题 |
| 💾 **断点续传** | 自动保存接收进度，刷新页面不丢失 |
| 📱 **移动端适配** | 针对手机扫描场景优化 |
| 🎨 **精美界面** | Apple 风格设计，简洁优雅 |

---

## 📖 使用方法

### 发送文件

1. 打开 **[发送端](send/index.html)**
2. 点击或拖拽选择要传输的文件
3. 调整分片大小和二维码尺寸（可选）
4. 点击"生成二维码"按钮
5. 按顺序展示二维码供接收端扫描

**发送端界面：**

![发送端界面](https://via.placeholder.com/800x500/f5f5f7/0071e3?text=Sender+Interface)

### 接收文件

1. 打开 **[接收端](receiver/index.html)**
2. 点击"开始扫描"按钮，允许摄像头权限
3. 按顺序扫描所有数据二维码
4. 最后扫描文件名二维码（橙色边框）
5. 点击"重组文件"按钮
6. 点击"下载文件"保存到本地

**接收端界面：**

![接收端界面](https://via.placeholder.com/800x500/f5f5f7/0071e3?text=Receiver+Interface)

---

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
  "f": "ABC12",     // 文件指纹
  "n": "base64...", // 文件名（Base64 编码）
  "s": 1024,        // 文件大小
  "tc": 5,          // 数据分片总数
  "h": "c7d2e"      // CRC32 校验码
}
```

### 核心技术

- **压缩算法**: [pako](https://github.com/nodeca/pako) (zlib/deflate)
- **二维码生成**: [qrcode.js](https://github.com/davidshimjs/qrcodejs)
- **二维码扫描**: [ZXing](https://github.com/zxing-js/library)
- **本地存储**: [localForage](https://github.com/localForage/localForage)
- **校验算法**: CRC32

---

## 💻 本地使用

### 方法一：直接下载

1. 下载本项目代码
2. 解压到任意文件夹
3. 双击 `index.html` 打开首页
4. 分别打开发送端和接收端即可使用

### 方法二：本地服务器

```bash
# 克隆仓库
git clone https://github.com/yourusername/QRSync_Offline.git

# 进入项目目录
cd QRSync_Offline

# 启动本地服务器（Python 3）
python -m http.server 8080

# 或 Node.js
npx serve .

# 浏览器访问 http://localhost:8080
```

---

## 📂 项目结构

```
QRSync_Offline/
├── index.html           # 首页入口
├── send/
│   └── index.html       # 发送端
├── receiver/
│   └── index.html       # 接收端
└── README.md            # 项目说明
```

> 本项目为纯前端实现，无后端依赖，所有第三方库均通过 CDN 引入。

---

## ⚙️ 配置说明

### 分片大小

- **范围**: 400 - 1500 字节
- **默认值**: 800 字节
- **建议**: 较小的分片可提高扫描成功率，但会增加二维码数量

### 二维码尺寸

- **范围**: 256 - 600 像素
- **默认值**: 400 像素
- **建议**: 根据屏幕尺寸和扫描距离调整

---

## 📝 注意事项

1. **扫描顺序**: 请按顺序扫描所有数据分片，最后扫描文件名二维码
2. **文件大小**: 建议传输文件大小不超过 10MB，过大文件会生成大量二维码
3. **屏幕亮度**: 确保发送端屏幕亮度足够，以提高扫描成功率
4. **摄像头对焦**: 保持手机摄像头与屏幕适当距离，确保二维码清晰
5. **校验失败**: 如遇到校验失败，请重新扫描该二维码

---

## 🔒 隐私说明

- 所有数据仅在浏览器本地处理，不会上传到任何服务器
- 接收进度使用浏览器的 IndexedDB 存储，不会泄露隐私
- 页面加载后即可断开网络使用，确保数据安全

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- [pako](https://github.com/nodeca/pako) - 快速 zlib 压缩库
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) - 二维码生成库
- [ZXing](https://github.com/zxing-js/library) - 二维码扫描库
- [localForage](https://github.com/localForage/localForage) - 本地存储库

---

<p align="center">
  Made with ❤️ by QRSync_Offline Team
</p>
