import { CollectionOf } from '@/config/firebase';
import { AssignmentBase, CourseTimePeriod } from '@/model/school/courses';
import auth from '@react-native-firebase/auth';
import { getDocs, Timestamp } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Agenda, AgendaEntry as RNCAgendaEntry } from 'react-native-calendars';

interface AgendaEntry extends Omit<RNCAgendaEntry, 'time'> {
    name: string;
    time: string;  // Assurez-vous que "time" est inclus dans AgendaEntry
    day: string;   // Le jour de la semaine (0: dimanche, 1: lundi, etc.)
    height: number; // Hauteur de l'événement (en pixels)
}

const AgendaScreen = () => {
    const [events, setEvents] = useState<{ [key: string]: CustomAgendaEntry[] }>({});
    const authUserId = auth().currentUser?.uid;

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const fetchAllCoursesEvents = async () => {
        try {
            const myCourses = await getDocs(CollectionOf(`users/${authUserId}/courses`));
            const coursesSnapshot = await getDocs(CollectionOf("courses"));
            const courses: any[] = [];
            coursesSnapshot.docs.forEach((course) => {
                if (myCourses.docs.some((myCourse) => myCourse.id === course.id)) {
                    courses.push(course);
                }
            });

            const allEventsData: { [key: string]: CustomAgendaEntry[] } = {};

            const startDate = new Date('2024-09-09');
            const endDate = new Date('2024-12-22');

            const getWeekDates = (startDate: Date, endDate: Date) => {
                const weeks = [];
                let currentDate = new Date(startDate);

                while (currentDate <= endDate) {
                    weeks.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 7);
                }

                return weeks;
            };

            const weekDates = getWeekDates(startDate, endDate);

            for (const courseDoc of coursesSnapshot.docs) {
                const courseId = courseDoc.id;
                const periodsSnapshot = courseDoc.data().periods || [];

                if (Array.isArray(periodsSnapshot)) {
                    periodsSnapshot.forEach((period: CourseTimePeriod) => {
                        const dayOfWeek = period.dayIndex;
                        const startTime = period.start;
                        const endTime = period.end;

                        weekDates.forEach((weekStartDate) => {
                            const currentDate = new Date(weekStartDate);
                            const daysToAdd = (dayOfWeek - currentDate.getDay() + 7) % 7;
                            currentDate.setDate(currentDate.getDate() + daysToAdd);

                            const dateKey = currentDate.toISOString().split("T")[0];

                            if (!allEventsData[dateKey]) {
                                allEventsData[dateKey] = [];
                            }

                            allEventsData[dateKey].push({
                                name: `${courseId}: ${period.type}`,
                                time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
                                height: 50,
                                day: ''
                            });
                        });
                    });
                }

                const assignmentsSnapshot = await getDocs(CollectionOf(`courses/${courseId}/assignments`));
                assignmentsSnapshot.forEach((assignmentDoc) => {
                    const event = assignmentDoc.data() as unknown as AssignmentBase;
                    if (event.dueDate && event.dueDate instanceof Timestamp) {
                        const dueDate = event.dueDate.toDate();
                        const dateKey = dueDate.toISOString().split("T")[0];

                        if (!allEventsData[dateKey]) {
                            allEventsData[dateKey] = [];
                        }
                    }
                });
            }

            const todosSnapshot = await getDocs(CollectionOf(`users/${authUserId}/todos`));
            todosSnapshot.forEach((doc) => {
                const todo = doc.data() as { name: string; dueDate: Timestamp };
                if (todo.dueDate && todo.dueDate instanceof Timestamp) {
                    const dueDate = todo.dueDate.toDate();
                    const dateKey = dueDate.toISOString().split("T")[0];

                    if (!allEventsData[dateKey]) {
                        allEventsData[dateKey] = [];
                    }

                    allEventsData[dateKey].push({
                        name: todo.name,
                        time: dueDate.toLocaleTimeString(),
                        height: 50,
                        day: ''
                    });
                }
            });

            setEvents(allEventsData);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de récupérer les événements et les ToDos");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAllCoursesEvents();
    }, []);

    interface CustomAgendaEntry extends AgendaEntry {
        time: string;
        name: string;
    }

    const renderAgendaItem = (reservation: AgendaEntry, isFirst: boolean) => (
        <View style={styles.eventCard}>
            <Text style={styles.eventName}>{reservation.name}</Text>
            <Text style={styles.eventTime}>{reservation.time}</Text>
        </View>
    );

    return (
        <Agenda
            items={events}
            renderItem={renderAgendaItem}
            selected={new Date().toISOString().split("T")[0]}
            firstDay={1}  // Lundi comme premier jour de la semaine
            theme={{
                selectedDayBackgroundColor: 'green',
                todayTextColor: 'red',
                agendaDayTextColor: 'blue',
                agendaDayNumColor: 'blue',
            }}
        />
    );
};

const styles = StyleSheet.create({
    eventCard: {
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        padding: 15,
        marginVertical: 5,
    },
    eventName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    eventTime: {
        fontSize: 14,
        color: '#666',
    },
});

export default AgendaScreen;
