import { ApplicationRoute } from '@/constants/Component';
import React from 'react';

import Avatar from '@/components/Avatar';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import SmthWrongComponent from '@/components/memento/SmthWrongComponent';
import { callFunction, CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { AppUser, UserID } from '@/model/users';
import { router } from 'expo-router';
import { useState } from 'react';
import { DecksRepository } from '../_layout';

const ShareScreen: ApplicationRoute = () => {
    const { id: courseId, deckId, type, indices_of_cards_to_share } = useStringParameters();
    const { uid } = useAuth();
    const { user } = useUser();
    const [searchedUser, setSearchedUser] = useState('');
    const current_user_type = user.type
    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);
    const users = useDynamicDocs(CollectionOf<AppUser>('users'));

    if (!users || !deck) return <SmthWrongComponent message='Oops, Error loading users or deck ... ' />;

    const cards = deck.data.cards;

    const cards_indices = (indices_of_cards_to_share ? JSON.parse(indices_of_cards_to_share) : []) as number[]

    // Only take into accounts users who are the same type as the current user
    // type of current user = user.type
    const users_data_filtered_type = users.filter(user => user.data.type === current_user_type);

    // For each users, map user.id to user.data.name
    const ids_names_map = new Map<string, string>();
    users_data_filtered_type.forEach(user => {
        ids_names_map.set(user.id, user.data.name);
    });

    // Remove the current user from the mapping of users to share the deck with
    ids_names_map.delete(uid);

    // Filter out users who are not in the same course
    const users_data_filtered_course = Array.from(ids_names_map.entries()).filter(([id, name]) => {
        const user = users.find(user => user.id === id);
        return user?.data.courses?.includes(courseId);
    }).map(([id, name]) => ({ id, name }));

    // Filter out users whose name is "Anonymous"
    const users_data_filtered_anonym = users_data_filtered_course.filter(user => user.name !== 'Anonymous');

    const searched_users_based_on_searchedUser = users_data_filtered_anonym.filter(user => user.name.toLowerCase().includes(searchedUser.toLowerCase()));


    async function shareDeck(user: UserID) {
        handler.modifyDocument(deckId, {
            cards: cards
        }, (deckId) => {
            callFunction(Memento.Functions.shareDeck, { deckId, other_user: user, courseId });
        });

        router.back();
    }

    async function shareCard(user: UserID, cardIndices: number[]) {
        handler.modifyDocument(deckId, {
            cards: cards
        }, (deckId) => {
            callFunction(Memento.Functions.shareCards, { deckId: deckId, cardIndices: cardIndices, other_user: user, courseId });
        });

        router.back();
    }

    return (
        <>
            <RouteHeader title={`Share your ${type} to ...`} />

            <FancyTextInput
                placeholder='Search for a user'
                mb='md'
                onChangeText={text => {
                    setSearchedUser(text);
                }}
            />

            <TScrollView>
                {searched_users_based_on_searchedUser.map(user => (
                    <TView backgroundColor='base' m={'sm'} style={{ borderRadius: 40 }}>
                        <TTouchableOpacity
                            key={user.name}
                            m={'xs'}
                            onPress={() => {
                                if (type == 'Deck') shareDeck(user.id);
                                else if (type == 'Card') shareCard(user.id, cards_indices);
                            }}>
                            <TView m={'sm'} flexDirection="row" alignItems="center">
                                <Avatar name={user.name} size={50} />
                                <TText ml="sm">
                                    {user.name}
                                </TText>
                                <Icon ml={'md'} name='rocket' color='cherry' style={{ alignItems: 'flex-end' }} />
                            </TView>
                        </TTouchableOpacity>
                    </TView>
                ))}
            </TScrollView>
        </>
    );
};

export default ShareScreen;
