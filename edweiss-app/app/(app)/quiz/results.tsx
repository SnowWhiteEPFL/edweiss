import ReactComponent from '@/constants/Component';

import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { ApplicationRoute } from '@/constants/Component';


const Results: ApplicationRoute = () => {
	//const { id } = useLocalSearchParams();

	const { uid } = useAuth();

	const courseId = "placeholderCourseId";
	const path = "courses/" + courseId + "/quizzes";
	const id = "TestQuizId";
	const quiz = useDoc(CollectionOf<Quizzes.Quiz>(path), id);
	const previousAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>(path + "/" + id + "/attempts"), uid);
	console.log("I am inside results");
	if (previousAttempt == undefined || quiz?.data == undefined) {
		return (<ActivityIndicator />);
	}

	return (
		<>
			{/* <QuizDisplay studentAnswers={previousAttempt?.data.answers} exercises={quiz?.data.exercises} results={quiz?.data.answers} >
			</QuizDisplay> */}
		</>
	);
};
export default Results;


const ResultOuterDisplay: ReactComponent<{}> = (props) => {
	return (
		<></>
	);
};
