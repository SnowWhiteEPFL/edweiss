import ReactComponent from '@/constants/Component';
import React from 'react';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import Memento from '@/model/memento';
import { mementoStatusColorMap, mementoStatusIconMap } from '@/utils/memento/utilsFunctions';
import { useEffect, useState } from 'react';
import Icon from '../core/Icon';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import RichText from '../core/rich-text/RichText';

/**
 * Card Display Component
 * 
 * @param {Memento.Card} card - Card object
 * 
 * @returns {ReactComponent} Card Display Component
 */
const CardDisplayComponent: ReactComponent<{
    card: Memento.Card
}> = ({ card }) => {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);

    // Reset the visibility state when the card changes
    useEffect(() => {
        setIsAnswerVisible(false);
    }, [card]);

    const handleToggleAnswer = () => {
        setIsAnswerVisible(prevState => !prevState);
    };

    return (
        <>
            {/* Box for card.question */}
            <TView testID='question_view' m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">
                <TView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <TText bold>Question:</TText>
                    <Icon
                        testID={`status_icon ${card.question}`}
                        name={mementoStatusIconMap[card.learning_status]}
                        color={mementoStatusColorMap[card.learning_status]}
                        size="lg"
                    />
                </TView>
                {/*<TText>{card.question}</TText>*/}
                <RichText>
                    {card.question}
                </RichText>
            </TView>

            {/* Box for card.answer */}
            <TTouchableOpacity testID='answerReveal' m="md" p="md" borderColor="crust" radius="lg" onPress={handleToggleAnswer}
                backgroundColor={isAnswerVisible ? 'transparent' : 'base'}
                style={{
                    borderWidth: 1
                }} >

                <TText bold mb="sm">Answer:</TText>
                <RichText>
                    {isAnswerVisible ? card.answer : 'Click to reveal the answer'}
                </RichText>

            </TTouchableOpacity>
        </>
    );
};

export default CardDisplayComponent;
