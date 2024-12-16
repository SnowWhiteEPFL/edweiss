import ReactComponent from '@/constants/Component';

import Colors, { Color } from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';
import { Animated, View } from 'react-native';

import { marginSizes, paddingSizes, radiusSizes, textSizes } from '@/constants/Sizes';
import { useEffect, useRef, useState } from 'react';
import TView from '../core/containers/TView';

function easeInOutQuint(x: number): number {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface ProgressPopupProps {
	handle: ProgressPopupHandle,
	messages?: readonly string[],
	overallDuration?: number,
	color?: Color
}

export type ProgressPopupHandle = {
	state: ProgressPopupState,
	start: () => void,
	stop: () => void,
	remove: () => void
}

export type ProgressPopupState = "none" | "in-progress" | "finished";

export function useProgressPopup(): ProgressPopupHandle {
	const [state, setState] = useState<ProgressPopupState>("none");

	return {
		state,
		start: () => setState("in-progress"),
		stop: () => setState("finished"),
		remove: () => setState("none")
	} as const;
}

const ProgressPopup: ReactComponent<ProgressPopupProps> = (props) => {
	if (props.handle.state == "none")
		return <></>;
	return <ProgressPopupInner {...props} />
}

export default ProgressPopup;

const ProgressPopupInner: ReactComponent<ProgressPopupProps> = ({
	handle,
	messages = [
		"Initializing secure channel",
		"Parsing the resources",
		"Preparing answer lexer and parser",
		"Generating raw answer",
	],
	overallDuration = 7000,
	color = "green"
}) => {
	const [currentMessage, setCurrentMessage] = useState(messages[0]);

	const showingUpAnim = useRef(new Animated.Value(0)).current;

	const progressionAnim = useRef(new Animated.Value(0)).current;
	const progressionAnimTextOpacity = useRef(new Animated.Value(1)).current;
	const progressionAnimCirclesColor = messages.map((_, index) => useRef(new Animated.Value(index == 0 ? 1 : 0)).current);
	const progressionAnimCirclesRipple = messages.map((_, index) => useRef(new Animated.Value(index == 0 ? 1 : 0)).current);

	const theme = useTheme();

	useEffect(() => {
		showingUpAnim.setValue(0);
		setCurrentMessage(messages[0]);
		progressionAnim.setValue(0);
		progressionAnimTextOpacity.setValue(1);
		messages.forEach((_, index) => progressionAnimCirclesColor[index].setValue(0));
		messages.forEach((_, index) => progressionAnimCirclesRipple[index].setValue(0));

		Animated.timing(showingUpAnim, {
			toValue: 1,
			duration: 400,
			useNativeDriver: false,
			easing: (x: number) => 1 - Math.pow(1 - x, 5)
		}).start();

		const stepDuration = overallDuration / messages.length;

		Animated.sequence(
			messages.flatMap((_, index) => [
				Animated.parallel([
					Animated.timing(progressionAnim, {
						toValue: index == messages.length - 1 ? ((index - 0.5) / (messages.length - 1)) : (index / (messages.length - 1)),
						duration: index == 0 ? 0 : stepDuration,
						useNativeDriver: false,
						easing: easeInOutQuint
					}),
					Animated.parallel(index == messages.length - 1 ?
						[] : [
							Animated.timing(progressionAnimCirclesColor[index], {
								delay: index == 0 ? 0 : stepDuration - 600,
								toValue: 1,
								duration: index == 0 ? 0 : 200,
								useNativeDriver: false,
								easing: easeInOutQuint
							}),
							Animated.timing(progressionAnimCirclesRipple[index], {
								delay: index == 0 ? 0 : stepDuration - 600,
								toValue: 1,
								duration: index == 0 ? 0 : 600,
								useNativeDriver: false,
								easing: easeInOutQuint
							}),
						])
				])
			])
		).start();

		(async () => {
			for (let index = 1; index < messages.length + 1; index++) {
				Animated.timing(progressionAnimTextOpacity, {
					toValue: 1,
					duration: 200,
					useNativeDriver: false,
					easing: easeInOutQuint
				}).start();

				setCurrentMessage(messages[index - 1]);

				await delay(stepDuration - 400);

				if (index != messages.length) {
					Animated.timing(progressionAnimTextOpacity, {
						toValue: 0,
						duration: 300,
						useNativeDriver: false,
						easing: easeInOutQuint
					}).start();

					await delay(200);
				}
			}
		})();
	}, []);

	useEffect(() => {
		if (handle.state == "finished") {
			(async () => {
				progressionAnimTextOpacity.setValue(1);

				for (let index = 0; index < messages.length - 2; index++) {
					progressionAnimCirclesColor[index].setValue(1);
					progressionAnimCirclesRipple[index].setValue(1);
				}

				setCurrentMessage(messages[messages.length - 1]);

				Animated.parallel([
					Animated.timing(progressionAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: false,
						easing: easeInOutQuint
					}),
					Animated.parallel([
						Animated.timing(progressionAnimCirclesColor[messages.length - 1], {
							delay: 250,
							toValue: 1,
							duration: 200,
							useNativeDriver: false,
							easing: easeInOutQuint
						}),
						Animated.timing(progressionAnimCirclesRipple[messages.length - 1], {
							delay: 250,
							toValue: 1,
							duration: 500,
							useNativeDriver: false,
							easing: easeInOutQuint
						}),
					])
				]).start();

				await delay(800);

				Animated.timing(showingUpAnim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: false,
					easing: easeInOutQuint
				}).start();

				await delay(400);

				handle.remove();
			})();
		}
	}, [handle.state]);

	const barColor = theme == "light" ? Colors.light.crust : Colors.dark.base;

	return (
		<Animated.View style={[{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			position: "absolute",
			top: -100,
			width: "100%",
			height: "130%",
			backgroundColor: "#0006",
			zIndex: 100000000,
			opacity: showingUpAnim.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 1]
			})
		}]}>
			<Animated.View
				style={{
					backgroundColor: theme == "light" ? Colors.light.base : Colors.dark.surface0,
					padding: paddingSizes["lg"],
					borderRadius: radiusSizes["lg"],
					width: "80%",
					transform: [{
						translateY: showingUpAnim.interpolate({
							inputRange: [0, 1],
							outputRange: [20, 0]
						})
					}],
					opacity: showingUpAnim.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 1]
					})
				}}
			>
				<Animated.Text style={{
					fontSize: textSizes["sm"],
					fontFamily: "Inter-SemiBold",
					textAlign: "center",
					color: Colors[theme][color],
					marginBottom: marginSizes["md"],
					opacity: progressionAnimTextOpacity.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 1]
					})
				}}>
					{currentMessage}
				</Animated.Text>

				<TView flexDirection='row' justifyContent='space-between' mb={-7} ml={-1} mr={-1} style={{ zIndex: 30 }}>
					{
						messages.map((_, index) => (
							<View key={_} style={{ position: "relative" }}>
								<Animated.View style={{
									backgroundColor: progressionAnimCirclesColor[index].interpolate({
										inputRange: [0, 1],
										outputRange: [barColor, Colors[theme][color]],
									}),
									borderRadius: 9999,
									padding: 6,
									zIndex: 100
								}} />

								<Animated.View style={{
									opacity: progressionAnimCirclesRipple[index].interpolate({
										inputRange: [0, 0.75, 1],
										outputRange: [0, 1, 0],
									}),
									borderColor: Colors[theme][color],
									borderWidth: 0.75,
									transform: [
										{
											scale: progressionAnimCirclesRipple[index].interpolate({
												inputRange: [0, 1],
												outputRange: [1, 2],
											})
										}
									],
									borderRadius: 9999,
									padding: 6,
									position: "absolute",
									left: -1,
									top: -1
								}} />
							</View>
						))
					}
				</TView>

				<View style={{ backgroundColor: barColor }}>
					<Animated.View style={{
						width: progressionAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], }),
						height: 3,
						backgroundColor: Colors[theme][color]
					}}></Animated.View>
				</View>
			</Animated.View>
		</Animated.View>
	);
};
