/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f6ff',
          100: '#deeaff',
          300: '#a8c8ff',
          400: '#74aaff',
          500: '#4d8ef0',
          600: '#3070d6',
          700: '#2258b0',
          800: '#1a4490',
          900: '#133070',
          950: '#0c1f4a',
        },
        accent: {
          300: '#72e2b5',
          400: '#38cc93',
          500: '#15b07a',
          600: '#0a9064',
        },
        dark: {
          900: '#0a0f1e',
          800: '#0f1629',
          700: '#162035',
          600: '#1e2d47',
          500: '#7a8aaa',
        }
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow':  '0 0 30px rgba(77, 142, 240, 0.2)',
        'card':  '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}