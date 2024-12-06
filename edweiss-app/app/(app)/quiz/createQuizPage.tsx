import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

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
import { callFunction, Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { Time } from '@/utils/time';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';


const CreateQuizPage: ApplicationRoute = () => {

	const { courseId } = useLocalSearchParams()
	const { uid } = useAuth()
	const [exercises, setExercises] = useState<Quizzes.Exercise[]>([]);
	const [quizName, setQuizName] = useState<string>("");
	const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
	const [showDate, setShowDate] = useState<boolean>(false);
	const [showTime, setShowTime] = useState<boolean>(false);


	const addModalRef = useRef<BottomSheetModal>(null);
	const publishQuizModalRef = useRef<BottomSheetModal>(null);

	useEffect(() => {

		console.log(JSON.stringify(exercises))
	}, [exercises]);

	async function checkUserType() {
		const thisUser = await getDocument(Collections.users, uid);

		if (thisUser?.data.type != "professor") {
			return <TText> You are not authorized to create a quiz. </TText>;
		}
	}
	checkUserType()
	console.log("course id : " + courseId)
	//console.log(isTemp)



	const onChangeDate = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDueDate(selectedDate);
			setShowDate(false);
		}
	};

	const onChangeTime = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDueDate(selectedDate);
			setShowTime(false);
		}
	};






	function addToExerciseList(exercise: Quizzes.Exercise) {
		//console.log(JSON.stringify(exercise))
		//setExercises(exercises.concat([exercise]))
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

	// function checkExerciseNumber() {
	// 	console.log(exercises.length)
	// 	if (isTemporary && exercises.length >= 1) {
	// 		Toast.show({
	// 			type: 'error',
	// 			text1: t(`quiz:too_much_exercises_temp`),
	// 		});
	// 		return false;
	// 	}
	// 	return true
	// }

	// function controlAddModal() {
	// 	if (checkExerciseNumber()) {
	// 		addModalRef.current?.present()
	// 	}
	// }
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
		} else {
			console.log(`Error while submitting attempt`);
		}
	}




	if (exercises.length <= 0) {
		return (
			<>

				<NameAndDateCustom dueDate={dueDate} onChangeDate={onChangeDate} onChangeTime={onChangeTime} setQuizName={setQuizName} setShowDate={setShowDate} setShowTime={setShowTime} showDate={showDate} showTime={showTime}></NameAndDateCustom>

				<TText ml='xl' mb='xl'>
					Quiz does not have any exercise yet.
				</TText>

				<FancyButton icon='add' backgroundColor='blue' onPress={() => addModalRef.current?.present()} ></FancyButton>
				<AddExerciseModal modalRef={addModalRef} updateExerciseList={addToExerciseList}></AddExerciseModal>
			</>

		)
	}
	return (
		<>

			<NameAndDateCustom dueDate={dueDate} onChangeDate={onChangeDate} onChangeTime={onChangeTime} setQuizName={setQuizName} setShowDate={setShowDate} setShowTime={setShowTime} showDate={showDate} showTime={showTime}></NameAndDateCustom>

			<TScrollView>

				<For each={exercises}>{
					(exercise, index) => {
						return (<>
							<PressableExercise index={index} editExercise={editExercise} removeExerciseFromList={removeExerciseFromList} exercise={exercise} key={index}></PressableExercise>
						</>)
					}
				}
				</For>

			</TScrollView>
			<FancyButton style={{ borderWidth: 0 }} outlined icon='add' backgroundColor='blue' onPress={() => addModalRef.current?.present()} > Add new exercise</FancyButton>
			{/* <FancyButton onPress={() => controlPublishModal()} icon='cloud-done-sharp'> Publish quiz </FancyButton > */}
			<TTouchableOpacity onPress={() => controlPublishModal()} ml='xl' mr='xl' py='md' m='lg' px='xl' style={{ borderWidth: 0 }} backgroundColor='blue' radius='lg' >
				<TView flexDirection='row' flexColumnGap='md'>
					<Icon name='cloud-done-sharp' size='xl' color='surface0' />

					<TText size='lg' ml='md' color='surface0'>
						Publish quiz
					</TText>
				</TView>

			</TTouchableOpacity>
			<AddExerciseModal modalRef={addModalRef} updateExerciseList={addToExerciseList} />
			<PublishQuizModal modalRef={publishQuizModalRef} quizName={quizName} dueDate={dueDate == undefined ? "undefined" : dueDate.toDateString()} numberOfExercises={exercises.length} publishQuiz={publishQuiz} />
		</>

	);
};
export default CreateQuizPage;

function timestampToDate(timestamp: number): Date {
	if (typeof timestamp !== "number" || isNaN(timestamp)) {
		throw new Error("Invalid timestamp. It must be a valid number.");
	}

	return new Date(timestamp);
}

