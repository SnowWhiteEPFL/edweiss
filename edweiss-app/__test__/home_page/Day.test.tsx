import CalendarDayDisplay from '@/components/calendar/CalendarDayDisplay';
import { Day } from '@/components/core/Day';
import { callFunction } from '@/config/firebase';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    router: {
        push: jest.fn(),
    },
}));

// Définissez l'objet `mockRouter` avec une fonction `push` mockée
const mockRouter = { push: jest.fn() };

// Assurez-vous que `useRouter` retourne `mockRouter`


// Mock de Firebase et autres dépendances
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
    firebase: jest.fn(),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({ data: () => mockCourseData }),
                set: jest.fn().mockResolvedValue({}),
            })),
        })),
    })),
}));

const mockCourseData = {
    id: 'course1',
    name: 'Test Course',
    description: 'Mocked course for testing',
    professors: ['prof1'],
    assistants: ['assistant1'],
    periods: [],
    section: 'IN',
    credits: 3,
    assignments: [],
    started: true,
    newAssignments: false,
};

const mockCourse: Course = {
    name: 'Test Course',
    description: 'A course for testing purposes.',
    professors: ['prof1'],
    assistants: ['student1'],
    periods: [],
    section: 'IN',
    credits: 3,
    assignments: [],
    started: true,
    newAssignments: false,
};

const mockPeriod: CourseTimePeriod = {
    start: 480,
    end: 540,
    type: "lecture",
    activityId: 'activity1',
    dayIndex: 1,
    rooms: [],
};

const mockUserProfessor = {
    data: {
        type: 'professor',
    },
};

const mockUserStudent = {
    data: {
        type: 'student',
    },
};

const mockFilteredPeriods: CourseTimePeriod[] = [
    {

        start: 480,
        end: 540,
        type: "lecture" as "lecture", // or use the appropriate CourseTimePeriodType
        activityId: 'activity1',
        dayIndex: 1,
        rooms: [],
    },
];

const mockAssignments = [
    {
        id: 'assignment1',
        data: {
            type: 'homework', // or the appropriate AssignmentType
            name: 'Assignment 1',
            dueDate: new Date().toISOString(),
        },
    },
];

const mockTodos = [
    {
        id: 'todo1',
        data: {
            name: 'Todo 1',
            status: 'pending', // or the appropriate TodoStatus
            dueDate: new Date().toISOString(),
        },
    },
];

function renderDayComponent({ user, period, format }: { user: any, period: CourseTimePeriod, format: string; }) {
    return render(
        <Day
            course={[{ id: 'course1', data: mockCourse }]}
            user={user}
            filteredPeriods={[period]}
            format={format} assignments={[]} todos={[]} />
    );
}

describe('Day Component', () => {
    it('renders correctly for a professor and navigates on press', () => {
        const { getByText } = renderDayComponent({ user: mockUserProfessor, period: mockPeriod, format: "day" });

        expect(getByText('Test Course')).toBeTruthy();

        fireEvent.press(getByText('Test Course'));

        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/startCourseScreen',
            params: {
                courseID: 'course1',
                course: JSON.stringify(mockCourse),
                period: JSON.stringify(mockPeriod),
                index: 0,
            },

        });
    }
    );

    it('renders correctly for a student and navigates on press', () => {
        const { getByText } = renderDayComponent({ user: mockUserStudent, period: mockPeriod, format: "week" });

        expect(getByText('Test Course')).toBeTruthy();

        fireEvent.press(getByText('Test Course'));

        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/startCourseScreen',
            params: {
                courseID: 'course1',
                course: JSON.stringify(mockCourse),
                period: JSON.stringify(mockPeriod),
                index: 0,
            },

        });
    });
    it('handles the case when period does not have an end time', () => {
        const periodWithoutEnd = { ...mockPeriod, end: undefined };

        const { getByText } = render(
            <CalendarDayDisplay
                period={mockPeriod}
                course={{ id: 'course1', data: mockCourse }}
                user={mockUserProfessor}
                filteredPeriods={[mockPeriod]}
                index={0}
            />
        );
        expect(getByText('Test Course')).toBeTruthy();
    });

    it('handles error on callFunction gracefully', () => {
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error("Erreur de test"));

        const { getByText } = renderDayComponent({ user: mockUserProfessor, period: mockPeriod, format: "day" });

    });

    it('renders periods correctly', () => {
        const { getByText } = render(
            <Day
                course={[{ id: 'course1', data: mockCourse }]}
                user={mockUserStudent}
                filteredPeriods={mockFilteredPeriods}
                format="day"
                assignments={[]}
                todos={[]}
            />
        );

        expect(getByText('Lecture')).toBeTruthy();
    });

    it('renders assignments correctly', () => {
        const { getByText } = render(
            <Day
                course={[{ id: 'course1', data: mockCourse }]}
                user={mockUserStudent}
                filteredPeriods={mockFilteredPeriods}
                format="day"
                assignments={[]}
                todos={[]}
            />
        );

        expect(getByText('Assignments Due Today:')).toBeTruthy();
        expect(getByText('Assignment 1')).toBeTruthy();
    });

    it('renders todos correctly', () => {
        const { getByText } = render(
            <Day
                course={[{ id: 'course1', data: mockCourse }]}
                user={mockUserStudent}
                filteredPeriods={mockFilteredPeriods}
                format="day"
                assignments={[]}
                todos={[]}
            />
        );

        expect(getByText('To-Dos:')).toBeTruthy();
        expect(getByText('Todo 1')).toBeTruthy();
    });

    it('navigates to the correct screen on period press', () => {
        const { getByText } = render(
            <Day
                course={[{ id: 'course1', data: mockCourse }]}
                user={mockUserStudent}
                filteredPeriods={mockFilteredPeriods}
                format="day"
                assignments={[]}
                todos={[]}
            />
        );

        fireEvent.press(getByText('Lecture'));

        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/lectures/slides',
            params: {
                courseNameString: 'Test Course',
                lectureIdString: 'activity1',
            },
        });
    });
});
