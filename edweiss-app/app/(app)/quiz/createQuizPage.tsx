import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import ProgressPopup, { useProgressPopup } from '@/components/animations/ProgressPopup';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import ModalContainer, { ModalContainerScrollView } from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import RadioSelectables, { RadioSelectable } from '@/components/input/RadioSelectables';
import { MCQResultDisplay, TFResultDisplay } from '@/components/quiz/QuizComponents';
import SelectMaterialForQuizModal from '@/components/quiz/selectMaterialForQuiz';
import { callFunction } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { addAssignmentAction } from '@/utils/courses/coursesActionsFunctions';
import { Time } from '@/utils/time';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Redirect, router } from 'expo-router';
import { t } from 'i18next';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';

export const CreateQuizPageSignature: ApplicationRouteSignature<{
	courseId: string,
	previousQuizName: string,
	previousDueDate: Date | undefined
}> = {
	path: "/(app)/quiz/createQuizPage"
}

const CreateQuizPage: ApplicationRoute = () => {

	const { courseId, previousQuizName, previousDueDate } = useRouteParameters(CreateQuizPageSignature)
	const { uid } = useAuth()
	const { user } = useUser()
	const [exercises, setExercises] = useState<Quizzes.Exercise[]>([]);
	const [quizName, setQuizName] = useState<string>(previousQuizName == undefined ? "" : previousQuizName);
	const [dueDate, setDueDate] = useState<Date | undefined>(previousDueDate == undefined ? undefined : new Date(previousDueDate));
	const [aiLoading, setAiLoading] = useState(false);
	const handle = useProgressPopup();


	const addModalRef = useRef<BottomSheetModal>(null);
	const publishQuizModalRef = useRef<BottomSheetModal>(null);
	const selectMaterialModalRef = useRef<BottomSheetModal>(null);


	useEffect(() => {

		console.log(JSON.stringify(exercises))
		console.log(courseId)
	}, [exercises]);

	if (user.type == 'student') {
		return (<Redirect href='/' />)
	}
	console.log("course id : " + courseId)
	//console.log(isTemp)

	function addToExerciseList(exercise: Quizzes.Exercise) {

		setExercises(exercises => {
			const newList = [...exercises];
			newList.push(exercise)
			return newList;
		});
	}
	function editExercise(exercise: Quizzes.Exercise, index: number) {
		setExercises((exercises) =>
			exercises.map((thisExo, i) =>
				i === index ? exercise : thisExo
			)
		)
	}
	function removeExerciseFromList(index: number) {
		setExercises((exos) =>
			exos.filter((_, i) => i !== index)
		);
	}


	function checkQuizParams(): boolean {
		if (exercises.length <= 0) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:empty_quiz`),
			});
			return false;
		}

		if (dueDate == undefined || Time.wasYesterday(dueDate)) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:date_invalid`),
			});
			return false;
		}
		if (quizName == "") {
			Toast.show({
				type: 'error',
				text1: t(`quiz:quiz_name_empty`),
			});
			return false;
		}


		return true

	}

	function controlPublishModal() {
		if (checkQuizParams()) {

			publishQuizModalRef.current?.present()

			return;
		}
		else {
			return;
		}
	}

	async function publishQuiz() {

		if (!checkQuizParams()) { return }
		if (dueDate == undefined) { // should not happen with check
			return;
		}
		const answers = exercises.map(exercise => {
			if (exercise.type == "MCQ") {
				const answer: QuizzesAttempts.MCQAnswersIndices = { type: "MCQAnswersIndices", value: exercise.answersIndices }
				return answer;
			}
			else { // if exercise is TF
				const answer: QuizzesAttempts.TFAnswer = { type: "TFAnswer", value: exercise.answer }
				return answer;
			}
		})
		const newQuiz: Quizzes.Quiz = {
			exercises: exercises,
			dueDate: Time.fromDate(dueDate),
			name: quizName,
			ended: false,
			showResultToStudents: false,
			type: "quiz",
			answers: answers

		}

		const res = await callFunction(Quizzes.Functions.createQuiz, { quiz: newQuiz, courseId: courseId, });

		if (res.status === 1) {
			console.log(`OKAY, submitted quiz with id ${res.data.id}`);
			const notif = await addAssignmentAction(courseId, newQuiz)
			if (notif.status === 1) {
				console.log("Assignment action submitted")
			}
			else {
				console.log(notif.error.message)
			}
		} else {
			console.log(`Error while submitting attempt`);
		}
	}
	if (exercises.length <= 0) {
		return (
			<>
				<TView flexDirection='column' justifyContent='center' flexRowGap={'xl'} mb={'xl'}>
					<TView>
						<NameAndDateCustom
							dueDate={dueDate}
							quizName={quizName}
						/>
					</TView>

					<TText color='subtext0' align='center'>
						{t('quiz:quiz_creation.no_exercise_warning')}
					</TText>
				</TView>
				<FancyButton style={{ borderWidth: 0 }} outlined icon='add' backgroundColor='blue' onPress={() => addModalRef.current?.present()}> Add exercise</FancyButton>
				<GenerateAiButton aiLoading={aiLoading} modalRef={selectMaterialModalRef} />
				<AddExerciseModal modalRef={addModalRef} updateExerciseList={addToExerciseList} />
				<SelectMaterialForQuizModal modalRef={selectMaterialModalRef} addToExerciseList={addToExerciseList} courseId={courseId} handle={handle} />
				<ProgressPopup handle={handle} />

			</>

		)
	}
	return (
		<>
			<NameAndDateCustom
				dueDate={dueDate}
				quizName={quizName}
			/>

			<TScrollView>

				<For each={exercises}>{
					(exercise, index) => {
						return (<>
							<PressableExercise index={index} editExercise={editExercise} removeExerciseFromList={removeExerciseFromList} exercise={exercise} key={exercise.question} />
						</>)
					}
				}
				</For>
				<FancyButton style={{ borderWidth: 0 }} outlined icon='add' backgroundColor='blue' onPress={() => addModalRef.current?.present()} > Add exercise</FancyButton>
				<GenerateAiButton aiLoading={aiLoading} modalRef={selectMaterialModalRef} />

				<TTouchableOpacity onPress={() => controlPublishModal()} ml='xl' mr='xl' py='md' px='xl' style={{ borderWidth: 0 }} backgroundColor='transparent' >
					<TView flexDirection='row' justifyContent='center'>
						<Icon name='cloud-done-sharp' size='xl' color='blue' />

						<TText size='md' ml='md' color='blue'>
							Publish quiz
						</TText>
					</TView>

				</TTouchableOpacity>

			</TScrollView>

			<AddExerciseModal modalRef={addModalRef} updateExerciseList={addToExerciseList} />
			<PublishQuizModal modalRef={publishQuizModalRef} quizName={quizName} dueDate={dueDate == undefined ? "undefined" : dueDate.toDateString()} numberOfExercises={exercises.length} publishQuiz={publishQuiz} />
			<SelectMaterialForQuizModal modalRef={selectMaterialModalRef} addToExerciseList={addToExerciseList} courseId={courseId} handle={handle} />
			<ProgressPopup handle={handle} />

		</>

	);
};
export default CreateQuizPage;


