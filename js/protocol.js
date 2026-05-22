// QRSync Protocol - Shared constants and utilities for sender and receiver
(function() {
  'use strict';

  var PROTO = {
    PACKET_TYPES: {
      DATA: 'data',
      FILENAME: 'fn'
    },
    QR_MAX_CAPACITY: 2953,

    generateShortFileId: function() {
      var timestamp = Date.now();
      var random = Math.floor(Math.random() * 46656);
      var combined = (timestamp % 60466176) * 1000 + random;
      return combined.toString(36).padStart(5, '0').slice(-5).toUpperCase();
    },

    calculateCRC32: function(data) {
      if (typeof pako !== 'undefined' && pako.crc32) {
        return pako.crc32(data).toString(36).padStart(5, '0').slice(-5).toLowerCase();
      }

      var table = new Uint32Array(256);
      for (var i = 0; i < 256; i++) {
        var c = i;
        for (var j = 0; j < 8; j++) {
          c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c;
      }

      var crc = 0xFFFFFFFF;
      for (var i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ data.charCodeAt(i)) & 0xFF];
      }
      crc = (crc ^ 0xFFFFFFFF) >>> 0;
      return crc.toString(36).padStart(5, '0').slice(-5).toLowerCase();
    },

    encodeFileName: function(filename) {
      try {
        var encoder = new TextEncoder();
        var encoded = encoder.encode(filename);
        return btoa(String.fromCharCode.apply(null, encoded));
      } catch (e) {
        return btoa(unescape(encodeURIComponent(filename)));
      }
    },

    decodeFileName: function(base64Name) {
      try {
        var binaryStr = atob(base64Name);
        var bytes = new Uint8Array(binaryStr.length);
        for (var i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        var decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
      } catch (e) {
        try {
          return decodeURIComponent(atob(base64Name));
        } catch (e2) {
          return base64Name;
        }
      }
    },

    uint8ArrayToBase64: function(uint8Array) {
      var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var result = '';
      for (var i = 0; i < uint8Array.length; i += 3) {
        var byte1 = uint8Array[i];
        var byte2 = i + 1 < uint8Array.length ? uint8Array[i + 1] : 0;
        var byte3 = i + 2 < uint8Array.length ? uint8Array[i + 2] : 0;
        var triplet = (byte1 << 16) | (byte2 << 8) | byte3;
        result += base64Chars.charAt((triplet >> 18) & 63);
        result += base64Chars.charAt((triplet >> 12) & 63);
        result += (i + 1 < uint8Array.length) ? base64Chars.charAt((triplet >> 6) & 63) : '=';
        result += (i + 2 < uint8Array.length) ? base64Chars.charAt(triplet & 63) : '=';
      }
      return result;
    },

    base64ToUint8Array: function(base64) {
      var binary = atob(base64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    },

    // Robust JSON extraction from scanned text
    parseChunk: function(rawText) {
      var trimmed = rawText.trim();
      // Try direct parse first (most common case)
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fall back to extracting JSON from noisy text
        var start = trimmed.indexOf('{');
        var end = trimmed.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          trimmed = trimmed.substring(start, end + 1);
          return JSON.parse(trimmed);
        }
        throw new Error('无法提取有效的 JSON 数据');
      }
    },

    createDataChunk: function(index, total, fingerprint, base64Data) {
      return {
        i: index,
        t: total,
        h: this.calculateCRC32(base64Data),
        f: fingerprint,
        d: base64Data
      };
    },

    createFileNameChunk: function(fingerprint, encodedName, fileSize, totalChunks) {
      var data = {
        t: this.PACKET_TYPES.FILENAME,
        f: fingerprint,
        n: encodedName,
        s: fileSize,
        ts: Date.now(),
        tc: totalChunks
      };
      data.h = this.calculateCRC32(JSON.stringify({
        t: data.t, f: data.f, n: data.n, s: data.s, ts: data.ts, tc: data.tc
      }));
      return data;
    }
  };

  window.QRPROTO = PROTO;
})();
