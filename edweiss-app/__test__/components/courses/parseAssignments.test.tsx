import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { parseAssignments } from '@/utils/courses/utilsParseAssignments';

describe('parseAssignments', () => {
    it('should return an empty array if extraInfo is undefined', () => {
        const result = parseAssignments(undefined);
        expect(result).toEqual([]);
    });

    it('should return an empty array if extraInfo is not a valid JSON string', () => {
        const result = parseAssignments('invalid json');
        expect(result).toEqual([]);
    });

    it('should parse valid JSON string and return assignments with dueDate', () => {
        const extraInfo = JSON.stringify([
            {
                name: "Assignment 1",
                type: "quiz",
                dueDate: { seconds: 2000, nanoseconds: 0 },
                color: "red"
            },
            {
                name: "Assignment 2",
                type: "quiz",
                dueDate: { seconds: 86400 + 2000, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
                color: "blue"
            }
        ]);

        const expectedAssignments: AssignmentWithColor[] = [
            {
                name: "Assignment 1",
                type: "quiz",
                dueDate: { seconds: 2000, nanoseconds: 0 },
                color: "red"
            },
            {
                name: "Assignment 2",
                type: "quiz",
                dueDate: { seconds: 86400 + 2000, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
                color: "blue"
            }
        ];

        const result = parseAssignments(extraInfo);
        expect(result).toEqual(expectedAssignments);
    });

    it('should handle assignments without dueDate', () => {
        const extraInfo = JSON.stringify([
            {
                name: "Assignment 1",
                type: "quiz",
                dueDate: { seconds: 2000, nanoseconds: 0 },
                color: "red"
            },
        ]);

        const expectedAssignments: AssignmentWithColor[] = [
            {
                name: "Assignment 1",
                type: "quiz",
                dueDate: { seconds: 2000, nanoseconds: 0 },
                color: "red"
            },
        ];

        const result = parseAssignments(extraInfo);
        expect(result).toEqual(expectedAssignments);
    });
});