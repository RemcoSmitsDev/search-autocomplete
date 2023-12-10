import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        lineLoader: {
          "0%": { left: "-40%" },
          "50%": { left: "20%", width: "80%" },
          "100%": { left: "100%", width: "100%" },
        },
      },
      animation: {
        lineLoader: "lineLoader 3.5s infinite ease-in-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
