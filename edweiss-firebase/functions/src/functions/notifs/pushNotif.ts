/**
 * @file pushNotif.ts
 * @description Cloud function to add a notification to the user's list
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { UserID } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate, assertIsIn, assertNonEmptyString, assertString, assertThatFields } from 'utils/sanitizer';
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

	assertThatFields(args, {
		title: Predicate.isString,
		message: Predicate.isString,
		type: Predicate.isIn<string>(validTypes),
		userIds: Predicate.isOptionalArray<UserID>,
		courseID: Predicate.isOptionalString,
	});

	assertNonEmptyString(args.title, "invalid_arg");
	assertString(args.message, "invalid_arg");
	assertIsIn(args.type, validTypes, "invalid_arg");

	if (args.userIds) {
		args.userIds.forEach((id) => assertNonEmptyString(id, "invalid_arg"));

		for (const id of args.userIds) {
			const notifCollection = CollectionOf<Notif>(`users/${id}/notifications`);

			const notifToInsert: Notif = {
				type: args.type as NotifType,
				title: args.title,
				message: args.message,
				read: false,
				date: Time.now(),
				courseID: args.courseID
			};

			try {
				await notifCollection.add(notifToInsert);
			} catch (error) {
				return fail("firebase_error");
			}
		}
	} else {
		const notifCollection = CollectionOf<Notif>(`users/${userId}/notifications`);

		const notifToInsert: Notif = {
			type: args.type as NotifType,
			title: args.title,
			message: args.message,
			read: false,
			date: Time.now(),
			courseID: args.courseID
		};

		try {
			await notifCollection.add(notifToInsert);
		} catch (error) {
			return fail("firebase_error");
		}
	}

	return ok({});

});
