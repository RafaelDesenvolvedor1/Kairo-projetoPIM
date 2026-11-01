import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // 1. Elimina os polyfills do Babel apontados no Lighthouse (economiza ~51 KiB)
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 2. Divide as dependências do node_modules em arquivos com cache persistente
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Isola o Ant Design e ícones (maior peso visual)
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor-antd';
            }
            // Isola o núcleo do React e roteador
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-react';
            }
            // Demais bibliotecas auxiliares
            return 'vendor-libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});