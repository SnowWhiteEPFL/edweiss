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


const NotificationsTab: ApplicationRoute = () => {

    const { width, height } = useWindowDimensions();
    const auth = useAuth();

    // Récupérer les documents de la collection 'notifications' pour l'utilisateur
    const firebase_data = useDynamicDocs(CollectionOf<Notif>(`users/${auth.authUser.uid}/notifications`));
    const notifs = firebase_data ? firebase_data.map(doc => ({ id: doc.id, data: doc.data })) : [];

    const notifsDay: { id: string, data: Notif; }[] = [], notifsWeek: { id: string, data: Notif; }[] = [], notifsMonth: { id: string, data: Notif; }[] = [], notifsYear: { id: string, data: Notif; }[] = [], otherNotifs: { id: string, data: Notif; }[] = [];

    // Sort notifs by date
    const now = new Date();
    const midnight = new Date(now.setHours(0, 0, 0, 0)); // Minuit du jour courant

    // Calcul du début de la semaine (dernier lundi à minuit)
    const dayOfWeek = midnight.getDay();
    const mondayMidnight = new Date(midnight);
    mondayMidnight.setDate(midnight.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Revenir au lundi précédent

    // Calcul du début du mois (1er du mois courant à minuit)
    const monthStart = new Date(midnight);
    monthStart.setDate(1);

    // Calcul du début de l'année (1er janvier à minuit)
    const yearStart = new Date(midnight);
    yearStart.setMonth(0); // Janvier
    yearStart.setDate(1);

    notifs.forEach((notif) => {
        const notifDate = new Date(notif.data.date.seconds * timeInMS.SECOND); // Date de la notif

        // Vérifier si la notification est du jour actuel
        if (notifDate >= midnight) {
            notifsDay.push(notif);
        }
        // Vérifier si la notification est de cette semaine
        else if (notifDate >= mondayMidnight) {
            notifsWeek.push(notif);
        }
        // Vérifier si la notification est de ce mois-ci
        else if (notifDate >= monthStart) {
            notifsMonth.push(notif);
        }
        // Vérifier si la notification est de cette année
        else if (notifDate >= yearStart) {
            notifsYear.push(notif);
        }
        // Si c'est plus ancien, la mettre dans les autres notifications
        else {
            otherNotifs.push(notif);
        }
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
                                    <TView key={index}>
                                        <NotifDisplay item={notif.data} id={notif.id} dateSection='today' index={index} />
                                    </TView>
                                ))}
                            </TView>
                        )}
                        {notifsWeek.length > 0 && (
                            <TView testID={testIDs.thisWeekView}>
                                <TText testID={testIDs.thisWeekText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_week`)}</TText>
                                {notifsWeek.map((notif, index) => (
                                    <TView key={index}>
                                        <NotifDisplay item={notif.data} id={notif.id} dateSection='thisWeek' index={index} />
                                    </TView>
                                ))}
                            </TView>
                        )}
                        {notifsMonth.length > 0 && (
                            <TView testID={testIDs.thisMonthView}>
                                <TText testID={testIDs.thisMonthText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_month`)}</TText>
                                {notifsMonth.map((notif, index) => (
                                    <TView key={index}>
                                        <NotifDisplay item={notif.data} id={notif.id} dateSection='thisMonth' index={index} />
                                    </TView>
                                ))}
                            </TView>
                        )}
                        {notifsYear.length > 0 && (
                            <TView testID={testIDs.thisYearView}>
                                <TText testID={testIDs.thisYearText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:this_year`)}</TText>
                                {notifsYear.map((notif, index) => (
                                    <TView key={index}>
                                        <NotifDisplay item={notif.data} id={notif.id} dateSection='thisYear' index={index} />
                                    </TView>
                                ))}
                            </TView>
                        )}
                        {otherNotifs.length > 0 && (
                            <TView testID={testIDs.olderView}>
                                <TText testID={testIDs.allTimeText} mb={10} mt={15} ml={2} size={16} color='darkBlue' bold={true}>{t(`notifications:all_time`)}</TText>
                                {otherNotifs.map((notif, index) => (
                                    <TView key={index}>
                                        <NotifDisplay item={notif.data} id={notif.id} dateSection='older' index={index} />
                                    </TView>
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

export default NotificationsTab;