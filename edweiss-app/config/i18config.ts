import i18next from 'i18next';

import AsyncStoragePlugin from 'i18next-react-native-async-storage';
import { initReactI18next } from 'react-i18next';

import en_common from "@/locales/en/common.json";
import en_course from "@/locales/en/course.json";
import en_home from "@/locales/en/home.json";
import en_memento from "@/locales/en/memento.json";
import en_notifications from "@/locales/en/notifications.json";
import en_showtime from "@/locales/en/showtime.json";
import en_todo from "@/locales/en/todo.json";

export type Locale = "en";
export type LocaleNamespace = typeof namespaces[number];
export type LocaleResource = { [l in Locale]: { [ns in LocaleNamespace]: any } };

export const defaultLang: Locale = "en" as const;
export const defaultNS: LocaleNamespace = "common";

export const namespaces = ["common", "home", "memento", "todo", "showtime", "course", "notifications"] as const;

export const resources = {
	en: {
		common: en_common,
		home: en_home,
		memento: en_memento,
		course: en_course,
		todo: en_todo,
		showtime: en_showtime,
		notifications: en_notifications
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
