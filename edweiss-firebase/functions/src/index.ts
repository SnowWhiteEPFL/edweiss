
import admin = require('firebase-admin');
admin.initializeApp();

import { FunctionImplementation } from 'utils/firebase';

import fs = require('fs');

fs.readdirSync('./src/functions', { recursive: true }).forEach(file => {
	if (typeof file != "string" || !file.endsWith(".ts"))
		return;

	const path = file.substring(0, file.length - 3);
	let pathStartIndex = path.lastIndexOf("/");
	if (pathStartIndex == -1)
		pathStartIndex = path.lastIndexOf("\\"); // Windows is terrible, switch to Linux already :/
	const name = pathStartIndex == -1 ? path : path.substring(pathStartIndex + 1, path.length);

	const FunctionImplementation = eval('require' /** Evil Shenanigans */)(`./functions/${path}`)[name] as FunctionImplementation;

	if (path !== FunctionImplementation.signature.path) {
		const errorMessage = `Mismatch between signature path (${FunctionImplementation.signature.path}) and actual path ${path}`;
		console.error(errorMessage);
		throw new Error(errorMessage);
	}

	exports[FunctionImplementation.signature.exportedName] = FunctionImplementation.handler;
});
