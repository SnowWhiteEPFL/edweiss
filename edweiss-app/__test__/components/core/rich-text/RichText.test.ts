import { richTextToHTML } from '@/components/core/rich-text/RichText';

jest.mock("react-native-webview", () => ({
	WebView: jest.fn()
}));

describe("RichText", () => {
	it("should parse correctly", () => {
		const res = richTextToHTML(`
			# Title
			## Subtitle
			Hello, $a + b$
		`, 'light');
		expect(res).toBe(`<div style="font-size: 32px; font-weight: bold">Title</div><div style="font-size: 28px; font-weight: bold">Subtitle</div>Hello, $a + b$`);
	});

	it("should parse code and comments correctly", () => {
		const res = richTextToHTML(`
${"```typescript"}
// the comment is well rendered
/*
multiline comments
*/
let a = 15;
class Important {
	export const msg = "hi mom";
}
${"```"}
${"```rust"}
fn why_love_rust() {
	println!("Because Rust is best");
}
${"```"}
		`, 'light');
		expect(res).toMatchSnapshot();
	});
});
