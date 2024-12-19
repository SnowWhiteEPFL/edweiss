/**
 * @file pushNotif.ts
 * @description Cloud function to add a notification to the user's list
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import sendNotif from 'actions/sendNotif';
import { AssignmentType } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { Predicate, assertIsIn, assertNonEmptyString, assertString, assertThatFields } from 'utils/sanitizer';
import NotifList from '../../model/notifs';
import Functions = NotifList.Functions;

// Types
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
		userID: Predicate.isOptionalString,
		courseID: Predicate.isOptionalString,
	});

	assertNonEmptyString(args.title, "invalid_arg");
	assertString(args.message, "invalid_arg");
	assertIsIn(args.type, validTypes, "invalid_arg");

	return sendNotif(userId, args.title, args.message, args.type as AssignmentType, args.userID, args.courseID);

});
