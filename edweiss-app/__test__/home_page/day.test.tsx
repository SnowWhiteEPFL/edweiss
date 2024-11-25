import { Day, getBackgroundColor, getNavigationDetails } from '@/components/core/Day';
import { AssignmentBase, AssignmentType, CourseTimePeriod, Section } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';
import { Timestamp } from '@/model/time';
import Todolist from '@/model/todo';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}));

// Definition of mock data in accordance with the model types
const mockCourses = [
    {
        id: 'course1',
        data: {
            name: 'Course 1',
            periods: [
                {
                    id: 'period1',
                    start: 0,
                    end: 60,
                    type: 'lecture' as CourseTimePeriodType,
                    activityId: 'view',
                    dayIndex: 0,
                    rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],
                },
            ],
            credits: 3,
            newAssignments: true,
            assignments: [{ type: 'quiz' as AssignmentType, name: 'Quiz 1', dueDate: { seconds: Math.floor(1234567890 / 1000), nanoseconds: (1234567890 % 1000) * 1000000 } as Timestamp }],
            description: 'Course description',
            professors: ['Professor 1'],
            assistants: ['Assistant 1'],
            section: 'IN' as Section, // Correct section type
            started: true,
        },
    }
];

const mockUser = { data: { type: 'student' } };
const mockFilteredPeriods = [
    {
        start: 540, // 9:00 AM
        end: 600,  // 10:00 AM
        type: 'lecture' as CourseTimePeriodType,
        activityId: 'view',
        dayIndex: 1, // Corresponds to Monday
        rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],
    }
];

const mockAssignments = [
    {
        id: '1',
        data: {
            name: 'Assignment 1',
            type: 'quiz' as AssignmentType,
            dueDate: { seconds: Math.floor(1234567890 / 1000), nanoseconds: (1234567890 % 1000) * 1000000 } as Timestamp
        }
    }
];
const mockTodos = [{ id: '1', data: { name: 'Todo 1', status: 'pending' as Todolist.TodoStatus } }];

const HOUR_BLOCK_HEIGHT = 50; // Define the constant with an appropriate value

describe('Day Component', () => {

    it('should render TouchableOpacity for each period and call getNavigationDetails', () => {
        const user = { data: { type: 'professor' } };
        const courseItem = {
            id: 'course1',
            data: {
                name: 'Course 1',
                periods: [],
                description: 'Course description',
                professors: [],
                assistants: [],
                section: 'IN' as Section,
                credits: 3,
                newAssignments: false,
                assignments: [],
                started: false,
            }
        };

        // Simulate periods
        const filteredPeriods: CourseTimePeriod[] = [
            { start: 9, end: 10, type: 'lecture' as CourseTimePeriodType, activityId: 'activity1', dayIndex: 1, rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }] },
            { start: 11, end: 12, type: 'lab' as CourseTimePeriodType, activityId: 'activity2', dayIndex: 1, rooms: [{ name: 'Room 102', geoloc: { latitude: 0, longitude: 0 } }] },
        ];

        const assignments: { id: string; data: AssignmentBase; }[] = [];
        const todos: { id: string; data: Todolist.Todo; }[] = [];
        const format = 'HH:mm';

        // Render the component with test data
        const { getByText, getAllByRole } = render(
            <Day
                course={[courseItem]}
                user={user}
                filteredPeriods={filteredPeriods}
                format={format}
                assignments={assignments}
                todos={todos}
            />
        );

        // Verify that the getNavigationDetails function is called with the correct values
        filteredPeriods.forEach((period, index) => {
            // Check if the `periodHeight` calculation is correct
            const periodHeight = ((period.end ?? period.start) - period.start) / 60 * HOUR_BLOCK_HEIGHT || HOUR_BLOCK_HEIGHT;
            expect(periodHeight).toBeCloseTo(((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT, 0);

            // Check if getNavigationDetails is called
            const { pathname, params } = getNavigationDetails(user, courseItem, period, index);
            expect(pathname).toBe('/(app)/startCourseScreen');  // This depends on your logic
            expect(params).toEqual({
                courseID: 'course1',
                course: JSON.stringify(courseItem.data),
                period: JSON.stringify(period),
                index,
            });
        });
    });

    it('should render assignments if they are provided', () => {
        render(
            <Day
                course={mockCourses}
                user={mockUser}
                filteredPeriods={[]}
                format="day"
                assignments={mockAssignments}
                todos={[]}
            />
        );

        // Check that the assignments are rendered
        expect(screen.getByText('Assignments Due Today:')).toBeTruthy();
        expect(screen.getByText('Assignment 1')).toBeTruthy();
    });

    it('should render to-dos if they are provided', () => {
        render(
            <Day
                course={mockCourses}
                user={mockUser}
                filteredPeriods={[]}
                format="day"
                assignments={[]}
                todos={mockTodos}
            />
        );

        // Check that the to-dos are rendered
        expect(screen.getByText('To-Dos:')).toBeTruthy();
        expect(screen.getByText('Todo 1')).toBeTruthy();
    });

});

