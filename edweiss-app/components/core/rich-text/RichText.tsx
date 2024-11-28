import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { MarginProps, PaddingProps, PredefinedSizes, Size, computeMargins, computeSize, computeSizeOpt, paddingSizes } from '@/constants/Sizes';
import { useColor, useOptionalColor } from '@/hooks/theme/useThemeColor';
import React, { useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';
import WebViewMathJaxWrapper from './WebViewMathJaxWrapper';

type RichTextProps = PaddingProps & MarginProps & {
	children: string,
	backgroundColor?: Color,
	color?: Color,
	size?: Size,
	font?: "Inter" | "Times New Roman"
}

const headerSizes = [
	32, // #
	28, // ##
	24, // ###
	20, // ####
	18, // #####
	16, // ######
]

// const richTextSizes: PredefinedSizes = {
// 	xs: 0.8,
// 	sm: 0.9,
// 	md: 1.0,
// 	lg: 1.2,
// 	xl: 1.4
// }

const richTextSizes: PredefinedSizes = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 18,
	xl: 20
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
		const line = lines[lineIndex].trim();

		for (let headerCheckIndex = 0; headerCheckIndex < 6; headerCheckIndex++) {
			if (line.startsWith("#".repeat(headerCheckIndex + 1) + " ")) {
				res += headerLevel(line, headerCheckIndex + 1);
				continue main;
			}
		}

		res += line + (lineIndex != lines.length - 1 ? '<br/>' : '');
	}

	console.log(res);

	return res;
}

const RichText: ReactComponent<RichTextProps> = ({ size = "md", ...props }) => {
	const text = useMemo(() => richTextToHTML(props.children), [props.children]);

	const computedBackgroundColor = useOptionalColor(props.backgroundColor);
	const computedColor = useColor(props.color ?? "text");

	const mightHaveMathExpressions = useMemo(() => /\$/.test(text), [text]);

	return (
		<WebViewMathJaxWrapper
			style={computeMargins(props)}
			disableMathJax={!mightHaveMathExpressions}
			source={`
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
						padding-top: ${computeSizeOpt(props.pt, paddingSizes) ?? computeSizeOpt(props.py, paddingSizes) ?? 0} !important;
						padding-bottom: ${computeSizeOpt(props.pb, paddingSizes) ?? computeSizeOpt(props.py, paddingSizes) ?? 0} !important;
						padding-left: ${computeSizeOpt(props.pl, paddingSizes) ?? computeSizeOpt(props.px, paddingSizes) ?? 0} !important;
						padding-right: ${computeSizeOpt(props.pr, paddingSizes) ?? computeSizeOpt(props.px, paddingSizes) ?? 0} !important;
						
						font-family: ${props.font ?? "Inter"};
						color: ${computedColor};
						font-size: ${computeSize(size, richTextSizes)}px;
						line-height: 1.6;
					}
				</style>
				<body>
					${text}
				</body>
			`}
			webview={{
				scrollEnabled: false,
				bounces: false,
				showsHorizontalScrollIndicator: false,
				showsVerticalScrollIndicator: false,
				style: {
					backgroundColor: computedBackgroundColor ?? 'transparent'
				}
			}}
		/>
	);
};

export default RichText;


// const hasRichTextFeatures = useMemo(() => {
// 	// return /\$|\n|#/.test(text);
// 	return /<|>|\$/.test(text);
// }, [text]);

// console.log(`Math Expr: ${hasMathExpression}, Rich Text: ${hasRichTextFeatures}`);
// console.log(text);

// if (!hasRichTextFeatures) {
// 	return <TText size={size} {...props} />;
// }
