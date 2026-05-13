import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Avenir Next", "Trebuchet MS", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "Avenir Next", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#2b170e",
        paper: "#edd2a3",
        "store-card": "#fff8e8",
        "store-red": "#d9272e",
        "store-gold": "#d89a22",
        "store-blue": "#2563eb",
        "store-green": "#034832"
      }
    }
  },
  plugins: []
};

export default config;
