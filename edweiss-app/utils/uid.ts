
export function predictiveUID(a: string, b: string, len: number) {
	if (a.localeCompare(b)) {
		return a.slice(0, len) + "" + b.slice(0, len);
	} else {
		return b.slice(0, len) + "" + a.slice(0, len);
	}
}

export default function generateUID(length: number) {
	const alphabet = "qwertyuiopasdfghjklzxcvbnQWERTYUIOPASDFGHJKLZXCVBN0123456789";
	let res = "";

	for (let i = 0; i < length; i++) {
		res += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}

	return res;
}
