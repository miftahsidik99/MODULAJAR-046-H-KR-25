import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

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