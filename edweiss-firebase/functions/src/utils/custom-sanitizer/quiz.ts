import { Predicate } from 'utils/sanitizer';

import Quizzes, { QuizzesAttempts } from 'model/quizzes';

export namespace CustomPredicateQuiz {

	export const isValidQuiz: Predicate<Quizzes.Quiz> =
		Predicate.fields<Quizzes.Quiz>({
			answers: [Predicate.isNonEmptyArray, Predicate.forEach(
				Predicate.dispatch("type", {
					MCQAnswersIndices: Predicate.fields({
						type: Predicate.is("MCQAnswersIndices"),
						value: Predicate.forEach(Predicate.isNumber)
					}),
					TFAnswer: Predicate.fields({
						type: Predicate.is("TFAnswer"),
						value: Predicate.isOptionalBoolean
					})
				})
			)],
			deadline: Predicate.isOptionalString,
			ended: Predicate.isBoolean,
			exercises: [Predicate.isNonEmptyArray, Predicate.forEach(
				Predicate.dispatch("type", {
					MCQ: Predicate.fields({
						answersIndices: Predicate.forEach(Predicate.isNumber),
						imageURL: Predicate.isOptionalString,
						numberOfAnswers: Predicate.isStrictlyPositive,
						propositions: Predicate.forEach(
							Predicate.fields<Quizzes.MCQProposition>({
								description: Predicate.isString,
								id: Predicate.isPositive,
								type: Predicate.is("MCQProposition"),
								imageUrl: Predicate.isOptionalString
							})
						),
						question: Predicate.isString
					}),
					TF: Predicate.fields({
						answer: Predicate.isBoolean,
						question: Predicate.isString,
						imageURL: Predicate.isOptionalString
					})
				})
			)],
			name: Predicate.isNonEmptyString,
			showResultToStudents: Predicate.isBoolean
		});

	export const isValidQuizAttempt: Predicate<QuizzesAttempts.QuizAttempt> =
		Predicate.fields<QuizzesAttempts.QuizAttempt>({
			attempts: Predicate.isPositive,
			answers: [Predicate.isNonEmptyArray, Predicate.forEach(
				Predicate.dispatch("type", {
					MCQAnswersIndices: Predicate.fields({
						type: Predicate.is("MCQAnswersIndices"),
						value: Predicate.forEach(Predicate.isNumber)
					}),
					TFAnswer: Predicate.fields({
						type: Predicate.is("TFAnswer"),
						value: Predicate.isOptionalBoolean
					})
				})
			)]
		})

}