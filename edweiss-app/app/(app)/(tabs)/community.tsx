import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import RichText from '@/components/core/rich-text/RichText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { ApplicationRoute } from '@/constants/Component';
import { router } from 'expo-router';
import { useState } from 'react';

const CommunityTab: ApplicationRoute = () => {
	/**
	 * This is only a demo editor, don't use this as an example of
	 * how to render rich texts.
	 */
	const [richText, setRichText] = useState(`
# Intro to Rich Text
### Titles
As you can see in the editor above, use # to define titles.
### Math expressions
The most beautiful formula: $e^{i\pi} + 1 = 0$
The actual most beautiful formula: $$\\int\\limits f(t)g(t) dt = \\int\\limits f(t) dt \\cdot \\int\\limits g(t) dt$$
	`.trim().replaceAll("\t", ""));

	return (
		<>
			<RouteHeader title={"Community"} />

			<TScrollView>
				<TView>
					<TText>
						Explore and experiment in community.tsx !
					</TText>
				</TView>

				<FancyButton mt={10} mb={10} onPress={() => router.push("/deck")} backgroundColor='pink'>
					Memento App
				</FancyButton>

				<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo`)}>
					My Todos
				</FancyButton>

				<FancyTextInput value={richText} onChangeText={setRichText} placeholder='Use Markdown and LaTeX' icon='document-text' label='Rich text' multiline />

				<RichText px={'sm'}>
					{richText}
				</RichText>
			</TScrollView>
		</>
	);
};

export default CommunityTab;