export const NameAndDateCustom: ReactComponent<{ dueDate: Date | undefined, setQuizName: React.Dispatch<React.SetStateAction<string>>, showDate: boolean, setShowDate: React.Dispatch<React.SetStateAction<boolean>>, showTime: boolean, setShowTime: React.Dispatch<React.SetStateAction<boolean>>, onChangeDate: (date: Date | undefined) => void, onChangeTime: (date: Date | undefined) => void }> = ({ dueDate, setQuizName, showDate, setShowDate, showTime, setShowTime, onChangeDate, onChangeTime }) => {
	return (<>
		<RouteHeader title='Create a new quiz' />
		<FancyTextInput mb='md' label='Quiz name' onChangeText={setQuizName}></FancyTextInput>
		<TText> Due date : {dueDate == undefined ? "undefined" : dateToStringWithTime(dueDate)} { }</TText>

		<FancyButton mb='md' onPress={() => setShowDate(true)}> Change due date </FancyButton>
		<FancyButton mb='md' onPress={() => setShowTime(true)}> Change time </FancyButton>


		{
			showDate && (
				<DateTimePicker
					testID="dateTimePicker1"
					value={dueDate == undefined ? timestampToDate(Date.now()) : dueDate}
					mode='date'
					is24Hour={true}
					display="default"
					onChange={(event, selectedDate) => {
						if (event.type === "dismissed") {
							setShowDate(false);
						} else {
							onChangeDate(selectedDate);

						}
					}
					}
				/>
			)
		}

		{
			showTime && (
				<DateTimePicker
					testID="dateTimePicker2"
					value={dueDate == undefined ? timestampToDate(Date.now()) : dueDate}
					mode='time'
					is24Hour={true}
					display="default"
					onChange={(event, selectedDate) => {
						if (event.type === "dismissed") {
							setShowTime(false);
						} else {
							onChangeTime(selectedDate);
						}
					}}
				/>
			)
		}
	</>

	);
};

function dateToStringWithTime(date: Date | undefined): string {
	if (date == undefined) {
		return "undefined"
	}
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		throw new Error("Invalid Date instance.");
	}

	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const year = date.getFullYear();

	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


export const PressableExercise: ReactComponent<{ exercise: Quizzes.Exercise, editExercise: (exercise: Quizzes.Exercise, index: number) => void, removeExerciseFromList: (index: number) => void, index: number, }> = ({ exercise, editExercise, index, removeExerciseFromList }) => {
	const editModalRef = useRef<BottomSheetModal>(null);
	const secondModalRef = useRef<BottomSheetModal>(null);
	return (<>
		<TTouchableOpacity onLongPress={() => { console.log("in pressable : " + exercise.question); editModalRef.current?.present() }}>
			{exercise.type == "MCQ" ? <MCQResultDisplay exercise={exercise} results={exercise.answersIndices} selectedIds={exercise.answersIndices}></MCQResultDisplay> : <TFResultDisplay selected={exercise.answer} exercise={exercise as Quizzes.TF} result={exercise.answer}></TFResultDisplay>}
		</TTouchableOpacity>
		<EditExerciseModal exercise={exercise} removeExerciseFromList={removeExerciseFromList} editExercise={editExercise} index={index} modalRef={editModalRef} secondModalRef={secondModalRef}></EditExerciseModal>

	</>
	);
};

export const PublishQuizModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, quizName: string, dueDate: string, numberOfExercises: number, publishQuiz: () => void }> = (props) => {
	return (
		<ModalContainer modalRef={props.modalRef}>
			<TView m='md' mb='md'>
				{/* <TView mb='md' p='md' flexDirection='row' flexColumnGap='xl' alignItems='center'>
					<Icon name='warning-sharp' color='red' size='xl' />
					<TText size='lg' align='left' lineHeight={40}>
						Are you certain you want to publish this quiz?
					</TText>
				</TView> */}
				<TView backgroundColor='base' radius={'lg'} mb='md' p='md' flexDirection='row' flexColumnGap='xl' alignItems='center'>
					<Icon name='warning-sharp' color='red' size='xl' />
					<TText color='red' style={{ flex: 1 }} size='md' align='left' lineHeight={24}>
						Are you certain you want to publish this quiz?
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
						Are you certain you want to publish this quiz?
					</TText>
				</TView>

				<FancyButton onPress={() => { props.publishLectureQuiz(); props.modalRef.current?.close(); router.back() }}> Confirm </FancyButton>
			</TView>
		</ModalContainer>
	);
};

