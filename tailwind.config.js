/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'mono': ['"JetBrains Mono"', 'Monaco', 'Consolas', '"Lucida Console"', 'monospace'],
        'code': ['"JetBrains Mono"', '"Fira Code"', 'Monaco', 'Consolas', 'monospace']
      },
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        retro: {
          cyan: '#00ffff',
          blue: '#0080ff',
          purple: '#8000ff',
          pink: '#ff00ff'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
        'sway': 'sway 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-soft': 'bounce-soft 2s infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        sway: {
          '0%': { transform: 'rotate(-3deg)' },
          '100%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.8), 0 0 30px rgba(56, 189, 248, 0.4)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'retro': '0 4px 0 #075985, 0 8px 16px rgba(0, 0, 0, 0.3)',
        'retro-hover': '0 6px 0 #075985, 0 12px 20px rgba(0, 0, 0, 0.4)',
        'retro-active': '0 2px 0 #075985, 0 4px 8px rgba(0, 0, 0, 0.2)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}