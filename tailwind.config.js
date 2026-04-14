/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pharmagreen: {
          50: '#effaf7',
          100: '#d8f2eb',
          500: '#1b6754',
          600: '#145244',
          900: '#0c2f27',
        },
      },
      boxShadow: {
        panel: '0 16px 40px -20px rgba(17, 24, 39, 0.45)',
        glow: '0 0 0 1px rgba(27, 103, 84, 0.12), 0 10px 30px -18px rgba(27, 103, 84, 0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        gradientShift: 'gradientShift 18s ease infinite',
      },
    },
  },
  plugins: [],
}

