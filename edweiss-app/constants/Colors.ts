import { CourseTimePeriodType } from '@/model/school/schedule';

export type Theme = 'light' | 'dark';

export type LightDarkProps = { light?: string, dark?: string; };

export type Color = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * 
 * 			Please don't add any colors, the Catppuccin theme has been carefully crafted
 * 			and does not need to be modified (it gives light/dark garanties, it's its
 * 			strength).
 * 
 */
const Colors = {
	light: {
		transparent: '#0000',
		// course_title_for_backgroud_color: "#000000",
		rosewater: "#dc8a78",
		flamingo: "#dd7878",
		pink: "#ea76cb",
		mauve: "#8839ef",
		cherry: "#B51C59",
		red: "#d20f39",
		maroon: "#e64553",
		peach: "#fe640b",
		yellow: "#df8e1d",
		// yellowlogo: "#FECB00",
		// clearGreen: "#7FC245",
		green: "#40a02b",
		teal: "#179299",
		sky: "#04a5e5",
		sapphire: "#209fb5",
		blue: "#1e66f5",
		lavender: "#7287fd",
		// darkBlue: "#191D63",
		// darkNight: "#2e303a",
		text: "#4c4f69",
		subtext1: "#5c5f77",
		subtext0: "#6c6f85",
		overlay2: "#7c7f93",
		overlay1: "#8c8fa1",
		overlay0: "#9ca0b0",
		surface2: "#acb0be",
		surface1: "#bcc0cc",
		surface0: "#ccd0da",
		// borderBottomColor: "#ccc",
		base: "#eff1f5",
		mantle: "#e6e9ef",
		crust: "#dce0e8",
		// Teal: "#8bd5ca",
	},
	dark: {
		transparent: '#0000',
		// course_title_for_backgroud_color: "#000000",
		rosewater: "#f5e0dc",
		flamingo: "#f2cdcd",
		pink: "#f5c2e7",
		mauve: "#cba6f7",
		cherry: "#B46283",
		red: "#f38ba8",
		maroon: "#eba0ac",
		peach: "#fab387",
		yellow: "#f9e2af",
		// yellowlogo: "#FFDF5E",
		// clearGreen: "#C7EA67",
		green: "#a6e3a1",
		teal: "#94e2d5",
		sky: "#89dceb",
		sapphire: "#74c7ec",
		blue: "#89b4fa",
		lavender: "#b4befe",
		// darkBlue: "#BCBFE5",
		text: "#cdd6f4",
		subtext1: "#bac2de",
		// darkNight: "#B7BDD9",
		subtext0: "#a6adc8",
		overlay2: "#9399b2",
		overlay1: "#7f849c",
		overlay0: "#6c7086",
		surface2: "#585b70",
		surface1: "#45475a",
		surface0: "#313244",
		// borderBottomColor: "#EFE6E6",
		base: "#1e1e2e",
		mantle: "#181825",
		crust: "#11111b",
		// Teal: "#8bd5ca",
	},
};

export default Colors;

export const courseColors: Record<CourseTimePeriodType, Color> = {
	lecture: 'blue',
	exercises: 'pink',
	lab: 'green',
	project: 'teal',
};
