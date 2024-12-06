import { FunctionFolder, FunctionOf, NoError, NoResult } from './functions';
import { CourseID } from './school/courses';
import { Timestamp } from './time';
import { UserID } from './users';

export namespace Forum {

	export type PostID = string & {};

	export interface Post {
		byId: UserID,
		byName: string,
		anonymous: boolean,
		content: string,
		title: string,
		likes: number,
		tags: string[],
		answered: boolean,
		createdAt: Timestamp,
		numberOfAnswers: number
	}

	export interface Answer {
		byId: UserID,
		byName: string,
		favorite: boolean,
		content: string,
		likes: number,
		anonymous: boolean,
		authority?: "professor" | "assistant",
		createdAt: Timestamp
	}

	export interface Like {
		createdAt: Timestamp
	}

	export const Functions = FunctionFolder("forum", {
		createPost: FunctionOf<{
			courseId: CourseID,
			anonymous: boolean,
			title: string,
			content: string,
			tags: string[],
		}, { id: PostID }, NoError>("createPost"),

		createAnswer: FunctionOf<{
			courseId: CourseID,
			postId: PostID,
			content: string
		}, NoResult, NoError>("createAnswer"),

		setLikePost: FunctionOf<{
			courseId: CourseID,
			postId: PostID,
			liked: boolean
		}, NoResult, NoError>("setLikePost")
	});

}