export const AddExerciseModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, updateExerciseList: (exercise: Quizzes.Exercise) => void }> = (props) => {
	const [isMCQ, setIsMCQ] = useState<boolean>(true);
	const [exercise, setExercise] = useState<Quizzes.Exercise>();


	return (

		<ModalContainerScrollView disabledDynamicSizing snapPoints={isMCQ ? ['80%'] : ['50%']} modalRef={props.modalRef}>

			<TView mb='lg' flexDirection='row' flexColumnGap='sm' >
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(true)} backgroundColor={isMCQ ? "blue" : "base"} icon='checkbox-sharp'> MCQ </FancyButton>

				</TView>
				<TView flex={1}>
					<FancyButton onPress={() => setIsMCQ(false)} backgroundColor={!isMCQ ? "blue" : "base"} icon='radio-button-on-sharp'> True-False </FancyButton>
				</TView>

			</TView>
			<TScrollView>
				{isMCQ ? <MCQFields modalRef={props.modalRef} addToExerciseList={props.updateExerciseList}></MCQFields> : <TFFields modalRef={props.modalRef} addToExerciseList={props.updateExerciseList}></TFFields>}
			</TScrollView>

		</ModalContainerScrollView>

	);

};
export const EditExerciseModal: ReactComponent<{ modalRef: RefObject<BottomSheetModalMethods>, secondModalRef: RefObject<BottomSheetModalMethods>, exercise: Quizzes.Exercise, editExercise: (exercise: Quizzes.Exercise, index: number) => void, removeExerciseFromList: (index: number) => void, index: number }> = (props) => {

	//console.log(props.removeExerciseFromList == undefined)
	console.log("in edit modal  : " + props.exercise.question)

	return (<>
		<ModalContainerScrollView modalRef={props.modalRef}>

			<TView flexDirection='row' flexColumnGap={"md"} mb='sm'>
				<TTouchableOpacity flex={1} radius={"xl"} p={"sm"} ml='sm' backgroundColor='red' flexDirection='row' flexColumnGap='sm' onPress={() => props.removeExerciseFromList(props.index)}>
					<Icon name='trash-bin-sharp' size='xl' mt='md' ml='sm' />

					<TText color='text' ml='lg' mt='md' size='lg'>
						Delete
					</TText>
				</TTouchableOpacity>
				<TTouchableOpacity flex={1} radius={"xl"} p={"sm"} mr='sm' backgroundColor='blue' flexDirection='row' flexColumnGap='sm' onPress={() => {
					props.secondModalRef.current?.present();
					props.modalRef.current?.close();
				}}>
					<Icon name='pencil-sharp' size='xl' mt='md' />
					<TText color='text' size='lg' ml='lg'>
						Edit
					</TText>
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
	//const [answer, setAnswer] = useState<number[]>([]);
	const [propositions, setPropositions] = useState<[string, boolean][]>(props.previousPropositions == undefined ? [] : props.previousPropositions);

	const placeHolder = props.previousQuestion == undefined ? "Which of these are true?" : props.previousQuestion
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
			Toast.show({
				type: 'error',
				text1: t(`quiz:empty_question`),
			});
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

		//const answersIndices = propositions.map((propo, index) => [propo[1], index] as const).filter((isCorrect, _) => isCorrect).map((_, index) => index)
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

			<FancyTextInput placeholder={"Which are correct?"} value={question} onChangeText={setQuestion} label='Question' mb='sm'></FancyTextInput>
			{
				propositions.length == 0 ?
					<TText align='center' mb='xl' mt='xl'> No options added!</TText> :
					<For each={propositions}>{
						(proposition, index) => {
							return (<PropositionField proposition={proposition} changeProposition={changeProposition} removeProposition={removeProposition} key={index} index={index} previousProposition={props.previousPropositions == undefined ? undefined : props.previousPropositions[index]} />)
						}
					}

					</For>
			}
			<FancyButton style={{ borderWidth: 0 }} onPress={() => addNewProposition()} icon='add-sharp' outlined> Add new proposition </FancyButton>
		</TView>
		<FancyButton style={{ borderWidth: 0 }} onPress={() => addToQuiz()} icon='save-sharp' outlined> Save</FancyButton>
	</>
		//			<TText>{JSON.stringify(propositions)}</TText>


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
				{/* <FancyButton mx={8} style={{ borderWidth: 0 }} onPress={() => toggleCorrect()} icon='checkmark-circle-sharp' backgroundColor={props.proposition[1] ? 'green' : 'surface0'} outlined></FancyButton> */}
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
	const placeHolder = props.previousQuestion == undefined ? 'Is the earth flat?' : props.previousQuestion

	const trueSelectable: RadioSelectable<boolean> = {
		label: "True",
		value: true,
	}
	const falseSelectable: RadioSelectable<boolean> = {
		label: "False",
		value: false,
	}


	function addToQuiz() {
		if (question == "") {
			Toast.show({
				type: 'error',
				text1: t(`quiz:empty_question`),
			});
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

			<FancyTextInput placeholder={placeHolder} onChangeText={setQuestion} label='Question' mb='lg'></FancyTextInput>
			{/* <TView flexDirection='row' flexColumnGap='xs' mb='lg'>
				<TView flex={1}>
					<FancyButton onPress={() => setAnswer(true)} backgroundColor={answer ? "green" : "base"}>True</FancyButton>
				</TView>
				<TView flex={1}>
					<FancyButton onPress={() => setAnswer(false)} backgroundColor={answer ? "base" : "red"}>False</FancyButton>
				</TView>
			</TView> */}
			<TView ml='md' mb='md'>
				<RadioSelectables data={[trueSelectable, falseSelectable]} onSelection={(value) => {
					setAnswer(value)
				}} value={answer} />
			</TView>



			<FancyButton style={{ borderWidth: 0 }} onPress={() => addToQuiz()} icon='save-sharp' outlined> Save</FancyButton>

		</TView>
	);
};


