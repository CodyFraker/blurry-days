/** @type {import('tailwindcss').Config} */
export default {
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
