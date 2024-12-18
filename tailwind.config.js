/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Existing content paths
    "./node_modules/primereact/**/*.js", // Add PrimeReact
    "./node_modules/primeicons/**/*.js", // Add PrimeIcons if used
  ],
  theme: {
    extend: {
      // You can extend the theme here if needed
    },
  },
  plugins: [
    require("daisyui"),
    // Add any additional plugins if necessary
  ],
  daisyui: {
    themes: ["light"], // Using light theme
  },
};
