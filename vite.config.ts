import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The last argument '' ensures we load all env vars, including system ones (like Vercel's)
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Prioritize VITE_GEMINI_API_KEY, fallback to API_KEY (old standard)
  const apiKey = env.VITE_GEMINI_API_KEY || env.API_KEY || '';

  // Safety Check: Log warning during build if Key is missing
  if (mode === 'production' && !apiKey) {
    console.warn("⚠️  WARNING: VITE_GEMINI_API_KEY or API_KEY is missing in the build environment!");
    console.warn("⚠️  Make sure to add it in Vercel Settings > Environment Variables.");
  }

  return {
    plugins: [react()],
    define: {
      // Inject the key safely into the client bundle
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});