import { callFunction } from '@/config/firebase';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Day } from '../../components/core/Day';

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

const mockCourse: Course = {
    name: 'Test Course',
    description: 'A course for testing purposes.',
    professors: ['prof1'],
    assistants: ['student1'],
    periods: [],
    section: 'IN',
    credits: 3,
    newAssignments: false,
    assignments: [],
    started: true,
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


const { getByText } = renderDayComponent({ user: mockUserProfessor, period: mockPeriod, format: "day" });

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
    });

    it('renders correctly for a student and navigates on press', () => {
        const { getByText } = renderDayComponent({ user: mockUserStudent, period: mockPeriod, format: "week" });

        expect(getByText('Test Course')).toBeTruthy();


        fireEvent.press(getByText('Test Course'));


        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/lectures/slides',
            params: {
                courseNameString: 'Test Course',
                lectureIdString: 'activity1',
            },
        });
    });

    it('handles the case when period does not have an end time', () => {

        const { getByText } = renderDayComponent({ user: mockUserProfessor, period: mockPeriod, format: "day" });
        expect(getByText('Test Course')).toBeTruthy();
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error("Erreur de test"));
    });
});
