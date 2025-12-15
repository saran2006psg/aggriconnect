import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@components': path.resolve(__dirname, './src/components'),
          '@pages': path.resolve(__dirname, './src/pages'),
          '@utils': path.resolve(__dirname, './src/utils'),
          '@types': path.resolve(__dirname, './src/types'),
          '@data': path.resolve(__dirname, './src/data'),
          '@styles': path.resolve(__dirname, './src/styles'),
          '@assets': path.resolve(__dirname, './src/assets'),
        }
      }
    };
});
