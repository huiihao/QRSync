// ===== zxing-wasm 初始化 =====
// wasmBinary 由 zxing_reader_wasm_b64.js 提供的 ZXingWasmBase64 变量解码而来
// 在 index.html 的 <script> 中已完成初始化

// ===== 状态 =====
let receivedChunks = new Map();  // index -> base64 data
let fileInfo = null;             // { fingerprint, filename, totalChunks, size }
let currentFileFingerprint = null;
let receivedFileName = '';

// 相机扫描状态
let isScanning = false;
let scanRafId = null;
let lastFrameTime = 0;
let lastDecodedText = '';
let lastScanTime = 0;

// 相机裁剪 canvas（复用，避免频繁分配）
let cropCanvas = null;
let cropCtx = null;

// 虚拟模式状态
let imageQueue = [];
let currentImageIndex = -1;

const SCAN_FPS = 12;

const DB = localforage.createInstance({ name: 'qrcode-receiver-v2' });

// ===== 分辨率档位 =====
const RESOLUTION_PRESETS = {
    '2160': [{ width: 3840, height: 2160 }],
    '1440': [{ width: 2560, height: 1440 }],
    '1080': [{ width: 1920, height: 1080 }],
    '720':  [{ width: 1280, height: 720  }],
    'auto': [
        { width: 3840, height: 2160 },
        { width: 2560, height: 1440 },
        { width: 1920, height: 1080 },
        { width: 1280, height: 720  },
    ]
};

// ===== 统一解码函数 =====
// 接受 ImageData，优先用 zxing-wasm（C++ 级别），失败后用 jsQR 兜底
async function decodeImageData(imgData) {
    if (typeof ZXingWASM !== 'undefined' && ZXingWASM._wasmReady) {
        try {
            const results = await ZXingWASM.readBarcodesFromImageData(imgData, {
                formats: ['QRCode'],
                tryHarder: true,
                tryRotate: true,
                tryInvert: true,
            });
            if (results.length > 0) return results[0].text;
        } catch (_) {}
    }
    // jsQR 后备
    const r = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
    return r ? r.data : null;
}

// ===== 相机模式 =====

async function tryOpenStream(deviceId, candidates) {
    for (const { width, height } of candidates) {
        try {
            const constraints = {
                video: {
                    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
                    width: { min: width, ideal: width },
                    height: { min: height, ideal: height }
                }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const track = stream.getVideoTracks()[0];
            return { stream, actual: track ? track.getSettings() : {} };
        } catch (_) {}
    }
    // 兜底：不指定分辨率
    const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? { video: { deviceId: { exact: deviceId } } } : { video: true }
    );
    const track = stream.getVideoTracks()[0];
    return { stream, actual: track ? track.getSettings() : {} };
}

function formatResolutionLabel(actual) {
    if (!actual.width || !actual.height) return '';
    const h = actual.height;
    const tag = h >= 2160 ? '(4K)' : h >= 1440 ? '(2K)' : h >= 1080 ? '(FHD)' : h >= 720 ? '(HD)' : '';
    return `${actual.width}×${actual.height} ${tag}`;
}

// 从视频帧裁出中心正方形的 ImageData，与 CSS object-fit:cover 的裁剪一致
function captureFrame(video) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const size = Math.min(vw, vh);
    const sx = Math.round((vw - size) / 2);
    const sy = Math.round((vh - size) / 2);

    if (!cropCanvas) {
        cropCanvas = document.createElement('canvas');
        cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    }
    cropCanvas.width = size;
    cropCanvas.height = size;
    cropCtx.imageSmoothingEnabled = true;
    cropCtx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    return cropCtx.getImageData(0, 0, size, size);
}

