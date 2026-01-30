/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#ADB5BD',
          500: '#1A365D',
          600: '#153050',
          700: '#0F2744',
          800: '#0A1D37',
          900: '#05132A',
        },
        accent: {
          50: '#FFFBF5',
          100: '#FFF7EB',
          200: '#FFEFD6',
          300: '#FFE4BD',
          400: '#D4A574',
          500: '#C49A6C',
          600: '#B08D5F',
          700: '#9A7B52',
          800: '#846945',
          900: '#6E5738',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFBFC',
          muted: '#F5F6F8',
        },
        content: {
          DEFAULT: '#1A202C',
          secondary: '#4A5568',
          muted: '#718096',
          light: '#A0AEC0',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'elegant-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.12)',
        'elegant-xl': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-elegant': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
