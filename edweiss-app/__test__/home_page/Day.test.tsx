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
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

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

function renderDayComponent({ user, period, format }: { user: any, period: CourseTimePeriod, format: string; }) {
    return render(
        <Day
            course={{ id: 'course1', data: mockCourse }}
            user={user}
            filteredPeriods={[period]}
            index={0}
            format={format} period={period} />
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
        expect(getByText('Test Course')).toBeTruthy();
    });
}
);