function startScanLoop(video) {
    let decoding = false;

    async function tick(now) {
        if (!isScanning) return;
        scanRafId = requestAnimationFrame(tick);

        if (now - lastFrameTime < 1000 / SCAN_FPS) return;
        lastFrameTime = now;
        if (decoding || video.readyState < 2) return;
        decoding = true;

        try {
            if (!video.videoWidth || !video.videoHeight) return;
            const imgData = captureFrame(video);
            const text = await decodeImageData(imgData);
            if (text) handleScanResult(text);
        } catch (_) {
        } finally {
            decoding = false;
        }
    }

    scanRafId = requestAnimationFrame(tick);
}

function stopScanLoop() {
    if (scanRafId !== null) {
        cancelAnimationFrame(scanRafId);
        scanRafId = null;
    }
    cropCanvas = null;
    cropCtx = null;
}

async function initCameraList() {
    try {
        // 先请求权限，让 enumerateDevices 能拿到 label
        try { await navigator.mediaDevices.getUserMedia({ video: true }); } catch (_) {}

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        const select = document.getElementById('camera-select');
        select.innerHTML = '<option value="">请选择摄像头...</option>';

        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            let label = device.label || `摄像头 ${index + 1}`;
            const isRear = /rear|back|后置/i.test(label);
            if (isRear) { label += ' [后置]'; option.selected = true; }
            option.text = label;
            select.appendChild(option);
        });

        if (videoDevices.length === 0) {
            select.innerHTML = '<option value="">未找到摄像头设备</option>';
        }
    } catch (err) {
        document.getElementById('camera-select').innerHTML = '<option value="">检测失败</option>';
    }
}

async function toggleCamera() {
    if (isScanning) await stopCamera();
    else await startCamera();
}

async function startCamera() {
    const deviceId = document.getElementById('camera-select').value;
    const resKey = document.getElementById('resolution-select').value;
    const candidates = RESOLUTION_PRESETS[resKey] || RESOLUTION_PRESETS['auto'];

    try {
        document.getElementById('btn-start').disabled = true;
        document.getElementById('scan-btn-text').textContent = '⏳ 启动中...';
        document.getElementById('resolution-actual').textContent = '';

        const { stream, actual } = await tryOpenStream(deviceId || null, candidates);

        const video = document.getElementById('video');
        video.srcObject = stream;
        await new Promise(resolve => { video.onloadedmetadata = resolve; });
        await video.play();

        isScanning = true;
        startScanLoop(video);

        document.getElementById('scan-section-wrapper').classList.add('active');
        document.getElementById('scan-btn-text').textContent = '⏹️ 停止扫描';
        document.getElementById('btn-start').disabled = false;

        const label = formatResolutionLabel(actual);
        if (label) document.getElementById('resolution-actual').textContent = '实际分辨率：' + label;

        showCameraStatus('扫描中... 请对准二维码', 'info');
        showFloatingMessage('📷 摄像头已启动' + (label ? '  ' + label : ''));
    } catch (err) {
        let msg = '启动失败';
        if (err.name === 'NotAllowedError')  msg = '请允许摄像头权限';
        else if (err.name === 'NotFoundError')   msg = '未找到摄像头';
        else if (err.name === 'NotReadableError') msg = '摄像头被占用';
        else msg = err.message;

        showCameraStatus('❌ ' + msg, 'error');
        showFloatingMessage('⚠️ ' + msg, true);
        await stopCamera();
    }
}

async function stopCamera() {
    isScanning = false;
    lastDecodedText = '';
    stopScanLoop();

    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }

    document.getElementById('scan-section-wrapper').classList.remove('active');
    document.getElementById('scan-btn-text').textContent = '🚀 开始扫描';
    document.getElementById('btn-start').disabled = false;
    showCameraStatus('扫描已停止', 'info');
}

// ===== 扫描结果处理 =====

function handleScanResult(decodedText) {
    const now = Date.now();
    if (now - lastScanTime < 800 && decodedText === lastDecodedText) return;
    lastScanTime = now;
    lastDecodedText = decodedText;

    const scanWindow = document.getElementById('scan-window');
    if (scanWindow) {
        scanWindow.classList.add('scan-success');
        setTimeout(() => scanWindow.classList.remove('scan-success'), 300);
    }

    processChunkData(decodedText);
}

