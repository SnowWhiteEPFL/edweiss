
import "i18next";

import { namespaces, resources } from "./i18config";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		ns: typeof namespaces;
		resources: typeof resources["en"];
		nsSeparator: ":";
		returnNull: false;
	}
}
