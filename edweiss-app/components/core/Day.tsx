import { AssignmentBase, Course, CourseTimePeriod } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import For from './For';
import { PeriodBlock } from './PeriodBlock';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;

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
    assignments: {
        id: string;
        data: AssignmentBase;
    }[];
    todos: {
        id: string;
        data: Todolist.Todo;
    }[];
}) => {
    return (
        <>
            <For each={course.filter((courseItem) => filteredPeriods.some(period => courseItem.data.periods.includes(period)))}>
                {(courseItem, index) =>
                    filteredPeriods.map((period) => {
                        const periodHeight = period.end
                            ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT
                            : HOUR_BLOCK_HEIGHT;
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

                        return (
                            <TTouchableOpacity
                                key={`period-${courseItem.id}-${period.start}-${period.end}-${user?.id}`}
                                flex={1 / filteredPeriods.length}
                                borderColor="overlay2"
                                radius={10}
                                b={2}
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
                                <PeriodBlock period={period} format={format} course={courseItem} user={user} />
                            </TTouchableOpacity>
                        );
                    })
                }
            </For>

            {assignments.length > 0 && (
                <TView style={styles.assignmentContainer} key={`assignments-${user?.id}`}>
                    <TText style={styles.assignmentTitle}>Assignments Due Today:</TText>
                    {assignments.map((assignment) => (
                        <TView key={`assignment-${user?.id}-${assignment.id}`} style={styles.assignmentItem}>
                            <TText style={styles.assignmentName}>{assignment.data.name}</TText>
                        </TView>
                    ))}
                </TView>
            )}

            {todos.length > 0 && (
                <TView style={styles.todoContainer} key={`todos-${user?.id}`}>
                    <TText style={styles.todoTitle}>To-Dos:</TText>
                    {todos.map((todo) => (
                        <TView key={`todo-${user?.id}-${todo.id}`} style={styles.todoItem}>
                            <TText style={styles.todoName}>{todo.data.name}</TText>
                        </TView>
                    ))}
                </TView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    assignmentContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 10,
    },
    assignmentTitle: {
        fontWeight: 'bold',
    },
    assignmentItem: {
        marginTop: 5,
    },
    assignmentName: {
        fontSize: 14,
    },
    todoContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'blue',
        borderRadius: 10,
    },
    todoTitle: {
        fontWeight: 'bold',
    },
    todoItem: {
        marginTop: 5,
    },
    todoName: {
        fontSize: 14,
    },
});
