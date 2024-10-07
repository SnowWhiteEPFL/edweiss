const { nextui } = require("@nextui-org/react");

const CTP = {
	light: {
		transparent: '#0000',

		rosewater: "#dc8a78",
		flamingo: "#dd7878",
		pink: "#ea76cb",
		mauve: "#8839ef",
		red: "#d20f39",
		maroon: "#e64553",
		peach: "#fe640b",
		yellow: "#df8e1d",
		green: "#40a02b",
		teal: "#179299",
		sky: "#04a5e5",
		sapphire: "#209fb5",
		blue: "#1e66f5",
		lavender: "#7287fd",
		text: "#4c4f69",
		subtext1: "#5c5f77",
		subtext0: "#6c6f85",
		overlay2: "#7c7f93",
		overlay1: "#8c8fa1",
		overlay0: "#9ca0b0",
		surface2: "#acb0be",
		surface1: "#bcc0cc",
		surface0: "#ccd0da",
		base: "#eff1f5",
		mantle: "#e6e9ef",
		crust: "#dce0e8"
	},
	dark: {
		transparent: '#0000',

		rosewater: "#f5e0dc",
		flamingo: "#f2cdcd",
		pink: "#f5c2e7",
		mauve: "#cba6f7",
		red: "#f38ba8",
		maroon: "#eba0ac",
		peach: "#fab387",
		yellow: "#f9e2af",
		green: "#a6e3a1",
		teal: "#94e2d5",
		sky: "#89dceb",
		sapphire: "#74c7ec",
		blue: "#89b4fa",
		lavender: "#b4befe",
		text: "#cdd6f4",
		subtext1: "#bac2de",
		subtext0: "#a6adc8",
		overlay2: "#9399b2",
		overlay1: "#7f849c",
		overlay0: "#6c7086",
		surface2: "#585b70",
		surface1: "#45475a",
		surface0: "#313244",
		base: "#1e1e2e",
		mantle: "#181825",
		crust: "#11111b"
	},
};

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
	],
	darkMode: "class",
	plugins: [
		require("@catppuccin/tailwindcss")({
			prefix: "ctp",
			defaultFlavour: "mocha"
		}),

		nextui({
			themes: {

				light: {
					colors: {
						primary: {
							foreground: CTP.light.crust,
							DEFAULT: CTP.light.blue
						},

						danger: {
							foreground: CTP.light.crust,
							DEFAULT: CTP.light.red
						},

						success: {
							foreground: CTP.light.crust,
							DEFAULT: CTP.light.green
						},

						secondary: {
							foreground: CTP.light.crust,
							DEFAULT: CTP.light.mauve
						},

						warning: {
							foreground: CTP.light.crust,
							DEFAULT: CTP.light.yellow
						},

						default: {
							foreground: CTP.light.text,
							DEFAULT: CTP.light.surface1
						},

						foreground: CTP.light.text,
						background: CTP.light.crust,
					}
				},

				dark: {
					colors: {
						primary: {
							foreground: CTP.dark.crust,
							DEFAULT: CTP.dark.blue
						},

						danger: {
							foreground: CTP.dark.crust,
							DEFAULT: CTP.dark.red
						},

						success: {
							foreground: CTP.dark.crust,
							DEFAULT: CTP.dark.green
						},

						secondary: {
							foreground: CTP.dark.crust,
							DEFAULT: CTP.dark.mauve
						},

						warning: {
							foreground: CTP.dark.crust,
							DEFAULT: CTP.dark.yellow
						},

						default: {
							foreground: CTP.dark.text,
							DEFAULT: CTP.dark.surface1
						},

						foreground: CTP.dark.text,
						background: CTP.dark.crust,
					}
				}

			}
		}),
	]
};
