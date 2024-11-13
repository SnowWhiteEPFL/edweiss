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
        const expectedMinutes = now.getHours() * 60 + now.getMinutes();
        const result = Time.getCurrentTimeInMinutes();
        expect(result).toBe(expectedMinutes);
    });

    it('should return a number', () => {
        const result = Time.getCurrentTimeInMinutes();
        expect(typeof result).toBe('number');
    });

    it('should be in the range of 0 to 1440', () => {
        const result = Time.getCurrentTimeInMinutes();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1441);
    });
});
