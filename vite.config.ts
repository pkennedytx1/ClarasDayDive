import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const askClaraApiTarget =
  process.env.VITE_ASK_CLARA_API_URL ?? 'http://localhost:13557';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: askClaraApiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
