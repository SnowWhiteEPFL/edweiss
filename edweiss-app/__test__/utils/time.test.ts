/**
 * @file time.test.tsx
 * @description Test suite for time interface library used for doing JS Date to 
 *              FB Timestamp conversion and utils properties
 * @author Adamm Alaoui & Youssef Laraki
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

jest.mock('@/config/i18config', () =>
    jest.fn((str: string, args: { [arg in string]: string }) => {
        if (str === 'common:time-since-display.ago') return `${args.time} ago`;
        else if (str === 'common:time-since-display.year') return 'year';
        else if (str === 'common:time-since-display.years') return 'years';
        else if (str === 'common:time-since-display.month') return 'month';
        else if (str === 'common:time-since-display.months') return 'months';
        else if (str === 'common:time-since-display.day') return 'day';
        else if (str === 'common:time-since-display.days') return 'days';
        else if (str === 'common:time-since-display.hour') return 'hour';
        else if (str === 'common:time-since-display.hours') return 'hours';
        else if (str === 'common:time-since-display.minute') return 'minute';
        else if (str === 'common:time-since-display.minutes') return 'minutes';
        else if (str === 'common:time-since-display.second') return 'second';
        else if (str === 'common:time-since-display.seconds') return 'seconds';
        return str;
    })
);


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

    describe("'ago' function", () => {
        it("should display `0 seconds` correctly when arg is now", () => {
            expect(Time.ago(new Date())).toBe("0 seconds ago");
        });

        it("should display year correctly", () => {
            const date1 = new Date();
            date1.setFullYear(date1.getFullYear() - 1);
            expect(Time.ago(date1)).toBe("1 year ago");

            const date2 = new Date();
            date2.setFullYear(date2.getFullYear() - 2);
            expect(Time.ago(date2)).toBe("2 years ago");
        });

        it("should display month correctly", () => {
            const date1 = new Date();
            date1.setMonth(date1.getMonth() - 1);
            expect(Time.ago(date1)).toBe("1 month ago");

            const date2 = new Date();
            date2.setMonth(date2.getMonth() - 3);
            expect(Time.ago(date2)).toBe("3 months ago");
        });

        it("should display day correctly", () => {
            const date1 = new Date();
            date1.setDate(date1.getDate() - 1);
            expect(Time.ago(date1)).toBe("1 day ago");

            const date2 = new Date();
            date2.setDate(date2.getDate() - 3);
            expect(Time.ago(date2)).toBe("3 days ago");
        });

        it("should display hour correctly", () => {
            const date1 = new Date();
            date1.setHours(date1.getHours() - 1);
            expect(Time.ago(date1)).toBe("1 hour ago");

            const date2 = new Date();
            date2.setHours(date2.getHours() - 3);
            expect(Time.ago(date2)).toBe("3 hours ago");
        });

        it("should display minute correctly", () => {
            const date1 = new Date();
            date1.setMinutes(date1.getMinutes() - 1);
            expect(Time.ago(date1)).toBe("1 minute ago");

            const date2 = new Date();
            date2.setMinutes(date2.getMinutes() - 3);
            expect(Time.ago(date2)).toBe("3 minutes ago");
        });
    });

    test("isBeforeNow", () => {
        const date = new Date();
        date.setHours(date.getHours() - 1);
        expect(Time.isBeforeNow(Time.fromDate(date))).toBe(true);
    });

    test("isAfterNow", () => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        expect(Time.isAfterNow(Time.fromDate(date))).toBe(true);
    });

    test("sameDay", () => {
        const date = new Date();
        expect(Time.sameDay(new Date(), date)).toBe(true);
    });

    test("sameYear", () => {
        const date = new Date();
        expect(Time.sameYear(new Date(), date)).toBe(true);
    });

    test("getCurrentTimeInMinutes", () => expect(Time.getCurrentTimeInMinutes()).toBeGreaterThanOrEqual(0));

    test("getCurrentDay", () => expect(Time.getCurrentDay()).toBeGreaterThanOrEqual(0));

    test("dateFromSeconds", () => expect(Time.dateFromSeconds(0).getTime()).toBe(new Date(0).getTime()));

    test("TimeFromSeconds", () => expect(Time.TimeFromSeconds(1334)).toStrictEqual({
        seconds: 1334,
        nanoseconds: 0
    }));

    test("formatTime", () => expect(Time.formatTime(100000)).toBe("23:59"));

});