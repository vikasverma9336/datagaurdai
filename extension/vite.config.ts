import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type);
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createIconPng(size: number): Buffer {
  const bytesPerPixel = 4;
  const rowLength = 1 + size * bytesPerPixel;
  const raw = Buffer.alloc(rowLength * size);

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLength;
    raw[rowStart] = 0;

    for (let x = 0; x < size; x++) {
      const offset = rowStart + 1 + x * bytesPerPixel;
      const inset = Math.max(1, Math.floor(size * 0.12));
      const inside = x >= inset && x < size - inset && y >= inset && y < size - inset;
      const checkStroke =
        Math.abs(y - (size * 0.62 - x * 0.35)) < size * 0.08 && x > size * 0.24 && x < size * 0.48 ||
        Math.abs(y - (size * 0.82 - x * 0.75)) < size * 0.08 && x >= size * 0.44 && x < size * 0.78;

      raw[offset] = checkStroke ? 255 : inside ? 31 : 0;
      raw[offset + 1] = checkStroke ? 255 : inside ? 41 : 0;
      raw[offset + 2] = checkStroke ? 255 : inside ? 55 : 0;
      raw[offset + 3] = inside || checkStroke ? 255 : 0;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createPngChunk('IHDR', ihdr),
    createPngChunk('IDAT', deflateSync(raw)),
    createPngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      generateBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        mkdirSync(distDir, { recursive: true });
        
        // Copy manifest
        copyFileSync(
          path.resolve(__dirname, 'manifest.json'),
          path.resolve(distDir, 'manifest.json')
        );
        
        // Copy popup.html
        const publicDir = path.resolve(__dirname, 'public');
        if (existsSync(path.resolve(publicDir, 'popup.html'))) {
          copyFileSync(
            path.resolve(publicDir, 'popup.html'),
            path.resolve(distDir, 'popup.html')
          );
        }
        
        // Create icons directory if it doesn't exist
        const iconsDir = path.resolve(distDir, 'icons');
        mkdirSync(iconsDir, { recursive: true });
        
        // Copy custom PNG icons when present, otherwise generate valid fallback PNGs.
        const iconSizes = ['16', '48', '128'];
        
        for (const size of iconSizes) {
          const customIcon = path.resolve(publicDir, `icon-${size}.png`);
          const distIcon = path.resolve(iconsDir, `icon-${size}.png`);

          if (existsSync(customIcon)) {
            copyFileSync(customIcon, distIcon);
          } else {
            writeFileSync(distIcon, createIconPng(Number(size)));
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    minify: true,
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, 'src/content/content.ts'),
        background: path.resolve(__dirname, 'src/background/background.ts'),
        popup: path.resolve(__dirname, 'src/ui/popup.tsx'),
      },
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        // Disable code splitting so each entry is fully bundled
        manualChunks: () => null
      }
    }
  }
});
