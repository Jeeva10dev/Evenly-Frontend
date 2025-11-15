/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
		},
		colors: {
		  border: "var(--border)",
		  ring: "var(--ring)",
		  background: "var(--background)",
		  foreground: "var(--foreground)",
		  card: "var(--card)",
		  "card-foreground": "var(--card-foreground)",
		  // add other variables as needed
		},
		borderRadius: {
		  sm: "var(--radius, 0.125rem)",
		  md: "var(--radius, 0.375rem)",
		  lg: "var(--radius, 0.5rem)",
		  xl: "var(--radius, 0.75rem)",
		},
	  },
	},
	plugins: [
	  require("tailwindcss-animate"), // comment out if not using
	],
  };