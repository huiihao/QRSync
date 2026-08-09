# 打包 QRSync 为可执行文件

本文档介绍如何将本仓库的纯前端页面打包为独立可执行文件或容器镜像，便于在不便直接使用浏览器的环境中启动。

> 当前项目目录为 `sender/`、`receiver/`、`shared/`、`js/`、`icon/`，下文示例均按此结构编写。请将路径中的 `/path/to/QRSync` 替换为你的实际仓库路径。

## 方案一：使用 Nativefier（推荐）

[Nativefier](https://github.com/nativefier/nativefier) 可将网页应用打包为桌面应用。

### 安装

```bash
# 需要 Node.js 环境
npm install -g nativefier
```

### 打包命令

```bash
# 打包发送端
nativefier \
  --name "QRSync-Sender" \
  --icon "/path/to/QRSync/icon/QRSync_icon.png" \
  --width 1200 \
  --height 800 \
  --min-width 800 \
  --min-height 600 \
  --file-download-options '{"saveAs": true}' \
  --single-instance \
  --tray \
  "file:///path/to/QRSync/sender/index.html"

# 打包接收端
nativefier \
  --name "QRSync-Receiver" \
  --icon "/path/to/QRSync/icon/QRSync_icon.png" \
  --width 900 \
  --height 800 \
  --min-width 600 \
  --min-height 600 \
  --file-download-options '{"saveAs": true}' \
  --single-instance \
  --tray \
  "file:///path/to/QRSync/receiver/index.html"
```

### Linux 系统打包

```bash
# 安装依赖
sudo apt-get install imagemagick  # Debian/Ubuntu
sudo yum install ImageMagick        # CentOS/RHEL

# 打包 Linux 版本（发送端示例）
nativefier \
  --platform linux \
  --arch x64 \
  --name "QRSync-Sender" \
  --icon "/path/to/QRSync/icon/QRSync_icon.png" \
  --width 1200 \
  --height 800 \
  "file:///path/to/QRSync/sender/index.html"
```

## 方案二：使用 Electron

### 1. 创建 Electron 项目

在仓库根目录旁或仓库内新建 Electron 工程均可；下列示例假设你把 `main.js` / `package.json` 放在仓库根目录，并直接加载本仓库的 `index.html`。

```bash
npm init -y
npm install electron --save-dev
npm install electron-builder --save-dev
```

### 2. 主进程文件 (`main.js`)

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon', 'QRSync_icon.png')
  });

  // 加载本仓库入口页（可从首页进入发送端 / 接收端）
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
```

### 3. `package.json` 关键片段

```json
{
  "name": "qrsync",
  "version": "2.0.0",
  "description": "Offline QR Code File Transfer Tool",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0"
  },
  "build": {
    "appId": "com.qrsync.app",
    "productName": "QRSync",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "index.html",
      "sender/**/*",
      "receiver/**/*",
      "shared/**/*",
      "js/**/*",
      "icon/**/*"
    ],
    "mac": {
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### 4. 打包

```bash
npm start          # 调试运行
npm run build      # 打包
npm run build:win  # Windows
npm run build:mac  # macOS
npm run build:linux
```

## 方案三：使用 Tauri（Rust，体积更小）

### 1. 安装依赖

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install tauri-cli
```

### 2. 创建 / 配置项目

将前端 `distDir` 指向本仓库根目录，开发入口可用首页：

```json
{
  "build": {
    "beforeBuildCommand": "",
    "beforeDevCommand": "",
    "devPath": "../index.html",
    "distDir": "../"
  },
  "tauri": {
    "windows": [
      {
        "title": "QRSync",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "bundle": {
      "active": true,
      "identifier": "com.qrsync.app",
      "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
    }
  }
}
```

可将 `icon/QRSync_icon.png` 转换为各平台所需图标后放入 Tauri 的 `icons/` 目录。

### 3. 打包

```bash
cargo tauri build
```

## 方案四：使用 PyWebView（Python）

### 1. 安装依赖

```bash
pip install pywebview pyinstaller
```

### 2. 启动脚本 (`app.py`)

将脚本放在仓库根目录时，可直接引用相对路径：

```python
import webview
import os
import sys

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath('.'), relative_path)

def main():
    webview.create_window(
        'QRSync - 发送端',
        get_resource_path('sender/index.html'),
        width=1200,
        height=800,
        min_size=(800, 600)
    )
    webview.create_window(
        'QRSync - 接收端',
        get_resource_path('receiver/index.html'),
        width=900,
        height=800,
        min_size=(600, 600)
    )
    webview.start()

if __name__ == '__main__':
    main()
```

### 3. PyInstaller 打包

需一并打包 `shared/` 与 `icon/`，否则样式与相对资源会缺失：

```bash
pyinstaller --windowed --onefile \
  --add-data "sender:sender" \
  --add-data "receiver:receiver" \
  --add-data "shared:shared" \
  --add-data "js:js" \
  --add-data "icon:icon" \
  --icon=icon/QRSync_icon.png \
  app.py
```

> Windows 下 `--add-data` 分隔符为 `;`，例如 `--add-data "sender;sender"`。

## 方案五：使用 Docker + Nginx

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t qrsync .
docker run -d -p 8080:80 qrsync
# 访问 http://localhost:8080
```

## 推荐方案总结

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Nativefier | 简单快速 | 包体积较大 | 快速打包 |
| Electron | 功能完整 | 包体积大 | 需要桌面集成 |
| Tauri | 体积小、性能好 | 需要 Rust 工具链 | 追求小体积 |
| PyWebView | Python 生态 | 依赖 Python 运行时/打包链 | Python 开发者 |
| Docker | 部署简单 | 仍是浏览器访问形态 | 内网统一托管 |

## 调试技巧

- **Electron**: 可临时调用 `mainWindow.webContents.openDevTools()`
- **Nativefier**: 按需注入调试脚本
- **Tauri**: `Ctrl+Shift+I` / `F12`
- **PyWebView**: `webview.start(debug=True)`

## 常见问题

### Q: 打包后样式丢失或跳转 404？

A: 确认打包配置包含 `sender/`、`receiver/`、`shared/`、`js/`、`icon/`，且页面内使用相对路径。

### Q: 摄像头无法使用？

A: 桌面壳或浏览器需授予摄像头权限；部分环境要求 `localhost` / HTTPS。`file://` 下能力因浏览器而异。

### Q: 文件下载失败？

A: Nativefier 可设置 `--file-download-options '{"saveAs": true}'`；Electron / 系统壳需允许下载与弹窗。

---

如有问题，请提交 Issue，或查阅对应打包工具的官方文档。
