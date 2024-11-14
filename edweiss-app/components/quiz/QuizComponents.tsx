//import { handleMCQColor, textColor } from '@/app/(app)/quiz/temporaryQuizStudentView';
import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import Quizzes from '@/model/quizzes';
import { memo } from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import For from '../core/For';
import TText from '../core/TText';

export const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number, }> = memo(({ exercise, selectedIds, onUpdate, exId }) => {
	const handleSelection = (propId: number) => {
		requestAnimationFrame(() => {
			let newAnswer;
			if (selectedIds.includes(propId)) {
				newAnswer = selectedIds.filter(currentId => currentId != propId); // unselects proposition, removes id
			}
			else if (exercise.numberOfAnswers > selectedIds.length) {
				newAnswer = selectedIds.concat([propId]);// adds id to list
			}
			else if (exercise.numberOfAnswers == 1 && selectedIds.length == 1) {
				newAnswer = selectedIds.map(e => propId);
			}
			else {
				newAnswer = selectedIds;
			}
			onUpdate(newAnswer, exId);  // updates answers at index exId
		});
	};


	return (
		<TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

			<TView mb={"lg"} radius={999} p={"md"}>
				<TText size={"lg"}>
					{exercise.question} - {exercise.numberOfAnswers} answer(s)
				</TText>
			</TView>

			<For each={exercise.propositions} key={exercise.question}>
				{(proposition, index) =>
					<TTouchableOpacity key={exercise.question + proposition.id}
						onPress={() => handleSelection(index)}
						backgroundColor={handleMCQColor(selectedIds, index)}
						mb={"md"} mr={"md"} ml={"md"} p={"sm"} px={"md"}
						radius={"xl"}>
						<TText color={textColor(handleMCQColor(selectedIds, index))}>
							{proposition.description}
						</TText>
					</TTouchableOpacity>}
			</For>
		</TView>
	);
});

export const MCQResultDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], results: number[]; }> = ({ exercise, selectedIds, results }) => {
	return (
		<TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

			<TView mb={"lg"} radius={999} p={"md"}>
				<TText size={"lg"}>
					{exercise.question}
				</TText>
			</TView>

			<For each={exercise.propositions} key={exercise.question}>
				{(proposition, index) =>
					<TTouchableOpacity key={exercise.question + proposition.id}
						backgroundColor={checkResultColor(checkMCQPropositionCorrect(selectedIds, results, index))}
						mb={"md"} mr={"md"} ml={"md"} p={"sm"} px={"md"}
						radius={"xl"}>
						<TText color={textColor(checkResultColor(checkMCQPropositionCorrect(selectedIds, results, index)))}>
							{proposition.description}
						</TText>
					</TTouchableOpacity>}
			</For>
		</TView>
	);
};

export const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number; }> = memo(({ exercise, selected, onUpdate, exId }) => {
	// selected represents the option (true or false) selected by the student, in this exercise.

	const handleSelection = (value: boolean) => {
		requestAnimationFrame(() => {
			if (selected == undefined || selected != value) {
				onUpdate(value, exId);
			} else {
				onUpdate(undefined, exId);// de-select the option
			}
		});
	};

	return (
		<TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"} pb={"xl"}>

			<TView mb={"lg"} radius={"xl"} p={"md"}>
				<TText size={"lg"}>
					{exercise.question}
				</TText>
			</TView>

			<TView flexDirection='row' flexColumnGap={"xl"}>
				<TTouchableOpacity flex={1} onPress={() => { handleSelection(true); }} radius={"xl"} p={"md"} backgroundColor={handleTFColor(selected, true)} testID='true' >
					<TText align='center' color={textColor(handleTFColor(selected, true))}>
						True
					</TText>
				</TTouchableOpacity>

				<TTouchableOpacity flex={1} onPress={() => handleSelection(false)} radius={"xl"} p={"md"} backgroundColor={handleTFColor(selected, false)} testID='false'>
					<TText align='center' color={textColor(handleTFColor(selected, false))}>
						False
					</TText>
				</TTouchableOpacity>

			</TView>
		</TView>

	);
});


export const TFResultDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, result: boolean; }> = ({ exercise, selected, result }) => {
	return (
		<TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"} pb={"xl"}>

			<TView mb={"lg"} radius={"xl"} p={"md"}>
				<TText size={"lg"}>
					{exercise.question}
				</TText>
			</TView>

			<TView flexDirection='row' flexColumnGap={"xl"}>
				<TTouchableOpacity flex={1} radius={"xl"} p={"md"} backgroundColor={checkResultColor(checkTFCorrect(selected, true, result))} testID='true'>
					<TText align='center' color={textColor(checkResultColor(checkTFCorrect(selected, true, result)))}>
						True
					</TText>
				</TTouchableOpacity>

				<TTouchableOpacity flex={1} radius={"xl"} p={"md"} backgroundColor={checkResultColor(checkTFCorrect(selected, false, result))} testID='false'>
					<TText align='center' color={textColor(checkResultColor(checkTFCorrect(selected, false, result)))}>
						False
					</TText>
				</TTouchableOpacity>

			</TView>
		</TView>

	);
};

export function checkResultColor(correctness: Quizzes.Results): Color {
	switch (correctness) {
		case 'unselected': return 'surface0';
		case 'wrong': return 'red';
		case 'missing': return 'yellow';
		case 'correct': return 'green';
	}
}

export function handleTFColor(selected: boolean | undefined, propValue: boolean): Color {
	if (selected == undefined) {
		return "surface0";
	}
	if (selected != propValue) {
		return "surface0";
	}
	else {
		return "blue";
	}
}
export function handleMCQColor(selectedIds: number[], propositionIndex: number): Color {

	if (selectedIds == undefined) {
		return "surface0";
	}
	if (selectedIds.includes(propositionIndex)) {
		return "blue";
	}
	else {
		return "surface0";
	}

}

export function checkMCQPropositionCorrect(selectedIds: number[], result: number[], propId: number): Quizzes.Results {
	if (!selectedIds.includes(propId) && !result.includes(propId)) {
		return 'unselected';
	}
	if (selectedIds.includes(propId) && !result.includes(propId)) {
		return 'wrong';
	}
	if (!selectedIds.includes(propId) && result.includes(propId)) {
		return 'missing';
	}
	else {
		return 'correct';
	}
}

export function checkTFCorrect(selected: boolean | undefined, propositionValue: boolean, result: boolean): Quizzes.Results {
	if (selected == undefined) {
		if (propositionValue == result) {
			return 'missing';
		}
		else {
			return 'unselected';
		}
	}
	else if (propositionValue == selected && propositionValue == result) {
		return 'correct';
	}
	else if (propositionValue != selected && propositionValue == result) {
		return 'missing';
	} else if (propositionValue == selected && propositionValue != result) {
		return 'wrong';
	}
	else {
		return 'unselected';
	}
}
export function textColor(backgroundColor: Color) {
	return backgroundColor == 'surface0' ? 'text' : 'base';
}