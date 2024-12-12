import { Predicate } from 'utils/sanitizer';

import LectureDisplay from 'model/lectures/lectureDoc';
import Quizzes, { LectureQuizzes, LectureQuizzesAttempts, QuizzesAttempts } from 'model/quizzes';

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
			dueDate: Predicate.isDefined,
			type: Predicate.isNonEmptyString,
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

	export const isValidLectureQuiz: Predicate<LectureQuizzes.LectureQuiz> =

		Predicate.fields<LectureQuizzes.LectureQuiz>({
			answer: Predicate.dispatch("type", {
				MCQAnswersIndices: Predicate.fields({
					type: Predicate.is("MCQAnswersIndices"),
					value: Predicate.forEach(Predicate.isNumber)
				}),
				TFAnswer: Predicate.fields({
					type: Predicate.is("TFAnswer"),
					value: Predicate.isOptionalBoolean
				}),


			}),
			ended: Predicate.isBoolean,
			exercise: Predicate.dispatch("type", {
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
			}),
			showResultToStudents: Predicate.isBoolean
		});

	export const isValidLectureQuizAttempt: Predicate<LectureQuizzesAttempts.LectureQuizAttempt> =

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

	export const isValidLectureQuizEvent: Predicate<LectureDisplay.QuizLectureEvent> =
		Predicate.fields<LectureDisplay.QuizLectureEvent>({
			done: Predicate.isBoolean,
			pageNumber: Predicate.isPositive,
			type: Predicate.is("quiz"),
			quizModel: CustomPredicateQuiz.isValidLectureQuiz
		})

}



