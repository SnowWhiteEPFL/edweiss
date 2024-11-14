// Import necessary components, types, and utilities
import { AssignmentBase, Course, CourseTimePeriod } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import React from 'react';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import For from './For';
import { PeriodBlock } from './PeriodBlock';
import TText from './TText';

// Define the height of each hour block in the day view
const HOUR_BLOCK_HEIGHT = 80;

// Component for displaying a day with course periods, assignments, and to-dos
export const Day = ({
    course,
    user,
    filteredPeriods,
    format,
    assignments,
    todos,
}: {
    course: { id: string; data: Course }[]; // List of courses
    user: any; // User data
    filteredPeriods: CourseTimePeriod[]; // Filtered periods for the day
    format: string; // Format type for period display (e.g., "day" or "week")
    assignments: { id: string; data: AssignmentBase }[]; // Assignments due today
    todos: { id: string; data: Todolist.Todo }[]; // To-do items for the day
}) => {
    return (
        <>
            {/* Display each course period that matches filtered periods */}
            <For each={course.filter((courseItem) => filteredPeriods.some(period => courseItem.data.periods.includes(period)))}>
                {(courseItem, index) =>
                    filteredPeriods.map((period) => {
                        // Calculate the height for each period based on its duration
                        const periodHeight = period.end
                            ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT
                            : HOUR_BLOCK_HEIGHT;

                        // Determine navigation path and parameters based on user type
                        const pathname = user?.data.type === 'professor' ? '/(app)/startCourseScreen' : '/(app)/lectures/slides';
                        const params = user?.data.type === 'professor'
                            ? {
                                courseID: courseItem.id,
                                course: JSON.stringify(courseItem.data),
                                period: JSON.stringify(period),
                                index,
                            }
                            : {
                                courseNameString: courseItem.data.name,
                                lectureIdString: period.activityId,
                            };

                        // Display each period as a clickable block
                        return (
                            <TTouchableOpacity
                                key={`period-${courseItem.id}-${period.start}-${period.end}-${user?.id}`}
                                flex={1 / filteredPeriods.length}
                                borderColor="overlay2"
                                radius={10}
                                b={2}
                                backgroundColor='cherry'
                                onPress={() => {
                                    router.push({
                                        pathname: pathname,
                                        params: params,
                                    });
                                }}
                                style={{
                                    height: periodHeight,
                                }}
                            >
                                {/* Render period block with relevant details */}
                                <PeriodBlock period={period} format={format} course={courseItem} user={user} />
                            </TTouchableOpacity>
                        );
                    })
                }
            </For>

            {/* Display assignments due today if any */}
            {assignments.length > 0 && (
                <TView mt={10} p={10} backgroundColor='red' b={10} key={`assignments-${user?.id}`}>
                    <TText>Assignments Due Today:</TText>
                    {assignments.map((assignment) => (
                        <TView key={`assignment-${user?.id}-${assignment.id}`} mt={5}>
                            <TText>{assignment.data.name}</TText>
                        </TView>
                    ))}
                </TView>
            )}

            {/* Display to-do items if any */}
            {todos.length > 0 && (
                <TView mt={10} p={10} backgroundColor='blue' b={10} key={`todos-${user?.id}`}>
                    <TText>To-Dos:</TText>
                    {todos.map((todo) => (
                        <TView key={`todo-${user?.id}-${todo.id}`} mt={5}>
                            <TText mt={5}>{todo.data.name}</TText>
                        </TView>
                    ))}
                </TView >
            )}
        </>
    );
};

