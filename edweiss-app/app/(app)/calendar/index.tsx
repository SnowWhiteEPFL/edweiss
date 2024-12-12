import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import { getNavigationDetails } from '@/components/core/Day';
import TText from '@/components/core/TText';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { Room } from '@/model/school/schedule';
import { getDocs, Timestamp } from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';

interface CustomEvents {
  name: string;
  startTime: number;
  endTime?: number;
  rooms?: Room[];
  period?: CourseTimePeriod;
  course?: { id: string, data: Course };
  todo?: { id: string, data: any };
  type: "Todo" | "Course" | "Assignment";
  assignmentID?: string;
}
const calculateTopOffset = (startTime: string) => {
  const [hours, minutes] = startTime.split(':').map(Number);

  const offset = minutes / 60 * 80;  // Calculer la position de l'heure
  return offset;  // Calculer la hauteur en fonction de l'heure et des minutes
};
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};
const EventsPerDayScreen = () => {

  const [isPortrait, setIsPortrait] = useState(true);
  const [loading, setLoading] = useState(true);
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: CustomEvents[] }>({});
  const auth = useAuth();
  const user = auth.authUser;
  const authUserId = auth.authUser?.uid;
  const { width, height } = useWindowDimensions();
  useEffect(() => {
    setIsPortrait(height > width); // Détecter l'orientation
  }, [width, height]);


  const HOUR_HEIGHT = 80; // Hauteur d'une case horaire



  const generateWeekDates = () => {
    const today = new Date();
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const allEvents: { [key: string]: CustomEvents[] } = {};
      const coursesSnapshot = await getDocs(CollectionOf('courses'));
      const myCoursesSnapshot = await getDocs(CollectionOf(`users/${authUserId}/courses`));

      const myCoursesIds = myCoursesSnapshot.docs.map((doc) => doc.id);
      const todoSnapshot = await getDocs(CollectionOf(`users/${authUserId}/todos`));
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

        periods.forEach((period: CourseTimePeriod) => {
          const startTime = period.start;
          const endTime = period.end;
          const dayIndex = period.dayIndex;
          const rooms = period.rooms; // Assuming 'name' is the string property of 'Room'

          const date = new Date();
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

      setEventsByDate(allEvents);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger les événements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const renderBlocks2 = (events: CustomEvents[], item: string) => {
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const currentPosition = (currentMinutes / 60) * 80; // Ajuster en fonction de la hauteur (80 pixels par heure)

    const blocks = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      events: events.filter(
        (event) => event.startTime >= i * 60 && event.startTime < (i + 1) * 60
      ),
    }));

    return (
      <TView style={{ flexDirection: 'column', position: 'relative' }}>
        {/* Trait rouge pour l'heure actuelle */}
        {item === new Date().toISOString().split('T')[0] && (
          <TView
            style={{
              position: 'absolute',
              top: currentPosition,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: 'red',
              zIndex: 10,
            }}
          />
        )}

        {blocks.map((block, index) => (
          <TView
            key={index}
            style={{
              flexDirection: 'row',

              height: 80, // Hauteur fixe par heure
              borderBottomWidth: 1,
              borderColor: '#ddd',
            }}
          >
            {/* Texte de l'heure */}
            <TView
              style={{
                width: 50,
                alignItems: 'flex-start',
              }}
            >
              <TText style={{ color: '#aaa', fontSize: 14 }}>
                {`${block.hour.toString().padStart(2, '0')}:00`}
              </TText>
            </TView>

            {/* Événements */}
            {block.events.length > 0 && (
              <TView
                style={{
                  flex: 1,
                  padding: 0,
                }}
              >
                {block.events.map((event, i) => {
                  const eventDuration = event.endTime
                    ? event.endTime - event.startTime
                    : 0; // Calculate duration in minutes
                  const eventHeight = ((eventDuration / 60) * 80) > 80 ? ((eventDuration / 60) * 80) : 80; // Convert to pixels
                  return (
                    <TView
                      key={i}
                      style={{
                        top: calculateTopOffset(formatTime(event.startTime)), // Décalage de l'événement
                        padding: 8,
                        borderRadius: 4,
                        backgroundColor: '#f9f9f9',
                        borderWidth: 1,
                        borderColor: '#ddd',
                        zIndex: 5, // Garantir que l'événement se trouve au-dessus des autres éléments
                        height: eventHeight, // Hauteur de l'événement
                      }}
                    >
                      <TText
                        style={{
                          fontSize: 14,
                          color: '#333',
                          fontWeight: 'bold',
                          marginBottom: 4,
                        }}
                      >
                        {event.name}
                      </TText>
                      {event.endTime !== undefined ? (
                        <>
                          {/* Afficher startTime et endTime */}
                          <TText style={{ fontSize: 12, color: '#666' }}>
                            Start: {formatTime(event.startTime)}
                          </TText>
                          <TText style={{ fontSize: 12, color: '#666' }}>
                            End: {formatTime(event.endTime)}
                          </TText>
                        </>
                      ) : (
                        <>
                          {/* Afficher seulement startTime avec un libellé personnalisé */}
                          <TText style={{ fontSize: 12, color: '#666' }}>
                            Scheduled at: {formatTime(event.startTime)}
                          </TText>
                        </>
                      )}
                    </TView>
                  );
                })}
              </TView>
            )}
          </TView>
        ))}
      </TView>
    );
  };

  const renderDay = ({ item }: { item: string }) => {
    const events = eventsByDate[item] || [];
    return (
      <TView style={{ width, height }}>
        <TScrollView style={{ width, padding: 8 }}>
          <TText>{item}</TText>
          <TText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            {item}
          </TText>
          {renderBlocks2(events, item)}
        </TScrollView>
      </TView>
    );
  };

  const weekDates = generateWeekDates();

  const renderPortraitView = () => (
    <FlatList
      data={weekDates}
      horizontal
      pagingEnabled
      keyExtractor={(item) => item}
      renderItem={renderDay}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center' }}
    />
  );
  function HorizontalTableView() {

    return (
      <TView flex={1}>
        {loading ? <TText>Loading...</TText> : <CalendarTable eventsByDate={eventsByDate} />}
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



interface CalendarTableProps {
  eventsByDate: { [key: string]: CustomEvents[] };
}

const CalendarTable = ({ eventsByDate }: CalendarTableProps) => {


  const auth = useAuth();
  const user = auth.authUser;
  const getStartOfWeek = (date: string | number | Date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday (1) or previous Monday if Sunday (0)
    currentDate.setDate(currentDate.getDate() + diff);
    return currentDate;
  };

  // Define the days of the week starting from Monday
  const getDaysOfWeekFromMonday = () => {
    const monday = getStartOfWeek(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day.toISOString().split('T')[0]);
    }
    return days;
  };



  const daysOfWeek = getDaysOfWeekFromMonday();

  // Générer une liste d'heures
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const formatDateToReadable = (date: number | Date | undefined) => {
    const formatter = new Intl.DateTimeFormat('en-EN', {
      weekday: 'short', // Full day name (e.g., "lundi")
      day: 'numeric',  // Day of the month
      month: 'short',   // Full month name (e.g., "décembre")
    });
    return formatter.format(date);
  };

  return (
    <TScrollView flexDirection='column'>
      <TView flexDirection='row'>
        <TView style={{ width: '9%' }} />
        {daysOfWeek.map((day) => (
          <TView key={day} flex={1} justifyContent='center' alignItems='center' b={1} borderColor='overlay0' backgroundColor='overlay0' style={{

            height: 40, width: '13%'

          }}>
            <TText size='xs'>{formatDateToReadable(new Date(day))}</TText>
          </TView>
        ))}
      </TView>
      {hours.map((hour) => (
        <TView key={hour} flexDirection='row'>
          <TView justifyContent='center' alignItems='center' b={1} borderColor='overlay1' style={{ width: '9%', height: 80, }}>
            <TText>{hour}</TText>
          </TView>
          {daysOfWeek.map((day, colIndex) => {
            const events = eventsByDate[day]?.filter(
              (event) =>
                event.startTime >= parseInt(hour) * 60 &&
                event.startTime < (parseInt(hour) + 1) * 60
            );
            return (
              <TView key={`${hour}-${colIndex}`} flex={1} b={1} borderColor='overlay0' style={{ height: 80 }}>
                {events?.map((event, index) => {
                  const eventDuration = event.endTime ? event.endTime - event.startTime : 0; // Calculate duration in minutes
                  const eventHeight = ((eventDuration / 60) * 80) > 80 ? ((eventDuration / 60) * 80) : 80; // Convert to pixels
                  const { pathname, params } = event.period && event.course ? getNavigationDetails(user, event.course, event.period, index) : { pathname: '', params: {} };
                  const todoParams = event.todo
                    ? { todo: JSON.stringify(event.todo) } // Sérialiser l'objet
                    : {};
                  console.log(pathname);
                  const assignmentParams = { pathname: `/(app)/quiz/temporaryQuizStudentView`, params: { quizId: event.assignmentID, courseId: event.course?.id } }
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (event.type == "Course") {
                          router.push({ pathname: pathname as any, params });
                        } else if (event.type == "Todo") {
                          router.push({ pathname: '/(app)/todo', params: todoParams });
                        }
                        else {
                          console.log(assignmentParams);
                          router.push(assignmentParams);
                        }
                      }}
                      key={index}
                      style={{
                        top: calculateTopOffset(formatTime(event.startTime)), // Décalage de l'événement
                        padding: 8,
                        borderRadius: 4,
                        backgroundColor: '#f9f9f9',
                        borderWidth: 1,
                        borderColor: '#ddd',
                        zIndex: 5, // Garantir que l'événement se trouve au-dessus des autres éléments
                        height: eventHeight, // Hauteur de l'événement
                      }}
                    >
                      <TText
                        size={9}
                        color='text'
                      >
                        {event.name}
                      </TText>
                      {event.endTime !== undefined ? (
                        <>
                          {/* Afficher startTime et endTime */}
                          <TText size={5} color='text'>
                            Start: {formatTime(event.startTime)}
                          </TText>
                          <TText size={5} color='text'>
                            End: {formatTime(event.endTime)}
                          </TText>
                        </>
                      ) : (
                        <>
                          {/* Afficher seulement startTime avec un libellé personnalisé */}
                          <TText style={{ fontSize: 12, color: '#666' }}>
                            Scheduled at: {formatTime(event.startTime)}
                          </TText>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </TView>
            );
          })}
        </TView>
      ))
      }
    </TScrollView >
  );
};


