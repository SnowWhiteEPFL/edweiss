import { calculateTopOffset, formatDateToReadable, formatDateToReadable2, formatTime, generateWeekDates, getDaysOfWeekFromMonday, getStartOfWeek } from '@/components/calendar/functions';


describe('Utility Functions', () => {
    test('formatDateToReadable formats date correctly', () => {
        const date = new Date('2024-12-25T00:00:00Z');
        expect(formatDateToReadable(date)).toBe('Wed, Dec 25');
    });

    test('formatDateToReadable2 formats date with full names', () => {
        const date = new Date('2024-12-25T00:00:00Z');
        expect(formatDateToReadable2(date)).toBe('Wednesday, December 25');
    });

    test('calculateTopOffset calculates offset correctly', () => {
        expect(calculateTopOffset('00:30')).toBe(40); // 30 minutes -> 40px offset
        expect(calculateTopOffset('01:00')).toBe(0); // 60 minutes -> 80px offset
        expect(calculateTopOffset('01:30')).toBe(40); // 90 minutes -> 120px offset
    });

    test('formatTime formats time correctly', () => {
        expect(formatTime(0)).toBe('00:00');
        expect(formatTime(75)).toBe('01:15');
        expect(formatTime(150)).toBe('02:30');
    });

    test('generateWeekDates generates dates for the next 7 days', () => {
        const today = new Date();
        const weekDates = generateWeekDates();
        expect(weekDates).toHaveLength(7);
        expect(weekDates[0]).toBe(today.toISOString().split('T')[0]);

        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        expect(weekDates[1]).toBe(nextDay.toISOString().split('T')[0]);
    });

    test('getDaysOfWeekFromMonday returns correct days', () => {
        const days = getDaysOfWeekFromMonday();
        expect(days).toHaveLength(7);

        const monday = getStartOfWeek(new Date());
        expect(days[0]).toBe(monday.toISOString().split('T')[0]);

        const nextDay = new Date(monday);
        nextDay.setDate(monday.getDate() + 1);
        expect(days[1]).toBe(nextDay.toISOString().split('T')[0]);
    });

    test('getStartOfWeek returns Monday of the current week', () => {
        const sunday = new Date('2024-12-15'); // Sunday
        const monday = new Date('2024-12-09'); // Expected Monday
        expect(getStartOfWeek(sunday).toISOString().split('T')[0]).toBe(monday.toISOString().split('T')[0]);

        const wednesday = new Date('2024-12-11'); // Wednesday
        expect(getStartOfWeek(wednesday).toISOString().split('T')[0]).toBe(monday.toISOString().split('T')[0]);
    });
});
