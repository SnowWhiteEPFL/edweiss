import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import HeaderButtons from '@/components/core/header/HeaderButtons';
import { CollectionOf, Document } from '@/config/firebase';
import t from '@/config/i18config';
import { useCourse } from '@/contexts/courses';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { pushWithParameters, useStringParameters } from '@/hooks/routeParameters';
import { Forum } from '@/model/forum';
import { CourseID } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { router } from 'expo-router';
import { PostRouteSignature } from './[postId]';

const ForumRoute: ApplicationRoute = () => {
	const { id: courseId } = useStringParameters();

	const course = useCourse(courseId);

	const posts = useDynamicDocs(CollectionOf<Forum.Post>(`courses/${courseId}/forum`).orderBy("createdAt", "desc"));

	return (
		<>
			<RouteHeader
				title={t("forum:forum-name", { course: course?.data.name })}
				isBold
				align='center'
				right={
					<HeaderButtons style={{ marginRight: 0 }}>
						<HeaderButton icon='add' onPress={() => {
							router.push(`/courses/${courseId}/forum/create-post`)
						}} />
					</HeaderButtons>
				}
			/>

			<TScrollView testID='posts'>
				<For each={posts}>
					{post => <PostDisplay key={post.id} post={post} courseId={courseId} />}
				</For>
			</TScrollView>
		</>
	);
};

export default ForumRoute;

const PostDisplay: ReactComponent<{ post: Document<Forum.Post>, courseId: CourseID }> = ({ post, courseId }) => {
	return (
		<TTouchableOpacity borderColor='surface0' bb={1} onPress={() => {
			pushWithParameters(PostRouteSignature, {
				courseId,
				postId: post.id,
				prefetchedPost: post
			})
		}} px={'sm'} py={'sm'}>
			<TView py={'sm'} flexDirection='row' alignItems='center' justifyContent='space-between'>
				<TText bold size={18} style={{ flex: 1 }}>
					{post.data.title}
				</TText>
				{
					post.data.answered &&
					<Icon name='checkmark' color='green' size={'lg'} />
				}
			</TView>

			<TView flexDirection='row' justifyContent='space-between' alignItems='center'>
				<TView flexDirection='row' flexColumnGap={'lg'} flex={1}>
					<TText bold color='red' size={'sm'}>
						{t("forum:tags.project")}
					</TText>
					<TText color='subtext1' size={'sm'}>
						{post.data.anonymous ? t("forum:anonymous") : post.data.byName}
					</TText>
					<TText color='subtext1' size={'sm'}>
						{Time.agoTimestamp(post.data.createdAt)}
					</TText>
				</TView>
				<TView flexDirection='row' alignItems='center' flexColumnGap={'sm'}>
					{
						post.data.numberOfAnswers != 0 && <>
							<TText color='subtext0' bold size={'xs'}>
								{post.data.numberOfAnswers}
							</TText>
							<Icon name='chatbox' color='subtext0' size={13} />
						</>
					}

					{
						post.data.likes != 0 && <>
							<TText color='subtext0' bold size={'xs'}>
								{post.data.likes}
							</TText>
							<Icon name='heart' color='red' size={13} />
						</>
					}
				</TView>
			</TView>
		</TTouchableOpacity>
	);
};
