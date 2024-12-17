import ProgressPopup, { useProgressPopup } from '@/components/animations/ProgressPopup';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { pushWithParameters } from '@/hooks/routeParameters';
import Quizzes from '@/model/quizzes';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { LectureQuizStudentViewSignature } from '../quiz/lectureQuizStudentView';
import { TemporaryQuizProfViewSignature } from '../quiz/temporaryQuizProfView';

const CommunityTab: ApplicationRoute = () => {
	const [aiLoading, setAiLoading] = useState(false);

	const handle = useProgressPopup();



	const handle = useProgressPopup();
	const [loading, setLoading] = useState(false);

	return (
		<>
			<RouteHeader title={"Community"} />

			<TScrollView>
				<TView>
					<TText>
						Explore and experiment in community.tsx !
					</TText>
				</TView>

				<FancyButton mt={10} mb={10} onPress={() => router.push("/deck")} backgroundColor='pink'>
					Memento App
				</FancyButton>

				<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo`)}>
					My Todos
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => router.push({ pathname: '/(app)/quiz/createQuizPage', params: { courseId: "edweiss-demo" } })} backgroundColor='green'>
					Create quiz
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => router.push({ pathname: '/(app)/quiz/createLectureQuizPage', params: { courseId: "edweiss-demo", lectureId: "xgy30FeIOHAnKtSfPjAe" } })} backgroundColor='cherry'>
					Create lecture quiz
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => pushWithParameters(LectureQuizStudentViewSignature, { courseId: "edweiss-demo", lectureId: "xgy30FeIOHAnKtSfPjAe", lectureEventId: "kPaqoWkLLY96B1pBkaeR", prefetchedQuiz: undefined })} backgroundColor='lavender'>
					Complete TF lecture quiz
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => pushWithParameters(LectureQuizStudentViewSignature, { courseId: "edweiss-demo", lectureId: "xgy30FeIOHAnKtSfPjAe", lectureEventId: "vP0yhuu9eVdATOqZV59Q", prefetchedQuiz: undefined })} backgroundColor='lavender'>
					Complete MCQ lecture quiz
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => pushWithParameters(TemporaryQuizProfViewSignature, { courseId: "edweiss-demo", lectureId: "xgy30FeIOHAnKtSfPjAe", lectureEventId: "kPaqoWkLLY96B1pBkaeR", prefetchedQuizEvent: undefined })} backgroundColor='lavender'>
					See TF results for prof
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => pushWithParameters(TemporaryQuizProfViewSignature, { courseId: "edweiss-demo", lectureId: "xgy30FeIOHAnKtSfPjAe", lectureEventId: "vP0yhuu9eVdATOqZV59Q", prefetchedQuizEvent: undefined })} backgroundColor='lavender'>
					See MCQ results for prof
				</FancyButton>

				<FancyButton icon='sparkles' loading={aiLoading} mt={10} mb={10} onPress={async () => {
					setAiLoading(true);
					handle.start();

					console.log("Calling AI function...");

					const res = await callFunction(Quizzes.Functions.generateQuizContentFromMaterial, {
						courseId: "edweiss-demo",
						materialUrl: "China-101.pdf"
					});

					console.log(JSON.stringify(res));

					if (res.status == 1) {
						res.data.generatedExercises.forEach(exo => {
							console.log(exo.question);
							exo.propositions.forEach(prop => {
								console.log(`  - ${prop.text}` + (prop.correct ? "(correct)" : ""));
							});
							console.log("");
						});
					}

					setAiLoading(false);
					handle.stop();
				}} backgroundColor='green' outlined style={{ borderWidth: 0 }}>
					Generate with AI
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => {
					router.push({
						pathname: '/(app)/lectures/remotecontrol' as any,
						params: {
							courseNameString: "edweiss-demo",
							lectureIdString: "xgy30FeIOHAnKtSfPjAe"
						}
					});
				}} >
					<TText> Go to STRC</TText>
				</FancyButton>

				<FancyButton mt={10} mb={10} onPress={() => {
					router.push({
						pathname: '/(app)/lectures/slides' as any,
						params: {
							courseNameString: "edweiss-demo",
							lectureIdString: "xgy30FeIOHAnKtSfPjAe"
						}
					});
				}} >
					<TText> Go to ShowTime</TText>
				</FancyButton>
			</TScrollView>


			<ProgressPopup handle={handle} />
		</>
	);
};

export default CommunityTab;
