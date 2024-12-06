import { Timestamp } from 'firebase-admin/firestore';
import { Forum } from 'model/forum';
import { isAssistantOf, isProfessorOf } from 'model/school/courses';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, clean, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { INVALID_COURSE_ID, NOT_IN_COURSE, USER_NOT_FOUND, fail, ok } from 'utils/status';

export const createAnswer = onSanitizedCall(Forum.Functions.createAnswer, {
	courseId: Predicate.isNonEmptyString,
	postId: Predicate.isNonEmptyString,
	content: Predicate.isNonEmptyString,
}, async (userId, args) => {
	const user = await getRequiredDocument(Collections.users, userId, USER_NOT_FOUND);

	if (!user.courses.includes(args.courseId))
		return NOT_IN_COURSE;

	const course = await getRequiredDocument(Collections.courses, args.courseId, INVALID_COURSE_ID);

	const [post, postRef] = await getDocumentAndRef(CollectionOf<Forum.Post>(`courses/${args.courseId}/forum`), args.postId);

	if (post == undefined)
		return fail('post_not_found');

	const collection = CollectionOf<Forum.Answer>(`courses/${args.courseId}/forum/${args.postId}/answers`);

	const anonymous = post.anonymous && userId == post.byId;

	let resId = "";

	try {
		const toAdd: Forum.Answer = {
			byId: userId,
			byName: user.name,
			content: args.content,
			favorite: false,
			likes: 0,
			// authority: isProfessorOf(userId, course) ? "professor" : isAssistantOf(userId, course) ? "assistant" : undefined,
			createdAt: Timestamp.now(),
			anonymous
		};

		if (isProfessorOf(userId, course))
			toAdd.authority = "professor";
		else if (isAssistantOf(userId, course))
			toAdd.authority = "assistant";

		const res = await collection.add(clean(toAdd));
		resId = res.id;
	} catch (e) {
		throw fail("firebase 1");
	}

	try {
		postRef.update({
			numberOfAnswers: post.numberOfAnswers + 1
		});
	} catch (e) {
		throw fail("firebase 2");
	}

	return ok({ id: resId });
});
