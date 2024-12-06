import { Timestamp } from 'firebase-admin/firestore';
import { Forum } from 'model/forum';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, clean, getRequiredDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { NOT_IN_COURSE, USER_NOT_FOUND, ok } from 'utils/status';

export const createPost = onSanitizedCall(Forum.Functions.createPost, {
	title: Predicate.isNonEmptyString,
	courseId: Predicate.isNonEmptyString,
	anonymous: Predicate.isBoolean,
	content: Predicate.isNonEmptyString,
	tags: [Predicate.isArray, Predicate.forEach(Predicate.isNonEmptyString)]
}, async (userId, args) => {
	const user = await getRequiredDocument(Collections.users, userId, USER_NOT_FOUND);

	if (!user.courses.includes(args.courseId))
		return NOT_IN_COURSE;

	const collection = CollectionOf<Forum.Post>(`courses/${args.courseId}/forum`);

	const res = await collection.add(clean({
		byId: userId,
		anonymous: args.anonymous,
		answered: false,
		byName: user.name,
		content: args.content,
		likes: 0,
		tags: args.tags,
		createdAt: Timestamp.now(),
		title: args.title,
		numberOfAnswers: 0
	}));

	return ok({ id: res.id });
});