export const NameAndDateCustom: ReactComponent<{ dueDate: Date | undefined, quizName: string, }> = ({ dueDate, quizName }) => {
	return (<>
		<RouteHeader title='Create a new quiz' />

		<TView ml={'md'} radius={'sm'} p={'xs'} mb={'xs'} flexDirection='row' flexColumnGap='md' alignItems='center' justifyContent='center'>
			<Icon name='text' />
			<TText bold>
				{quizName}
			</TText>
		</TView>

		<TView ml={'md'} flexDirection='row' flexColumnGap='md' alignItems='center' justifyContent='center'>
			<Icon name='time-sharp' />
			<TText > Due date :
			</TText>

			<TView flexDirection='row' flexColumnGap={'md'}>
				<TView backgroundColor='crust' radius={'sm'} p={'xs'}>
					<TText bold>
						{dateToStringWithTime(dueDate)[0]}
					</TText>

				</TView>
				<TView backgroundColor='crust' radius={'sm'} p={'xs'}>
					<TText bold>
						{dateToStringWithTime(dueDate)[1]}
					</TText>
				</TView>
			</TView>

		</TView>
	</>

	);
};

function dateToStringWithTime(date: Date | undefined): string[] {
	if (date == undefined) {
		return ["undefined", "undefined"];
	}
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		return ["error", "error"];
	}

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = date.getFullYear();

	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return [`${day}/${month}/${year}`, ` ${hours}:${minutes}:${seconds}`];
}

