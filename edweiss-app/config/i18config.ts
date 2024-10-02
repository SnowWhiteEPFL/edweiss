import i18next from 'i18next';

import { typeCheck } from '@/utils/types';
import AsyncStoragePlugin from 'i18next-react-native-async-storage';
import { initReactI18next } from 'react-i18next';

import en_common from "@/locales/en/common.json";
import en_memento from "@/locales/en/memento.json";

export type Locale = "en";
export type LocaleNamespace = typeof namespaces[number];
export type LocaleResource = { [l in Locale]: { [ns in LocaleNamespace]: any } };

export const defaultLang: Locale = "en" as const;
export const defaultNS: LocaleNamespace = "common";

export const namespaces = ["common", "memento"] as const;

export const resources = {
	en: {
		common: en_common,
		memento: en_memento
	}
} as const;

i18next.use(AsyncStoragePlugin(defaultLang)).use(initReactI18next).init({
	compatibilityJSON: 'v3',
	fallbackLng: defaultLang,
	resources: typeCheck<LocaleResource>(resources),
	ns: namespaces,
	defaultNS,
	interpolation: {
		escapeValue: false
	},
	nsSeparator: ":"
});

const t = i18next.t;

export default t;

// export default i18next;

// export function t(k: LocaleKey, args?: { [x: string]: string }) {
// 	return i18next.t(k, args);
// }
