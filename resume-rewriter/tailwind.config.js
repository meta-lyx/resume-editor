/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Pixel Pear custom colors
        pear: {
          DEFAULT: "#A3E635",
          50: "#F7FEE7",
          100: "#ECFCCB",
          200: "#D9F99D",
          300: "#BEF264",
          400: "#A3E635",
          500: "#84CC16",
          600: "#65A30D",
          700: "#4D7C0F",
          800: "#3F6212",
          900: "#365314",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          400: "#22D3EE",
          500: "#06B6D4",
        },
        pink: {
          DEFAULT: "#F472B6",
          400: "#F472B6",
          500: "#EC4899",
        },
        surface: {
          DEFAULT: "hsl(222 37% 11%)",
          light: "hsl(222 30% 16%)",
          dark: "hsl(222 47% 7%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(163, 230, 53, 0.2)',
        'glow': '0 0 25px rgba(163, 230, 53, 0.3)',
        'glow-lg': '0 0 40px rgba(163, 230, 53, 0.4)',
        'glow-cyan': '0 0 25px rgba(34, 211, 238, 0.3)',
        'glow-pink': '0 0 25px rgba(244, 114, 182, 0.3)',
        'glass': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-pear': 'linear-gradient(135deg, #A3E635, #84CC16)',
        'gradient-rainbow': 'linear-gradient(135deg, #A3E635, #22D3EE, #F472B6)',
        'mesh-gradient': `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(163, 230, 53, 0.08), transparent),
          radial-gradient(ellipse 60% 40% at 100% 50%, rgba(34, 211, 238, 0.05), transparent),
          radial-gradient(ellipse 50% 30% at 0% 80%, rgba(244, 114, 182, 0.05), transparent)
        `,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(163, 230, 53, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(163, 230, 53, 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            a: {
              fontWeight: 500,
              color: 'hsl(var(--primary))',
            },
            strong: {
              fontWeight: 600,
              color: 'hsl(var(--foreground))',
            },
            h1: {
              fontFamily: 'Outfit, system-ui, sans-serif',
              color: 'hsl(var(--foreground))',
            },
            h2: {
              fontFamily: 'Outfit, system-ui, sans-serif',
              color: 'hsl(var(--foreground))',
            },
            h3: {
              fontFamily: 'Outfit, system-ui, sans-serif',
              color: 'hsl(var(--foreground))',
            },
            h4: {
              fontFamily: 'Outfit, system-ui, sans-serif',
              color: 'hsl(var(--foreground))',
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
