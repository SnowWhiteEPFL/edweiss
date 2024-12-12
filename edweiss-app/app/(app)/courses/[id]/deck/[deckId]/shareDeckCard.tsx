import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { AppUser, UserID } from '@/model/users';
import { router } from 'expo-router';
import { useState } from 'react';

const ShareScreen: ApplicationRoute = () => {
    const { id: courseId, deckId, type } = useStringParameters();
    const { uid } = useAuth();
    const [loading, setIsLoading] = useState(false);

    const users = useDynamicDocs(CollectionOf<AppUser>('users'));
    if (!users) return null;

    // For each users, map user.id to user.data.name
    const ids_names_map = new Map<string, string>();
    users.forEach(user => {
        ids_names_map.set(user.id, user.data.name);
    });

    // Remove the current user from the mapping of users to share the deck with
    ids_names_map.delete(uid);

    // Filter out users who are not in the same course
    const users_data_filtered_course = Array.from(ids_names_map.entries()).filter(([id, name]) => {
        const user = users.find(user => user.id === id);
        return user && user.data.courses && user.data.courses.includes(courseId);
    }).map(([id, name]) => ({ id, name }));

    // Filter out users whose name is "Anonymous"
    const users_data_filtered_anonym = users_data_filtered_course.filter(user => user.name !== 'Anonymous');


    async function shareDeck(user: UserID) {
        const res = await callFunction(Memento.Functions.shareDeck, { deckId, other_user: user, courseId });
        setIsLoading(false);
        router.back();
    }

    async function shareCard(user: UserID) {
    }

    return (
        <>
            <RouteHeader title={`Share your ${type} to ...`} />

            <TScrollView>
                {users_data_filtered_anonym.map(user => (
                    <FancyButton
                        key={user.name}
                        loading={loading}
                        textColor='text'
                        backgroundColor='transparent'
                        mb={'sm'}
                        style={{ borderColor: 'green', width: '20%', alignSelf: 'center' }}
                        onPress={() => {
                            setIsLoading(true);
                            if (type === 'deck') shareDeck(user.id);
                            else if (type === 'card') shareCard(user.id);
                        }}>
                        <TView alignItems='center'>
                            <TText>{user.name}</TText>
                        </TView>
                    </FancyButton>
                ))}
            </TScrollView>
        </>
    );
};

export default ShareScreen;
