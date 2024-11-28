import Colors, { Color, Theme } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { MarginProps, PaddingProps, PredefinedSizes, Size, computeBoxModelSize, computeSize } from '@/constants/Sizes';
import useTheme from '@/hooks/theme/useTheme';
import { useColor, useOptionalColor } from '@/hooks/theme/useThemeColor';
import React, { useMemo } from 'react';
import WebViewMathJaxWrapper from './WebViewMathJaxWrapper';

interface RichTextOptions {
	disableLanguageDisplay?: boolean
}

type RichTextProps = PaddingProps & MarginProps & {
	children: string,
	backgroundColor?: Color,
	color?: Color,
	size?: Size,
	font?: "Inter" | "Times New Roman",
	options?: RichTextOptions
}

const headerSizes = [
	32, // #
	28, // ##
	24, // ###
	20, // ####
	18, // #####
	16, // ######
]

const richTextSizes: PredefinedSizes = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 18,
	xl: 20
}

const RichText: ReactComponent<RichTextProps> = ({ size = "md", ...props }) => {
	const theme = useTheme();
	const text = useMemo(() => richTextToHTML(props.children, theme, props.options), [props.children, theme, props.options]);
	const computedBackgroundColor = useOptionalColor(props.backgroundColor);
	const computedColor = useColor(props.color ?? "text");
	const mightHaveMathExpressions = useMemo(() => /\$/.test(text), [text]);

	return (
		<WebViewMathJaxWrapper
			style={computeBoxModelSize(props)}
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
						padding: 0 !important;

						font-family: ${props.font ?? "Inter"};
						color: ${computedColor};
						font-size: ${computeSize(size, richTextSizes)}px;
						line-height: 1.6;
					}
				</style>
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
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

type LanguageSpecification = {
	keywords: string[],
	nextSpecialKeyword?: string[],
	specialWords?: string[],
	commentStyle: '/' | '#',
	patternExtend?: {
		identifierContinue?: string
	}
}

const LanguagesSpecs: Record<string, LanguageSpecification | undefined> = {
	javascript: {
		keywords: [
			"public", "private", "protected", "yield",
			"let", "const", "var", "function", "return",
			"class", "async", "await", "null", "undefined", "this", "super",
			"if", "else", "default", "for", "in", "throw", "import",
			"true", "false", "new", "while", "do", "break", "continue", "switch",
			"typeof", "with", "try", "catch", "finally", "instanceof"
		],
		commentStyle: '/'
	},
	typescript: {
		keywords: [
			"number", "string", "boolean", "object", "any", "interface", "void", "type", "enum",
			"unknown", "never", "as", "readonly", "satisfies", "declare",
			"typeof", "keyof",

			"public", "private", "protected", "yield",
			"let", "const", "var", "function", "return",
			"class", "async", "await", "null", "undefined", "this", "super",
			"if", "else", "default", "for", "in", "throw", "import",
			"true", "false", "new", "while", "do", "break", "continue", "switch",
			"typeof", "with", "try", "catch", "finally", "instanceof"
		],
		commentStyle: '/'
	},
	c: {
		keywords: [
			"auto", "break", "case", "char", "const",
			"constexpr", "continue", "default", "do",
			"double", "else", "enum", "extern", "false",
			"float", "for", "goto", "if", "int", "long",
			"nullptr", "register", "return", "short", "signed",
			"sizeof", "static", "struct", "switch", "true",
			"typedef", "union", "unsigned", "void", "while"
		],
		commentStyle: '/'
	},
	python: {
		keywords: [
			"and", "as", "assert", "break", "class",
			"continue", "def", "elif", "else",
			"except", "False", "finally", "for",
			"from", "global", "if", "import", "in",
			"is", "lambda", "None", "nonlocal",
			"not", "or", "pass", "raise", "return",
			"True", "try", "while", "with", "yield"
		],
		commentStyle: '#'
	},
	java: {
		keywords: [
			"abstract", "assert", "boolean", "break",
			"byte", "case", "catch", "char", "class",
			"continue", "const", "default", "do",
			"double", "else", "enum", "exports", "extends",
			"final", "finally", "float", "for", "goto", "if",
			"implements", "import", "instanceof", "int",
			"interface", "long", "module", "native",
			"new", "package", "private", "protected",
			"public", "requires", "return", "short",
			"static", "super", "switch", "synchronized",
			"this", "throw", "throws", "transient",
			"try", "var", "void", "volatile", "while"
		],
		nextSpecialKeyword: ["class"],
		specialWords: ["String", "System", "Object"],
		commentStyle: '/'
	},
	rust: {
		keywords: [
			"as", "break", "const", "continue", "crate",
			"else", "enum", "extern", "false", "fn",
			"for", "if", "impl", "in", "let", "loop",
			"match", "mod", "move", "mut", "pub", "ref",
			"return", "self", "Self", "static", "struct",
			"super", "trait", "true", "type", "unsafe",
			"use", "where", "while",

			"bool", "char", "str",
			"u8", "u16", "u32", "u64", "u128",
			"i8", "i16", "i32", "i64", "i128",
			"f32", "f64"
		],
		nextSpecialKeyword: ["struct", "trait", "type"],
		specialWords: ["Option", "Either", "Result", "std", "String"],
		commentStyle: '/',
		patternExtend: {
			identifierContinue: "!" // for macros
		}
	}
}

namespace Patterns {
	export const Letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
	export const Numbers = "0123456789";
	export const NumbersContinue = Numbers + "x.fFlLdD";
	export const IdentifierStart = Letters + "_$";
	export const IdentifierContinue = IdentifierStart + Numbers;
	export const StringStart = "\"'`";

	export function is(char: string, pattern: string, extension?: string | undefined) {
		if (extension == undefined)
			return pattern.includes(char);
		return (pattern + extension).includes(char);
	}
}

function keywordInfo(language: string, identifier: string): undefined | { isNextSpecial: boolean } {
	const spec = LanguagesSpecs[language];
	if (spec == undefined)
		return undefined;

	const keywordIndex = spec.keywords.indexOf(identifier);
	if (keywordIndex == -1)
		return undefined;

	return {
		isNextSpecial: spec.nextSpecialKeyword?.includes(identifier) == true // because it can be undefined, obviously
	}
}

function highlight(word: string, color: Color, theme: Theme) {
	return `<span style="color: ${Colors[theme][color]}">${word}</span>`;
}

function syntaxHighlight(language: string, code: string, theme: Theme): string {
	let res = "";

	const spec = LanguagesSpecs[language];

	const push = (token: string, color?: Color) =>
		res += color == undefined ? token : highlight(token, color, theme);

	let lineIndex = 1;
	let nextIdentifierSpecial = false;

	main:
	for (let charIndex = 0; charIndex < code.length; charIndex++) {
		const char = code[charIndex];

		const isNextChar = (query: string, offset = 1) =>
			charIndex + offset >= code.length ? false : code[charIndex + offset] == query;

		const newLine = () => {
			res += "<br/>";
			lineIndex++;
		}

		if (char == "\n") {
			newLine();
			continue main;
		}

		if (char == "\t") {
			res += "  ";
			continue main;
		}

		if (Patterns.is(char, Patterns.IdentifierStart)) {
			let identifier = char;
			for (charIndex++; charIndex < code.length; charIndex++) {
				const identifierChar = code[charIndex];
				if (!Patterns.is(identifierChar, Patterns.IdentifierContinue, spec?.patternExtend?.identifierContinue)) {
					charIndex--;
					break;
				}
				identifier += identifierChar;
			}
			const info = keywordInfo(language, identifier);
			const isKeyword = info != undefined;

			const isSpecial = nextIdentifierSpecial || (spec?.specialWords?.includes(identifier) == true); // because it can be undefined

			nextIdentifierSpecial = false;
			if (info != undefined) {
				nextIdentifierSpecial = info.isNextSpecial;
			}

			push(identifier, isKeyword ? 'mauve' : isNextChar("(") ? 'blue' : isSpecial ? 'yellow' : 'red');
			continue main;
		}

		if (Patterns.is(char, Patterns.Numbers)) {
			let number = char;
			for (charIndex++; charIndex < code.length; charIndex++) {
				const numberChar = code[charIndex];
				if (!Patterns.is(numberChar, Patterns.NumbersContinue)) {
					charIndex--;
					break;
				}
				number += numberChar;
			}
			push(number, 'peach');
			continue main;
		}

		if (Patterns.is(char, Patterns.StringStart)) {
			const stringStartChar = char;
			let string = char;
			let escapeNext = false;
			for (charIndex++; charIndex < code.length; charIndex++) {
				const stringChar = code[charIndex];

				if (stringChar == stringStartChar && !escapeNext) {
					string += stringStartChar;
					break;
				}

				string += stringChar;
				escapeNext = stringChar == "\\" && escapeNext == false;
			}
			push(string, 'green');
			continue main;
		}

		if (spec?.commentStyle == '/') {
			if (Patterns.is(char, "/") && isNextChar("/")) {
				let comment = char;
				for (charIndex++; charIndex < code.length; charIndex++) {
					const commentChar = code[charIndex];
					if (commentChar == "\n") {
						charIndex--;
						break;
					}
					comment += commentChar;
				}
				push(comment, "overlay0");
				continue main;
			}

			if (Patterns.is(char, "/") && isNextChar("*")) {
				let comment = char;
				for (charIndex++; charIndex < code.length; charIndex++) {
					const commentChar = code[charIndex];
					if (commentChar == "\n") {
						comment += "<br/>";
						lineIndex++;
						continue;
					}
					if (commentChar == "*" && isNextChar("/")) {
						charIndex++;
						comment += "*/";
						break;
					}
					comment += commentChar;
				}
				push(comment, "overlay0");
				continue main;
			}
		} else if (spec?.commentStyle == '#') {
			if (Patterns.is(char, "#")) {
				let comment = char;
				for (charIndex++; charIndex < code.length; charIndex++) {
					const commentChar = code[charIndex];
					if (commentChar == "\n") {
						charIndex--;
						break;
					}
					comment += commentChar;
				}
				push(comment, "overlay0");
				continue main;
			}
		}

		push(char);
	}

	const total = `
	<div style="display: flex">
		<div style="color: ${Colors[theme]["surface1"]}; margin-right: 16px">
			${[...Array(lineIndex).keys()].map(line => `<div style="text-align: end">${line + 1}</div>`).join("")}
		</div>
		<div style="white-space: pre; overflow: scroll">${res}</div>
	</div>
	`

	// const t = <span style={{textAlign: "right"}}></span>

	return total;
}

function headerLevel(line: string, level: number) {
	return `<div style="font-size: ${headerSizes[level - 1]}px; font-weight: bold">${line.substring(level + 1)}</div>`;
}

export function richTextToHTML(rawText: string, theme: Theme, options?: RichTextOptions): string {
	// const text = sanitizeHtml(rawText, {
	// 	allowVulnerableTags: false
	// }).trim();
	const text = rawText.trim();

	const lines = text.split("\n");

	let result = "";

	main:
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex].trim();

		for (let headerCheckIndex = 0; headerCheckIndex < 6; headerCheckIndex++) {
			if (line.startsWith("#".repeat(headerCheckIndex + 1) + " ")) {
				result += headerLevel(line, headerCheckIndex + 1);
				continue main;
			}
		}

		if (line.startsWith("```")) {
			const language = line.substring(3);
			let code = "";

			for (lineIndex++; lineIndex < lines.length; lineIndex++) {
				const codeLine = lines[lineIndex];
				if (codeLine.trim() == "```")
					break;
				code += codeLine + "\n";
			}

			if (code.endsWith("\n")) {
				code = code.substring(0, code.length - 1);
			}

			const languageDisplay = `<div style="position: absolute; right: 8px; top: 4px; font-size: 14px; color: ${Colors[theme]["overlay0"]}">${language}</div>`;

			const highlighted = syntaxHighlight(language, code, theme);

			result += `
			<div style="
				padding: 10px;
				padding-top: 10px;
				margin: 10px;
				border-radius: 8px;
				position: relative;
				font-family: Fira Code;
				background-color: ${Colors[theme]["crust"]};
				">${options?.disableLanguageDisplay ? "" : languageDisplay}${highlighted}</div>
			`;

			continue main;
		}

		result += line + (lineIndex != lines.length - 1 ? '<br/>' : '');
	}

	return result;
}

