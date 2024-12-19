import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { CustomEvents } from '@/model/school/Events';
import { getDocs, Timestamp } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import HorizontalCalendar from './horizontalCalendar'; // Import HorizontalCalendar
import VerticalCalendar from './VerticalCalendar';

export interface EventsByDate {
  [key: string]: CustomEvents[];
}

// Function to get navigation details based on user type and course information
export const getNavigationDetails = (user: any, courseItem: { id: string; data: Course }, period: CourseTimePeriod, index: number) => {
  const isProfessor = user?.type === 'professor';
  return {
    pathname: isProfessor ? '/(app)/startCourseScreen' : '/(app)/lectures/slides',
    params: isProfessor
      ? {
        courseID: courseItem.id,
        course: JSON.stringify(courseItem.data),
        period: JSON.stringify(period),
        index,
      }
      : {
        courseNameString: courseItem.data.name,
        lectureIdString: period.activityId,
      },
  };
};

const HOUR_BLOCK_HEIGHT = 80; // Height of an hour block

const EventsPerDayScreen = () => {
  const [isPortrait, setIsPortrait] = useState(true); // State to track orientation
  const [loading, setLoading] = useState(true); // State to track loading status
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: CustomEvents[] }>({}); // State to store events by date
  const auth = useAuth(); // Get authentication context
  const authUserId = auth.authUser?.uid; // Get authenticated user ID
  const { width, height } = useWindowDimensions(); // Get window dimensions
  const date = new Date(); // Current date

  useEffect(() => {
    setLoading(true); // Enable loading when orientation changes
    setIsPortrait(height > width); // Update orientation
    const timer = setTimeout(() => {
      setLoading(false); // Disable loading after a delay
    }, 500); // For example, 500ms for the transition
    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [width, height]); // Track changes in width and height

  // Function to fetch all events
  const fetchAllEvents = async () => {
    setLoading(true); // Enable loading
    try {
      const allEvents: { [key: string]: CustomEvents[] } = {}; // Object to store events by date
      const coursesSnapshot = await getDocs(CollectionOf('courses')); // Fetch all courses
      const myCoursesSnapshot = await getDocs(CollectionOf(`users/${authUserId}/courses`)); // Fetch user's courses

      const myCoursesIds = myCoursesSnapshot.docs.map((doc) => doc.id); // Get IDs of user's courses
      const todoSnapshot = await getDocs(CollectionOf(`users/${authUserId}/todos`)); // Fetch user's todos
      todoSnapshot.forEach((todoDoc) => {
        const todo = todoDoc.data();
        if (todo.dueDate instanceof Timestamp) {
          const dueDate = todo.dueDate.toDate();
          const dateKey = dueDate.toISOString().split('T')[0];

          if (!allEvents[dateKey]) allEvents[dateKey] = [];
          allEvents[dateKey].push({
            name: `Todos: ${todo.name}`,
            startTime: dueDate.getHours() * 60 + dueDate.getMinutes(),
            todo: { id: todoDoc.id, data: todoDoc.data() },
            type: "Todo",
          });
        }
      });
      for (const courseDoc of coursesSnapshot.docs) {
        if (!myCoursesIds.includes(courseDoc.id)) continue;

        const course = courseDoc.data();
        const periods = course.periods || [];

        Object.entries(periods).forEach(([id, period]: [string, CourseTimePeriod]) => {
          const startTime = period.start;
          const endTime = period.end;
          const dayIndex = period.dayIndex;
          const rooms = period.rooms; // Assuming 'name' is the string property of 'Room'

          date.setDate(date.getDate() + ((dayIndex - date.getDay() + 7) % 7));
          const dateKey = date.toISOString().split('T')[0];

          if (!allEvents[dateKey]) allEvents[dateKey] = [];
          allEvents[dateKey].push({
            name: `${courseDoc.id}: ${period.type}`,
            startTime,
            endTime,
            rooms,
            period,
            course: { id: courseDoc.id, data: courseDoc.data() as unknown as Course },
            type: "Course",
          });
        });

        const assignmentsSnapshot = await getDocs(CollectionOf(`courses/${courseDoc.id}/assignments`));
        assignmentsSnapshot.forEach((assignmentDoc) => {
          const assignment = assignmentDoc.data();
          if (assignment.dueDate instanceof Timestamp) {
            const dueDate = assignment.dueDate.toDate();
            const dateKey = dueDate.toISOString().split('T')[0];

            if (!allEvents[dateKey]) allEvents[dateKey] = [];
            allEvents[dateKey].push({
              name: `Assignment: ${assignment.name}`,
              startTime: dueDate.getHours() * 60 + dueDate.getMinutes(),
              type: "Assignment",
              assignmentID: assignmentDoc.id,
              course: { id: courseDoc.id, data: courseDoc.data() as unknown as Course },
            });
          }
        });
      }

      setEventsByDate(allEvents); // Update state with fetched events
    } catch (error) {
      Alert.alert('Error', "Unable to load events"); // Show error alert
    } finally {
      setLoading(false); // Disable loading
    }
  };

  useEffect(() => {
    fetchAllEvents(); // Fetch events on component mount
  }, []);

  // Function to render portrait view
  const renderPortraitView = () => (
    <TView flex={1}>
      {loading ? <TText align='center' p={100}>Loading...</TText> : <VerticalCalendar eventsByDate={eventsByDate} />}
    </TView>
  );

  // Function to render horizontal view
  function HorizontalTableView() {
    return (
      <TView flex={1}>
        {loading ? <TText align='center' p={100}>Loading...</TText> : <HorizontalCalendar eventsByDate={eventsByDate} />}
      </TView>
    );
  }

  return (
    <TView flex={1}>
      {isPortrait ? renderPortraitView() : HorizontalTableView()}
    </TView>
  );
};

export default EventsPerDayScreen;
