import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        brand: {
          white: "hsl(var(--color-white))",
          orange: "hsl(var(--color-orange))",
          tangelo: "hsl(var(--color-tangelo))",
          "black-steel": "hsl(var(--color-black-steel))",
          blue: "hsl(var(--color-blue))",
          red: "hsl(var(--color-red))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius-lg, 1rem)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl, 1.25rem)",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "var(--shadow-card, 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06))",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #ED6C27 0%, #d85a1a 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
