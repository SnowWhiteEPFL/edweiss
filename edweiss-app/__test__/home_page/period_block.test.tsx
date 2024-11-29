import { PeriodBlock } from '@/components/core/PeriodBlock';
import { render, screen } from '@testing-library/react-native';

import '@testing-library/jest-native/extend-expect';
import React from 'react';

jest.mock('@/components/core/formatTime', () => jest.fn((time) => `${Math.floor(time / 60)}:${time % 60 < 10 ? '0' : ''}${time % 60}`));



const mockPeriod = initPeriods({
    id: 'period1',
    start: 0,
    end: 1440, // Full day period
    type: 'lecture', // Assuming `initPeriods` handles type casting
    activityId: 'activity1',
    dayIndex: 1,
    rooms: [{ id: 'room1', name: 'Room 101', geoloc: { latitude: 0, longitude: 0 } }],
});

const mockCourse = initCourse({
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
        section: 'IN', // Assuming `initCourse` handles any enum or type casting
        newAssignments: true,
        assignments: [],
    },
});


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
        expect(screen.getByText('0:00 - 24:00')).toBeTruthy();
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

    // Test pour vérifier la direction et la taille du texte pour le format 'day'
    it('sets the correct styles for format "day"', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="day"
            />
        );

        // Vérifie que la direction est 'row' (par défaut pour "day")
        const firstView = screen.getByTestId('period-block-view');  // Assure-toi d'ajouter un `testID` à ton TView pour identifier les éléments dans les tests
        expect(firstView).toHaveStyle({ flexDirection: 'column' });

        // Vérifie que la taille primaire du texte est 15 pour 'day'
        const primaryText = screen.getByText('Lecture');  // On suppose que ce texte correspond au premier TText
        expect(primaryText).toHaveStyle({ fontSize: 15 });

        // Vérifie que la taille secondaire du texte est 12 pour 'day'
        const secondaryText = screen.getByText('Course 1');
        expect(secondaryText).toHaveStyle({ fontSize: 12 });
    });

    // Test pour vérifier la direction et la taille du texte pour le format 'week'
    it('sets the correct styles for format "week"', () => {
        render(
            <PeriodBlock
                period={mockPeriod}
                course={mockCourse}
                user={mockUserStudent}
                format="week"
            />
        );

        // Vérifie que la direction est 'column' pour "week"
        const firstView = screen.getByTestId('period-block-view');
        expect(firstView).toHaveStyle({ flexDirection: 'column' });

        // Vérifie que la taille primaire du texte est 12 pour 'week'
        const primaryText = screen.getByText('Lecture');
        expect(primaryText).toHaveStyle({ fontSize: 12 });

        // Vérifie que la taille secondaire du texte est 9 pour 'week'
        const secondaryText = screen.getByText('Course 1');
        expect(secondaryText).toHaveStyle({ fontSize: 9 });
    });



})