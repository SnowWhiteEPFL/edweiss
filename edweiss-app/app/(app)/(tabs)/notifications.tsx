/**
 * @file notifications.tsx
 * @description Module for displaying the notifications screen
 * @author Florian Dinant
 */

import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import NotifDisplay from '@/components/notifs/NotifDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { iconSizes } from '@/constants/Sizes';
import { timeInMS } from '@/constants/Time';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { default as NotifList } from '@/model/notifs';
import React from 'react';
import { Image, useWindowDimensions } from 'react-native';


// Constants

// Tests Tags
export const testIDs = {
    parametersTouchable: 'parameters-touchable',
    parameters: 'parameters_icon',

    divider: 'divider',

    scrollView: 'scroll-view',
    notifsView: 'notifs-view',
    todayView: 'today-view',
    todayText: 'today-text',
    thisWeekView: 'this-week-view',
    thisWeekText: 'this-week-text',
    thisMonthView: 'this-month-view',
    thisMonthText: 'this-month-text',
    thisYearView: 'this-year-view',
    thisYearText: 'this-year-text',
    olderView: 'older-view',
    allTimeText: 'all-time-text',

    noNotifView: 'no-notif-view',
    noNotifImage: 'no-notif-image',
    noNotifTitle: 'no-notif-title',
    noNotifText: 'no-notif-text',
};


type Notif = NotifList.Notif;


/**
 * This component renders the notifications screen, displaying notifications
 * categorized by time periods (today, this week, this month, this year, and older).
 * It fetches notifications from Firebase for the authenticated user and sorts them
 * into the appropriate categories based on their timestamps.
 * 
 * @returns JSX.Element - The rendered component for the notifications screen.
 */
const NotificationsPage: ApplicationRoute = () => {

    const { width, height } = useWindowDimensions();
    const auth = useAuth();

    // Récupérer les documents de la collection 'notifications' pour l'utilisateur
    const firebase_data = useDynamicDocs(CollectionOf<Notif>(`users/${auth.authUser.uid}/notifications`));
    const notifs = firebase_data ? firebase_data.map(doc => ({ id: doc.id, data: doc.data })) : [];

    const notifsDay: { id: string, data: Notif; }[] = [], notifsWeek: { id: string, data: Notif; }[] = [], notifsMonth: { id: string, data: Notif; }[] = [], notifsYear: { id: string, data: Notif; }[] = [], otherNotifs: { id: string, data: Notif; }[] = [];

    // Sort notifs by date
    const now = new Date();
    const midnight = new Date(now.setHours(0, 0, 0, 0)); // Minuit du jour courant

    // Compute last Monday at midnight
    const dayOfWeek = midnight.getDay();
    const mondayMidnight = new Date(midnight);
    mondayMidnight.setDate(midnight.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Go back to last Monday

    // Compute start of the month (1st of the month at midnight)
    const monthStart = new Date(midnight);
    monthStart.setDate(1);

    // Compute start of the year (1st of January at midnight)
    const yearStart = new Date(midnight);
    yearStart.setMonth(0); // Janvier
    yearStart.setDate(1);

    // Function to categorize notifications by date
    notifs.forEach((notif) => {
        const notifDate = new Date(notif.data.date.seconds * timeInMS.SECOND); // Notif date

        if (notifDate >= midnight) notifsDay.push(notif);
        else if (notifDate >= mondayMidnight) notifsWeek.push(notif);
        else if (notifDate >= monthStart) notifsMonth.push(notif);
        else if (notifDate >= yearStart) notifsYear.push(notif);
        else otherNotifs.push(notif);
    });

    // Sort each array by date in descending order (most recent first)
    notifsDay.sort((a, b) => b.data.date.seconds - a.data.date.seconds);
    notifsWeek.sort((a, b) => b.data.date.seconds - a.data.date.seconds);
    notifsMonth.sort((a, b) => b.data.date.seconds - a.data.date.seconds);
    notifsYear.sort((a, b) => b.data.date.seconds - a.data.date.seconds);
    otherNotifs.sort((a, b) => b.data.date.seconds - a.data.date.seconds);

    return (
        <TView>
            <RouteHeader isBold title={t(`notifications:notifications`)}
                right={
                    <TTouchableOpacity testID={testIDs.parametersTouchable} onPress={() => console.log("press parameters icon")}>
                        <Icon testID={testIDs.parameters} name='cog' size={iconSizes.lg} mr={24} />
                    </TTouchableOpacity>
                }
            />
            <TView testID={testIDs.divider} bb={0.5} mt={10} borderColor='crust'></TView>

            <TScrollView testID={testIDs.scrollView} p={16} backgroundColor="transparent">
                {notifs.length > 0 ? (
                    <TView testID={testIDs.notifsView} mb={30}>
                        {notifsDay.length > 0 && (
                            <TView testID={testIDs.todayView}>
                                <TText testID={testIDs.todayText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:today`)}</TText>
                                {notifsDay.map((notif, index) => (
                                    <NotifDisplay item={notif.data} id={notif.id} dateSection='today' index={index} key={notif.data.title} />
                                ))}
                            </TView>
                        )}
                        {notifsWeek.length > 0 && (
                            <TView testID={testIDs.thisWeekView}>
                                <TText testID={testIDs.thisWeekText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_week`)}</TText>
                                {notifsWeek.map((notif, index) => (
                                    <NotifDisplay item={notif.data} id={notif.id} dateSection='thisWeek' index={index} key={notif.data.title} />
                                ))}
                            </TView>
                        )}
                        {notifsMonth.length > 0 && (
                            <TView testID={testIDs.thisMonthView}>
                                <TText testID={testIDs.thisMonthText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_month`)}</TText>
                                {notifsMonth.map((notif, index) => (
                                    <NotifDisplay item={notif.data} id={notif.id} dateSection='thisMonth' index={index} key={notif.data.title} />
                                ))}
                            </TView>
                        )}
                        {notifsYear.length > 0 && (
                            <TView testID={testIDs.thisYearView}>
                                <TText testID={testIDs.thisYearText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_year`)}</TText>
                                {notifsYear.map((notif, index) => (
                                    <NotifDisplay item={notif.data} id={notif.id} dateSection='thisYear' index={index} key={notif.data.title} />
                                ))}
                            </TView>
                        )}
                        {otherNotifs.length > 0 && (
                            <TView testID={testIDs.olderView}>
                                <TText testID={testIDs.allTimeText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:all_time`)}</TText>
                                {otherNotifs.map((notif, index) => (
                                    <NotifDisplay item={notif.data} id={notif.id} dateSection='older' index={index} key={notif.data.title} />
                                ))}
                            </TView>
                        )}
                    </TView>
                ) :
                    <TView testID={testIDs.noNotifView} flex={1} justifyContent='flex-start' alignItems='center'>
                        <Image
                            testID={testIDs.noNotifImage}
                            source={require('../../../assets/images/no-notification.png')} // chemin relatif de l'image
                            style={{ width: width * 0.9, height: height * 0.5, resizeMode: 'contain' }}
                        />
                        <TText testID={testIDs.noNotifTitle} mb={25} bold size={30}>{t(`notifications:no_notifs_yet`)}</TText>
                        <TText testID={testIDs.noNotifText} align='center' mx={20} size={18} color='darkNight'>{t(`notifications:no_notifs_text`)}</TText>
                    </TView>
                }
            </TScrollView>
        </TView>
    );
};

export default NotificationsPage;