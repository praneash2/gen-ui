module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  plugins: [],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'spin-slower': 'spin 4s linear infinite',
        'spin-reverse': 'spin-reverse 3s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
    },
  },
};
