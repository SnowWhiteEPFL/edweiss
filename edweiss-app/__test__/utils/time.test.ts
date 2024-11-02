import { Timestamp } from '@/model/time';
import { Time } from '../../utils/time';

jest.mock('@react-native-firebase/firestore', () => {
    return {
        Timestamp: {
            fromMillis: (millis: number) => ({
                toDate: () => new Date(millis),
            }),
        },
    };
});

describe('Time Utilities', () => {
    describe('toDate', () => {
        it('should convert Firebase Timestamp to JS Date', () => {
            const mockTimestamp: Timestamp = { seconds: 1620305400, nanoseconds: 0 }; // Mock timestamp (seconds since Unix epoch)

            const date = Time.toDate(mockTimestamp);
            expect(date.getTime()).toBe(1620305400000); // Expect JS Date in milliseconds
        });

        it('should handle timestamps with _seconds', () => {
            const mockTimestamp: Timestamp = { seconds: 1620305400, nanoseconds: 0 }; // Mock timestamp (seconds since Unix epoch)
            const date = Time.toDate(mockTimestamp);
            expect(date.getTime()).toBe(1620305400000); // Expect JS Date in milliseconds
        });
    });

    describe('isToday', () => {
        it('should return true for today\'s date', () => {
            const today = new Date();
            expect(Time.isToday(today)).toBe(true);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000); // 24 hours ago
            expect(Time.isToday(yesterday)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000); // 24 hours from now
            expect(Time.isToday(tomorrow)).toBe(false);
        });
    });

    describe('wasYesterday', () => {
        it('should return true for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000); // 24 hours ago
            expect(Time.wasYesterday(yesterday)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date();
            expect(Time.wasYesterday(today)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000); // 24 hours from now
            expect(Time.wasYesterday(tomorrow)).toBe(false);
        });
    });

    describe('isTomorrow', () => {
        it('should return true for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000); // 24 hours from now
            expect(Time.isTomorrow(tomorrow)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date();
            expect(Time.isTomorrow(today)).toBe(false);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000); // 24 hours ago
            expect(Time.isTomorrow(yesterday)).toBe(false);
        });
    });
});