// ===== 配置 =====
const CONFIG = {
    CHUNK_SIZE: 600,
    QR_SIZE: 800,
    QR_MAX_CAPACITY: 2953,
    AUTOPLAY_INTERVAL: 2000,
    PACKET_TYPES: { DATA: 'data', FILENAME: 'fn' }
};

// ===== 状态 =====
let file = null;
let chunks = [];
let currentChunkIndex = 0;
let fileFingerprint = '';
let originalFileName = '';
let originalFileSize = 0;
let qrCodes = [];
let fileNameQrCode = null;
let autoplayInterval = null;
let isPlaying = false;
let hasGenerated = false;

// ===== DOM 引用 =====
const uploadArea    = document.getElementById('uploadArea');
const fileInput     = document.getElementById('fileInput');
const fileInfo      = document.getElementById('fileInfo');
const generateBtn   = document.getElementById('generateBtn');
const resetBtn      = document.getElementById('resetBtn');
const qrSection     = document.getElementById('qrSection');
const qrContainer   = document.getElementById('qrContainer');
const chunksGrid    = document.getElementById('chunksGrid');
const downloadSection = document.getElementById('downloadSection');

// ===== 파일 업로드 이벤트 =====
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

function handleFile(selectedFile) {
    file = selectedFile;
    originalFileName = file.name;
    originalFileSize = file.size;

    document.getElementById('fileName').textContent = originalFileName;
    document.getElementById('fileSize').textContent = formatFileSize(originalFileSize);
    document.getElementById('fileType').textContent = file.type || '未知类型';

    fileFingerprint = generateShortFileId();
    document.getElementById('fileFingerprint').textContent = fileFingerprint;

    uploadArea.classList.add('has-file');
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <div class="upload-text">文件已选择</div>
        <div class="upload-hint">${originalFileName}</div>
    `;

    fileInfo.style.display = 'block';
    generateBtn.disabled = false;
    hasGenerated = false;
    hideRegenerateHints();
    updateChunkEstimation();
    showStatus('status', '文件已选择，点击"生成二维码"开始', 'success');
    showToast('文件选择成功');
}

// ===== 设置滑块 =====
const chunkSizeSlider = document.getElementById('chunkSizeSlider');
const chunkSizeValue  = document.getElementById('chunkSizeValue');
const chunkSizeHint   = document.getElementById('chunkSizeHint');

chunkSizeSlider.addEventListener('input', function () {
    CONFIG.CHUNK_SIZE = parseInt(this.value);
    chunkSizeValue.textContent = CONFIG.CHUNK_SIZE + ' B';
    updateChunkEstimation();
    if (hasGenerated) chunkSizeHint.classList.add('show');
});

const qrSizeSlider = document.getElementById('qrSizeSlider');
const qrSizeValue  = document.getElementById('qrSizeSlider').parentElement.querySelector('.slider-value') ||
                     document.getElementById('qrSizeValue');
const qrSizeHint   = document.getElementById('qrSizeHint');

document.getElementById('qrSizeSlider').addEventListener('input', function () {
    CONFIG.QR_SIZE = parseInt(this.value);
    document.getElementById('qrSizeValue').textContent = CONFIG.QR_SIZE + ' px';
    if (hasGenerated) qrSizeHint.classList.add('show');
});

function hideRegenerateHints() {
    chunkSizeHint.classList.remove('show');
    qrSizeHint.classList.remove('show');
}

function updateChunkEstimation() {
    if (!file) return;
    const estimated = Math.ceil(file.size * 0.6 / CONFIG.CHUNK_SIZE);
    document.getElementById('estimatedChunks').textContent = (estimated + 1) + ' 个';
    document.getElementById('estimationBar').style.width = Math.min(estimated, 100) + '%';
}

// ===== 播放间隔 =====
document.getElementById('intervalConfirmBtn').addEventListener('click', () => {
    const raw = parseInt(document.getElementById('intervalInput').value);
    CONFIG.AUTOPLAY_INTERVAL = Math.max(100, Math.min(60000, isNaN(raw) ? 2000 : raw));
    document.getElementById('intervalInput').value = CONFIG.AUTOPLAY_INTERVAL;
    document.getElementById('intervalAppliedValue').textContent = CONFIG.AUTOPLAY_INTERVAL;
    document.getElementById('intervalAppliedHint').classList.add('show');
    setTimeout(() => document.getElementById('intervalAppliedHint').classList.remove('show'), 2500);
    if (isPlaying) restartAutoplay();
});

// ===== 生成二维码 =====
generateBtn.addEventListener('click', async () => {
    if (!file) { showStatus('status', '请先选择文件', 'error'); return; }
    if (typeof QRCode === 'undefined') { showStatus('status', 'QRCode 库未加载', 'error'); return; }

    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="loading"></span> 处理中...';
        showStatus('status', '正在读取并压缩文件...', 'info');

        const fileBuffer = await readFileAsArrayBuffer(file);
        const compressed = pako.deflate(new Uint8Array(fileBuffer));

        showStatus('status', `压缩完成: ${formatFileSize(fileBuffer.byteLength)} → ${formatFileSize(compressed.length)}`, 'success');
        await processFileChunks(compressed);
    } catch (error) {
        showStatus('status', '处理文件时出错: ' + error.message, 'error');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span>生成二维码</span>';
    }
});

async function processFileChunks(compressed) {
    chunks = [];
    qrCodes = [];

    const totalChunks = Math.ceil(compressed.length / CONFIG.CHUNK_SIZE);
    if (totalChunks <= 0) throw new Error('分片计算错误');

    showStatus('status', `正在分片处理... (共 ${totalChunks} 个数据分片)`, 'info');

    const compressedArray = new Uint8Array(compressed);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CONFIG.CHUNK_SIZE;
        const chunkData = compressedArray.slice(start, Math.min(start + CONFIG.CHUNK_SIZE, compressed.length));
        const base64Data = uint8ArrayToBase64(chunkData);

        const chunkObj = {
            i: i,
            t: totalChunks,
            h: calculateCRC32(base64Data),
            f: fileFingerprint,
            d: base64Data
        };

        const jsonStr = JSON.stringify(chunkObj);
        if (jsonStr.length > CONFIG.QR_MAX_CAPACITY) {
            const suggested = Math.max(200, Math.floor(CONFIG.CHUNK_SIZE / (jsonStr.length / CONFIG.QR_MAX_CAPACITY) * 0.8));
            showStatus('status', `分片 ${i+1} 数据过大，建议将分片大小调整为 ${suggested} B`, 'error');
            chunkSizeSlider.value = suggested;
            chunkSizeValue.textContent = suggested + ' B';
            CONFIG.CHUNK_SIZE = suggested;
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span>生成二维码</span>';
            return;
        }

        chunks.push(chunkObj);

        if (i % Math.max(1, Math.floor(totalChunks / 10)) === 0) {
            showStatus('status', `分片进度: ${i+1}/${totalChunks}`, 'info');
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    // 计算最小安全 QR 尺寸（每模块至少 4px）
    const maxJsonLen = Math.max(...chunks.map(c => JSON.stringify(c).length));
    const estimatedVersion = maxJsonLen < 1000 ? 25 : maxJsonLen < 1209 ? 30 : maxJsonLen < 1520 ? 35 : 40;
    const minSafeSize = (17 + 4 * estimatedVersion) * 4;
    if (CONFIG.QR_SIZE < minSafeSize) {
        CONFIG.QR_SIZE = minSafeSize;
        document.getElementById('qrSizeSlider').value = Math.min(minSafeSize, 1200);
        document.getElementById('qrSizeValue').textContent = CONFIG.QR_SIZE + ' px';
    }

    createFileNameQrCode(totalChunks);
    showStatus('status', `处理完成！共 ${totalChunks} 个数据分片 + 1 个文件名分片`, 'success');
    await generateQRCodeSequence();
    hasGenerated = true;
    hideRegenerateHints();
}

function createFileNameQrCode(totalChunks) {
    const encodedFileName = encodeFileName(originalFileName);
    const fnData = {
        t: CONFIG.PACKET_TYPES.FILENAME,
        f: fileFingerprint,
        n: encodedFileName,
        s: originalFileSize,
        ts: Date.now(),
        tc: totalChunks
    };
    fnData.h = calculateCRC32(JSON.stringify({
        t: fnData.t, f: fnData.f, n: fnData.n, s: fnData.s, ts: fnData.ts, tc: fnData.tc
    }));
    fileNameQrCode = fnData;
}

async function generateQRCodeSequence() {
    qrSection.classList.add('show');
    currentChunkIndex = 0;
    qrCodes = [
        ...chunks.map((c, i) => ({ data: c, type: CONFIG.PACKET_TYPES.DATA, index: i })),
        { data: fileNameQrCode, type: CONFIG.PACKET_TYPES.FILENAME, index: chunks.length }
    ];

    const totalQR = qrCodes.length;
    document.getElementById('totalQrCount').textContent = totalQR;
    document.getElementById('dataQrCount').textContent = chunks.length;
    downloadSection.classList.add('show');

    renderChunksGrid();
    showQRCode(0);

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>生成二维码</span>';
    showToast('二维码生成完成');
    qrSection.scrollIntoView({ behavior: 'smooth' });
}

function renderChunksGrid() {
    chunksGrid.innerHTML = '';
    chunks.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'chunk-dot pending';
        dot.textContent = i + 1;
        dot.id = `chunk-dot-${i}`;
        dot.onclick = () => { stopAutoplay(); showQRCode(i); };
        chunksGrid.appendChild(dot);
    });

    const fnDot = document.createElement('div');
    fnDot.className = 'chunk-dot filename';
    fnDot.textContent = '📄';
    fnDot.id = 'chunk-dot-filename';
    fnDot.onclick = () => { stopAutoplay(); showQRCode(chunks.length); };
    chunksGrid.appendChild(fnDot);
}

function showQRCode(index) {
    currentChunkIndex = index;
    const qrData = qrCodes[index];
    const isFilename = qrData.type === CONFIG.PACKET_TYPES.FILENAME;

    qrContainer.innerHTML = '<div id="qrcode"></div>';
    qrContainer.className = isFilename ? 'qr-container filename-qr' : 'qr-container data-qr';

    new QRCode(document.getElementById('qrcode'), {
        text: JSON.stringify(qrData.data),
        width: CONFIG.QR_SIZE,
        height: CONFIG.QR_SIZE,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
    });

    document.getElementById('qrCounter').textContent = `${index + 1} / ${qrCodes.length}`;

    const qrType = document.getElementById('qrType');
    qrType.textContent = isFilename ? '文件名分片' : `数据分片 ${qrData.data.i + 1}/${qrData.data.t}`;
    qrType.className = 'qr-type ' + (isFilename ? 'filename' : 'data');
    document.getElementById('qrHint').textContent = isFilename ? '⚠️ 请最后扫描此二维码' : '请使用接收端扫描此二维码';

    document.querySelectorAll('.chunk-dot').forEach((dot, i) => {
        dot.classList.remove('generated');
        if (i === index) dot.classList.add('generated');
    });
}

// ===== 导航 =====
document.getElementById('prevBtn').addEventListener('click', () => {
    stopAutoplay();
    if (currentChunkIndex > 0) showQRCode(currentChunkIndex - 1);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    stopAutoplay();
    if (currentChunkIndex < qrCodes.length - 1) showQRCode(currentChunkIndex + 1);
});

// ===== 自动播放 =====
const playBtn       = document.getElementById('playBtn');
const autoplayToggle = document.getElementById('autoplayToggle');
const autoplayStatus = document.getElementById('autoplayStatus');

playBtn.addEventListener('click', () => isPlaying ? stopAutoplay() : startAutoplay());
autoplayToggle.addEventListener('change', () => autoplayToggle.checked ? startAutoplay() : stopAutoplay());

function startAutoplay() {
    isPlaying = true;
    playBtn.textContent = '⏸ 暂停';
    autoplayToggle.checked = true;
    autoplayStatus.textContent = '开启';
    autoplayInterval = setInterval(() => {
        showQRCode((currentChunkIndex + 1) % qrCodes.length);
    }, CONFIG.AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
    isPlaying = false;
    playBtn.textContent = '▶ 播放';
    autoplayToggle.checked = false;
    autoplayStatus.textContent = '关闭';
    clearInterval(autoplayInterval);
    autoplayInterval = null;
}

function restartAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
        showQRCode((currentChunkIndex + 1) % qrCodes.length);
    }, CONFIG.AUTOPLAY_INTERVAL);
}

// ===== 下载 =====
document.getElementById('downloadCurrentBtn').addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) { showToast('没有可下载的二维码'); return; }
    const isLast = currentChunkIndex === qrCodes.length - 1;
    const filename = isLast
        ? `qrcode_${fileFingerprint}_filename.png`
        : `qrcode_${fileFingerprint}_${String(currentChunkIndex + 1).padStart(3, '0')}.png`;
    canvas.toBlob(blob => { saveFile(blob, filename); showToast('已开始下载当前二维码'); }, 'image/png');
});

document.getElementById('downloadAllBtn').addEventListener('click', async () => {
    if (!qrCodes.length) return;
    if (typeof JSZip === 'undefined') { showStatus('status', 'ZIP 库未加载', 'error'); return; }

    const btn = document.getElementById('downloadAllBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> 打包中...';
    showStatus('status', '正在打包所有二维码，请稍候...', 'info');

    try {
        const zip = new JSZip();
        const folder = zip.folder(`qrcodes_${fileFingerprint}`);

        // 用离屏 canvas 批量生成，不插入 DOM
        const offCanvas = document.createElement('canvas');
        offCanvas.width = CONFIG.QR_SIZE;
        offCanvas.height = CONFIG.QR_SIZE;

        for (let i = 0; i < qrCodes.length; i++) {
            const qr = qrCodes[i];
            const isFilename = qr.type === CONFIG.PACKET_TYPES.FILENAME;
            const tempDiv = document.createElement('div');

            new QRCode(tempDiv, {
                text: JSON.stringify(qr.data),
                width: CONFIG.QR_SIZE,
                height: CONFIG.QR_SIZE,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            });

            await new Promise(resolve => setTimeout(resolve, 30));

            const cvs = tempDiv.querySelector('canvas');
            if (cvs) {
                const blob = await new Promise(resolve => cvs.toBlob(resolve, 'image/png'));
                const fname = isFilename
                    ? 'qrcode_filename.png'
                    : `qrcode_data_${String(qr.data.i + 1).padStart(3, '0')}.png`;
                folder.file(fname, blob);
            }

            if (i % 10 === 0) showStatus('status', `打包进度: ${i+1}/${qrCodes.length}`, 'info');
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveFile(content, `qrcodes_${fileFingerprint}.zip`);
        showStatus('status', `✅ 已生成 ${qrCodes.length} 个二维码`, 'success');
        showToast('ZIP 文件下载已开始');
    } catch (error) {
        showStatus('status', '打包失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// ===== 重置 =====
resetBtn.addEventListener('click', () => {
    stopAutoplay();
    file = null; chunks = []; qrCodes = []; currentChunkIndex = 0;
    fileFingerprint = ''; originalFileName = ''; originalFileSize = 0;
    fileNameQrCode = null; hasGenerated = false;

    fileInput.value = '';
    uploadArea.classList.remove('has-file');
    uploadArea.innerHTML = `
        <div class="upload-icon">📂</div>
        <div class="upload-text">点击或拖拽文件到此处</div>
        <div class="upload-hint">支持任意类型文件</div>
    `;

    fileInfo.style.display = 'none';
    qrSection.classList.remove('show');
    downloadSection.classList.remove('show');
    generateBtn.disabled = true;

    chunkSizeSlider.value = 600;
    chunkSizeValue.textContent = '600 B';
    CONFIG.CHUNK_SIZE = 600;

    document.getElementById('qrSizeSlider').value = 800;
    document.getElementById('qrSizeValue').textContent = '800 px';
    CONFIG.QR_SIZE = 800;

    hideRegenerateHints();
    document.getElementById('estimatedChunks').textContent = '-- 个';
    document.getElementById('estimationBar').style.width = '0%';
    showStatus('status', '请选择一个文件开始', 'info');
    showToast('已重置');
});

// ===== 初始化 =====
window.addEventListener('load', () => {
    if (typeof QRCode === 'undefined') showStatus('status', 'QRCode 库未加载', 'error');
    if (typeof pako === 'undefined') showStatus('status', '压缩库未加载', 'error');
    showStatus('status', '请选择一个文件开始', 'info');
});
