import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Explicitly disable HMR and WebSocket connections in production builds
      hmr: isProduction ? false : (process.env.DISABLE_HMR !== 'true' ? { clientPort: 443 } : false),
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
