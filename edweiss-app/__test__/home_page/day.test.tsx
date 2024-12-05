import { Day, getBackgroundColor, getNavigationDetails } from '@/components/core/Day';
import { AssignmentBase, AssignmentType, CourseTimePeriod } from '@/model/school/courses';
import { Timestamp } from '@/model/time';
import Todolist from '@/model/todo';
import { render, screen } from '@testing-library/react-native';
import { initCourse, initPeriod } from './helper_functions';


jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}));



// Mock data
const mockCourses = [
    initCourse({
        id: 'course1',
        data: {
            name: 'Course 1',
            description: 'Course 1 description',
            periods: [initPeriod(540, 600, 'lecture', 'view', 0, 'Room 101')],
            professors: [],
            assistants: [],
            credits: 0,
            section: 'IN',
            assignments: [],
            newAssignments: false,
            started: false,
        }
    })
];

const mockUser = { data: { type: 'student' } };

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

// Test cases
describe('Day Component', () => {
    it('should render TouchableOpacity for each period and call getNavigationDetails', () => {
        const user = { data: { type: 'professor' } };
        const filteredPeriods: CourseTimePeriod[] = [
            initPeriod(540, 600, 'lecture', 'activity1', 1, 'Room 101'),
            initPeriod(660, 720, 'lab', 'activity2', 1, 'Room 102')
        ];

        const assignments: { id: string; data: AssignmentBase }[] = [];
        const todos: { id: string; data: Todolist.Todo }[] = [];
        const format = 'HH:mm';

        render(
            <Day
                course={mockCourses}
                user={user}
                filteredPeriods={filteredPeriods}
                format={format}
                assignments={assignments}
                todos={todos}
            />
        );

        filteredPeriods.forEach((period, index) => {
            const periodHeight = ((period.end ?? period.start) - period.start) / 60 * HOUR_BLOCK_HEIGHT || HOUR_BLOCK_HEIGHT;
            expect(periodHeight).toBeCloseTo(((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT, 0);

            const { pathname, params } = getNavigationDetails(user, mockCourses[0], period, index);
            expect(pathname).toBe('/(app)/startCourseScreen');
            expect(params).toEqual({
                courseID: 'course1',
                course: JSON.stringify(mockCourses[0].data),
                period: JSON.stringify(period),
                index
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

        expect(screen.getByText('To-Dos:')).toBeTruthy();
        expect(screen.getByText('Todo 1')).toBeTruthy();
    });
});

describe('getBackgroundColor', () => {
    it('should return the correct color for each type', () => {
        expect(getBackgroundColor('lecture')).toBe('blue');
        expect(getBackgroundColor('lab')).toBe('yellow');
        expect(getBackgroundColor('exercises')).toBe('green');
        expect(getBackgroundColor('unknown')).toBe('overlay2');
    });
});

describe('getNavigationDetails', () => {
    it('should return correct pathname and params based on user type', () => {
        const period = initPeriod(540, 600, 'lecture', 'activity1', 1, 'Room 101');
        const { pathname, params } = getNavigationDetails(mockUser, mockCourses[0], period, 0);

        expect(pathname).toBe('/(app)/lectures/slides');
        expect(params).toEqual({
            courseNameString: 'Course 1',
            lectureIdString: 'activity1'
        });
    });
});
