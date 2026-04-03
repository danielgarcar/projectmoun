/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#6C63FF',
          secondary: '#48BB78',
          accent:    '#F6AD55',
        },
        bg: {
          base:    '#0F0F1A',
          surface: '#1A1A2E',
          card:    '#16213E',
        },
        border: {
          DEFAULT: '#2D2D4E',
        },
        text: {
          primary:   '#F7FAFC',
          secondary: '#A0AEC0',
          muted:     '#718096',
        },
        status: {
          success: '#48BB78',
          warning: '#F6AD55',
          error:   '#FC8181',
          info:    '#63B3ED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.4)',
        md:   '0 4px 12px rgba(0,0,0,0.5)',
        lg:   '0 8px 24px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(108,99,255,0.35)',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6C63FF, #9B59B6)',
        'gradient-success': 'linear-gradient(135deg, #48BB78, #38A169)',
        'gradient-warm':    'linear-gradient(135deg, #F6AD55, #ED8936)',
      },
      spacing: {
        'nav': '64px',
      },
      screens: {
        xs: '375px',
        sm: '640px',
      },
    },
  },
  plugins: [],
};
