import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#1f2923", moss: "#687b52", olive: "#89945c", jade: "#4f8975", celadon: "#c7d9c2", cream: "#f5f4ed" }, boxShadow: { soft: "0 18px 50px rgba(31,41,35,.08)" } } },
  plugins: []
};
export default config;
