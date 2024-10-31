import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import CalendarDisplay from '@/components/calendar/CalendarDisplay';
import { useState } from 'react';

const Route: ApplicationRoute = () => {

	const [selectedDate, setSelectedDate] = useState(new Date());

	return (
		<>
			<RouteHeader title='My calendar' />

			{
				/**
				 * 
				 * We should implement some sort of smooth Swipe mechanic on this page
				 * to call the `setSelectedDate`.
				 * 
				 */
			}

			{/* <Swipeable renderRightActions={() => <TText>HELLO</TText>} containerStyle={{ flex: 1 }} childrenContainerStyle={{ flex: 1 }}> */}
			<CalendarDisplay courses={[]} date={selectedDate} />
			{/* </Swipeable> */}
		</>
	);
};

export default Route;
