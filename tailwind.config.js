/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          blue: '#4A90E2',
          lightBlue: '#87CEEB'
        },
        feature: {
          blue: '#3B82F6',
          orange: '#F97316',
          red: '#EF4444',
          green: '#10B981',
          pink: '#EC4899',
          purple: '#8B5CF6',
          yellow: '#F59E0B',
          cyan: '#06B6D4'
        }
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to bottom, #4A90E2, #87CEEB)',
        'gradient-banner': 'linear-gradient(135deg, #E0F2FE, #BAE6FD)'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        }
      }
    },
  },
  plugins: [],
};
