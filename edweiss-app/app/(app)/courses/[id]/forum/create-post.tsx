import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import Avatar from '@/components/Avatar';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RichText from '@/components/core/rich-text/RichText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { pushWithParameters, useStringParameters } from '@/hooks/routeParameters';
import { Forum } from '@/model/forum';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { PostRouteSignature } from './[postId]';

const Route: ApplicationRoute = () => {
	const { id: courseId } = useStringParameters();

	const { uid } = useAuth();
	const { user } = useUser();

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [anonymous, setAnonymous] = useState(false);

	const [loading, setLoading] = useState(false);

	function canSubmit() {
		return title.length > 0 && content.length > 0;
	}

	async function submit() {
		if (!canSubmit())
			return;

		setLoading(true);

		const res = await callFunction(Forum.Functions.createPost, {
			anonymous,
			content,
			title,
			courseId,
			tags: []
		});

		if (res.status == 1) {
			router.back();
			pushWithParameters(PostRouteSignature, {
				courseId,
				postId: res.data.id
			})
			// router.push(`/courses/${courseId}/forum/${res.data.id}`);
		} else {
			Alert.alert("An error occured " + res.error);
			setLoading(false);
		}

	}

	return (
		<>
			<RouteHeader title='Create post' align='center' />

			<TScrollView>
				<FancyTextInput value={title} onChangeText={setTitle} label={t("forum:creation.title.label")} placeholder={t("forum:creation.title.placeholder")} icon='text' />
				<FancyTextInput value={content} onChangeText={setContent} mt={'md'} multiline numberOfLines={5} label={t("forum:creation.content.label")} placeholder={t("forum:creation.content.placeholder")} />

				<TTouchableOpacity onPress={() => setAnonymous(a => !a)} flexColumnGap={'lg'} flexDirection='row' alignItems='center' m={'md'} backgroundColor='crust' p={'md'} radius={'lg'}>
					<TView flexDirection='row' justifyContent='center' alignItems='center' backgroundColor={anonymous ? 'blue' : 'transparent'} borderColor={anonymous ? 'blue' : 'overlay1'} b={2} radius={'md'} style={{ width: 28, height: 28 }}>
						<Icon name='checkmark' size={24} color={anonymous ? 'crust' : 'transparent'} />
					</TView>
					<TView flex={1}>
						<TText bold>
							{t("forum:creation.anonymous.label")}
						</TText>
						<TText mt={'xs'} size={'sm'} color='overlay0' lineHeight={18}>
							{t("forum:creation.anonymous.description")}
						</TText>
					</TView>
				</TTouchableOpacity>

				{/* <TText m={'md'} bold align='center' color='subtext0'>
					Preview
				</TText> */}

				<TView m={'md'} p={'md'} radius={'lg'} backgroundColor='base'>
					<TView flexDirection='row' flexColumnGap={12} alignItems='center' mb={'sm'}>
						<Avatar size={40} name={anonymous ? undefined : user.name} uid={uid} />

						<TView flex={1}>
							<TText color={title.length == 0 ? "overlay1" : "text"} size={18} bold>
								{
									title.length == 0 ? t("forum:creation.no-title-yet") : title
								}
							</TText>
							<TText mt={-2} size={'xs'} color='overlay0'>
								{anonymous ? t("forum:anonymous") : user.name}
							</TText>
						</TView>
					</TView>
					<RichText options={{ disableLanguageDisplay: true }}>
						{content}
					</RichText>
				</TView>

				<FancyButton onPress={submit} loading={loading} backgroundColor={canSubmit() ? undefined : 'overlay0'} outlined={!canSubmit()} disabled={!canSubmit()}>
					{t("forum:creation.post")}
				</FancyButton>
			</TScrollView>
		</>
	);
};

export default Route;
