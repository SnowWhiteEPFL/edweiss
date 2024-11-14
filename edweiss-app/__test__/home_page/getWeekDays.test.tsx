describe('getWeekDates', () => {
    it('should return an array of 7 dates starting with the Monday of the week of the given date', () => {
        // Set a reference date (e.g., a Wednesday)
        const date = new Date('2023-11-15'); // A Wednesday
        const startOfWeek = new Date('2023-11-13'); // Monday of this week

        const getWeekDates = () => {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay() + 1);
            return Array.from({ length: 7 }, (_, i) => {
                const weekDate = new Date(startOfWeek);
                weekDate.setDate(startOfWeek.getDate() + i);
                return weekDate;
            });
        };

        // Call the function
        const weekDates = getWeekDates();

        // Check that the array contains exactly 7 dates
        expect(weekDates).toHaveLength(7);

        // Check that the first day is the Monday of the week
        expect(weekDates[0]).toEqual(startOfWeek);

        // Check that the days are in correct sequential order
        for (let i = 1; i < 7; i++) {
            const expectedDate = new Date(startOfWeek);
            expectedDate.setDate(startOfWeek.getDate() + i);
            expect(weekDates[i]).toEqual(expectedDate);
        }
    });
});
