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
import { hexToRgb } from '../../utils/color';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


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
            if (item.read) markAsUnreadAction(); else markAsReadAction();
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
                        const rgb = hexToRgb(NotifList.iconsColorBackground[item.type as keyof typeof NotifList.iconsColorBackground]);
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
                                <Icon name={NotifList.icons[item.type as keyof typeof NotifList.icons] as IconType} size={iconSizes.sm} color={NotifList.iconsColor[item.type as keyof typeof NotifList.iconsColor] as Color} testID={testIDs.notifIcon} />
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
