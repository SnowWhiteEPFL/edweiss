import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { timeInMS } from '@/constants/Time';
import { default as NotifList } from '@/model/notifs';
import { hexToRgb } from '@/utils/color';
import { deleteNotifAction, markAsReadAction, markAsUnreadAction } from '@/utils/notifs/notifsActionsFunctions';
import { useCallback, useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


//Constants

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

const iconsColorBackground = {
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



/**
 * NotifDisplay Component
 * 
 * This component is responsible for displaying a notification in the notification page.
 * It is a swipeable component that allows the user to mark the notification as read/unread or delete it.
 * 
 * @param item - The notification data to be displayed.
 * @param id - The id of the notification in the list.
 * @param dateSection - The section of the date to be displayed.
 * @param index - The index of the notification in the list.
 * @param key - The key of the notification in the list.
 * 
 * @returns JSX.Element - The rendered component for the notification display.
 */
const NotifDisplay: ReactComponent<{ item: NotifList.Notif, id: string, dateSection: dateSection, index: number; }> = ({ item, id, dateSection, index }) => {

    // Define swipeableRefs
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);

    // Extract the logic for marking as read/unread
    const handleMarkAsReadUnread = useCallback(() => {
        item.read ? markAsUnreadAction(id) : markAsReadAction(id);
    }, [item, id, markAsUnreadAction, markAsReadAction]);

    // Render left actions on swipe
    const renderLeftActions = () => (
        <TTouchableOpacity testID={testIDs.swipeLeftTounchable} onPress={() => { console.log('Read/Unread Button pressed'); handleMarkAsReadUnread(); swipeableRefs.current[index]?.close(); }}>
            <TView testID={testIDs.swipeLeftView} justifyContent='center' alignItems='flex-end' py={20} backgroundColor='blue'>
                <TText testID={testIDs.swipeLeftText} size={16} bold px={12} color='constantWhite'>
                    {item.read ? t(`notifications:unread`) : t(`notifications:read`)}
                </TText>
            </TView>
        </TTouchableOpacity>
    );

    const renderRightActions = () => (
        <TTouchableOpacity testID={testIDs.swipeRightTounchable} onPress={() => { console.log('Delete Button pressed'); deleteNotifAction(id); swipeableRefs.current[index]?.close(); }}>
            <TView testID={testIDs.swipeRightView} justifyContent='center' alignItems='flex-end' py={20} backgroundColor='cherry'>
                <TText testID={testIDs.swipeRightText} size={16} bold px={12} color='constantWhite'>
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
                <TTouchableOpacity testID={testIDs.notifTouchable} backgroundColor='mantle' flexDirection='row' alignItems='center' py={12} flex={1} onPress={() => { console.log(`Notif "${item.title}" has been clicked`); if (!item.read) markAsReadAction(id); }}>
                    {/* // Icon */}
                    {(() => {
                        const rgb = hexToRgb(iconsColorBackground[item.type as keyof typeof iconsColorBackground]);
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
                                <Icon testID={testIDs.notifIcon} name={icons[item.type as keyof typeof icons] as IconType} size={iconSizes.sm} color={iconsColor[item.type as keyof typeof iconsColor] as Color} />
                            </TView>
                        );
                    })()}

                    <TView testID={testIDs.notifGlobalView} flex={1} bb={1} ml={10} borderColor='crust'>
                        <TView testID={testIDs.notifTitleDateView} flex={1} flexDirection='row' alignItems="center" justifyContent='space-between'>
                            {/* // Title */}
                            <TText testID={testIDs.notifTitle} numberOfLines={1} size={14} bold={!item.read} >{item.title}</TText>
                            {/* // Date */}
                            <TText testID={testIDs.notifDate} numberOfLines={1} align='right' bold={!item.read} size={12} >
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