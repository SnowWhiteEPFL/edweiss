// Import necessary components, types, and utilities
import { Color } from '@/constants/Colors';
import { AssignmentBase, Course, CourseTimePeriod } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import React from 'react';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import For from './For';
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
    items.length > 0 && (
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
    return (
        <>
            <For each={course.filter((courseItem) => filteredPeriods.some((period) => courseItem.data.periods.includes(period)))}>
                {(courseItem, index) =>
                    filteredPeriods.map((period) => {
                        const periodHeight = ((period.end ?? period.start) - period.start) / 60 * HOUR_BLOCK_HEIGHT || HOUR_BLOCK_HEIGHT;
                        const { pathname, params } = getNavigationDetails(user, courseItem, period, index);

                        return (
                            <TTouchableOpacity
                                key={`period-${courseItem.id}-${period.start}-${period.end}`}
                                flex={1 / filteredPeriods.length}
                                borderColor="overlay2"
                                radius={10}
                                b={2}
                                backgroundColor={getBackgroundColor(period.type)}
                                onPress={() => router.push({ pathname: pathname as any, params })}
                                style={{ height: periodHeight }}

                            >
                                <PeriodBlock period={period} format={format} course={courseItem} user={user} />
                            </TTouchableOpacity>
                        );
                    })
                }
            </For>

            <RenderList title="Assignments Due Today:" items={assignments} color="red" itemKey="assignment" />
            <RenderList title="To-Dos:" items={todos} color="blue" itemKey="todo" />
        </>
    );
};
