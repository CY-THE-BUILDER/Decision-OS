import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f5f7fb",
        coral: "#f97316",
        sky: "#0ea5e9",
        moss: "#14532d",
        sand: "#f8efe3"
      }
    }
  },
  plugins: []
};

export default config;
