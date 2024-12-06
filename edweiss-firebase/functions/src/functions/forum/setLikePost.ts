import { Timestamp } from 'firebase-admin/firestore';
import { Forum } from 'model/forum';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { OK } from 'utils/status';

export const setLikePost = onSanitizedCall(Forum.Functions.setLikePost, {
	courseId: Predicate.isNonEmptyString,
	postId: Predicate.isNonEmptyString,
	liked: Predicate.isBoolean,
}, async (userId, args) => {
	const [post, postRef] = await getDocumentAndRef(CollectionOf<Forum.Post>(`courses/${args.courseId}/forum`), args.postId);
	const [like, likeRef] = await getDocumentAndRef(CollectionOf<Forum.Like>(`courses/${args.courseId}/forum/${args.postId}/likes`), userId);

	if (args.liked) {
		if (like != undefined)
			return OK;

		await likeRef.set({
			createdAt: Timestamp.now()
		});

		await postRef.set({
			...post,
			likes: post.likes + 1
		});

		return OK;
	} else {
		if (like == undefined)
			return OK;

		await likeRef.delete();

		await postRef.set({
			...post,
			likes: Math.max(post.likes - 1, 0)
		});

		return OK;
	}
});
