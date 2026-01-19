import { defineConfig } from 'vite';

// Vite config for local testing (without GitHub Pages base path)
// https://vitejs.dev/config/
export default defineConfig({
  // Use root base path for local testing
  base: '/',

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
