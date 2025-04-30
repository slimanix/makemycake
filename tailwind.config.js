/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-cake': 'float-cake 7s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-text': 'gradient-text 4s ease-in-out infinite',
        'fade-in': 'fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in-up': 'fade-in-up 1.2s cubic-bezier(0.4,0,0.2,1) both',
        'bounce-in': 'bounce-in 1s cubic-bezier(0.68,-0.55,0.27,1.55) both',
        'logo-pop': 'logo-pop 1.2s cubic-bezier(0.68,-0.55,0.27,1.55) both',
        'pulse-btn': 'pulse-btn 2s infinite',
        'bg-gradient': 'bg-gradient 10s ease-in-out infinite',
        'bokeh1': 'bokeh1 8s ease-in-out infinite',
        'bokeh2': 'bokeh2 7s ease-in-out infinite',
        'bokeh3': 'bokeh3 9s ease-in-out infinite',
        'bokeh4': 'bokeh4 6s ease-in-out infinite',
        'sparkle': 'sparkle 3.5s infinite',
        'sparkle2': 'sparkle2 4.2s infinite',
        'sparkle3': 'sparkle3 3.8s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-cake': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.05)' },
        },
        glow: {
          '0%, 100%': { filter: 'blur(16px) brightness(1.1)' },
          '50%': { filter: 'blur(24px) brightness(1.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        'gradient-text': {
          '0%, 100%': { backgroundPosition: 'left' },
          '50%': { backgroundPosition: 'right' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'logo-pop': {
          '0%': { transform: 'scale(0.8) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(4deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'pulse-btn': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(236, 72, 153, 0)' },
        },
        'bg-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bokeh1: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.08)' },
        },
        bokeh2: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(20px) scale(1.04)' },
        },
        bokeh3: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-18px) scale(1.06)' },
        },
        bokeh4: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(12px) scale(1.03)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.3) rotate(20deg)' },
        },
        sparkle2: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.9', transform: 'scale(1.2) rotate(-15deg)' },
        },
        sparkle3: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1) rotate(10deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 