import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { Course, Course_functions, CourseTimePeriod } from '@/model/school/courses';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

type Lecture = LectureDisplay.Lecture;

const StartCourseScreen: ApplicationRoute = () => {
	const { courseID, course, period } = useLocalSearchParams() as unknown as { courseID: string; course: string; period: string; index: number; };
	const [loading, setLoading] = useState(false);
	const [parsedCourse, setParsedCourse] = useState<Course>(JSON.parse(course));
	const [parsedPeriod] = useState<CourseTimePeriod>(JSON.parse(period));
	const [textButton, setTextButton] = useState("Start course");
	const [colorButtonStartStop, setColorButtonStartStop] = useState<Color>("transparent");
	const [colorButtonShow, setColorButtonShow] = useState<Color>("transparent");
	const [colorTextStartStop, setColorTextStartStop] = useState<Color>("constantBlack");
	const [colorTextShow, setColorTextShow] = useState<Color>("constantBlack");
	const lectureId = parsedPeriod.activityId;
	const [textButtonShow, setTextButtonShow] = useState("Show to student");
	const [available, setAvailable] = useState<boolean>(false);

	async function toogle() {
		setLoading(true);
		const res = await callFunction(Course_functions.Functions.toogleCourse, {
			courseID, course: parsedCourse
		});

		if (res.status == 1) {
			console.log(`OKAY, course started ${parsedCourse.started}`);
			setParsedCourse(prevCourse => ({
				...prevCourse,
				started: !prevCourse.started
			}));
		}
		setLoading(false);
	}

	async function toogle_2() {
		setLoading(true);

		try {
			const res = await callFunction(Course_functions.Functions.tooglePeriod, {
				courseID: courseID, lectureID: lectureId, course: parsedCourse
			});
			console.log("2");
			if (res.status == 1) {
				setAvailable(res.data.available);
			} else {
				console.log(`Failed to make available to student, status: ${res.status}`);
			}
		} catch (error) {
			console.error("Error toggling period:", error);
		}
		setLoading(false);
	}

	useEffect(() => {
		setColorButtonStartStop(parsedCourse.started ? "transparent" : "overlay2");
		setTextButton(parsedCourse.started ? "Stop course" : "Start course");
		setColorTextStartStop(parsedCourse.started ? "flamingo" : "constantBlack");
		setTextButtonShow(available ? "Sharing in progress..." : "Show to student");
		setColorTextShow(available ? "flamingo" : "constantBlack");
		setColorButtonShow(available ? "transparent" : "overlay2");
	}, [parsedCourse.started, available]);

	return (
		<TView flexDirection='column'>
			<RouteHeader title={"Course gestion"} />
			{loading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : (
				<>
					<FancyButton style={{ borderRadius: 40, borderColor: "blue", }} key={"toogle"} backgroundColor={colorButtonStartStop} m={15}
						onPress={() => { toogle(); }}>
						<TText color={colorTextStartStop}>{textButton}</TText>
					</FancyButton>

					<FancyButton style={{ borderRadius: 40, borderColor: "blue", }} key={"Show"} m={15} backgroundColor={colorButtonShow}
						onPress={() => { toogle_2(); }}>
						<TText color={colorTextShow}>{textButtonShow}</TText>
					</FancyButton>
					<FancyButton style={{ borderRadius: 40, borderColor: "blue", }} backgroundColor={'overlay2'} m={15} onPress={() => {
						router.push({
							pathname: '/(app)/lectures/slides' as any,
							params: {
								courseNameString: parsedCourse.name,
								lectureIdString: lectureId
							}
						});
					}} ><TText color='constantBlack'>Go to show Time</TText></FancyButton>


					<FancyButton style={{ borderRadius: 40, borderColor: "blue", }} backgroundColor={'overlay2'} m={15} onPress={() => {
						router.push({
							pathname: '/(app)/lectures/remotecontrol' as any,
							params: {
								courseNameString: parsedCourse.name,
								lectureIdString: lectureId
							}

						});
					}} >
						<TText color='constantBlack'> Go to STRC</TText>
					</FancyButton>


					<FancyButton style={{ borderRadius: 40, borderColor: "blue", }} backgroundColor={'overlay2'} m={15}>
						<TText color='constantBlack'> Send my Token</TText>
					</FancyButton>






				</>
			)}
		</TView>
	);
};

export default StartCourseScreen;
