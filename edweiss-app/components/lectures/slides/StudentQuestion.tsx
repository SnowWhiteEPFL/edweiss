import Avatar from '@/components/Avatar';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, CollectionOf, Document } from '@/config/firebase';
import SyncStorage from '@/config/SyncStorage';
import ReactComponent from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStoredState } from '@/hooks/storage';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { Time } from '@/utils/time';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';


const StudentQuestion: ReactComponent<{ courseName: string, lectureId: string, questionsDoc: Document<LectureDisplay.Question>[] | undefined }> = ({ courseName, lectureId, questionsDoc }) => {
    const [question, setQuestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAnonym, setIsAnonym] = useState<boolean>(false);
    const { uid } = useAuth();

    const sortedQuestions = useDynamicDocs(CollectionOf<LectureDisplay.Question>(`courses/${courseName}/lectures/${lectureId}/questions`).orderBy("likes", "desc"));

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
            console.log(res.error);
            // Display feedback to the user when failure (empty question)
            Toast.show({
                type: 'error',
                text1: 'You were unable to send this message',
            });
        }
        setIsLoading(false);
    }

    const QuestionItem: React.FC<{
        question: Document<LectureDisplay.Question>;
        index: number;
    }> = ({ question, index }) => {
        const { text, anonym, userID, likes, username, postedTime, answered } = question.data;
        const isUser = uid == userID;
        const id = question.id;
        const likedStorageKey = `stquestion-${id}`;
        const [liked, setLiked] = useStoredState(likedStorageKey, false);
        const initialLiked = useMemo(() => SyncStorage.get(likedStorageKey) == true, []);

        // Function for updating a question with new like values
        async function toggleLike() {
            setLiked(liked => !liked);

            const res = await callFunction(LectureDisplay.Functions.likeQuestion, {
                courseId: courseName,
                lectureId: lectureId,
                id: id,
                liked: !liked
            });

            if (res.status == 0) {
                setLiked(initialLiked);
            }
        }
        const likeCount = Math.max(0, likes + (initialLiked == liked ? 0 : (liked ? 1 : -1)));

        return (
            <>
                {!answered && <TView key={index} mb={'sm'} backgroundColor='crust' borderColor='surface0' radius={'lg'} flex={1} flexDirection='column' mr={isUser ? 'md' : 'lg'} ml={isUser ? 'lg' : 'md'} style={{ right: isUser ? 0 : 10 }}>
                    <TView pt={'sm'} flexDirection='row' flexColumnGap={10} alignItems='center' radius={'lg'} mb={'sm'}>
                        <TView ml={'md'}>
                            <Avatar size={30} name={anonym ? undefined : username} uid={anonym ? undefined : userID} />
                        </TView>
                        <TView flex={1} flexDirection='row' alignItems='flex-end' justifyContent='space-between'>
                            <TText mb={'xs'} size={'sm'} pl={2} pt={'sm'}>{anonym ? "Anonymous" : username}</TText>
                            <TText size={'xs'}>{Time.agoTimestamp(postedTime)}</TText>
                        </TView>
                    </TView>
                    <TText pl={'md'}>
                        {text}
                    </TText>

                    <TTouchableOpacity mr={'md'} testID={`like-button-${index}`} onPress={toggleLike} flexDirection='row' justifyContent='flex-end' alignItems='center' flexColumnGap={8}>
                        <Icon name={liked ? 'heart' : 'heart-outline'} color='red' size={24} />
                        <TText color='red' size={'xs'} bold lineHeight={14}>{likeCount}</TText>
                    </TTouchableOpacity>
                </TView>}
            </>

        );
    }

    return (
        <>
            {/* Display existing questions */}
            {sortedQuestions ? (
                <For each={sortedQuestions}>
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
                            setIsLoading(true);
                            addQuestion(question);
                        }
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Icon size="xl" name="send-outline" color="text" />
                    )}
                </TTouchableOpacity>
                <TView flexDirection='row' justifyContent='center' style={{ position: 'absolute', right: 20, top: 0 }}>
                    <TText color='darkBlue' size={15}>Anonym ? </TText>
                    <TTouchableOpacity backgroundColor="transparent" onPress={() => { setIsAnonym(!isAnonym) }} pt={'xs'} testID={isAnonym ? "checkmark-circle-outline" : "ellipse-outline"}>
                        <Icon size="lg" name={isAnonym ? "checkmark-circle-outline" : "ellipse-outline"} color="darkBlue" />
                    </TTouchableOpacity>
                </TView>

            </TView>

        </>
    );
};


export default StudentQuestion;
