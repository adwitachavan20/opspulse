/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#080c14',
        surface: '#0d1526',
        border: '#1a2540',
        accent: '#00e5ff',
        green: '#00ff88',
        amber: '#ffb800',
        red: '#ff3b5c',
        muted: '#4a6080',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'war-flash': 'warFlash 1s ease-in-out infinite',
        'slide-in': 'slideIn 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'count-up': 'countUp 0.6s ease-out',
      },
      keyframes: {
        warFlash: {
          '0%, 100%': { boxShadow: '0 0 0px #ff3b5c00' },
          '50%': { boxShadow: '0 0 40px #ff3b5c88' },
        },
        slideIn: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
