import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(255,255,255)",
        foreground: "rgb(23,23,23)",
        primary: {
          light: "rgb(236,197,255)",
          DEFAULT: "rgb(168,85,247)",
          dark: "rgb(107,33,168)"
        }
      }
    }
  },
  plugins: []
};
export default config;