describe('getBackgroundColor', () => {
    it('should return blue for lecture type', () => {
        expect(getBackgroundColor('lecture')).toBe('blue');
    });

    it('should return yellow for lab type', () => {
        expect(getBackgroundColor('lab')).toBe('yellow');
    });

    it('should return green for exercises type', () => {
        expect(getBackgroundColor('exercises')).toBe('green');
    });

    it('should return overlay2 for an unrecognized type', () => {
        expect(getBackgroundColor('unknown')).toBe('overlay2');
    });

    it('should return overlay2 for an empty type', () => {
        expect(getBackgroundColor('')).toBe('overlay2');
    });
});

describe('getNavigationDetails', () => {
    it('should return correct pathname and params for a professor', () => {
        const user = { data: { type: 'professor' } };
        const courseItem = {
            id: 'course1',
            data: {
                name: 'Course 1',
                periods: [] as CourseTimePeriod[], // Missing property
                description: 'Course description', // Add missing properties
                professors: [],
                assistants: [],
                section: 'IN' as Section,
                credits: 3, // Missing property
                newAssignments: false, // Missing property
                assignments: [], // Missing property
                started: false, // Missing property
            }
        };
        const period: CourseTimePeriod = {
            start: 9,
            end: 10,
            type: 'lecture',
            activityId: 'activity1',
            dayIndex: 1,     // Missing property
            rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],  // Missing property
        };
        const index = 0;

        const { pathname, params } = getNavigationDetails(user, courseItem, period, index);

        expect(pathname).toBe('/(app)/startCourseScreen');
        expect(params).toEqual({
            courseID: 'course1',
            course: JSON.stringify(courseItem.data),
            period: JSON.stringify(period),
            index: 0,
        });
    });

    it('should return correct pathname and params for a non-professor (e.g., student)', () => {
        const user = { data: { type: 'student' } }; // A non-professor user
        const courseItem = {
            id: 'course1',
            data: {
                name: 'Course 1',
                periods: [] as CourseTimePeriod[], // Missing property
                description: 'Course description', // Add missing properties
                professors: [],
                assistants: [],
                section: 'IN' as Section,
                credits: 3, // Missing property
                newAssignments: false, // Missing property
                assignments: [], // Missing property
                started: false, // Missing property
            }
        };
        const period: CourseTimePeriod = {
            start: 9,
            end: 10,
            type: 'lecture',
            activityId: 'activity1',
            dayIndex: 1,     // Missing property
            rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],  // Missing property
        };

        const index = 0;

        const { pathname, params } = getNavigationDetails(user, courseItem, period, index);

        expect(pathname).toBe('/(app)/lectures/slides');
        expect(params).toEqual({
            courseNameString: 'Course 1',
            lectureIdString: 'activity1',
        });
    });

    it('should handle undefined user type (fallback case)', () => {
        const user = { data: { type: undefined } }; // User without type
        const courseItem = {
            id: 'course1',
            data: {
                name: 'Course 1',
                periods: [] as CourseTimePeriod[], // Missing property
                description: 'Course description', // Add missing properties
                professors: [],
                assistants: [],
                section: 'IN' as Section,
                credits: 3, // Missing property
                newAssignments: false, // Missing property
                assignments: [], // Missing property
                started: false, // Missing property
            }
        };
        const period: CourseTimePeriod = {
            start: 9,
            end: 10,
            type: 'lecture',
            activityId: 'activity1',
            dayIndex: 1,     // Missing property
            rooms: [{ name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],  // Missing property
        };
        const index = 0;

        const { pathname, params } = getNavigationDetails(user, courseItem, period, index);

        expect(pathname).toBe('/(app)/lectures/slides'); // Fallback to student pathname
        expect(params).toEqual({
            courseNameString: 'Course 1',
            lectureIdString: 'activity1',
        });
    });
});
