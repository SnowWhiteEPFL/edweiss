import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzes, QuizzesAttempts } from '@/model/quizzes';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { MCQFields, PublishLectureQuizModal, TFFields } from './createQuizPage';

const CreateLectureQuizPage: ApplicationRoute = () => {

	const { courseId, lectureId } = useLocalSearchParams()
	const { uid } = useAuth()
	const [exercise, setExercise] = useState<Quizzes.Exercise | undefined>(undefined);
	const [isMCQ, setIsMCQ] = useState<boolean>(false);

	const publishLectureQuizModalRef = useRef<BottomSheetModal>(null);


	async function updateExerciseList(exercise: Quizzes.Exercise) {
		setExercise(exercise)
	}

	async function checkUserType() {
		const thisUser = await getDocument(Collections.users, uid);

		if (thisUser?.data.type != "professor") {
			return <TText> You are not authorized to create a quiz. </TText>;
		}
	}
	checkUserType()

	function controlPublishLectureQuiz() {
		if (exercise == undefined) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:empty_quiz`),
			});
			return false
		}
		publishLectureQuizModalRef.current?.present()
		return true
	}

	async function publishLectureQuiz() {

		if (!controlPublishLectureQuiz()) {
			return;
		}
		if (exercise == undefined) {
			return;
		}
		console.log("inside publish lecture quiz")

		const answer: QuizzesAttempts.Answer =
			exercise.type == "MCQ" ?
				{ type: "MCQAnswersIndices", value: exercise.answersIndices } : { type: "TFAnswer", value: exercise.answer }

		const newQuiz: LectureQuizzes.LectureQuiz = {
			exercise: exercise,
			ended: false,
			showResultToStudents: false,
			answer: answer

		}

		const newLectureQuiz: LectureDisplay.QuizLectureEvent = {
			done: false,
			pageNumber: 1,
			quizModel: newQuiz,
			type: "quiz"
		}

		const res = await callFunction(Quizzes.Functions.createLectureQuiz, { lectureQuiz: newLectureQuiz, courseId: courseId, lectureId: lectureId });

		console.log(res)
		if (res.status === 1) {
			console.log(`OKAY, submitted quiz with id ${res.data.id}`);
		} else {
			console.log(res.error);
		}
	}

	return (
		<>
			<RouteHeader title='New lecture quiz' />

			<TView mb='lg' flexDirection='row' flexColumnGap='sm' >
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(true)} backgroundColor={isMCQ ? "blue" : "base"} icon='checkbox-sharp'> MCQ </FancyButton>

				</TView>
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(false)} backgroundColor={!isMCQ ? "blue" : "base"} icon='radio-button-on-sharp'> True-False </FancyButton>
				</TView>

			</TView>
			<TScrollView>
				{isMCQ ? <MCQFields addToExerciseList={updateExerciseList}></MCQFields> : <TFFields addToExerciseList={updateExerciseList}></TFFields>}
			</TScrollView>
			<FancyButton onPress={() => controlPublishLectureQuiz()}> Publish lecture quiz </FancyButton>
			<PublishLectureQuizModal modalRef={publishLectureQuizModalRef} publishLectureQuiz={publishLectureQuiz} />

		</>
	);
};

export default CreateLectureQuizPage;