export const GenerateAiButton: ReactComponent<{ aiLoading: boolean, modalRef: RefObject<BottomSheetModalMethods> }> = ({ aiLoading, modalRef, }) => {
	return (<>
		<FancyButton icon='sparkles' loading={aiLoading} mt={10} mb={10} backgroundColor='green' outlined style={{ borderWidth: 0 }} onPress={() => modalRef.current?.present()}>
			Generate with AI
		</FancyButton>

	</>

	);
};

export function fillMCQFromGeneratedFields(
	question: string,
	propositions: {
		text: string;
		correct: boolean;
	}[]): Quizzes.Exercise {

	if (propositions.length == 2) {
		const formattedTF: Quizzes.TF = {
			question: question,
			answer: propositions[0].correct, // proposition[0] always corresponds to True => its boolean dictates correctness
			type: 'TF'
		}
		return formattedTF;
	}
	else {
		const formattedPropositions: Quizzes.MCQProposition[] = propositions.map((proposition, index) => {
			return {
				description: proposition.text,
				id: index,
				type: "MCQProposition"
			}
		});
		const answersIndices: number[] = propositions.map((proposition, index) => {
			return proposition.correct ? index : -1
		}).filter(index => index !== -1);

		const formattedMCQ: Quizzes.MCQ = {
			answersIndices: answersIndices,
			numberOfAnswers: answersIndices.length,
			propositions: formattedPropositions,
			question: question,
			type: "MCQ"
		}
		return formattedMCQ;
	}


}




export const PressableExercise: ReactComponent<{ exercise: Quizzes.Exercise, editExercise: (exercise: Quizzes.Exercise, index: number) => void, removeExerciseFromList: (index: number) => void, index: number, }> = ({ exercise, editExercise, index, removeExerciseFromList }) => {
	const editModalRef = useRef<BottomSheetModal>(null);
	const secondModalRef = useRef<BottomSheetModal>(null);
	return (<>
		<TTouchableOpacity onLongPress={() => { console.log("in pressable : " + exercise.question); editModalRef.current?.present() }}>
			{exercise.type == "MCQ" ? <MCQResultDisplay exercise={exercise} results={exercise.answersIndices} selectedIds={exercise.answersIndices}></MCQResultDisplay> : <TFResultDisplay selected={exercise.answer} exercise={exercise as Quizzes.TF} result={exercise.answer}></TFResultDisplay>}
		</TTouchableOpacity>
		<EditExerciseModal
			exercise={exercise}
			removeExerciseFromList={removeExerciseFromList}
			editExercise={editExercise}
			index={index}
			modalRef={editModalRef}
			secondModalRef={secondModalRef} />

	</>
	);
};

export const PublishQuizModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, quizName: string, dueDate: string, numberOfExercises: number, publishQuiz: () => void }> = (props) => {
	return (
		<ModalContainer modalRef={props.modalRef}>
			<TView m='md' mb='md'>

				<TView backgroundColor='base' radius={'lg'} mb='md' p='md' flexDirection='row' flexColumnGap='xl' alignItems='center'>
					<Icon name='warning-sharp' color='red' size='xl' />
					<TText color='red' style={{ flex: 1 }} size='md' align='left' lineHeight={24}>
						{t('quiz:quiz_creation.are_you_sure')}
					</TText>
				</TView>

				<TText size='md' mb='md'>
					Name of the quiz : {props.quizName}
				</TText>
				<TText size='md' mb='md'>
					Due date : {props.dueDate}
				</TText>
				<TText size='md'>
					Number of exercises : {props.numberOfExercises}
				</TText>

			</TView>
			<FancyButton mb='sm' onPress={() => { props.publishQuiz(); props.modalRef.current?.close(); router.back() }}> Confirm </FancyButton>

		</ModalContainer>
	);
};

