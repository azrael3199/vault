/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#165EEF",
        secondary: "#FFFFFF",
        accent: "#FF0000",
        background: "#FDFDFD",
      },
    },
  },
  plugins: [require("nightwind")],
  darkMode: "class",
};
