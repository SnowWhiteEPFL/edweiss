import NotifList from 'model/notifs';
import { AssignmentType, CourseID } from 'model/school/courses';
import { UserID } from 'model/users';
import { clean, CollectionOf, Collections, query, where } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import { Time } from 'utils/time';

// Types
type Notif = NotifList.Notif;
type NotifType = NotifList.NotifType;

export default async function sendNotif(owner: UserID, title: string, message: string, type: AssignmentType, userID?: UserID, courseID?: CourseID) {
    if (courseID) {

        try {
            // Étape 1 : Récupérer tous les userIds inscrits au cours
            const q = query(Collections.users, where("courses", "array-contains", courseID));
            const querySnapshot = await q.get();

            // Étape 2 : Parcourir chaque utilisateur et envoyer la notification
            const userIds: string[] = [];
            querySnapshot.forEach((doc) => {
                userIds.push(doc.id);
            });

            for (const id of userIds) {
                const notifCollection = CollectionOf<Notif>(`users/${id}/notifications`);

                const notifToInsert: Notif = {
                    type: type as NotifType,
                    title: title,
                    message: message,
                    read: false,
                    date: Time.now(),
                    courseID: courseID
                };

                try {
                    await notifCollection.add(clean(notifToInsert));
                } catch (error) {
                    return fail("firebase_error : " + error);
                }
            }

        } catch (error) {
            console.error("Erreur lors de l'envoi des notifications :", error);
            return fail("firebase_error : " + error);
        }

    } else {
        const notifCollection = CollectionOf<Notif>(`users/${userID ? userID : owner}/notifications`);

        const notifToInsert: Notif = {
            type: type as NotifType,
            title: title,
            message: message,
            read: false,
            date: Time.now(),
            courseID: undefined
        };

        try {
            await notifCollection.add(clean(notifToInsert));
        } catch (error) {
            return fail("firebase_error: " + error);
        }
    }

    return ok({});
}