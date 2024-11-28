import Colors, { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { MarginProps, PaddingProps, PredefinedSizes, Size, computeMargins, computeSize, computeSizeOpt, paddingSizes } from '@/constants/Sizes';
import useTheme from '@/hooks/theme/useTheme';
import { useOptionalColor } from '@/hooks/theme/useThemeColor';
import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import MathJax from 'react-native-mathjax';
import sanitizeHtml from 'sanitize-html';

type RichTextProps = PaddingProps & MarginProps & {
	backgroundColor?: Color,
	color?: Color,
	children: string,
	size?: Size,
	font?: "Inter" | "Times New Roman"
}

const headerSizes = [
	32,
	28,
	24,
	20,
	18,
	16
]

const richTextSizes: PredefinedSizes = {
	xs: 0.8,
	sm: 0.9,
	md: 1.0,
	lg: 1.2,
	xl: 1.4
}

function headerLevel(line: string, level: number) {
	return `<div style="font-size: ${headerSizes[level - 1]}px; font-weight: bold">${line.substring(level + 1)}</div>`;
}

export function richTextToHTML(rawText: string): string {
	const text = sanitizeHtml(rawText, {
		allowedTags: [] // no tags allowed so no injection attacks are permitted
	}).trim();

	const lines = text.split("\n");

	let res = "";

	main:
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		if (lineIndex != 0) {
			res += '<br/>';
		}

		const line = lines[lineIndex].trim();

		for (let headerCheckIndex = 0; headerCheckIndex < 6; headerCheckIndex++) {
			if (line.startsWith("#".repeat(headerCheckIndex + 1) + " ")) {
				res += headerLevel(line, headerCheckIndex + 1);
				continue main;
			}
		}

		res += line;
	}

	return res;
}

const RichText: ReactComponent<RichTextProps> = ({ size = "md", ...props }) => {
	const text = useMemo(() => richTextToHTML(props.children), [props.children]);

	const theme = useTheme();
	const computedBackgroundColor = useOptionalColor(props.backgroundColor);
	const computedColor = useOptionalColor(props.color);

	return (
		<MathJax
			style={{
				backgroundColor: computedBackgroundColor ?? 'transparent',
				...computeMargins(props)
			} satisfies ViewStyle}
			html={`
				<style>
					@font-face {
						font-family: Inter;
						src: url('file:///android_asset/fonts/Inter.ttf') format('truetype')
					}
					body {
						width: 100%;
						height: 100%;

						margin: 0 !important;
 						padding: ${computeSizeOpt(props.p, paddingSizes) ?? 0} !important;
						padding-top: ${computeSizeOpt(props.pt, paddingSizes) ?? 0} !important;
						padding-bottom: ${computeSizeOpt(props.pb, paddingSizes) ?? 0} !important;
						padding-left: ${computeSizeOpt(props.pl, paddingSizes) ?? 0} !important;
						padding-right: ${computeSizeOpt(props.pr, paddingSizes) ?? 0} !important;
						
						font-family: ${props.font ?? "Inter"};
						color: ${computedColor ?? Colors[theme].text};
						font-size: ${16 * computeSize(size, richTextSizes)}px;
						line-height: 1.6;
					}
				</style>
				<body>
					${text}
				</body>
			`}
			scrollEnabled={false}
			allowBounce={false}
			alwaysBounceHorizontal={false}
			alwaysBounceVertical={false}
			bounces={false}
		/>
	);
};

export default RichText;
