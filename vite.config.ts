import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src/client',
  build: {
    outDir: '../../public',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/client/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
