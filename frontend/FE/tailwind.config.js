/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef6ff',
          100: '#d9eaff',
          300: '#8ebeff',
          400: '#5a9bff',
          500: '#3478f6',
          600: '#1a5ce8',
          700: '#1447cc',
          800: '#163aa6',
          900: '#183483',
          950: '#121f50',
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
        'glow':  '0 0 30px rgba(52, 120, 246, 0.25)',
        'card':  '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],

}