import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path based on deployment target
  // GitHub Pages: /AYS-AI-Website/
  // OVHCloud: /
  // Local tests: /
  base: process.env.VITE_BASE_PATH || '/',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate source maps for debugging
    sourcemap: true,
    // Optimize build - use esbuild (faster and built-in)
    minify: 'esbuild',
    // Rollup options
    rollupOptions: {
      output: {
        // Hash asset names for cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  // Server options for local development
  server: {
    port: 5173,
    open: true,
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
  },
});
