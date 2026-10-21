import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Thư viện và từ điển bản dịch tách riêng để trình duyệt cache lâu dài
        manualChunks(id) {
          const path = id.replace(/\\/g, '/');
          if (
            /\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(path)
          ) {
            return 'react';
          }
          if (/\/node_modules\/(i18next|react-i18next)\//.test(path)) return 'i18n';
          if (path.includes('/src/locales/')) return 'locales';
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
