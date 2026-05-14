import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('firebase')) {
            if (id.includes('firebase/auth') || id.includes('@firebase/auth')) {
              return 'firebase-auth';
            }

            if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) {
              return 'firebase-firestore';
            }

            if (id.includes('firebase/storage') || id.includes('@firebase/storage')) {
              return 'firebase-storage';
            }

            if (id.includes('firebase/analytics') || id.includes('@firebase/analytics')) {
              return 'firebase-analytics';
            }

            return 'firebase-core';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