export const PublishLectureQuizModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, publishLectureQuiz: () => void }> = (props) => {
	return (
		<ModalContainer modalRef={props.modalRef}>
			<TView>
				<TView backgroundColor='base' radius={'lg'} mb='md' p='md' flexDirection='row' flexColumnGap='xl' alignItems='center'>
					<Icon name='warning-sharp' color='red' size='xl' />
					<TText color='red' style={{ flex: 1 }} size='md' align='left' lineHeight={24}>
						{t('quiz:quiz_creation.are_you_sure')}
					</TText>
				</TView>

				<FancyButton onPress={() => { props.publishLectureQuiz(); props.modalRef.current?.close(); router.back() }}> Confirm </FancyButton>
			</TView>
		</ModalContainer>
	);
};

export const AddExerciseModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, updateExerciseList: (exercise: Quizzes.Exercise) => void }> = (props) => {
	const [isMCQ, setIsMCQ] = useState<boolean>(true);

	return (

		<ModalContainerScrollView disabledDynamicSizing snapPoints={isMCQ ? ['80%'] : ['50%']} modalRef={props.modalRef}>

			<TView mb='lg' flexDirection='row' flexColumnGap='sm' >
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(true)} textColor={isMCQ ? "crust" : "surface2"} backgroundColor={isMCQ ? "blue" : "base"} icon='checkbox-sharp'> {t('quiz:quiz_display.mcq')} </FancyButton>

				</TView>
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(false)} textColor={!isMCQ ? "crust" : "surface2"} backgroundColor={!isMCQ ? "blue" : "base"} icon='radio-button-on-sharp'> {t('quiz:quiz_display.tf')} </FancyButton>
				</TView>

			</TView>
			<TScrollView>
				{isMCQ ? <MCQFields modalRef={props.modalRef} addToExerciseList={props.updateExerciseList}></MCQFields> : <TFFields modalRef={props.modalRef} addToExerciseList={props.updateExerciseList}></TFFields>}
			</TScrollView>

		</ModalContainerScrollView>

	);

};
export const EditExerciseModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, secondModalRef: RefObject<BottomSheetModalMethods>, exercise: Quizzes.Exercise, editExercise: (exercise: Quizzes.Exercise, index: number) => void, removeExerciseFromList: (index: number) => void, index: number }> = (props) => {

	return (<>
		<ModalContainerScrollView modalRef={props.modalRef}>

			<TView flexDirection='row' flexColumnGap={"xl"} mb='md' mx={'lg'}>
				<TTouchableOpacity flex={1} radius={'lg'} p={"sm"} backgroundColor='base' flexDirection='row' flexColumnGap='sm' justifyContent='center' alignItems='center' onPress={() => props.removeExerciseFromList(props.index)}>
					<TView >
						<Icon name='trash-bin-sharp' color='red' size='xl' />

					</TView>
					<TView>
						<TText color='red' size='lg'>
							{t('quiz:quiz_creation.delete')}
						</TText>
					</TView>

				</TTouchableOpacity>
				<TTouchableOpacity flex={1} radius={"lg"} p={"sm"} backgroundColor='base' flexDirection='row' flexColumnGap='sm' justifyContent='center' alignItems='center' onPress={() => {
					props.secondModalRef.current?.present();
					props.modalRef.current?.close();
				}}>

					<TView>
						<Icon name='pencil-sharp' color='blue' size='xl' />

					</TView>
					<TView>
						<TText color='blue' size='lg'>
							{t('quiz:quiz_creation.edit')}
						</TText>
					</TView>
				</TTouchableOpacity>

			</TView>

			<EditSecondModal modalRef={props.secondModalRef} editExercise={props.editExercise} exercise={props.exercise} index={props.index}></EditSecondModal>

		</ModalContainerScrollView>
	</>


	);

};

