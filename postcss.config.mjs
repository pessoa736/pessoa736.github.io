
const config= {
  content: ["site/**/*.{js,ts,jsx,tsx}"],
  extends: {
    colors: {
      primary: "#000000",
      secondary: "#ffffff",
    },
    fontFamily: {
      mono: ["Quicksand", "sans-serif"],
      sans: ["Odibee Sans", "cursive"],
    },
    spacing: {
      18: "4.5rem",
    },
    borderRadius: {
      "normal": "10px"
    },
    boxShadow: {
      "darkMode": "0 -10px 10px #fff",
      "lightMode": "0 -10px 10px #000",
    },
    text: {
      "saudacao": "64px",
    },
  },
  plugins: ["@tailwindcss/postcss"],
};

export default config;
