import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We cast process to 'any' to avoid TypeScript errors if @types/node is missing.
  const cwd = (process as any).cwd();
  const env = loadEnv(mode, cwd, '');

  // Prioritize VITE_GEMINI_API_KEY (Standard for Vite), fallback to API_KEY
  // Ini akan mengambil value dari Vercel Environment Variables
  const apiKey = env.VITE_GEMINI_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX:
      // Vite tidak menyediakan `process.env` di browser secara default.
      // Kita "menanam" nilai API Key langsung ke dalam kode saat build.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});