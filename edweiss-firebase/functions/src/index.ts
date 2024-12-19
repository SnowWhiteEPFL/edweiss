import 'dotenv/config';

import admin = require('firebase-admin');
admin.initializeApp();

import { FunctionImplementation } from 'utils/firebase';

// const res = admin.storage().bucket().get({
// 	autoCreate: false
// });

import fs = require('fs');

exportFnDir("./src/functions");

function exportFnDir(originPath: string) {
	fs.readdirSync(originPath).forEach(file => {
		if (typeof file != "string")
			return;

		if (file.endsWith(".ts")) {
			exportFn((originPath + "/" + file).replace("./src/functions/", ""));
		} else {
			exportFnDir(originPath + "/" + file);
		}
	});
}

function exportFn(file: string) {
	console.log(`Exporting ${file}.`);

	let path = file.substring(0, file.length - 3);

	path = unixify(path);

	const pathStartIndex = path.lastIndexOf("/");

	const name = pathStartIndex == -1 ? path : path.substring(pathStartIndex + 1, path.length);

	const FunctionImplementation = eval('require' /** Evil Shenanigans */)(`./functions/${path}`)[name] as FunctionImplementation;

	if (path !== FunctionImplementation.signature.path) {
		const errorMessage = `Mismatch between signature path (${FunctionImplementation.signature.path}) and actual path ${path}`;
		console.error(errorMessage);
		throw new Error(errorMessage);
	}

	exports[FunctionImplementation.signature.exportedName] = FunctionImplementation.handler;
}

function unixify(path: string) {
	while (path.indexOf("\\") != -1) {
		path = path.replace("\\", "/");
	}
	return path;
}

// fs.readdirSync('./src/functions', { recursive: true }).forEach(file => {
// 	if (typeof file != "string" || !file.endsWith(".ts"))
// 		return;

// 	console.log(`Exporting ${file}.`);

// 	let path = file.substring(0, file.length - 3);

// 	while (path.indexOf("\\") != -1) {
// 		path = path.replace("\\", "/");
// 	}

// 	const pathStartIndex = path.lastIndexOf("/");

// 	const name = pathStartIndex == -1 ? path : path.substring(pathStartIndex + 1, path.length);

// 	const FunctionImplementation = eval('require' /** Evil Shenanigans */)(`./functions/${path}`)[name] as FunctionImplementation;

// 	if (path !== FunctionImplementation.signature.path) {
// 		const errorMessage = `Mismatch between signature path (${FunctionImplementation.signature.path}) and actual path ${path}`;
// 		console.error(errorMessage);
// 		throw new Error(errorMessage);
// 	}

// 	exports[FunctionImplementation.signature.exportedName] = FunctionImplementation.handler;
// });
