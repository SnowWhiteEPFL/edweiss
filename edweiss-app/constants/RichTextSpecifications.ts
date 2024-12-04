type LanguageSpecification = {
	keywords: string[],
	nextSpecialKeyword?: string[],
	specialWords?: string[],
	commentStyle: '/' | '#',
	patternExtend?: {
		identifierContinue?: string
	}
}

export const LanguagesSpecs: Record<string, LanguageSpecification | undefined> = {
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
	},
	fox: {
		keywords: [
			"echo", "let", "mut", "fn",
			"if", "else", "for", "in", "while", "do", "switch", "case", "match",
			"library", "import", "as",
			"return", "break", "continue", "assert",
			"true", "false",
			"int", "float", "double", "char", "short", "byte", "long", "boolean", "string",
			"pub", "object", "class", "enum", "trait", "extends", "this",
			"nil"
		],
		nextSpecialKeyword: ["library", "class", "enum", "trait", "object"],
		commentStyle: '/'
	}
}

export namespace Patterns {
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