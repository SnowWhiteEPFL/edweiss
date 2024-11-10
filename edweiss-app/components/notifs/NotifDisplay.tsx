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
    swipeLeftTounchable: 'swipe-left-touchable',
    swipeLeftView: 'swipe-left-view',
    swipeLeftText: 'swipe-left-text',

    swipeRightTounchable: 'swipe-right-touchable',
    swipeRightView: 'swipe-right-view',
    swipeRightText: 'swipe-right-text',

    swipeableComponent: 'swipeable-component',
    swipeView: 'swipe-view',
    notifTouchable: 'notif-touchable',
    iconView: 'icon-view',
    notifIcon: 'notif-icon',
    notifGlobalView: 'notif-global-view',
    notifTitleDateView: 'notif-title-date-view',
    notifTitle: 'notif-title',
    notifDate: 'notif-date',
    notifMessage: 'notif-message',
};

type dateSection = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'older';



const NotifDisplay: ReactComponent<{ item: NotifList.Notif, id: string, dateSection: dateSection, index: number; }> = ({ item, id, dateSection, index }) => {

    // Define swipeableRefs
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);

    // Render left actions on swipe
    const renderLeftActions = () => (
        <TTouchableOpacity testID={testIDs.swipeLeftTounchable} onPress={() => { console.log('Read/Unread Button pressed'); if (item.read) markAsUnreadAction(id); else markAsReadAction(id); swipeableRefs.current[index]?.close(); }}>
            <TView testID={testIDs.swipeLeftView} justifyContent='center' alignItems='flex-end' py={20} backgroundColor='blue'>
                <TText testID={testIDs.swipeLeftText} size={16} bold={true} px={12} color='constantWhite'>
                    {item.read ? t(`notifications:unread`) : t(`notifications:read`)}
                </TText>
            </TView>
        </TTouchableOpacity>
    );

    const renderRightActions = () => (
        <TTouchableOpacity testID={testIDs.swipeRightTounchable} onPress={() => { console.log('Delete Button pressed'); deleteNotifAction(id); swipeableRefs.current[index]?.close(); }}>
            <TView testID={testIDs.swipeRightView} justifyContent='center' alignItems='flex-end' py={20} backgroundColor='cherry'>
                <TText testID={testIDs.swipeRightText} size={16} bold={true} px={12} color='constantWhite'>
                    {t(`notifications:delete`)}
                </TText>
            </TView>
        </TTouchableOpacity>
    );

    return (
        <Swipeable
            testID={testIDs.swipeableComponent}
            ref={(ref) => { swipeableRefs.current[index] = ref; }}
            renderLeftActions={renderLeftActions}  // Render actions on swipe
            renderRightActions={renderRightActions}  // Render actions on swipe
            onSwipeableOpen={(direction) => { if (direction === 'left') { console.log(`Left swipe detected on notif: ${id}`); } if (direction === 'right') { console.log(`Right swipe detected on notif: ${id}`); } }
            }>
            <TView testID={testIDs.swipeView} flexDirection='row' alignItems="center" justifyContent='space-between'>
                {/* TODO: Handle onPress event qui envoie vers le quiz ou la soumission. ATTENTION SI LE QUIZ OU SUBMIT EST DEJA FINI */}
                <TTouchableOpacity testID={testIDs.notifTouchable} backgroundColor='mantle' flexDirection='row' alignItems='center' py={12} flex={1} onPress={() => { console.log(`Notif \"${item.title}\" has been clicked`); if (!item.read) markAsReadAction(id); }}>
                    {/* // Icon */}
                    {(() => {
                        const rgb = hexToRgb(NotifList.iconsColorBackground[item.type as keyof typeof NotifList.iconsColorBackground]);
                        return (
                            <TView
                                testID={testIDs.iconView}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 30,
                                    backgroundColor: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : 'transparent',
                                    justifyContent: 'center', // Centrer verticalement
                                    alignItems: 'center', // Centrer horizontalement
                                    marginBottom: 20,
                                }}>
                                <Icon testID={testIDs.notifIcon} name={NotifList.icons[item.type as keyof typeof NotifList.icons] as IconType} size={iconSizes.sm} color={NotifList.iconsColor[item.type as keyof typeof NotifList.iconsColor] as Color} />
                            </TView>
                        );
                    })()}

                    <TView testID={testIDs.notifGlobalView} flex={1} bb={1} ml={10} borderColor='crust'>
                        <TView testID={testIDs.notifTitleDateView} flexDirection='row' alignItems="center" justifyContent='space-between'>
                            {/* // Title */}
                            <TText testID={testIDs.notifTitle} size={14} bold={!item.read} >{item.title}</TText>
                            {/* // Date */}
                            <TText testID={testIDs.notifDate} align='right' bold={!item.read} size={12} >
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
                        <TText testID={testIDs.notifMessage} bold={!item.read} size={12} py={15} >{item.message}</TText>
                    </TView>
                </TTouchableOpacity>
            </TView>
        </Swipeable>
    );
};

export default NotifDisplay;

export async function markAsUnreadAction(id: string) { if (!id) return; const res = await callFunction(NotifList.Functions.markAsUnread, { id: id }); }

export async function markAsReadAction(id: string) { if (!id) return; const res = await callFunction(NotifList.Functions.markAsRead, { id: id }); }

export async function pushNotifAction(id: string, type: string, title: string, message: string, read: boolean, courseID?: CourseID | null, date?: string) {
    if (!id) return;
    try { const res = await callFunction(NotifList.Functions.pushNotif, { type: type, title: title, message: message, date: date, read: read, courseID: courseID }); if (res.status == 0) { console.log('Notification failed to push'); } }
    catch (error) { console.error('Error pushing notification:', error); }
}
export async function deleteNotifAction(id: string) { if (!id) return; const res = await callFunction(NotifList.Functions.deleteNotif, { id: id }); }