import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import { Color } from '@/constants/Colors';
import { Size } from '@/constants/Sizes';

const TermsOfService: ApplicationRoute = () => {
	const titleMb: Size = 8;
	const paragraphMb: Size = 12;
	const lineHeight: Size = 23;
	const paragraphColor: Color = "subtext1";

	return (
		<>
			<RouteHeader isBold align='center' title='Terms of use' />

			<TScrollView py={"md"} px={"sm"}>
				<TText size={"lg"} bold mb={titleMb}>1. We Own You (and Your Data)</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					By using EdWeiss, you agree to let us collect, store, and monetize every piece of information about you, including but not limited to your location, learning habits, and thoughts you might have had while dreaming about algebra.
				</TText>

				<TText size={"lg"} bold mb={titleMb}>2. Mandatory Eternal Updates</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					Our app will update whenever it feels like it, consuming your device's memory and battery life, whether you like it or not. Refusing updates will render the app useless, and possibly your phone, too.
				</TText>

				<TText size={"lg"} bold mb={titleMb}>3. Knowledge Tax</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					Learning too much? Good for you. But remember, every lesson after the free trial requires a payment in either cash, your soul, or a small portion of your device's CPU.
				</TText>

				<TText size={"lg"} bold mb={titleMb}>4. Spy Mode (It's Always On)</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					For “security purposes,” the app's microphone and camera are always on. We promise not to misuse this feature 😉.
				</TText>

				<TText size={"lg"} bold mb={titleMb}>5. Zero Accountability</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					If the app accidentally teaches you something wrong (e.g., the Earth is flat), that's on you. Legal claims against EdWeiss™ will be met with hearty laughter and a legal team the size of a small country.
				</TText>

				<TText size={"lg"} bold mb={titleMb}>6. Exit Clause (There Isn't One)</TText>
				<TText color={paragraphColor} align='justify' lineHeight={lineHeight} mb={paragraphMb}>
					Once you've installed the app, you can never truly delete it. Like an unskippable pop quiz, it will haunt your device forever.
				</TText>

				<TView my={"md"}></TView>

				{/* <TText>
					By tapping “I Agree,” you've entered into this unholy pact. Have a fun time learning! 👹
				</TText> */}
			</TScrollView>
		</>
	);
};

export default TermsOfService;
