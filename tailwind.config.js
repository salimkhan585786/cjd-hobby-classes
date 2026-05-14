import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(17, 24, 39, 0.12)',
        glow: '0 12px 50px rgba(139, 92, 246, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(124, 58, 237, 0.2), transparent 40%), radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.16), transparent 25%)',
      },
    },
  },
  plugins: [forms],
};
