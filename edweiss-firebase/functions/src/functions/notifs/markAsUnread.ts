/**
 * @file markAsUnread.ts
 * @description Cloud function to mark a notification as unread
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import NotifList from '../../model/notifs';
import Functions = NotifList.Functions;

// Types
type Notif = NotifList.Notif;


// ------------------------------------------------------------
// ----------------  Update Notif Cloud Function  --------------
// ------------------------------------------------------------

export const markAsUnread = onAuthentifiedCall(Functions.markAsUnread, async (userId, args) => {
    if (!args.id)
        return fail("invalid_id");

    const [notif, notifRef] = await getDocumentAndRef(CollectionOf<Notif>(`users/${userId}/notifications/`), args.id);

    if (notif == undefined)
        return fail("firebase_error");

    const updatedFields: Partial<Notif> = {};
    updatedFields.read = false;

    await notifRef.set({
        ...notif,
        ...updatedFields
    });

    return ok({});
});
