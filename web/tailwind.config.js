/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Blue for RoadSense
          foreground: '#ffffff',
        },
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#1a1a1a',
        border: 'rgba(37, 99, 235, 0.2)',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: '#262626',
        accent: '#2563eb',
        ring: '#2563eb',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.875rem',
        sm: '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
