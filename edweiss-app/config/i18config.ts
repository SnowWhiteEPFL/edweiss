import i18next from 'i18next';

import AsyncStoragePlugin from 'i18next-react-native-async-storage';
import { initReactI18next } from 'react-i18next';

import en_common from "@/locales/en/common.json";
import en_memento from "@/locales/en/memento.json";
import en_showtime from "@/locales/en/showtime.json";

export type Locale = "en";
export type LocaleNamespace = typeof namespaces[number];
export type LocaleResource = { [l in Locale]: { [ns in LocaleNamespace]: any } };

export const defaultLang: Locale = "en" as const;
export const defaultNS: LocaleNamespace = "common";

export const namespaces = ["common", "memento", "showtime"] as const;

export const resources = {
	en: {
		common: en_common,
		memento: en_memento,
		showtime: en_showtime
	}
} as const;

i18next.use(AsyncStoragePlugin(defaultLang)).use(initReactI18next).init({
	compatibilityJSON: 'v3',
	fallbackLng: defaultLang,
	resources: resources satisfies LocaleResource,
	ns: namespaces,
	defaultNS,
	interpolation: {
		escapeValue: false
	},
	nsSeparator: ":"
});

const t = i18next.t;

export default t;