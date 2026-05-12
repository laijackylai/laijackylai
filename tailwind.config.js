/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sapphire: {
          50: '#EEF2FF',
          100: '#D4DEFF',
          300: '#7B9AFF',
          500: '#0F52BA',
          700: '#0A3A82',
          900: '#061F4A',
        },
        gray: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          400: '#A3A3A3',
          600: '#525252',
          900: '#171717',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Black', 'sans-serif'],
        body: ['var(--font-ibm-plex)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-ocra)', 'Courier New', 'monospace'],
        sans: ['var(--font-ibm-plex)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.0' }],
        'display-lg': ['3.375rem', { lineHeight: '1.05' }],
        'heading-1': ['2.5rem', { lineHeight: '1.1' }],
        'heading-2': ['1.875rem', { lineHeight: '1.2' }],
        'heading-3': ['1.375rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        display: '0.05em',
        nav: '0.08em',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        "text-reveal": {
          "0%": {
            transform: "translate(0, 100%)",
          },
          "100%": {
            transform: "translate(0, 0)",
          },
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slide: {
          "0%": { transform: "translateY(100%)", opacity: 0.1 },
          "15%": { transform: "translateY(0)", opacity: 1 },
          "30%": { transform: "translateY(0)", opacity: 1 },
          "45%": { transform: "translateY(-100%)", opacity: 1 },
          "100%": { transform: "translateY(-100%)", opacity: 0.1 },
        },
      },
      animation: {
        "text-reveal": "text-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) 0.5s",
        'fade-in-down': 'fade-in-down 2s ease-out',
        'fade-in-up': 'fade-in-up 2s ease-out',
        'fade-in-left': 'fade-in-left 1.5s ease-out',
        'fade-in-right': 'fade-in-right 1.5s ease-out',
        "slide-3": "slide 6s linear infinite",
        "slide-4": "slide 8s linear infinite"
      },
      variants: {
        animation: ["motion-safe"]
      }
    },
  },
  plugins: [],
}
