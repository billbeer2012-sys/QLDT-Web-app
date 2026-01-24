
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
          DEFAULT: '#001f3f', // Xanh Navy
          light: '#003366',
          dark: '#001a33',
        },
        secondary: '#FF8C00', // Cam đậm (làm màu nhấn)
        accent: '#F0E68C',    // Vàng nhạt (làm màu phụ)
      },
    },
  },
  plugins: [],
}
