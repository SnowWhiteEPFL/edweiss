/**
 * @file time.test.tsx
 * @description Test suite for time interface library used for doing JS Date to 
 *              FB Timestamp conversion and utils properties
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { Timestamp } from '@/model/time';
import { Time } from '../../utils/time';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

jest.mock('@react-native-firebase/firestore', () => {
    return {
        Timestamp: {
            fromMillis: (millis: number) => ({
                toDate: () => new Date(millis),
            }),
        },
    };
});


// ------------------------------------------------------------
// ----------     Time Utils functions  Test suite     --------
// ------------------------------------------------------------

describe('Time Utilities Tests Suites', () => {
    describe('toDate', () => {
        it('should convert Firebase Timestamp to JS Date', () => {
            const mockTimestamp: Timestamp = { seconds: 1620305400, nanoseconds: 0 };

            const date = Time.toDate(mockTimestamp);
            expect(date.getTime()).toBe(1620305400000);
        });

        it('should handle timestamps with _seconds', () => {
            const mockTimestamp: Timestamp = { seconds: 1620305400, nanoseconds: 0 };
            const date = Time.toDate(mockTimestamp);
            expect(date.getTime()).toBe(1620305400000);
        });
    });

    describe('isToday', () => {
        it('should return true for today\'s date', () => {
            const today = new Date();
            expect(Time.isToday(today)).toBe(true);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000);
            expect(Time.isToday(yesterday)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000);
            expect(Time.isToday(tomorrow)).toBe(false);
        });
    });

    describe('wasYesterday', () => {
        it('should return true for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000);
            expect(Time.wasYesterday(yesterday)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date();
            expect(Time.wasYesterday(today)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000);
            expect(Time.wasYesterday(tomorrow)).toBe(false);
        });
    });

    describe('isTomorrow', () => {
        it('should return true for tomorrow\'s date', () => {
            const tomorrow = new Date(Date.now() + 86400000);
            expect(Time.isTomorrow(tomorrow)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date();
            expect(Time.isTomorrow(today)).toBe(false);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(Date.now() - 86400000);
            expect(Time.isTomorrow(yesterday)).toBe(false);
        });
    });

    describe('Check margin day gap for isToday', () => {
        const duringDayDelta = 100;
        it('should return true if the day is within today', () => {
            const today = new Date(new Date().setHours(0, 0, 0, 0) + duringDayDelta);
            expect(Time.isToday(today)).toBe(true);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(new Date().setHours(0, 0, 0, 0) - 86400000 + duringDayDelta);
            expect(Time.isToday(yesterday)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(new Date().setHours(0, 0, 0, 0) + 86400000 + duringDayDelta);
            expect(Time.isToday(tomorrow)).toBe(false);
        });
    });
    describe('Check margin day gap for isTomorrow', () => {
        const duringDayDelta = 100;
        it('should return true if the day is within tomorrow', () => {
            const tomorrow = new Date(new Date().setHours(0, 0, 0, 0) + 86400000 + duringDayDelta);
            expect(Time.isTomorrow(tomorrow)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date(new Date().setHours(0, 0, 0, 0) + duringDayDelta);
            expect(Time.isTomorrow(today)).toBe(false);
        });

        it('should return false for yesterday\'s date', () => {
            const yesterday = new Date(new Date().setHours(0, 0, 0, 0) - 86400000 + duringDayDelta);
            expect(Time.isTomorrow(yesterday)).toBe(false);
        });
    });

    describe('Check margin day gap for wasYesterday', () => {
        const duringDayDelta = 100;
        it('should return true if the day is within yesterday', () => {
            const yesterday = new Date(new Date().setHours(0, 0, 0, 0) - 86400000 + duringDayDelta);
            expect(Time.wasYesterday(yesterday)).toBe(true);
        });

        it('should return false for today\'s date', () => {
            const today = new Date(new Date().setHours(0, 0, 0, 0) + duringDayDelta);
            expect(Time.wasYesterday(today)).toBe(false);
        });

        it('should return false for tomorrow\'s date', () => {
            const tomorrow = new Date(new Date().setHours(0, 0, 0, 0) + 86400000 + duringDayDelta);
            expect(Time.wasYesterday(tomorrow)).toBe(false);
        });
    });

    describe('fromDate', () => {
        it('should correctly convert a typical date to Timestamp', () => {
            const date = new Date('2023-01-01T00:00:00.123Z'); // Sample date with milliseconds
            const timestamp = Time.fromDate(date);

            expect(timestamp).toEqual({
                seconds: Math.floor(date.getTime() / 1000),
                nanoseconds: (date.getTime() % 1000) * 1_000_000,
            });
        });

        it('should correctly handle a date without milliseconds', () => {
            const date = new Date('2023-01-01T00:00:00.000Z'); // No milliseconds
            const timestamp = Time.fromDate(date);

            expect(timestamp).toEqual({
                seconds: Math.floor(date.getTime() / 1000),
                nanoseconds: 0,
            });
        });

        it('should handle dates in the past (negative nanoseconds)', () => {
            const date = new Date('1970-01-01T00:00:00.000Z'); // UNIX epoch
            const timestamp = Time.fromDate(date);

            expect(timestamp).toEqual({
                seconds: 0,
                nanoseconds: 0,
            });
        });

        it('should handle dates far in the future', () => {
            const date = new Date('2100-01-01T00:00:00.123Z'); // Future date with milliseconds
            const timestamp = Time.fromDate(date);

            expect(timestamp).toEqual({
                seconds: Math.floor(date.getTime() / 1000),
                nanoseconds: (date.getTime() % 1000) * 1_000_000,
            });
        });

        it('should handle leap second dates correctly', () => {
            const date = new Date('2016-12-31T23:59:60.999Z'); // Date with leap second
            const timestamp = Time.fromDate(date);

            expect(timestamp).toEqual({
                seconds: Math.floor(date.getTime() / 1000),
                nanoseconds: (date.getTime() % 1000) * 1_000_000,
            });
        });
    });

});