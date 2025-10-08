import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function readBuildInfo() {
  const p = path.resolve(process.cwd(), 'build-info.json');
  if (!fs.existsSync(p)) return { date: '', sequence: 0 };
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      date: typeof parsed?.date === 'string' ? parsed.date : '',
      sequence: Number(parsed?.sequence) || 0,
    };
  } catch {
    return { date: '', sequence: 0 };
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const manualSeq = (env.VITE_VERSION_SEQ || '').trim();

  const info = readBuildInfo();
  const seqForLabel = manualSeq || String(info.sequence);
  const APP_VERSION_LABEL = `${info.date}-version ${seqForLabel}`;

  return {
    plugins: [react()],
    define: {
      __APP_VERSION_LABEL__: JSON.stringify(APP_VERSION_LABEL),
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
          if (warning.code === 'TYPE_ONLY_EXPORT') return;
          warn(warning);
        },
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
