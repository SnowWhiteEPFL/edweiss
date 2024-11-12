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

});