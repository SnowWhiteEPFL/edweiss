import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { t } from 'i18next';
import { useState } from 'react';

interface CustomDocument<T> {
    data: T;
}

const StudentQuestion: ReactComponent<{ courseName: string, lectureId: string, questionsDoc: CustomDocument<LectureDisplay.Question>[] | undefined }> = ({ courseName, lectureId, questionsDoc }) => {
    const [question, setQuestion] = useState<string>('');

    // Display each question given as parameters as a component 
    const renderQuestion = (question: string, key: React.Key) => (
        <TView key={key} mb={'sm'} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
            <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`showtime:peer_question`)}</TText>
            <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='flex-start' alignItems='center'>
                <TText ml={10} color='overlay0'>{question}</TText>
            </TView>
        </TView>
    );

    // Function for adding new question into the firebase storage
    async function addQuestion(question: string) {
        try {
            await callFunction(LectureDisplay.Functions.createQuestion, {
                courseId: courseName,
                lectureId: lectureId,
                question: question
            });
        } catch (error) {
            console.error("Error creating question:", error);
        }
        setQuestion('');
    }

    return (
        <>
            {/* Questions Display */}
            {questionsDoc?.map((question, index) => renderQuestion(question?.data.text, index))}

            {/* Enter Your Question */}
            <TView>
                <FancyTextInput value={question} onChangeText={n => { setQuestion(n) }} mb={'sm'} multiline label='Ask your questions' icon='chatbubbles-outline' placeholder='Got something on your mind? Type away!' />
                <TTouchableOpacity style={{ position: 'absolute', right: 20, bottom: 10 }} backgroundColor='transparent' onPress={() => addQuestion(question)} pl={'md'}>
                    <Icon size={'xl'} name='send-outline' color='text'></Icon>
                </TTouchableOpacity>
            </TView>

        </>)
};

export default StudentQuestion;


