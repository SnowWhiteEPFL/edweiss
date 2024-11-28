import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

interface CustomDocument<T> {
    data: T;
}

const StudentQuestion: ReactComponent<{ courseName: string, lectureId: string, questionsDoc: CustomDocument<LectureDisplay.Question>[] | undefined }> = ({ courseName, lectureId, questionsDoc }) => {
    const [question, setQuestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(false);

    // Display each question given as parameters as a component 
    const renderQuestion = (question: string, anonym: boolean, userId: string, likes: number, key: React.Key) => (
        <TView key={key} mb={'sm'} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
            <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{anonym ? "Anonym" : userId}</TText>

            <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
                <TText ml={10} color='overlay0'>{question}</TText>

                <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' alignItems='flex-end'>
                    <TText color='text'>{likes}</TText>
                    <TTouchableOpacity backgroundColor='transparent' onPress={() => {
                        setIsLiked(!isLiked);
                    }}>
                        <Icon size={'md'} name={isLiked ? 'heart' : 'heart-outline'} color='text'></Icon>
                    </TTouchableOpacity>
                </TView>
            </TView>
        </TView>
    );

    // Function for adding new question into the firebase storage
    async function addQuestion(question: string) {
        try {
            const res = await callFunction(LectureDisplay.Functions.createQuestion, {
                courseId: courseName,
                lectureId: lectureId,
                question: question
            });
            setQuestion('');

            if (res.status) {
                // Display feedback to the user when success
                Toast.show({
                    type: 'success',
                    text1: 'Your comment was successfully added'
                });
            } else {
                // Display feedback to the user when failure
                Toast.show({
                    type: 'error',
                    text1: 'You were unable to send this message',
                });
            }
        } catch (error) {
            // Display feedback to the user when failing to add question
            Toast.show({
                type: 'error',
                text1: 'Your message submition encountered and error: ',
                text2: error instanceof Error ? error.message : JSON.stringify(error), // Include the error details
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {/* Display existing questions */}
            {questionsDoc ? questionsDoc.map((qDoc, index) =>
                renderQuestion(qDoc?.data.text, qDoc?.data.anonym, qDoc?.data.userID, qDoc?.data.likes, index)
            ) :
                <TText>No questions available</TText>}

            {/* Input for new question */}
            <TView>
                <FancyTextInput
                    value={question}
                    onChangeText={setQuestion}
                    mb="sm"
                    multiline
                    label="Ask your questions"
                    icon="chatbubbles-outline"
                    placeholder="Got something on your mind? Type away!"
                />
                <TTouchableOpacity
                    style={{ position: 'absolute', right: 20, bottom: 10, }}
                    backgroundColor="transparent"
                    onPress={() => {
                        if (!isLoading) {
                            addQuestion(question);
                            setIsLoading(true);
                        }
                    }}
                    pl="md"
                >
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Icon size="xl" name="send-outline" color="text" />
                    )}
                </TTouchableOpacity>
            </TView>
        </>
    );
};

export default StudentQuestion;


