import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import Avatar from '@/components/Avatar';
import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RichText from '@/components/core/rich-text/RichText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import SyncStorage from '@/config/SyncStorage';
import { CollectionOf, Document, callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { useCachedDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import { useStoredState } from '@/hooks/storage';
import { Forum } from '@/model/forum';
import { CourseID } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { router } from 'expo-router';
import { Key, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PostRouteSignature: ApplicationRouteSignature<{
	courseId: CourseID,
	postId: Forum.PostID,
	prefetchedPost?: Document<Forum.Post>
}> = {
	path: "/courses/[id]/forum/[postId]"
}

const ForumPostRoute: ApplicationRoute = () => {
	const { courseId, postId, prefetchedPost } = useRouteParameters(PostRouteSignature);

	const likedStorageKey = `post-liked-${postId}`;

	const [post] = usePrefetchedDynamicDoc(CollectionOf<Forum.Post>(`courses/${courseId}/forum`), postId, prefetchedPost);
	const [liked, setLiked] = useStoredState(likedStorageKey, false);
	const initialLiked = useMemo(() => SyncStorage.get(likedStorageKey) == true, []);

	const answers = useCachedDynamicDocs(`post-answers-${postId}`, CollectionOf<Forum.Answer>(`courses/${courseId}/forum/${postId}/answers`).orderBy("createdAt", "asc"));

	const [answer, setAnswer] = useState("");

	const [loading, setLoading] = useState(false);

	const insets = useSafeAreaInsets();

	if (post == undefined)
		return <RouteHeader title='Post' />;

	async function toggleLike() {
		setLiked(liked => !liked);

		const res = await callFunction(Forum.Functions.setLikePost, {
			courseId,
			postId,
			liked: !liked
		});

		if (res.status == 0) {
			setLiked(initialLiked);
		}
	}

	async function submitAnswer() {
		setLoading(true);

		const res = await callFunction(Forum.Functions.createAnswer, {
			courseId,
			postId,
			content: answer,
		});

		if (res.status == 1)
			setAnswer("");

		setLoading(false);
	}

	const likeCount = Math.max(0, post.data.likes + (initialLiked == liked ? 0 : (liked ? 1 : -1)));

	return (
		<>
			<RouteHeader
				header={
					<TView backgroundColor='mantle' style={{ minHeight: 64, paddingTop: insets.top + 16, paddingLeft: insets.left, paddingRight: insets.right }} flexDirection='row' flexColumnGap={10} alignItems='center' mb={'sm'}>
						<TTouchableOpacity px={'sm'} pr={0} onPress={_ => router.back()}>
							<Icon name='chevron-back' size={28} />
						</TTouchableOpacity>

						<Avatar size={40} name={post.data.anonymous ? undefined : post.data.byName} uid={post.data.anonymous ? undefined : post.data.byId} />

						<TView flex={1}>
							<TText size={16} bold>
								{post.data.title}
							</TText>
							<TText mt={-2} size={'xs'} color='overlay0'>
								{post.data.anonymous ? t("forum:anonymous") : post.data.byName}, {Time.agoTimestamp(post.data.createdAt)}
							</TText>
						</TView>
					</TView>
				}
				title='Post'
			/>

			<TScrollView>

				<TView p={'md'} mb={'md'}>
					<RichText options={{ disableLanguageDisplay: true }}>
						{post.data.content}
					</RichText>

					<TView flexDirection='row' justifyContent='flex-end'>
						<TTouchableOpacity testID='like' onPress={toggleLike} flexDirection='row' justifyContent='flex-start' alignItems='center' flexColumnGap={8}>
							<Icon name={liked ? 'heart' : 'heart-outline'} color='red' size={24} />
							<TText color='red' size={'xs'} bold lineHeight={14}>
								{likeCount}
							</TText>
						</TTouchableOpacity>
					</TView>
				</TView>

				<FancyTextInput value={answer} onChangeText={setAnswer} multiline icon='chatbox' label={t("forum:answer-box.label")} placeholder={t("forum:answer-box.placeholder")} numberOfLines={3} />

				{
					answer.length > 0 && <>
						<TView backgroundColor='base' m={'md'} p={'md'} radius={'lg'}>
							<TText mt={-4} color='overlay0' size={'xs'} bold>
								{t("forum:preview")}
							</TText>
							<RichText>
								{answer}
							</RichText>
						</TView>

						<FancyButton testID='submit-answer' loading={loading} onPress={submitAnswer}>
							{t("forum:submit-answer")}
						</FancyButton>
					</>
				}

				<For each={answers}>
					{
						answer => <AnswerDisplay key={answer.id} rkey={answer.id} answer={answer} />
					}
				</For>

			</TScrollView>
		</>
	);
};

export default ForumPostRoute;

const AnswerDisplay: ReactComponent<{ answer: Document<Forum.Answer>, rkey: Key }> = ({ answer, rkey }) => {
	return (
		<TView testID={`answer-${answer.id}`} m={'md'} pt={'md'} bt={1} borderColor='surface0'>
			<TView backgroundColor='mantle' flexDirection='row' flexColumnGap={10} alignItems='center' mb={'sm'}>
				<Avatar size={40} name={answer.data.anonymous ? undefined : answer.data.byName} uid={answer.data.anonymous ? undefined : answer.data.byId} />

				<TView flex={1}>
					<TText size={16} bold>
						{answer.data.byName}
					</TText>
					<TText mt={-2} size={'xs'} color='overlay0'>
						{Time.agoTimestamp(answer.data.createdAt)}
					</TText>
				</TView>
			</TView>

			<RichText key={rkey}>
				{answer.data.content}
			</RichText>
		</TView>
	);
};
