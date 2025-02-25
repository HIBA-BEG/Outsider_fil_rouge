/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,ts,tsx}",
    "./app/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          light: '#f6f7f8',
          dark: '#000000',
        },
        // Dark mode colors
        secondary: {
          light: '#f3f4f6',
          dark: '#1f2937',
        }
      },
    },
  },
  plugins: [],
};
