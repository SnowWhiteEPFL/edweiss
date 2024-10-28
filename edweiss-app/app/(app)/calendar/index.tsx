import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import CalendarDisplay from '@/components/calendar/CalendarDisplay';

const Route: ApplicationRoute = () => {
	return (
		<>
			<RouteHeader title='My calendar' />

			{/* <Swipeable renderRightActions={() => <TText>HELLO</TText>} containerStyle={{ flex: 1 }} childrenContainerStyle={{ flex: 1 }}> */}
			<CalendarDisplay courses={[]} />
			{/* </Swipeable> */}
		</>
	);
};

export default Route;
