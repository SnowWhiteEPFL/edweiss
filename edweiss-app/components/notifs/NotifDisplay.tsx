import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { timeInMS } from '@/constants/Time';
import { default as NotifList } from '@/model/notifs';
import { CourseID } from '@/model/school/courses';
import { useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


// Constants

// Icons
const icons = {
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

const iconsColor = {
    message: 'color11',
    quiz: 'color5',
    submission: 'color4',
    grade: 'color17',
    announcement: 'color1',
    event: 'color9',
    meeting: 'color12',
    group: 'color15',
    post: 'color13',
    comment: 'color7',
    like: 'color8',
    follow: 'color3',
};

const iconsColorBackground = {
    message: "#79B8FE", //color11
    quiz: "#FFDF5E", //color5
    submission: "#FFBB5B", //color4
    grade: "#451F48", //color17
    announcement: "#651510", //color1
    event: "#71D3BC", //color9
    meeting: "#4F6CFD", //color12
    group: "#844D92", //color15
    post: "#8F8ED7", //color13
    comment: "#608E55", //color7
    like: "#6AC979", //color8
    follow: "#E97F78",  //color3
};

// Tests Tags
export const testIDs = {
    notifIcon: 'notif-icon',
    notifDate: 'notif-date',
    notifTitle: 'notif-title',
    notifMessage: 'notif-message',
    swipeView: 'swipe-view',
};

type dateSection = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'older';



const NotifDisplay: ReactComponent<{ item: NotifList.Notif, id: string, dateSection: dateSection, index: number; }> = ({ item, id, dateSection, index }) => {

    // Define swipeableRefs
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);

    // Render left actions on swipe
    const renderLeftActions = () => (
        <TTouchableOpacity onPress={() => {
            if (item.read) {
                markAsUnreadAction();
            } else {
                markAsReadAction();
                // const date: Timestamp = Timestamp.fromDate(new Date(1730697600000));
                // pushNotifAction('meeting', 'Meeting', 'Test Add Notif', false, null, OurTime.toDate(date).toISOString());
            }
            swipeableRefs.current[index]?.close();
        }}>
            <TView justifyContent='center' alignItems='flex-end' py={20} backgroundColor='blue' testID={testIDs.swipeView}>
                <TText size={16} bold={true} px={12} color='constantWhite'>
                    {item.read ? t(`notifications:unread`) : t(`notifications:read`)}
                </TText>
            </TView>
        </TTouchableOpacity>

    );

    const renderRightActions = () => (
        <TTouchableOpacity onPress={() => {
            deleteNotifAction();
            swipeableRefs.current[index]?.close();
        }}>
            <TView justifyContent='center' alignItems='flex-end' py={20} backgroundColor='cherry' testID={testIDs.swipeView}>
                <TText size={16} bold={true} px={12} color='constantWhite'>
                    {t(`notifications:delete`)}
                </TText>
            </TView>
        </TTouchableOpacity>
    );


    // Fonction pour convertir le code hex en RGB
    const hexToRgb = (hex: string) => {
        // Regex pour vérifier si le code hex est valide
        const hexCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        // Si le code hex est valide
        if (hexCode) {
            // Retourner les valeurs RGB
            return {
                r: parseInt(hexCode[1], 16),
                g: parseInt(hexCode[2], 16),
                b: parseInt(hexCode[3], 16),
            };
        }
    };

    async function markAsUnreadAction() {
        if (!id) return;
        const res = await callFunction(NotifList.Functions.markAsUnread, { id: id });
        // You can handle error here
    }

    async function markAsReadAction() {
        if (!id) return;
        const res = await callFunction(NotifList.Functions.markAsRead, { id: id });
        // You can handle error here
    }

    async function pushNotifAction(type: string, title: string, message: string, read: boolean, courseID?: CourseID | null, date?: string) {
        if (!id) return;
        try {
            const res = await callFunction(NotifList.Functions.pushNotif, { type: type, title: title, message: message, date: date, read: read, courseID: courseID });
            if (res.status == 0) {
                console.log('Notification failed to push');
            }
        } catch (error) {
            console.error('Error pushing notification:', error);
            // You can handle error here, e.g., show a toast or alert to the user
        }
    }
    async function deleteNotifAction() {
        if (!id) return;
        const res = await callFunction(NotifList.Functions.deleteNotif, { id: id });
        // You can handle error here
    }

    return (
        <Swipeable
            ref={(ref) => { swipeableRefs.current[index] = ref; }}
            renderLeftActions={renderLeftActions}  // Render actions on swipe
            renderRightActions={renderRightActions}  // Render actions on swipe
            onSwipeableOpen={(direction) => {
                if (direction === 'left') { console.log(`Left swipe detected on notif: ${id}`); }
                if (direction === 'right') { console.log(`Right swipe detected on notif: ${id}`); }
            }}>
            <TView flexDirection='row' alignItems="center" justifyContent='space-between'>
                {/* TODO: Handle onPress event qui envoie vers le quiz ou la soumission. ATTENTION SI LE QUIZ OU SUBMIT EST DEJA FINI */}
                <TTouchableOpacity backgroundColor='mantle' flexDirection='row' alignItems='center' py={12} flex={1} onPress={() => {
                    console.log(`Notif \"${item.title}\" has been clicked`);
                    if (!item.read) {
                        markAsReadAction();
                    }
                }}>
                    {/* // Icon */}
                    {(() => {
                        const rgb = hexToRgb(iconsColorBackground[item.type as keyof typeof iconsColorBackground]);
                        return (
                            <TView
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 30,
                                    backgroundColor: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'transparent',
                                    justifyContent: 'center', // Centrer verticalement
                                    alignItems: 'center', // Centrer horizontalement
                                    marginBottom: 20,
                                }}>
                                <Icon name={icons[item.type as keyof typeof icons] as IconType} size={iconSizes.sm} color={iconsColor[item.type as keyof typeof iconsColor] as Color} testID={testIDs.notifIcon} />
                            </TView>
                        );
                    })()}

                    <TView flex={1} bb={1} ml={10} borderColor='crust'>
                        <TView flexDirection='row' alignItems="center" justifyContent='space-between'>
                            {/* // Title */}
                            <TText size={14} bold={!item.read} testID={testIDs.notifTitle} >{item.title}</TText>
                            {/* // Date */}
                            <TText align='right' bold={!item.read} size={12} testID={testIDs.notifDate} >
                                {(() => {
                                    const date = item.date ? new Date(item.date.seconds * timeInMS.SECOND) : new Date();
                                    const options: Intl.DateTimeFormatOptions = {};

                                    switch (dateSection) {
                                        case 'today':
                                            return date.toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            });
                                        case 'thisWeek':
                                            options.weekday = 'long';
                                            break;
                                        case 'thisMonth':
                                            options.weekday = 'long';
                                            options.day = 'numeric';
                                            break;
                                        case 'thisYear':
                                            options.weekday = 'long';
                                            options.month = 'long';
                                            options.day = 'numeric';
                                            break;
                                        case 'older':
                                            options.year = 'numeric';
                                            options.month = 'long';
                                            options.day = 'numeric';
                                            break;
                                    }

                                    if (dateSection === 'thisMonth' || dateSection === 'thisYear') {
                                        const day = date.getDate();
                                        const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
                                        const month = date.toLocaleDateString(undefined, { month: 'long' });
                                        const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
                                        return dateSection === 'thisMonth'
                                            ? `${weekday} the ${day}${suffix}`
                                            : `${weekday}, ${month} ${day}${suffix}`;
                                    }

                                    return date.toLocaleDateString(undefined, options);
                                })()}
                            </TText>
                        </TView>
                        <TText bold={!item.read} size={12} py={15} testID={testIDs.notifMessage} >{item.message}</TText>
                    </TView>
                </TTouchableOpacity>
            </TView>
        </Swipeable>
    );
};

export default NotifDisplay;
