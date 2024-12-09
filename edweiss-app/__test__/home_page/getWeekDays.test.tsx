import { getWeekDates } from '@/components/core/getWeekDates';

jest.mock('@/config/i18config', () =>
    jest.fn((str: string, args: { [arg in string]: string }) => str)
);

describe('getWeekDates', () => {

    // Basic test with a mid-week date (Wednesday)
    it('should return an array of 7 dates starting with the Monday of the week of the given date', () => {
        const date = new Date('2023-11-15'); // Wednesday, November 15, 2023
        const startOfWeek = new Date('2023-11-13'); // Monday, November 13, 2023

        const weekDates = getWeekDates(date);

        expect(weekDates).toHaveLength(7);
        expect(weekDates[0]).toEqual(startOfWeek);

        // Check if the following dates are correctly incremented
        for (let i = 1; i < 7; i++) {
            const expectedDate = new Date(startOfWeek);
            expectedDate.setDate(startOfWeek.getDate() + i);
            expect(weekDates[i]).toEqual(expectedDate);
        }
    });

    // Test for a Sunday date
    it('should handle a Sunday date correctly and return the correct week starting from Monday', () => {
        const date = new Date('2023-11-12'); // Sunday, November 12, 2023
        const startOfWeek = new Date('2023-11-06'); // Monday, November 6, 2023

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test with a date at the beginning of the year
    it('should handle dates at the beginning of the year correctly', () => {
        const date = new Date('2023-01-01'); // January 1, 2023 (Sunday)
        const startOfWeek = new Date('2022-12-26'); // Monday, December 26, 2022

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test with a date at the end of the year
    it('should handle dates at the end of the year correctly', () => {
        const date = new Date('2023-12-31'); // Sunday, December 31, 2023
        const startOfWeek = new Date('2023-12-25'); // Monday, December 25, 2023

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test with a very old date
    it('should handle very old dates correctly', () => {
        const date = new Date('2000-02-29'); // February 29, 2000 (leap year)
        const startOfWeek = new Date('2000-02-28'); // Monday, February 28, 2000

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test with a future date
    it('should handle future dates correctly', () => {
        const date = new Date('2024-02-01'); // February 1, 2024
        const startOfWeek = new Date('2024-01-29'); // Monday, January 29, 2024

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

});
