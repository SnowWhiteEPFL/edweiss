import { callFunction } from '@/config/firebase';
import NotifList from '@/model/notifs';
import { CourseID } from '@/model/school/courses';
import { UserID } from '@/model/users';

export async function markAsUnreadAction(id: string) {
    if (!id) return;
    const res = await callFunction(NotifList.Functions.markAsUnread, { id: id });
    if (res.status == 0) { console.log('Notification failed to mark as unread'); }
}

export async function markAsReadAction(id: string) {
    if (!id) return;
    const res = await callFunction(NotifList.Functions.markAsRead, { id: id });
    if (res.status == 0) { console.log('Notification failed to mark as read'); }
}

export async function pushNotifAction(type: string, title: string, message: string, users?: UserID[], courseID?: CourseID) {
    try {
        console.log('Pushing notification : ', type, title, message, users, courseID);
        const res = await callFunction(NotifList.Functions.pushNotif, { type: type, title: title, message: message, userIds: users, courseID: courseID });
        console.log('Notification pushed : ', res);
        if (res.status == 0) { console.log('Notification failed to push : ', res.error); }
    }
    catch (error) { console.error('Error pushing notification:', error); }
}

export async function deleteNotifAction(id: string) {
    if (!id) return;
    const res = await callFunction(NotifList.Functions.deleteNotif, { id: id });
    if (res.status == 0) { console.log('Notification failed to delete'); }
}