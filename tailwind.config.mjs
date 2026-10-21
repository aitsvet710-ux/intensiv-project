/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#f7f3ef',
          100: '#efe6dd',
          200: '#d9c5b3',
          300: '#c4a089',
          400: '#a67c52',
          500: '#8b5a2b',
          600: '#734a24',
          700: '#5c3b1d',
          800: '#452d17',
          900: '#2f1f10'
        },
        ochre: {
          400: '#d97706',
          500: '#b45309'
        },
        cream: '#f5f1ea'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
};
