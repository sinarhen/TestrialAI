import type { Config } from 'tailwindcss';
import plugin = require("tailwindcss-animate");
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			animation: {
				fadeIn: "fadeIn 1s ease-in-out"
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: "0", transform: "translateX(-50px)"},
					"100%": { opacity: "100%", transform: "translateX(0)"}
				}
			}
		}
	},

	plugins: [plugin]
} satisfies Config;
