import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // We rely on standard Vite 'import.meta.env.VITE_...' behavior now.
  // Ensure your Vercel Environment Variables start with 'VITE_'
});