/**
 * @file pushNotif.ts
 * @description Cloud function to add a notification to the user's list
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { CourseID } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate, assertIsIn, assertString, assertThat, assertThatFields } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import { Time } from 'utils/time';
import NotifList from '../../model/notifs';
import Functions = NotifList.Functions;

// Types
type Notif = NotifList.Notif;
type NotifType = NotifList.NotifType;


// ------------------------------------------------------------
// ----------------  Add Notif to Cloud Function  --------------
// ------------------------------------------------------------

export const pushNotif = onAuthentifiedCall(Functions.pushNotif, async (userId, args) => {
	const validTypes: NotifType[] = ['message', 'quiz', 'submission', 'grade', 'announcement', 'event', 'meeting', 'group', 'post', 'comment', 'like', 'follow'] as const;

	// if (!args.type || !validTypes.includes(args.type) || !args.title || !args.message || args.read !== false)
	// 	return fail("invalid_arg");

	assertThatFields(args, {
		title: Predicate.isString,
		date: Predicate.isString,
		message: Predicate.isString,
		read: Predicate.is<boolean>(false),
		type: Predicate.isIn<string>(validTypes),

		/**
		 * The following line is convoluted only because `courseID` can be null rather
		 * than undefined. Please change it to undefined.
		 */
		courseID: Predicate.isEither(Predicate.is(null) as Predicate<CourseID | null>, Predicate.isNonEmptyString as Predicate<CourseID | null>)
	})

	assertString(args.title, "invalid_arg");
	assertString(args.message, "invalid_arg");
	assertThat(args.read, Predicate.is<boolean>(false), "invalid_arg");
	assertIsIn(args.type, validTypes, "invalid_arg");

	const notifCollection = CollectionOf<Notif>(`users/${userId}/notifications`);

	let dueDate: Date;

	if (typeof args.date === 'string') {
		dueDate = new Date(args.date);
	} else {
		return fail('error_date');
	}

	const notifToInsert: Notif = {
		type: args.type as NotifType,
		title: args.title,
		message: args.message,
		read: args.read,
		date: Time.fromDate(dueDate),
		courseID: null
	};

	try {
		const res = await notifCollection.add(notifToInsert);

		if (!res.id) {
			return fail("firebase_error");
		}

		return ok({ id: res.id });

	} catch (error) {
		return fail("firebase_error");
	}
});
