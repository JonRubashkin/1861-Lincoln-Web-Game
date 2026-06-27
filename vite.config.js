import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves a project site under /<repo-name>/.
// Change `base` if the repository is renamed. For local dev `base` is ignored.
export default defineConfig({
  base: '/1861-Lincoln-Web-Game/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
