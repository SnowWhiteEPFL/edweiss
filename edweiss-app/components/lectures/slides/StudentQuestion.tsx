import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, Document } from '@/config/firebase';
import SyncStorage from '@/config/SyncStorage';
import ReactComponent from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import LectureDisplay from '@/model/lectures/lectureDoc';
import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';


const StudentQuestion: ReactComponent<{ courseName: string, lectureId: string, questionsDoc: Document<LectureDisplay.Question>[] | undefined }> = ({ courseName, lectureId, questionsDoc }) => {
    const [question, setQuestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAnonym, setIsAnonym] = useState<boolean>(false);
    const [enableDisplay, setEnableDisplay] = useState<boolean>(false);
    const { uid } = useAuth();

    // Function for adding new question into the firebase storage
    async function addQuestion(question: string) {
        const res = await callFunction(LectureDisplay.Functions.createQuestion, {
            courseId: courseName,
            lectureId: lectureId,
            question: question,
            anonym: isAnonym,
        });
        setQuestion('');
        if (res.status) {
            // Display feedback to the user when success
            Toast.show({
                type: 'success',
                text1: 'Your comment was successfully added'
            });
        } else {
            // Display feedback to the user when failure (empty question)
            Toast.show({
                type: 'error',
                text1: 'You were unable to send this message',
            });
        }
        setIsLoading(false);
    }

    // Function for updating a question with new like values
    async function likeQuestion(id: string, likes: number) {
        const res = await callFunction(LectureDisplay.Functions.likeQuestion, {
            courseId: courseName,
            lectureId: lectureId,
            id: id,
            likes: likes,
        });
        if (!res.status) {
            console.log(res.error)
            // Display feedback to the user when failure (empty question)
            Toast.show({
                type: 'error',
                text1: 'You were unable to like/unlike this message',
            });
        }
    }

    const QuestionItem: React.FC<{
        question: Document<LectureDisplay.Question>;
        index: number;
    }> = ({ question, index }) => {
        const { text, anonym, userID, likes, username } = question.data;
        const isUser = uid == userID;
        const id = question.id;

        return (
            <TView key={index} mb={'sm'} backgroundColor={isUser ? 'sapphire' : 'crust'} borderColor='surface0' radius={'lg'} flex={1} flexDirection='column' ml='sm' style={{ right: isUser ? 0 : 10 }}>
                <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{anonym ? "Anonym" : username}</TText>

                <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
                    <TText ml={10} color='overlay0'>{text}</TText>
                    <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' alignItems='flex-end'>
                        <TText color='text'>{likes}</TText>
                        {!isUser && <TTouchableOpacity testID={`like-button-${index}`} backgroundColor='transparent' onPress={() => {
                            if (SyncStorage.get(`stquestion-${id}`) !== undefined) {
                                SyncStorage.set(`stquestion-${id}`, !SyncStorage.get(`stquestion-${id}`));
                                if (SyncStorage.get(`stquestion-${id}`)) {
                                    console.log(SyncStorage.get(`stquestion-${id}`))
                                    likeQuestion(id, likes + 1);
                                } else {
                                    console.log(SyncStorage.get(`stquestion-${id}`))
                                    likeQuestion(id, likes - 1);
                                }
                            } else {
                                SyncStorage.set(`stquestion-${id}`, true);
                            }
                        }}>
                            <Icon size={'md'} name={SyncStorage.get(`stquestion-${id}`) === undefined || !SyncStorage.get(`stquestion-${id}`) ? 'heart-outline' : 'heart'} color='text'></Icon>
                        </TTouchableOpacity>}
                    </TView>
                </TView>
            </TView>
        );
    }

    return (
        <>
            {/* Display existing questions */}
            {questionsDoc ? (
                <For each={questionsDoc}>
                    {(question, index) => <QuestionItem question={question} index={index} />}
                </For>
            ) : (
                <TText>No questions available</TText>
            )}

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
                <TTouchableOpacity backgroundColor="transparent" style={{ position: 'absolute', right: 20, bottom: 10, }} pl="md" testID="send-button"
                    onPress={() => {
                        if (!isLoading) {
                            addQuestion(question);
                            setIsLoading(true);
                        }
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Icon size="xl" name="send-outline" color="text" />
                    )}
                </TTouchableOpacity>
                <TTouchableOpacity style={{ position: 'absolute', right: 20, bottom: 60, }} backgroundColor="transparent" onPress={() => { setEnableDisplay(!enableDisplay) }} pl="md" testID='person-circle-outline'>
                    <Icon size="xl" name="person-circle-outline" color="text" />
                </TTouchableOpacity>

            </TView>

            {/* Overlay for anonimity and username configuration */}
            {enableDisplay && (
                <TView radius={'lg'} flex={1} justifyContent='center' style={{ position: 'absolute', bottom: 0, right: 0, left: 0 }} backgroundColor='overlay0' pt={"md"} pb={"sm"} mr={"md"} ml={"md"} mb={"md"}>

                    <TView flexDirection='row' justifyContent='center'>
                        <TText color='cherry'>Anonym ? </TText>
                        <TTouchableOpacity backgroundColor="transparent" onPress={() => { setIsAnonym(!isAnonym) }} pl="md" testID={isAnonym ? "checkmark-circle-outline" : "ellipse-outline"}>
                            <Icon size="xl" name={isAnonym ? "checkmark-circle-outline" : "ellipse-outline"} color="cherry" />
                        </TTouchableOpacity>
                    </TView>

                    <TTouchableOpacity style={{ position: 'absolute', top: 0, right: 0 }} onPress={() => { setEnableDisplay(!enableDisplay) }}>
                        <Icon size="lg" name="close-circle-outline" color="red" />
                    </TTouchableOpacity>

                </TView>)}
        </>
    );
};


export default StudentQuestion;
