import { PeriodBlock } from '@/components/core/PeriodBlock';
import { Section } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';
import { render, screen } from '@testing-library/react-native';

import '@testing-library/jest-native/extend-expect';
import React from 'react';

const mockPeriod = {
    id: 'period1',
    start: 0,
    end: 1440, // Add the end time here
    type: 'lecture' as CourseTimePeriodType,
    activityId: 'activity1',
    dayIndex: 1,
    rooms: [{ id: 'room1', name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],
};

const mockCourse = {
    id: 'course1',
    data: {
        name: 'Course 1',
        started: true,
        description: 'Course description',
        professors: ['Professor 1'],
        assistants: ['Assistant 1'],
        periods: [mockPeriod],
        credits: 3,
        department: 'Department 1',
        section: 'IN' as Section, // Adjust this to match the correct enum value
        newAssignments: true,
        assignments: [],
    },
};

const mockUserStudent = {
    id: 'user1',
    data: {
        type: 'student',
    },
};

const mockUserProfessor = {
    id: 'user2',
    data: {
        type: 'professor',
    },
};

describe('PeriodBlock Component', () => {
    it('renders period information correctly', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="day"
            />
        );

        expect(screen.getByText('Lecture')).toBeTruthy();
        expect(screen.getByText('Course 1')).toBeTruthy();
        expect(screen.getByText('Join Course')).toBeTruthy();
    });

    it('renders "Join Course" for students', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="day"
            />
        );

        expect(screen.getByText('Join Course')).toBeTruthy();
    });

    it('renders "Start Course" for professors when course is not started', () => {
        const notStartedCourse = { ...mockCourse, data: { ...mockCourse.data, started: false } };

        render(
            <PeriodBlock
                user={mockUserProfessor}
                period={mockPeriod}
                course={notStartedCourse}
                format="day"
            />
        );

        expect(screen.getByText('Start Course')).toBeTruthy();
    });

    it('renders "Stop Course" for professors when course is started', () => {
        render(
            <PeriodBlock
                user={mockUserProfessor}
                period={mockPeriod}
                course={mockCourse}
                format="day"
            />
        );

        expect(screen.getByText('Stop Course')).toBeTruthy();
    });

    // Test to verify direction and text size for 'day' format
    it('sets the correct styles for format "day"', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="day"
            />
        );

        // Check that the direction is 'row' (default for "day")
        const firstView = screen.getByTestId('period-block-view');  // Ensure you add a `testID` to your TView for identifying elements in tests
        expect(firstView).toHaveStyle({ flexDirection: 'column' });

        // Check that the primary text size is 15 for 'day'
        const primaryText = screen.getByText('Lecture');  // Assuming this text corresponds to the first TText
        expect(primaryText).toHaveStyle({ fontSize: 15 });

        // Check that the secondary text size is 12 for 'day'
        const secondaryText = screen.getByText('Course 1');
        expect(secondaryText).toHaveStyle({ fontSize: 12 });
    });

    // Test to verify direction and text size for 'week' format
    it('sets the correct styles for format "week"', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="week"
            />
        );

        // Check that the direction is 'column' for "week"
        const firstView = screen.getByTestId('period-block-view');
        expect(firstView).toHaveStyle({ flexDirection: 'column' });

        // Check that the primary text size is 12 for 'week'
        const primaryText = screen.getByText('Lecture');
        expect(primaryText).toHaveStyle({ fontSize: 12 });

        // Check that the secondary text size is 9 for 'week'
        const secondaryText = screen.getByText('Course 1');
        expect(secondaryText).toHaveStyle({ fontSize: 9 });
    });
})

describe('PeriodBlock Component - Additional Cases', () => {
    // Test when no user is provided
    it('renders correctly when user is null', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={null}
                format="day"
            />
        );

        // Ensure no actions are displayed
        expect(screen.queryByText('Join Course')).toBeNull();
        expect(screen.queryByText('Start Course')).toBeNull();
        expect(screen.queryByText('Stop Course')).toBeNull();
    });

    // Test boundary time formatting
    it('renders correct time for boundary values', () => {
        const boundaryPeriod = { ...mockPeriod, start: 0, end: 1439 }; // 0:00 to 23:59

        render(
            <PeriodBlock
                period={boundaryPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="day"
            />
        );

        expect(screen.getByText('0:00 - 23:59')).toBeTruthy(); // Ensure boundary times render correctly
    });

    // Test unexpected user type
    it('renders no actions for unsupported user type', () => {
        const unexpectedUser = { id: 'user3', data: { type: 'admin' } };

        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={unexpectedUser}
                format="day"
            />
        );

        expect(screen.queryByText('Join Course')).toBeNull();
        expect(screen.queryByText('Start Course')).toBeNull();
        expect(screen.queryByText('Stop Course')).toBeNull();
    });
});
