import { Day } from '@/components/core/Day';
import { AssignmentType, Section } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';
import { Timestamp } from '@/model/time';
import Todolist from '@/model/todo';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}));

// Définition des données mockées en accord avec les types du modèle
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
            section: 'IN' as Section, // Section correcte avec le type
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
        dayIndex: 1, // Correspond à lundi
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

describe('Day Component', () => {

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

        // Vérifie que les assignations sont rendues
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

        // Vérifie que les tâches à faire sont rendues
        expect(screen.getByText('To-Dos:')).toBeTruthy();
        expect(screen.getByText('Todo 1')).toBeTruthy();
    });

});
