
import admin = require('firebase-admin');
admin.initializeApp();

import { FunctionImplementation } from 'utils/firebase';

import fs = require('fs');

fs.readdirSync('./src/functions', { recursive: true }).forEach(file => {
	if (typeof file != "string" || !file.endsWith(".ts"))
		return;

	const path = file.substring(0, file.length - 3);
	const name = path.lastIndexOf("/") == -1 ? path : path.substring(path.lastIndexOf("/") + 1, path.length);

	const FunctionImplementation = eval('require' /** Evil Shenanigans */)(`./functions/${path}`)[name] as FunctionImplementation;

	if (path !== FunctionImplementation.signature.path) {
		const errorMessage = `Mismatch between signature path (${FunctionImplementation.signature.path}) and actual path ${path}`;
		console.error(errorMessage);
		throw new Error(errorMessage);
	}

	exports[FunctionImplementation.signature.exportedName] = FunctionImplementation.handler;
});

// fs.readdirSync('./src/functions', { recursive: true }).then(files => {
// 	files.forEach(file => {
// 		if (!file.endsWith(".ts"))
// 			return;

// 		// console.log("To export : " + file);

// 		const path = file.substring(0, file.length - 3);
// 		const name = path.lastIndexOf("/") == -1 ? path : path.substring(path.lastIndexOf("/") + 1, path.length);

// 		console.log(`Path: ${path}, Name: ${name}`);

// 		const FunctionImplementation = eval('require' /** Evil Shenanigans */)(`./functions/${path}`)[name] as FunctionImplementation;

// 		console.log(FunctionImplementation);

// 		exports[FunctionImplementation.signature.exportedName] = FunctionImplementation.handler;
// 	});
// });

// import AllFunctions from 'model/functions/all';

// const allDeclaredFunctions = Object.values(AllFunctions);

// for (let i = 0; i < allDeclaredFunctions.length; i++) {
// 	const fn = allDeclaredFunctions[i];
// 	const path = `./functions/${fn.path}`;

// 	const FunctionHandler = eval('require' /** Shenanigans ik */)(path)[fn.originalName];

// 	console.log(`> Name: ${fn.originalName}, Path: ${path}, Exported Name : ${fn.exportedName}`);

// 	exports[fn.exportedName] = FunctionHandler;
// }
