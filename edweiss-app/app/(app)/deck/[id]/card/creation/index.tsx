/**
 * Create a card screen
 * User can create a card with a question and an answer
 * 
 * @file index.tsx
 * @description Screen to create a card with a question and an answer
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import { iconSizes } from '@/constants/Sizes';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { checkDupplication_EmptyField } from '@/utils/memento/utilsFunctions';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal } from 'react-native';
import { DecksRepository } from '../../../_layout';

// ------------------------------------------------------------
// ----------------- CreateCardScreen Component ----------------
// ------------------------------------------------------------

/**
 * Create a card screen
 * User can create a card with a question and an answer
 * 
 * @returns {ApplicationRoute} Screen to create a card
 */
const CreateCardScreen: ApplicationRoute = () => {
    const { deckId } = useStringParameters();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [existedQuestion, setExistedQuestion] = useState(false);
    const [emptyField, setEmptyField] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);


    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

    // Create a new card
    async function createCard() {
        if (!deck) return

        if (checkDupplication_EmptyField(
            deck.data.cards.some(card => card.question === question),
            question.length == 0 || answer.length == 0,
            setExistedQuestion,
            setEmptyField,
            setIsLoading
        ) == 0) {
            return;
        }

        const card: Memento.Card = {
            question: question,
            answer: answer,
            learning_status: "Not yet",
        };

        const previousCards = deck?.data.cards ?? [];

        handler.modifyDocument(deckId, { cards: [...previousCards, card] }, () => {
            callFunction(Memento.Functions.createCard, {
                deckId: deckId,
                card: card
            });
        });

        router.back();
    }

    return (
        <>
            <RouteHeader title='Create a card' />

            <TScrollView>
                <TView m='md' borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={question}
                        onChangeText={n => {
                            setQuestion(n);
                            setExistedQuestion(false);
                            setEmptyField(false);
                        }}
                        placeholder='My amazing question'
                        icon='help-sharp'
                        label='Question'
                        error={existedQuestion ? 'Question already exists' : emptyField ? 'Please fill in all fields' : undefined}
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <TView m='md' mt={2} borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={answer}
                        onChangeText={n => {
                            setAnswer(n)
                            setEmptyField(false)
                        }}
                        placeholder='My amazing answer'
                        icon='bulb-outline'
                        label='Answer'
                        error={emptyField ? 'Please fill in all fields' : undefined}
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <FancyButton
                    testID='createCardButton'
                    backgroundColor='blue'
                    mt={'md'} mb={'sm'}
                    icon='logo-firebase'
                    onPress={() => {
                        setIsLoading(true);
                        createCard();
                    }}
                    loading={isLoading}>

                    Create Card
                </FancyButton>

                <FancyButton onPress={() => setPreviewModalVisible(true)}>
                    Preview Card
                </FancyButton>

                <Modal
                    visible={previewModalVisible}
                    animationType='fade'
                    onRequestClose={() => setPreviewModalVisible(false)}
                >
                    <TView flex={1} p={20} backgroundColor='mantle'>
                        <TTouchableOpacity alignItems="flex-start" onPress={() => { setPreviewModalVisible(false); }}>
                            <Icon name={'close'} size={iconSizes.lg} color="blue" mr={8} />
                        </TTouchableOpacity>

                        {/* Box for card.question */}
                        <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">
                            <TText bold mb="sm">Question:</TText>
                            <TText>{question}</TText>
                        </TView>

                        {/* Box for card.answer */}
                        <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">

                            <TText bold mb="sm">Answer:</TText>
                            <TText>{answer}</TText>

                        </TView>

                    </TView>
                </Modal>

            </TScrollView >
        </>
    );
};

export default CreateCardScreen;
