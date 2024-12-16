import ReactComponent from '@/constants/Component';

import { DecksRepository } from '@/app/(app)/courses/[id]/deck/_layout';
import { callFunction } from '@/config/firebase';
import { iconSizes } from '@/constants/Sizes';
import { useAuth } from '@/contexts/auth';
import { useRepositoryDocument } from '@/hooks/repository';
import Memento from '@/model/memento';
import { CourseID } from '@/model/school/courses';
import { checkDupplication_EmptyField } from '@/utils/memento/utilsFunctions';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import Icon from '../core/Icon';
import RichText from '../core/rich-text/RichText';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';

const CreateDeleteEditCardModal: ReactComponent<{
    courseId: CourseID,
    deckId: string,
    mode: string,
    prev_question: string,
    prev_answer: string,
    cardIndex: number,
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    specialDeleteCard?: () => void;
}> = ({ courseId, deckId, mode, prev_question, prev_answer, cardIndex, visible, setVisible, specialDeleteCard }) => {
    const [existedQuestion, setExistedQuestion] = useState(false);
    const [question, setQuestion] = useState(prev_question);
    const [answer, setAnswer] = useState(prev_answer);
    const [emptyField, setEmptyField] = useState(false);

    const { uid } = useAuth();

    // Reset state when modal is opened with new card data
    useEffect(() => {
        if (visible) {
            setQuestion(prev_question);
            setAnswer(prev_answer);
            setExistedQuestion(false);
            setEmptyField(false);
        }
    }, [visible, prev_question, prev_answer]);

    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);
    if (deck == undefined) return null;
    const cards = deck.data.cards;
    const card = cards[cardIndex];

    function error_selected() {
        if (existedQuestion) {
            return t("memento:card-creation-edition.question-existed-announcement");
        }
        if (emptyField) {
            return t("memento:card-creation-edition.empty-fields-announcement");
        }
        return undefined;
    }

    // Create a new card
    async function createCard() {
        if (!deck) return

        if (checkDupplication_EmptyField(
            deck.data.cards.some(card => card.question === question),
            question.trim().length == 0 || answer.trim().length == 0,
            setExistedQuestion,
            setEmptyField,
        ) == 0) {
            return;
        }

        const card: Memento.Card = {
            ownerID: uid,
            question: question,
            answer: answer,
            learning_status: "Not yet",
        };

        const previousCards = deck?.data.cards ?? [];

        handler.modifyDocument(deckId, { cards: [...previousCards, card] }, () => {
            callFunction(Memento.Functions.createCard, {
                deckId: deckId,
                card: card,
                courseId: courseId
            });
        });

        setVisible(false);
    }

    // Update a card with a new question and answer
    async function updateCard(new_Question: string, new_Answer: string) {
        if (deck == undefined || card == undefined) return;

        if (checkDupplication_EmptyField(
            deck.data.cards.some(card => card.question === new_Question) && new_Question != prev_question,
            new_Question.length == 0 || new_Answer.length == 0,
            setExistedQuestion,
            setEmptyField,
        ) == 0) return;

        const newCards = deck.data.cards;
        if (new_Question != prev_question || new_Answer != prev_answer) {
            newCards[cardIndex] = { ...card, ownerID: uid, question: new_Question, answer: new_Answer };
        } else {
            newCards[cardIndex] = { ...card, question: new_Question, answer: new_Answer }; // changed
        }
        handler.modifyDocument(deckId, {
            cards: newCards
        }, (deckId) => {
            callFunction(Memento.Functions.updateCard, { deckId, newCard: { ...card, question: new_Question, answer: new_Answer }, cardIndex: cardIndex, courseId: courseId }); // changed
        });

        setVisible(false);

    }

    // Delete a card
    async function deleteCard() {
        handler.modifyDocument(deckId, { cards: cards.filter((_, index) => index != cardIndex) }, (deckId) => {
            callFunction(Memento.Functions.deleteCards, { deckId: deckId, cardIndices: [cardIndex], courseId: courseId });
            console.log(`Card deleted with index ${cardIndex}`);
            setVisible(false);
        })
    }

    return (
        <Modal testID={`${mode}_modal`} visible={visible} animationType='fade' onRequestClose={() => setVisible(false)}>
            <TView flex={1} p={20} backgroundColor='mantle'>
                <TScrollView>

                    <TView flexDirection="row" justifyContent="space-between" alignItems="center" mb={'lg'}>
                        {/* Close Button */}
                        <TTouchableOpacity flex={1} testID="closeButton" alignItems="flex-start" onPress={() => {
                            setVisible(false)
                        }}>
                            <Icon name="close" size={iconSizes.lg} color="blue" />
                        </TTouchableOpacity>

                        <TView justifyContent='center' alignItems='center'>
                            <TText bold size='lg' align='center'>Option</TText>
                        </TView>

                        {/* Top-Right Button */}
                        {mode == "Edit" ? <TTouchableOpacity
                            testID="topRightButton"
                            alignItems='flex-end'
                            flex={1}
                            onPress={() => {
                                if (specialDeleteCard) {
                                    specialDeleteCard();
                                    setVisible(false);
                                } else {
                                    deleteCard()
                                }
                            }}
                        >
                            <Icon name="trash" size={iconSizes.lg} color="red" />
                        </TTouchableOpacity> : <TView flex={1} />}
                    </TView>


                    <TView my='md' borderColor='crust' radius='lg'>
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
                            error={error_selected()}
                            multiline
                            numberOfLines={3}

                        />
                    </TView>

                    <TView my='md' mt={2} borderColor='crust' radius='lg'>
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

                    {/* Box for card.question */}
                    < TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">

                        <TText bold mb="sm">Question:</TText>
                        <RichText>{question}</RichText>

                    </TView>

                    {/* Box for card.answer */}
                    <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">

                        <TText bold mb="sm">Answer:</TText>
                        <RichText>{answer}</RichText>

                    </TView>
                </TScrollView>

                <FancyButton
                    testID={`${mode}CardButton`}
                    outlined
                    backgroundColor='blue'
                    textColor='blue'
                    mt={'md'} mb={'sm'}
                    icon='checkmark-outline'
                    onPress={() => {
                        if (mode === "Edit") {
                            updateCard(question, answer);
                        } else {
                            createCard();
                        }
                    }}
                    style={{ width: '50%', alignSelf: 'center' }}
                >
                    {mode} Card
                </FancyButton>
            </TView>
        </Modal>
    );
};

export default CreateDeleteEditCardModal;
