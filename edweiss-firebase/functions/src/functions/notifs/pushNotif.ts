/**
 * @file pushNotif.ts
 * @description Cloud function to add a notification to the user's list
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
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
    const validTypes: string[] = ['message', 'quiz', 'submission', 'grade', 'announcement', 'event', 'meeting', 'group', 'post', 'comment', 'like', 'follow'];

    if (!args.type || !validTypes.includes(args.type) || !args.title || !args.message || args.read !== false)
        return fail("invalid_arg");

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
