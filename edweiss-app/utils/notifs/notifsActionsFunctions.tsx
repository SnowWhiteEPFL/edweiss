import { callFunction } from '@/config/firebase';
import NotifList from '@/model/notifs';
import { CourseID } from '@/model/school/courses';

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

export async function pushNotifAction(id: string, type: string, title: string, message: string, read: boolean, courseID?: CourseID | null, date?: string) {
    if (!id) return;
    try {
        const res = await callFunction(NotifList.Functions.pushNotif, { type: type, title: title, message: message, date: date, read: read, courseID: courseID });
        if (res.status == 0) { console.log('Notification failed to push'); }
    }
    catch (error) { console.error('Error pushing notification:', error); }
}

export async function deleteNotifAction(id: string) {
    if (!id) return;
    const res = await callFunction(NotifList.Functions.deleteNotif, { id: id });
    if (res.status == 0) { console.log('Notification failed to delete'); }
}