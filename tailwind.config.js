/** @type {import('tailwindcss').Config} */
const config = {
	content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};

export default config;
