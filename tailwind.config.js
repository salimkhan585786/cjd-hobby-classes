import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 80px rgba(17, 24, 39, 0.12)',
        glow: '0 12px 50px rgba(139, 92, 246, 0.18)',
        'light-card': '0 8px 32px rgba(124, 58, 237, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'light-hover': '0 16px 48px rgba(124, 58, 237, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        'light-glow': '0 0 60px rgba(139, 92, 246, 0.1)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(124, 58, 237, 0.2), transparent 40%), radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.16), transparent 25%)',
        'light-hero': 'linear-gradient(135deg, #faf5ff 0%, #f0e7ff 30%, #ede9fe 60%, #faf5ff 100%)',
        'light-card': 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        'light-cta': 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 40%, #e0f2fe 70%, #ede9fe 100%)',
        'light-nav': 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
      },
      colors: {
        surface: {
          light: '#faf9ff',
          'light-card': '#ffffff',
          'light-elevated': '#f5f3ff',
          'light-input': '#faf9ff',
        },
      },
    },
  },
  plugins: [forms],
};
