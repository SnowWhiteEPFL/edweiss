import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import Quizzes from '@/model/quizzes';
import { t } from 'i18next';
import { memo } from 'react';
import TView from '../core/containers/TView';
import For from '../core/For';
import RichText from '../core/rich-text/RichText';
import TText from '../core/TText';
import CoolCheckBox from '../input/CoolCheckBox';
import RadioSelectables, { RadioSelectable } from '../input/RadioSelectables';

export const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number, disableBottomBar?: boolean }> = memo(({ exercise, selectedIds, onUpdate, exId, disableBottomBar }) => {
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
		<TView mb={"xs"} bb={disableBottomBar ? 0 : 1} borderColor='surface0' radius={'lg'} pb={"md"} mx={12}>

			<TView mb={12} p={"sm"}>
				{/* <RichText>
					{`${exercise.question}`}
				</RichText> */}
				<TText>
					{`${exercise.question}`}
				</TText>
				<TText size={"sm"} color='subtext0' bold>
					{exercise.numberOfAnswers + " " + t('quiz:quiz_display.answer')}
				</TText>
			</TView>

			<For each={exercise.propositions}>
				{(proposition, index) =>
					<CoolCheckBox
						key={proposition.id} value={selectedIds.includes(index)} onChange={b => {
							handleSelection(index)

						}} label={
							<TView flexDirection='row' flexColumnGap={12} alignItems='center'>
								<TText size={"sm"} bold color='subtext0'>
									{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(index)}
								</TText>
								<TView flex={1}>
									<RichText>{proposition.description}</RichText>
								</TView>
							</TView>
						} />
				}

			</For>
		</TView>
	);
});

export const MCQResultDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], results: number[], disableBottomBar?: boolean }> = ({ exercise, selectedIds, results, disableBottomBar }) => {
	return (

		<TView mb={"xs"} bb={disableBottomBar ? 0 : 1} borderColor='surface0' radius={'lg'} pb={"md"} mx={12}>

			<TView mb={12} p={"sm"}>
				<TText>
					{`${exercise.question}`}
				</TText>
				<TText size={"sm"} color='subtext0' bold>
					{exercise.numberOfAnswers + " " + t('quiz:quiz_display.answer')}
				</TText>
			</TView>

			<For each={exercise.propositions}>
				{(proposition, index) =>
					<CoolCheckBox
						borderWidth={2}
						key={proposition.id} value={selectedIds.includes(index)} disabled
						activeColor={checkResultColor(checkMCQPropositionCorrect(selectedIds, results, index))}
						iconName={checkMCQPropositionCorrect(selectedIds, results, index) == "wrong" ? "close" : "checkmark"}
						label={
							<TView flexDirection='row' flexColumnGap={12} alignItems='center'>
								<TText size={"sm"} bold color='subtext0'>
									{"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(index)}
								</TText>
								<TView flex={-1}>
									<RichText>{proposition.description}</RichText>
								</TView>
							</TView>
						} />
				}

			</For>
		</TView>
	);
};

export const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number, disableBottomBar?: boolean }> = memo(({ exercise, selected, onUpdate, exId, disableBottomBar }) => {
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

	const trueSelectable: RadioSelectable<boolean> = {
		label: t('quiz:quiz_display.true'),
		value: true,
	}
	const falseSelectable: RadioSelectable<boolean> = {
		label: t('quiz:quiz_display.false'),
		value: false,
	}

	return (
		<TView bb={disableBottomBar ? 0 : 1} borderColor='surface0' mx={12} radius={'lg'} pb={"md"}>
			<TView p={"sm"}>
				<TText>
					{exercise.question}
				</TText>
			</TView>

			<TView ml={'sm'}>
				<RadioSelectables data={[trueSelectable, falseSelectable]} onSelection={(value) => {
					handleSelection(value)
				}} value={selected} />
			</TView>
		</TView>

	);
});


export const TFResultDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, result: boolean, disableBottomBar?: boolean }> = ({ exercise, selected, result, disableBottomBar }) => {
	const trueSelectable: RadioSelectable<boolean> = {
		label: t('quiz:quiz_display.true'),
		value: true,
		color: checkResultColor(checkTFCorrect(selected, true, result))
	}
	const falseSelectable: RadioSelectable<boolean> = {
		label: t('quiz:quiz_display.false'),
		value: false,
		color: checkResultColor(checkTFCorrect(selected, false, result))
	}
	return (

		<TView bb={disableBottomBar ? 0 : 1} borderColor='surface0' mx={12} radius={'lg'} pb={"md"}>
			<TView p={"sm"}>
				<TText>
					{exercise.question}
				</TText>
			</TView>

			<TView ml={'sm'}>
				<RadioSelectables data={[trueSelectable, falseSelectable]} disabled
					onSelection={() => { }}
					value={selected}
				// color={checkResultColor(checkTFCorrect(selected, true, result))}
				/>
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