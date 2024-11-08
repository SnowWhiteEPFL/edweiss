import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';

export function parseAssignments(extraInfo: string | undefined): AssignmentWithColor[] {
    if (typeof extraInfo === 'string') {
        try {
            const assignments = JSON.parse(extraInfo);
            return assignments.map((assignment: AssignmentWithColor) => ({
                ...assignment,
                dueDate: {
                    seconds: assignment.dueDate.seconds,
                    nanoseconds: assignment.dueDate.nanoseconds,
                },
            }));
        } catch (error) {
            console.error('Failed to parse extraInfo:', error);
            return [];
        }
    }
    return [];
}