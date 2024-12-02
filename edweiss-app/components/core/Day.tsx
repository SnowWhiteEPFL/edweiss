// Import necessary components, types, and utilities
import { Color } from '@/constants/Colors';
import { AssignmentBase, Course, CourseTimePeriod } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import { PeriodBlock } from './PeriodBlock';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;

// Function to determine background color based on type
export const getBackgroundColor = (type: string): Color =>
    ({ lecture: 'blue', lab: 'yellow', exercises: 'green' }[type] as Color || 'overlay2');

// Function to compute navigation details based on user type
export const getNavigationDetails = (user: any, courseItem: { id: string; data: Course }, period: CourseTimePeriod, index: number) => {
    const isProfessor = user?.data.type === 'professor';
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

// Reusable component to render a list of items
const RenderList = ({ title, items, color, itemKey }: { title: string; items: any[]; color: Color; itemKey: string }) =>

    items?.length > 0 && (
        <TView mt={10} p={10} backgroundColor={color} b={10}>
            <TText>{title}</TText>
            {items.map((item) => (
                <TView key={`${itemKey}-${item.id}`} mt={5}>
                    <TText>{item.data.name}</TText>
                </TView>
            ))}
        </TView>
    );

// Main Day component

// Fonction de rendu des périodes, prenant un tableau avec les détails calculés
const renderPeriods = ({
    periodData,
    format,
    user,
    courseItem,
}: {
    periodData: { period: CourseTimePeriod; periodHeight: number; position: number; pathname: string; params: any; courseItem: { id: string; data: Course } }[];
    format: string;
    user: any;
    courseItem: { id: string; data: Course };
}) => {
    return (
        <>
            {periodData.map(({ period, periodHeight, position, pathname, params }) => (
                <TTouchableOpacity
                    key={`period-${period.start}-${period.end}`}
                    flex={1}
                    borderColor="overlay2"
                    radius={10}
                    b={2}
                    backgroundColor={getBackgroundColor(period.type)}
                    onPress={() => router.push({ pathname: pathname as any, params })}
                    style={{ height: periodHeight, top: position }}
                >
                    <PeriodBlock
                        period={period}
                        format={format}
                        course={courseItem}
                        user={user}
                    />
                </TTouchableOpacity>
            ))}
        </>
    );
};
export default renderPeriods;

export const Day = ({
    course,
    user,
    filteredPeriods,
    format,
    assignments,
    todos,
}: {
    course: { id: string; data: Course }[];
    user: any;
    filteredPeriods: CourseTimePeriod[];
    format: string;
    assignments: { id: string; data: AssignmentBase }[];
    todos: { id: string; data: Todolist.Todo }[];
}) => {
    const [topPosition, setTopPosition] = useState(0);

    // Regrouper les périodes par leur cours associé et mémoriser les positions
    const periodData = useMemo(() => {
        const data: any[] = [];
        let ind = 0
        course.forEach((courseItem) => {
            const periods = filteredPeriods.filter((period) =>
                courseItem.data.periods.includes(period)
            );

            periods.forEach((period, index) => {

                const periodHeight =
                    (((period.end ?? period.start) - period.start) / 60) * 80; // HOUR_BLOCK_HEIGHT
                const { pathname, params } = getNavigationDetails(user, courseItem, period, index);
                const position = (period.start / 60) * HOUR_BLOCK_HEIGHT - ind;
                setTopPosition(periodHeight)
                ind = periodHeight

                // Calculer la position et créer un tableau avec les données nécessaires
                data.push({
                    period,
                    periodHeight,
                    position,
                    pathname,
                    params,
                    courseItem
                });
            });
        });

        return data;
    }, [course, filteredPeriods, user]);

    return (
        <>

            {/* Appel de la fonction renderPeriods avec le tableau de données pré-calculé */}
            {renderPeriods({
                periodData,
                format,
                user,
                courseItem: periodData[0]?.courseItem
            })}



            <RenderList title="Assignments Due Today:" items={assignments} color="red" itemKey="assignment" />
            <RenderList title="To-Dos:" items={todos} color="blue" itemKey="todo" />
        </>
    );
};
