/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
      }
    },
  },
  plugins: [],
};
