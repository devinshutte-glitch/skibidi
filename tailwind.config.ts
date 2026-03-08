import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff5f3',
          100: '#ffe8e3',
          200: '#ffc9bd',
          300: '#ffa08d',
          400: '#ff6b4d',
          500: '#ff4a2a',
          600: '#e83010',
          700: '#c2250c',
          800: '#9e210e',
          900: '#831f12',
        },
        ocean: {
          50: '#f0fafe',
          100: '#dff3fc',
          200: '#b9e7f9',
          300: '#7dd4f5',
          400: '#38bcee',
          500: '#0ea3dc',
          600: '#0283ba',
          700: '#036996',
          800: '#07587b',
          900: '#0b4966',
        },
        sand: {
          50: '#fefdf7',
          100: '#fdfaec',
          200: '#faf2ca',
          300: '#f5e599',
          400: '#efd265',
          500: '#e8bd3c',
          600: '#d4a028',
          700: '#b07d1d',
          800: '#8e611c',
          900: '#754f1c',
        },
        palm: {
          500: '#2d7a3c',
          600: '#246330',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'wave': 'wave 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'confetti': 'confetti 1s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-8px)' },
          '80%': { transform: 'translateX(8px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(720deg)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0ea3dc 0%, #0283ba 50%, #036996 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #ff6b4d 0%, #ffa08d 50%, #ffd700 100%)',
        'beach-gradient': 'linear-gradient(180deg, #38bcee 0%, #7dd4f5 40%, #faf2ca 80%, #f5e599 100%)',
        'tropical-gradient': 'linear-gradient(135deg, #0ea3dc 0%, #2d7a3c 100%)',
      },
    },
  },
  plugins: [],
}
export default config
