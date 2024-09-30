
// import the original type declarations
import "i18next";

import { defaultNS, namespaces, resources } from "./i18config";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS;
		ns: typeof namespaces;
		resources: typeof resources["en"];
		nsSeparator: ".";
		returnNull: false;
	}
}
