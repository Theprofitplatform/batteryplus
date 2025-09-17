import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        products: 'products.html',
        services: 'services.html',
        about: 'about.html',
        contact: 'contact.html'
      }
    },
    // Image optimization settings
    assetsInlineLimit: 4096, // Inline small images as base64
    assetsDir: 'assets',
    // Optimization settings
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['sharp'],
          utils: ['./src/utils/lazy-loading.js', './src/utils/performance-monitor.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  // Optimization plugins
  optimizeDeps: {
    include: ['web-vitals']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@config': resolve(__dirname, 'config'),
      '@scripts': resolve(__dirname, 'scripts')
    }
  },
  // Asset handling
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif'],

  // Performance optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true
  }
});