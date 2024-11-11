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

    // Icons
    export const icons = {
        message: 'chatbubbles-outline',
        quiz: 'help-circle-outline',
        submission: 'clipboard-outline',
        grade: 'school-outline',                // others:  trophy-outline / ribbon-outline / medal-outline
        announcement: 'megaphone-outline',      // others:  warning-outline / alert-circle-outline / alert-outline
        event: 'pizza-outline',                 // others:  information-circle-outline
        meeting: 'people-outline',
        group: 'people-circle-outline',         // others:  people-circle
        post: 'create-outline',
        comment: 'chatbubble-ellipses-outline', // others:  chatbubble-outline
        like: 'heart-outline',                  // others:  heart-sharp / thumbs-up-outline
        follow: 'person-add-outline',
    };

    export const iconsColor = {
        message: 'blue',
        quiz: 'yellow',
        submission: 'peach',
        grade: 'mauve',
        announcement: 'red',
        event: 'sky',
        meeting: 'darkBlue',
        group: 'pink',
        post: 'rosewater',
        comment: 'green',
        like: 'lavender',
        follow: 'maroon',
    };

    export const iconsColorBackground = {
        message: '#1e66f5',  //"79B8FE", //color11
        quiz: '#df8e1d', //"FFDF5E", //color5
        submission: '#fe640b', //"FFBB5B", //color4
        grade: '#8839ef', //"451F48", //color17
        announcement: '#d20f39', //"651510", //color1
        event: '#04a5e5', //"71D3BC", //color9
        meeting: '#191D63', //"4F6CFD", //color12
        group: '#ea76cb', //"844D92", //color15
        post: '#dc8a78', //"8F8ED7", //color13
        comment: '#40a02b', //"608E55", //color7
        like: '#7287fd', //"6AC979", //color8
        follow: '#e64553', //"E97F78",  //color3
    };

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