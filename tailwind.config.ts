import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#fffdf8",
        "store-red": "#d9272e",
        "store-gold": "#f2b705",
        "store-blue": "#2563eb",
        "store-green": "#15803d"
      }
    }
  },
  plugins: []
};

export default config;
