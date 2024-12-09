/**
 * Create a card or edit an existing card screen
 * 
 * @file index.tsx
 * @description Create a card or edit an existing card screen
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
import RichText from '@/components/core/rich-text/RichText';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { iconSizes } from '@/constants/Sizes';
import { useRepositoryDocument } from '@/hooks/repository';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { checkDupplication_EmptyField } from '@/utils/memento/utilsFunctions';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal } from 'react-native';
import { DecksRepository } from '../../_layout';

// ------------------------------------------------------------
// ----------------- CreateCardScreen Component ----------------
// ------------------------------------------------------------

export const CreateEditCardScreenSignature: ApplicationRouteSignature<{
    deckId: string,
    mode: string,
    prev_question: string,
    prev_answer: string,
    cardIndex: number
}> = {
    path: "/deck/[id]/card"
};

/**
 * Create or edit card screen
 * User can create a new card or edit an existing card with a question and an answer
 * 
 * @returns {ApplicationRoute} Screen to create or edit a card
 */
const CreateEditCardScreen: ApplicationRoute = () => {
    const { deckId, mode, prev_question, prev_answer, cardIndex } = useRouteParameters(CreateEditCardScreenSignature);
    const [question, setQuestion] = useState(prev_question);
    const [answer, setAnswer] = useState(prev_answer);
    const [existedQuestion, setExistedQuestion] = useState(false);
    const [emptyField, setEmptyField] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);


    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

    const card = deck?.data.cards[cardIndex]; // changed

    const error_selected = existedQuestion ? t("memento:card-creation-edition.question-existed-announcement") : emptyField ? t("memento:card-creation-edition.empty-fields-announcement") : undefined;

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

    // Update a card with a new question and answer
    async function updateCard(new_Question: string, new_Answer: string) {
        if (deck == undefined || card == undefined)
            return;

        if (checkDupplication_EmptyField(
            deck.data.cards.some(card => card.question === new_Question) && new_Question != prev_question,
            new_Question.length == 0 || new_Answer.length == 0,
            setExistedQuestion,
            setEmptyField,
            setIsLoading
        ) == 0) return;

        const newCards = deck.data.cards;
        newCards[cardIndex] = { ...card, question: new_Question, answer: new_Answer }; // changed

        handler.modifyDocument(deckId, {
            cards: newCards
        }, (deckId) => {
            callFunction(Memento.Functions.updateCard, { deckId, newCard: { ...card, question: new_Question, answer: new_Answer }, cardIndex: cardIndex }); // changed
        });

        router.back();

    }
    return (
        <>
            <RouteHeader title={`${mode} a card`} />

            <TScrollView>
                <TView m='md' borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={question}
                        onChangeText={n => {
                            setQuestion(n);
                            setExistedQuestion(false);
                            setEmptyField(false);
                        }}
                        placeholder={t("memento:card-creation-edition.content.question.placeholder")}
                        icon='help-sharp'
                        label={t("memento:card-creation-edition.content.question.label")}
                        error={error_selected}
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
                        placeholder={t("memento:card-creation-edition.content.answer.placeholder")}
                        icon='bulb-outline'
                        label={t("memento:card-creation-edition.content.answer.label")}
                        error={emptyField ? t("memento:card-creation-edition.empty-fields-announcement") : undefined}
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <FancyButton
                    testID='createCardButton'
                    backgroundColor='blue'
                    mt={'md'} mb={'sm'}
                    icon='checkmark-outline'
                    onPress={() => {
                        setIsLoading(true);
                        if (mode === "Edit") {
                            updateCard(question, answer);
                        } else {
                            createCard();
                        }
                    }}
                    loading={isLoading}>

                    {mode} Card
                </FancyButton>

                <FancyButton testID='previewButton' onPress={() => setPreviewModalVisible(true)}>
                    Preview Card
                </FancyButton>

                <Modal
                    testID='previewModal'
                    visible={previewModalVisible} animationType='fade'
                //onRequestClose={() => setPreviewModalVisible(false)}
                >
                    <TView flex={1} p={20} backgroundColor='mantle'>
                        <TTouchableOpacity testID='closeButton' alignItems="flex-start" onPress={() => { setPreviewModalVisible(false); }}>
                            <Icon name={'close'} size={iconSizes.lg} color="blue" mr={8} />
                        </TTouchableOpacity>

                        <TView justifyContent='center' alignItems='center' mb='sm'>
                            <TText bold size='lg' mb='sm'>Preview</TText>
                        </TView>

                        {/* Box for card.question */}
                        <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">

                            <TText bold mb="sm">Question:</TText>
                            <RichText>{question}</RichText>

                        </TView>

                        {/* Box for card.answer */}
                        <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">

                            <TText bold mb="sm">Answer:</TText>
                            <RichText>{answer}</RichText>

                        </TView>

                    </TView>
                </Modal>

            </TScrollView >
        </>
    );
};

export default CreateEditCardScreen;
