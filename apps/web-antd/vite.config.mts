import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        port: parseInt(process.env.VITE_DEV_PORT || '8000'), // Port từ env hoặc default 8000
        host: true, // Cho phép truy cập từ network
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // Sử dụng API URL từ environment variable hoặc fallback về mock
            target: process.env.VITE_APP_URL_API || 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
