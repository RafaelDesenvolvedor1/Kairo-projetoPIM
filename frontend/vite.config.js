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
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Mantém React e Ant Design juntos no mesmo ciclo de vida
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('antd') ||
              id.includes('@ant-design') ||
              id.includes('@rc-component') ||
              id.includes('rc-')
            ) {
              return 'vendor-framework';
            }
            // Outras dependências auxiliares (ex: axios, dayjs, etc.)
            return 'vendor-utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});