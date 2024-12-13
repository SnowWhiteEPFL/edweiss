import { calculateTopOffset, formatDateToReadable, formatTime, getDaysOfWeekFromMonday } from '@/components/calendar/functions';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { useAuth } from '@/contexts/auth';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { EventsByDate, getNavigationDetails } from '.';

/**
 * Renders a horizontal calendar view with events.
 *
 * @param {Object} props - The component props.
 * @param {EventsByDate} props.eventsByDate - An object containing events grouped by date.
 *
 * @returns {JSX.Element} The horizontal calendar component.
 *
 * @component
 *
 * @example
 * const eventsByDate = {
 *   '2023-10-01': [
 *     { name: 'Event 1', startTime: 60, endTime: 120, type: 'Course', period: 'Morning', course: { id: 1 }, assignmentID: 123 },
 *     { name: 'Event 2', startTime: 180, endTime: 240, type: 'Todo', todo: { id: 1 } }
 *   ],
 *   '2023-10-02': [
 *     { name: 'Event 3', startTime: 300, endTime: 360, type: 'Assignment', assignmentID: 456, course: { id: 2 } }
 *   ]
 * };
 * 
 * <HorizontalCalendar eventsByDate={eventsByDate} />
 */
export const horizontaCalendar = ({ eventsByDate }: { eventsByDate: EventsByDate }) => {
    const auth = useAuth();
    const user = auth.authUser;
    const daysOfWeek = getDaysOfWeekFromMonday(); // Get days of the week starting from Monday
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`); // Generate an array of hours from 0:00 to 23:00

    return (
        <>
            {/* Render the days of the week */}
            <TView pt={25} flexDirection='row'>
                <TView style={{ width: '9%' }} />
                {daysOfWeek.map((day) => (
                    <TView key={day} flex={1} justifyContent='center' alignItems='center' b={1} borderColor='overlay0' backgroundColor='overlay0' style={{
                        height: 40, width: '13%'
                    }}>
                        <TText size='xs'>{formatDateToReadable(new Date(day))}</TText>
                    </TView>
                ))}
            </TView>
            {/* Render the hours and events */}
            <ScrollView style={{ flexDirection: 'column' }}>
                {hours.map((hour) => (
                    <TView key={hour} flexDirection='row'>
                        <TView justifyContent='center' alignItems='center' b={1} borderColor='overlay1' style={{ width: '9%', height: 80 }}>
                            <TText>{hour}</TText>
                        </TView>
                        {daysOfWeek.map((day, colIndex) => {
                            const events = eventsByDate[day]?.filter(
                                (event) => event.startTime >= parseInt(hour) * 60 &&
                                    event.startTime < (parseInt(hour) + 1) * 60
                            );
                            return (
                                <TView key={`${hour}-${colIndex}`} flex={1} b={1} borderColor='overlay2' style={{ height: 80 }}>
                                    {events?.map((event, index) => {
                                        const eventDuration = event.endTime ? event.endTime - event.startTime : 0; // Calculate duration in minutes
                                        const eventHeight = ((eventDuration / 60) * 80) > 80 ? ((eventDuration / 60) * 80) : 80; // Convert to pixels
                                        const { pathname, params } = event.period && event.course ? getNavigationDetails(user, event.course, event.period, index) : { pathname: '', params: {} };
                                        const todoParams = event.todo
                                            ? { todo: JSON.stringify(event.todo) } // Serialize the object
                                            : {};
                                        const assignmentPath = `/(app)/quiz/temporaryQuizStudentView`;
                                        const assignmentParams = { quizId: event.assignmentID, courseId: event.course?.id }

                                        return (
                                            <TTouchableOpacity
                                                onPress={() => {
                                                    if (event.type == "Course") {
                                                        router.push({ pathname: pathname as any, params });
                                                    } else if (event.type == "Todo") {
                                                        router.push({ pathname: '/(app)/todo', params: todoParams });
                                                    }
                                                    else {
                                                        router.push({ pathname: assignmentPath, params: assignmentParams });
                                                    }
                                                }}
                                                key={index}
                                                radius={4}
                                                backgroundColor='flamingo'
                                                b={1}
                                                borderColor='red'
                                                style={{
                                                    top: calculateTopOffset(formatTime(event.startTime)), // Event offset
                                                    height: eventHeight, // Event height
                                                }}
                                            >
                                                <TText size={'xs'} color='constantBlack'>
                                                    {event.name}
                                                </TText>
                                            </TTouchableOpacity>
                                        );
                                    })}
                                </TView>
                            );
                        })}
                    </TView>
                ))}
            </ScrollView>
        </>
    );
};

export default horizontaCalendar;
