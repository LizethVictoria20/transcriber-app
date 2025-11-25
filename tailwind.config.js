/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // CAMBIO AQUÍ: Usa 'class' estándar. Es menos propenso a fallos.
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
