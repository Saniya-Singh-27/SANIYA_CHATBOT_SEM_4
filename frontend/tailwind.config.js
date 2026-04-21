/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#f0f2f5',
        'sidebar-bg': '#ffffff',
        'user-msg': '#007bff',
        'bot-msg': '#ffffff',
      }
    },
  },
  plugins: [],
}