export const EditSecondModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, editExercise: (exercise: Quizzes.Exercise, index: number) => void, exercise: Quizzes.Exercise, index: number }> = (props) => {
	const previousQuestion = props.exercise.question
	if (props.exercise.type == "MCQ") {
		const previousPropositions: [string, boolean][] = [];
		const answers = props.exercise.answersIndices
		props.exercise.propositions.forEach((proposition, index) => {
			previousPropositions.push([proposition.description, answers.find(element => element == index) != undefined])
		})
		return (
			<ModalContainerScrollView modalRef={props.modalRef}>
				<TScrollView>
					<MCQFields modalRef={props.modalRef} editExercise={props.editExercise} previousQuestion={previousQuestion} previousPropositions={previousPropositions} index={props.index}></MCQFields>
				</TScrollView>
			</ModalContainerScrollView>

		);
	}
	else {

		return (
			<ModalContainerScrollView modalRef={props.modalRef}>
				<TScrollView>
					<TFFields modalRef={props.modalRef} previousQuestion={previousQuestion} previousBoolean={props.exercise.answer} editExercise={props.editExercise} index={props.index}></TFFields>
				</TScrollView>
			</ModalContainerScrollView>

		);
	}


};
export const MCQFields: ReactComponent<{ addToExerciseList?: (exercise: Quizzes.Exercise) => void, editExercise?: (exercise: Quizzes.Exercise, index: number) => void, modalRef?: RefObject<BottomSheetModalMethods>, previousPropositions?: [string, boolean][], previousQuestion?: string, index?: number }> = (props) => {
	const [question, setQuestion] = useState<string>(props.previousQuestion == undefined ? "" : props.previousQuestion);
	const [propositions, setPropositions] = useState<[string, boolean][]>(props.previousPropositions == undefined ? [] : props.previousPropositions);
	const [questionError, setQuestionError] = useState<string | undefined>(undefined);

	function handleQuestionInputError(text: string) {
		if (text.length == 0) {
			setQuestionError("Please write a question")
		}
		else {
			setQuestionError(undefined)
		}

	}

	function addNewProposition() {
		if (propositions.length >= 6) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:max_propositions`),
			});
			return;
		}
		setPropositions(propositions => {
			const newPropositions = [...propositions];
			newPropositions.push(["", false])
			return newPropositions;
		});
	}

	function changeProposition(index: number, description: string, isCorrect: boolean) {

		setPropositions((propositions) =>
			propositions.map((proposition, i) =>
				i === index ? [description, isCorrect] : proposition
			)
		);
	}

	function removeProposition(index: number) {
		setPropositions((propositions) =>
			propositions.filter((_, i) => i !== index)
		);
	}

	function addToQuiz() {
		if (question == "") {
			// Toast.show({
			// 	type: 'error',
			// 	text1: t(`quiz:empty_question`),
			// });
			setQuestionError("Please write a question")
			return;
		}
		if (propositions.length <= 1) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:not_enough_propositions`),
			});
			return;
		}
		if (propositions.filter(proposition => proposition[0] == "").length >= 1) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:empty_propositions`),
			});
			return;
		}
		if (propositions.filter(proposition => proposition[1] == true).length < 1) {
			Toast.show({
				type: 'error',
				text1: t(`quiz:not_enough_correct`),
			});
			return;
		}

		const answersIndices: number[] = [];

		propositions.forEach((proposition, index) => {
			if (proposition[1])
				answersIndices.push(index);
		});

		const exercise: Quizzes.MCQ = {
			answersIndices,
			question,
			type: 'MCQ',
			numberOfAnswers: answersIndices.length,
			propositions: propositions.map((propo, index) => {
				const actualProp: Quizzes.MCQProposition = { description: propo[0], id: index, type: 'MCQProposition' }
				return actualProp;
			})
		}
		if (props.addToExerciseList != undefined) { // case where we add a new exercise
			props.addToExerciseList(exercise)
		}
		else if (props.editExercise != undefined && props.index != undefined) { // case where we are editing an exercise
			props.editExercise(exercise, props.index)
		}

		props.modalRef?.current?.close()
	}

	return (<>
		<TView mb='sm'>

			<FancyTextInput placeholder={"Which are correct?"} icon='text' value={question} onChangeText={(text) => { setQuestion(text); handleQuestionInputError(text) }} label='Question' mb='sm' error={questionError}></FancyTextInput>
			{
				propositions.length == 0 ?
					<TText align='center' mb='xl' mt='xl' color='subtext0'> {t('quiz:quiz_creation.no_option')}</TText> :
					<For each={propositions}>{
						(proposition, index) => {
							return (<PropositionField proposition={proposition} changeProposition={changeProposition} removeProposition={removeProposition} key={index} index={index} previousProposition={props.previousPropositions == undefined ? undefined : props.previousPropositions[index]} />)
						}
					}

					</For>
			}
			<FancyButton style={{ borderWidth: 0 }} onPress={() => addNewProposition()} icon='add-sharp' outlined> {t('quiz:quiz_creation.add_new_proposition')}</FancyButton>
		</TView>
		<FancyButton style={{ borderWidth: 0 }} onPress={() => addToQuiz()} icon='save-sharp' outlined> {t('quiz:quiz_creation.save')}</FancyButton>
	</>


	);
};

const PropositionField: ReactComponent<{ proposition: [string, boolean], changeProposition: (index: number, description: string, isCorrect: boolean) => void, index: number, removeProposition: (index: number) => void, previousProposition?: [string, boolean] | undefined }> = (props) => {

	function toggleCorrect() {
		props.changeProposition(props.index, props.proposition[0], !props.proposition[1])
	}
	function changeDescription(newText: string) {
		props.changeProposition(props.index, newText, props.proposition[1])
	}
	return (
		<TView mb='xs' flexDirection='row' alignItems='center' flexColumnGap='md'>
			<TView>
				<TTouchableOpacity mx={8} backgroundColor='transparent' onPress={() => toggleCorrect()}>
					<Icon size='xl' name='checkmark-circle-sharp' color={props.proposition[1] ? 'green' : 'surface0'}></Icon>
				</TTouchableOpacity>
			</TView>
			<TView flex={1} >
				<FancyTextInput mx={0} placeholder={"Write your proposition"} label='Proposition' onChangeText={changeDescription} value={props.proposition[0]} />
			</TView>

			<TView>
				<FancyButton mx={8} style={{ borderWidth: 0 }} onPress={() => props.removeProposition(props.index)} icon='trash-bin-sharp' backgroundColor='red' outlined />
			</TView>
		</TView>
	);
};


export const TFFields: ReactComponent<{ editExercise?: (exercise: Quizzes.Exercise, index: number) => void, addToExerciseList?: (exercise: Quizzes.Exercise) => void, modalRef?: RefObject<BottomSheetModalMethods>, previousQuestion?: string, previousBoolean?: boolean, index?: number }> = (props) => {
	const [question, setQuestion] = useState<string>(props.previousQuestion == undefined ? "" : props.previousQuestion);
	const [answer, setAnswer] = useState<boolean>(props.previousBoolean == undefined ? true : props.previousBoolean);
	const [questionError, setQuestionError] = useState<string | undefined>(undefined);
	const placeHolder = props.previousQuestion == undefined ? 'Is the earth flat?' : props.previousQuestion

	function handleQuestionInputError(text: string) {
		if (text.length == 0) {
			setQuestionError("Please write a question")
		}
		else {
			setQuestionError(undefined)
		}

	}

	const trueSelectable: RadioSelectable<boolean> = {
		label: "True",
		value: true,
	}
	const falseSelectable: RadioSelectable<boolean> = {
		label: "False",
		value: false,
	}


	function addToQuiz() {
		if (question.length == 0) {
			setQuestionError("Please write a question")

			return;
		}
		const exercise: Quizzes.TF = {
			answer: answer,
			question: question,
			type: 'TF'
		}
		if (props.addToExerciseList != undefined) { // case where we add a new exercise
			props.addToExerciseList(exercise)
		}
		else if (props.editExercise != undefined && props.index != undefined) { // case where we are editing an exercise
			props.editExercise(exercise, props.index)
		}
		props.modalRef?.current?.close()
	}


	return (
		<TView >

			<FancyTextInput placeholder={placeHolder} error={questionError} icon='text' onChangeText={(text) => { setQuestion(text); handleQuestionInputError(text) }} label='Question' mb='lg' />
			<TView ml='md' mb='md'>
				<RadioSelectables data={[trueSelectable, falseSelectable]} onSelection={(value) => {
					setAnswer(value)
				}} value={answer} />
			</TView>

			<FancyButton style={{ borderWidth: 0 }} onPress={() => addToQuiz()} icon='save-sharp' outlined> {t('quiz:quiz_creation.save')}</FancyButton>

		</TView>
	);
};


