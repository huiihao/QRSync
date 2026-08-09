// ===== 共享工具函数 =====

// CRC32 查找表（模块加载时一次性建立，避免每次重建）
const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c;
    }
    return table;
})();

function calculateCRC32(str) {
    if (typeof pako !== 'undefined' && pako.crc32) {
        return pako.crc32(str).toString(36).padStart(5, '0').slice(-5).toLowerCase();
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(36).padStart(5, '0').slice(-5).toLowerCase();
}

// 分块 base64 编码，避免大数组展开导致调用栈溢出
function uint8ArrayToBase64(uint8Array) {
    const CHUNK = 8192;
    let result = '';
    for (let i = 0; i < uint8Array.length; i += CHUNK) {
        result += String.fromCharCode(...uint8Array.subarray(i, i + CHUNK));
    }
    return btoa(result);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateShortFileId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 46656);
    const combined = (timestamp % 60466176) * 1000 + random;
    return combined.toString(36).padStart(5, '0').slice(-5).toUpperCase();
}

function encodeFileName(filename) {
    try {
        return btoa(String.fromCharCode(...new TextEncoder().encode(filename)));
    } catch (e) {
        return btoa(unescape(encodeURIComponent(filename)));
    }
}

function decodeFileName(base64Name) {
    try {
        const binaryStr = atob(base64Name);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        try { return decodeURIComponent(atob(base64Name)); } catch { return base64Name; }
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function saveFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

let _toastTimer = null;
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function showStatus(elementId, message, type = 'info') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'status show ' + type;
}
