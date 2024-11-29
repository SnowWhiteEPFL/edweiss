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

describe('getCurrentTimeInMinutes', () => {
    it('should return the correct number of minutes since midnight', () => {
        const now = new Date();
        const expectedMinutes = now.getHours() * 60 + now.getMinutes(); // Calculates minutes since midnight
        const result = Time.getCurrentTimeInMinutes();
        expect(result).toBe(expectedMinutes); // Verifies that the result matches the expected value
    });

    it('should return a number', () => {
        const result = Time.getCurrentTimeInMinutes();
        expect(typeof result).toBe('number'); // Ensures the result is of type number
    });

    it('should be in the range of 0 to 1440', () => {
        const result = Time.getCurrentTimeInMinutes();
        expect(result).toBeGreaterThanOrEqual(0); // Ensures the result is not negative
        expect(result).toBeLessThan(1441); // Ensures the result does not exceed 1440 (total minutes in a day)
    });
});
