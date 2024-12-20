import { FunctionFolder, FunctionOf } from './functions';
import { CourseID } from './school/courses';
import { Timestamp } from './time';
import { UserID } from './users';

namespace NotifList {

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
        pushNotif: FunctionOf<{ type: string, title: string, message: string, userID?: UserID, courseID?: CourseID; }, {}, 'invalid_arg' | 'firebase_error'>("pushNotif"),
        deleteNotif: FunctionOf<{ id: string; }, {}, 'invalid_arg' | 'firebase_error'>("deleteNotif"),
    });
}

export default NotifList;