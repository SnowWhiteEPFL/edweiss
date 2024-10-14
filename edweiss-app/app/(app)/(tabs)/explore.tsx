import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes from '@/model/quizzes';
import messaging from '@react-native-firebase/messaging';
import { useState } from 'react';
import Slide from '../lectures/slides';


const ExploreTab: ApplicationRoute = () => {
	const quiz1: Quizzes.Quiz = {
		name: "Sample Quiz 1",
		deadline: "2024-12-31", // Optional deadline (can be omitted if not needed)
		exercises: [
			// Multiple Choice Question (MCQ)
			{
				question: "What is the capital of France?",
				imageURL: undefined, // No image URL for this question
				propositions: [
					{ id: 1, description: "Paris", type: "MCQProposition" },
					{ id: 2, description: "London", type: "MCQProposition" },
					{ id: 3, description: "Berlin", type: "MCQProposition" },
					{ id: 4, description: "Madrid", type: "MCQProposition" }
				],
				answersIndices: [0], // The correct answer is "Paris"
				numberOfAnswers: 1, // Only one correct answer
				type: "MCQ"
			},
			// True or False Question (TF)
			{
				question: "The Earth is flat.",
				imageURL: undefined, // No image URL for this question
				answer: false, // The answer is false
				type: "TF"
			}
		],
		answers: [
			// Example of how the answers might look for this quiz
			{
				type: "MCQAnswersIndices",
				value: [0] // Answered "Paris" for the first question
			},
			{
				type: "TFAnswer",
				value: false // Answered "False" for the second question
			}
		]
	};
	const [envent, setenvent] = useState<Quizzes.Quiz | undefined>(undefined);
	const [lectureDoc, setLectureDoc] = useState({ uri: 'China-101.pdf', audioRecording: [], events: [], currentEvent: envent } as LectureDisplay.Lecture);

	async function registerToken() {
		const fcmToken = await messaging().getToken();

		// console.log("FCM Token: " + token + i18next);

		// const res = await callFunction('registerFCMToken', { fcmToken: token });

		// console.log("Res register tokens : " + JSON.stringify(res));
	}

	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				{
					//				<FancyButton onPress={() => { router.push({ pathname: '/(app)/lectures/slides' as any }); }} >
					//					<TText> Go To Lecture's slide</TText>
					//</FancyButton> router.params
				}
				<Slide lectureDoc={lectureDoc}></Slide>



				<FancyButton onPress={() => { console.log("Toogle events |||"); (envent) ? setenvent(undefined) : setenvent(quiz1); }} >
					<TText> Toogle Quiz</TText>
				</FancyButton>

			</TView >
		</>
	);
};

export default ExploreTab;
