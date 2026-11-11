/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Sage moss + flecked paper (light); dark keeps graphite surfaces
				primary: '#3E6B48', // 苔绿

				// Light Mode (草纸冷灰绿 + 墨点纹理)
				'bg-light': '#EEEEE6',
				'surface-light': '#F7F7F1', // 卡片/浮层背景
				'text-light': '#1C1E1A',
				'text-muted-light': '#5B6158',

				// Dark Mode (OpenAI/Modern Dark)
				'bg-dark': '#131316',
				'surface-dark': '#1C1C21', // 卡片/浮层背景
				'text-dark': '#EDEDED',
				'text-muted-dark': '#A1A1AA',
			},
			fontFamily: {
				serif: ['"EB Garamond"', '"Noto Serif SC"', 'serif'],
				display: ['"EB Garamond"', '"Noto Serif SC"', 'serif'],
				sans: ['"Inter"', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
