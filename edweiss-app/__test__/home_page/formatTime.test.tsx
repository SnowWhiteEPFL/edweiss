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

describe('formatTime', () => {
    it('should format 0 minutes to "0:00"', () => {
        expect(Time.formatTime(0)).toBe('0:00'); // Verifies that 0 minutes is formatted as "0:00"
    });

    it('should format 59 minutes to "0:59"', () => {
        expect(Time.formatTime(59)).toBe('0:59'); // Verifies that 59 minutes is formatted as "0:59"
    });

    it('should format 60 minutes to "1:00"', () => {
        expect(Time.formatTime(60)).toBe('1:00'); // Verifies that 60 minutes is formatted as "1:00"
    });

    it('should format 75 minutes to "1:15"', () => {
        expect(Time.formatTime(75)).toBe('1:15'); // Verifies that 75 minutes is formatted as "1:15"
    });

    it('should format 120 minutes to "2:00"', () => {
        expect(Time.formatTime(120)).toBe('2:00'); // Verifies that 120 minutes is formatted as "2:00"
    });

    it('should format 130 minutes to "2:10"', () => {
        expect(Time.formatTime(130)).toBe('2:10'); // Verifies that 130 minutes is formatted as "2:10"
    });

    it('should format 1439 minutes to "23:59"', () => {
        expect(Time.formatTime(1439)).toBe('23:59'); // Verifies that 1439 minutes is formatted as "23:59"
    });

    it('should format 1440 minutes to "23:59"', () => {
        expect(Time.formatTime(1440)).toBe('23:59'); // Verifies that 1440 minutes (the next day) is formatted as "23:59"
    });
});
