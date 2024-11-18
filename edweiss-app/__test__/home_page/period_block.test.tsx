import { PeriodBlock } from '@/components/core/PeriodBlock';
// Adjust the import path as necessary
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/components/core/formatTime', () => jest.fn((time) => `${Math.floor(time / 60)}:${time % 60 < 10 ? '0' : ''}${time % 60}`));

const mockPeriod = {
    id: 'period1',
    start: 480,
    end: 540, // Add the end time here
    type: "lecture", // Adjust the enum value as necessary
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
        section: "IN", // Adjust this to match the correct enum value
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
        expect(screen.getByText('Join Course')).toBeTruthy();
        expect(screen.getByText('Course 1')).toBeTruthy();
        expect(screen.getByText('8:00 - 9:00')).toBeTruthy();
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
                user={mockUserProfessor}
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
})