async function processChunkData(data) {
    try {
        let trimmed = data.trim();
        if (!trimmed.startsWith('{') && trimmed.includes('{'))
            trimmed = trimmed.substring(trimmed.indexOf('{'));
        if (!trimmed.endsWith('}') && trimmed.includes('}'))
            trimmed = trimmed.substring(0, trimmed.lastIndexOf('}') + 1);
        if (!trimmed.startsWith('{') || !trimmed.endsWith('}'))
            throw new Error('数据格式错误');

        const chunk = JSON.parse(trimmed);

        if (chunk.t === 'fn') {
            // 文件名分片
            if (!chunk.f || !chunk.n || typeof chunk.s !== 'number' || !chunk.h)
                throw new Error('文件名数据字段错误');

            const crcCheck = calculateCRC32(JSON.stringify({
                t: chunk.t, f: chunk.f, n: chunk.n, s: chunk.s, ts: chunk.ts, tc: chunk.tc
            }));
            if (crcCheck !== chunk.h.toLowerCase()) {
                showFloatingMessage('❌ 文件名校验失败', true);
                return;
            }
            if (currentFileFingerprint && chunk.f !== currentFileFingerprint) {
                showFloatingMessage('⚠️ 文件指纹不匹配', true);
                return;
            }

            fileInfo = {
                fingerprint: chunk.f,
                filename: decodeFileName(chunk.n),
                totalChunks: chunk.tc,
                size: chunk.s
            };
            currentFileFingerprint = chunk.f;
            receivedFileName = fileInfo.filename;

            showFingerprintDisplay(currentFileFingerprint);
            await saveProgress();
            updateUI();
            showFloatingMessage('📄 文件名接收成功');
            showCameraStatus(`✅ 文件: ${receivedFileName}`, 'success');
        } else {
            // 数据分片
            if (typeof chunk.i !== 'number' || !chunk.t || !chunk.d || !chunk.f || !chunk.h)
                throw new Error('数据二维码字段错误');

            if (!currentFileFingerprint) {
                currentFileFingerprint = chunk.f;
                showFingerprintDisplay(currentFileFingerprint);
            } else if (chunk.f !== currentFileFingerprint) {
                showFloatingMessage('⚠️ 二维码不属于当前文件', true);
                return;
            }

            if (calculateCRC32(chunk.d) !== chunk.h.toLowerCase()) {
                showFloatingMessage(`❌ 分片 ${chunk.i+1} 校验失败`, true);
                return;
            }

            if (receivedChunks.has(chunk.i)) {
                showFloatingMessage(`⚠️ 分片 ${chunk.i+1}/${chunk.t} 已接收过`);
                return;
            }

            if (!fileInfo) fileInfo = { fingerprint: chunk.f, totalChunks: chunk.t, filename: '未知文件', size: 0 };

            receivedChunks.set(chunk.i, chunk.d);
            await saveProgress();
            updateUI();
            showFloatingMessage(`✅ 分片 ${chunk.i+1}/${chunk.t}`);
            showCameraStatus(`✅ 成功接收数据分片 ${chunk.i+1}/${fileInfo.totalChunks}`, 'success');
        }

        // 检查是否完整
        if (fileInfo?.totalChunks > 0 &&
            receivedChunks.size >= fileInfo.totalChunks &&
            fileInfo.filename !== '未知文件') {
            document.getElementById('btn-reassemble').disabled = false;
            showFloatingMessage('🎉 接收完成！');
            setTimeout(() => stopCamera(), 500);
        }
    } catch (err) {
        showFloatingMessage('❌ ' + err.message, true);
    }
}

// ===== 虚拟模式 =====

function switchMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.getElementById('camera-section').classList.toggle('active', mode === 'camera');
    document.getElementById('virtual-section').classList.toggle('active', mode === 'virtual');
    if (mode === 'virtual') stopCamera();
}

function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) addToQueue(files);
}

async function addToQueue(files) {
    for (const file of files) {
        const url = URL.createObjectURL(file);
        imageQueue.push({ file, url, status: 'pending' });
    }
    updateQueueUI();
    if (currentImageIndex === -1 && imageQueue.length > 0) selectImage(0);
}

function selectImage(index) {
    currentImageIndex = index;
    displayImage(imageQueue[index]);
    updateQueueUI();
}

function displayImage(item) {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        document.getElementById('preview-container').style.display = 'block';
    };
    img.src = item.url;
}

function updateQueueUI() {
    const grid = document.getElementById('queue-grid');
    grid.innerHTML = '';
    imageQueue.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'queue-item' + (i === currentImageIndex ? ' selected' : '') +
            (item.status === 'completed' ? ' completed' : item.status === 'error' ? ' error' : '');
        div.innerHTML = `<img src="${item.url}" alt="">`;
        div.onclick = () => selectImage(i);
        grid.appendChild(div);
    });
}

async function scanCurrent() {
    if (currentImageIndex === -1) return;
    const item = imageQueue[currentImageIndex];
    const scanBtn = document.getElementById('btn-scan');
    scanBtn.disabled = true;
    scanBtn.textContent = '⏳ 识别中...';

    try {
        const canvas = document.getElementById('preview-canvas');
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const text = await decodeImageData(imgData);
        if (text) {
            processChunkData(text);
            item.status = 'completed';
            setTimeout(() => {
                if (currentImageIndex < imageQueue.length - 1) selectImage(currentImageIndex + 1);
            }, 400);
        } else {
            item.status = 'error';
            showToast('未识别到二维码');
        }
    } catch (err) {
        item.status = 'error';
        showToast('识别失败: ' + err.message);
    }

    scanBtn.disabled = false;
    scanBtn.textContent = '🔍 识别';
    updateQueueUI();
}

async function scanAllQueued() {
    for (let i = 0; i < imageQueue.length; i++) {
        if (imageQueue[i].status !== 'completed') {
            selectImage(i);
            await scanCurrent();
            await new Promise(r => setTimeout(r, 100));
        }
    }
}

// ===== 粘贴处理 =====
async function handlePaste(e) {
    const items = [...(e.clipboardData?.items || [])];
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    if (!imageItems.length) return;
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean);
    if (files.length) addToQueue(files);
}

// ===== UI 更新 =====

function showFingerprintDisplay(fp) {
    const el = document.getElementById('fingerprint-display');
    document.getElementById('fingerprint-value').textContent = fp;
    el.style.display = 'block';
}

function showCameraStatus(message, type) {
    const el = document.getElementById('camera-status');
    el.textContent = message;
    el.className = 'status-message show status-' + type;
}

function showFloatingMessage(message, isError = false) {
    const msg = document.createElement('div');
    msg.className = 'floating-message' + (isError ? ' floating-error' : '');
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2800);
}

function updateUI() {
    const total = fileInfo?.totalChunks || 0;
    const received = receivedChunks.size;

    document.getElementById('received-count').textContent = received;
    document.getElementById('total-count').textContent = total || '?';
    document.getElementById('missing-count').textContent = Math.max(0, total - received);

    const pct = total > 0 ? (received / total) * 100 : 0;
    document.getElementById('progress-fill-recv').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = total > 0 ? pct.toFixed(0) + '%' : '--';

    if (fileInfo?.filename) {
        const fnEl = document.getElementById('filename-display');
        fnEl.querySelector('span').textContent = fileInfo.filename;
        fnEl.style.display = 'block';
    }

    // 缺失分片
    const missingEl = document.getElementById('missing-list');
    if (total > 0 && received < total) {
        const missing = [];
        for (let i = 0; i < total; i++) {
            if (!receivedChunks.has(i)) missing.push(i + 1);
        }
        missingEl.innerHTML = missing.slice(0, 50).map(n =>
            `<span class="missing-chip">${n}</span>`
        ).join('') + (missing.length > 50 ? `<span class="missing-chip">+${missing.length - 50}</span>` : '');
    } else {
        missingEl.innerHTML = '';
    }
}

