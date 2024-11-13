/**
 * @file deleteNotif.ts
 * @description Cloud function to delete a notification from firebase
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import NotifList from '../../model/notifs';
import Functions = NotifList.Functions;

// Types
type Notif = NotifList.Notif;


// ------------------------------------------------------------
// ----------------  Delete Notif Cloud Function  --------------
// ------------------------------------------------------------

export const deleteNotif = onAuthentifiedCall(Functions.deleteNotif, async (userId, args) => {
	assertNonEmptyString(args.id, "invalid_id");

	const [notif, notifRef] = await getDocumentAndRef(CollectionOf<Notif>(`users/${userId}/notifications/`), args.id);

	if (notif == undefined)
		return fail("firebase_error");

	await notifRef.delete();

	return ok({});
});
