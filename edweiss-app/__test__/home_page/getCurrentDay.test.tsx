import { Time } from '../../utils/time';

jest.mock('@react-native-firebase/firestore', () => ({
        firebase: jest.fn(),
        firestore: jest.fn(() => ({
                collection: jest.fn(),
                doc: jest.fn(),
                get: jest.fn(),
                set: jest.fn(),
        })),
}));

describe('getCurrentDay', () => {
        it('should return the current day of the week as a number', () => {
                const now = new Date();
                const expectedDay = now.getDay(); // Gets the current day of the week (0 for Sunday, 6 for Saturday)
                const result = Time.getCurrentDay();
                expect(result).toBe(expectedDay); // Verifies the result matches the current day
        });

        it('should return a number between 0 and 6', () => {
                const result = Time.getCurrentDay();
                expect(result).toBeGreaterThanOrEqual(0); // Ensures the result is not less than 0
                expect(result).toBeLessThan(7); // Ensures the result is less than 7 (valid days of the week range)
        });

        it('should return a number', () => {
                const result = Time.getCurrentDay();
                expect(typeof result).toBe('number'); // Ensures the result is of type number
        });
});
