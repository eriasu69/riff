import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const target = 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target, changeOrigin: false },
      '/ws': { target: 'ws://127.0.0.1:8787', ws: true, changeOrigin: false },
      '/preview': { target, ws: true, changeOrigin: false },
    },
  },
});
