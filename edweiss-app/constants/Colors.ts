
export type Theme = 'light' | 'dark';

export type LightDarkProps = { light?: string, dark?: string };

export type Color = keyof typeof Colors.light & keyof typeof Colors.dark

const Colors = {
	light: {
		transparent: '#0000',
		black: '#000',
		white: '#fff',

		background: '#fff',
		text: '#11181C',
		tint: '#0a7ea4',
		icon: '#687076',

		blue: "#2366fe",
		red: "#f14",
		violet: "#ffaaff",

		borderColor: "#bbbbbb"
	},
	dark: {
		transparent: '#0000',
		black: '#000',
		white: '#fff',

		background: '#000',
		text: '#ECEDEE',
		tint: '#fff',
		icon: '#9BA1A6',

		blue: "#2366fe",
		red: "#f14",
		violet: "#ff44ff",

		borderColor: "#777777"
	},
};

export default Colors;