// ===== 持久化 =====

async function saveProgress() {
    try {
        const data = {
            fingerprint: currentFileFingerprint,
            fileInfo,
            chunks: Object.fromEntries(receivedChunks)
        };
        await DB.setItem('progress', data);
    } catch (_) {}
}

async function loadProgress() {
    try {
        const data = await DB.getItem('progress');
        if (!data) return;
        currentFileFingerprint = data.fingerprint;
        fileInfo = data.fileInfo;
        receivedChunks = new Map(Object.entries(data.chunks || {}).map(([k, v]) => [parseInt(k), v]));
        receivedFileName = fileInfo?.filename || '';
        if (currentFileFingerprint) showFingerprintDisplay(currentFileFingerprint);
        updateUI();
        if (receivedChunks.size > 0) showFloatingMessage(`📂 已恢复 ${receivedChunks.size} 个分片`);
    } catch (_) {}
}

// ===== 重组文件 =====

async function reassembleFile() {
    if (!fileInfo || receivedChunks.size < fileInfo.totalChunks) {
        showToast('数据不完整，无法重组');
        return;
    }

    const btn = document.getElementById('btn-reassemble');
    btn.disabled = true;
    btn.textContent = '⏳ 重组中...';

    try {
        const sortedChunks = Array.from({ length: fileInfo.totalChunks }, (_, i) => {
            if (!receivedChunks.has(i)) throw new Error(`缺少分片 ${i+1}`);
            return receivedChunks.get(i);
        });

        const totalBytes = sortedChunks.reduce((sum, b64) => sum + Math.floor(b64.replace(/=+$/, '').length * 3 / 4), 0);
        const compressedData = new Uint8Array(totalBytes);
        let offset = 0;

        for (const b64 of sortedChunks) {
            const binary = atob(b64);
            for (let i = 0; i < binary.length; i++) {
                compressedData[offset++] = binary.charCodeAt(i);
            }
        }

        const decompressed = pako.inflate(compressedData.slice(0, offset));
        const blob = new Blob([decompressed]);
        saveFile(blob, fileInfo.filename);
        showToast(`✅ 文件 "${fileInfo.filename}" 下载成功`);
    } catch (err) {
        showToast('重组失败: ' + err.message);
        btn.disabled = false;
    }

    btn.textContent = '⬇️ 重组并下载';
}

// ===== 清除数据 =====

async function clearAllData() {
    if (!confirm('确定要清除所有接收数据吗？此操作不可恢复。')) return;
    try {
        if (isScanning) await stopCamera();
        receivedChunks.clear();
        fileInfo = null;
        currentFileFingerprint = null;
        receivedFileName = '';
        imageQueue = [];
        currentImageIndex = -1;
        await DB.clear();
        document.getElementById('fingerprint-display').style.display = 'none';
        document.getElementById('filename-display').style.display = 'none';
        document.getElementById('btn-reassemble').disabled = true;
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('queue-grid').innerHTML = '';
        updateUI();
        showToast('数据已清除');
    } catch (err) {
        showToast('清除失败: ' + err.message);
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
    const isMac = navigator.platform.includes('Mac');
    document.querySelectorAll('.kbd-cmd').forEach(el => { el.textContent = isMac ? '⌘' : 'Ctrl'; });
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', (e) => {
        const isMod = isMac ? e.metaKey : e.ctrlKey;
        if (isMod && e.key === 'v') return; // 让 paste 事件处理
    });

    await initCameraList();
    await loadProgress();
    showCameraStatus('等待扫描第一个二维码...', 'info');
});
