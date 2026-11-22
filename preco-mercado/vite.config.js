import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' funciona no GitHub Pages (qualquer nome de repositório) porque o app usa HashRouter.
export default defineConfig({
  plugins: [react()],
  base: './',
});
