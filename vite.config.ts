import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: '/fudagit-web/',
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
  },
});
