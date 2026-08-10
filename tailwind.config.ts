import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0F1F2E",
        "navy-light": "#16293C",
        concrete: "#EDEBE5",
        "concrete-dark": "#D9D5CB",
        signal: "#FF6A1A",
        "signal-dark": "#E05A0F",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
