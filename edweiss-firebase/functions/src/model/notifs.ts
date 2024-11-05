import { FunctionFolder, FunctionOf } from './functions';
import { CourseID } from './school/courses';
import { Timestamp } from './time';

namespace NotifList {

    // export const NOTIFICATIONS_TYPES = {
    //     MESSAGE: 'message',
    //     QUIZ: 'quiz',
    //     SUBMISSION: 'submission',
    //     GRADE: 'grade',
    //     ANNOUNCEMENT: 'announcement',
    //     EVENT: 'event',
    //     MEETING: 'meeting',
    //     GROUP: 'group',
    //     POST: 'post',
    //     COMMENT: 'comment',
    //     LIKE: 'like',
    //     FOLLOW: 'follow',
    //     // Define your custom notification types here
    // };

    export type NotifType = 'message' | 'quiz' | 'submission' | 'grade' | 'announcement' | 'event' | 'meeting' | 'group' | 'post' | 'comment' | 'like' | 'follow';

    export interface Notif {
        type: NotifType;
        title: string;
        message: string;
        date: Timestamp;
        read: boolean;
        courseID?: CourseID | null;
    }

    export const Functions = FunctionFolder("notifs", {
        markAsUnread: FunctionOf<{ id: string; }, {}, 'invalid_arg' | 'firebase_error'>("markAsUnread"),
        markAsRead: FunctionOf<{ id: string; }, {}, 'invalid_arg' | 'firebase_error'>("markAsRead"),
        pushNotif: FunctionOf<{ type: string, title: string, message: string, date: string, read: boolean, courseID: CourseID | null; }, {}, 'invalid_arg' | 'firebase_error'>("pushNotif"),
        deleteNotif: FunctionOf<{ id: string; }, {}, 'invalid_arg' | 'firebase_error'>("deleteNotif"),
    });
}

export default NotifList;