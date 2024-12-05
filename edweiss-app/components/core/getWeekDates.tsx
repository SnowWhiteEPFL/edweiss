/**
 * Function to get all dates of a week based on a given date.
 * @param date - The reference date to get the week's dates.
 * @returns An array of objects representing each day of the week, including the date and day of the week.
 */
export const getWeekDates = (date: Date) => {
    // Create a new date to avoid modifying the original date
    const startOfWeek = new Date(date);

    // Normalize to UTC to prevent issues with local time zone differences
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate the start of the week by setting the date to the Monday of the current week
    // `date.getDay()` returns the day of the week (0 = Sunday, 1 = Monday, etc...)
    if (date.getDay() === 0) startOfWeek.setDate(date.getDate() - 6); // Sunday
    else startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday

    // Generate an array of 7 days, each based on the calculated start of the week
    return Array.from({ length: 7 }, (_, i) => {
        const weekDate = new Date(startOfWeek);
        weekDate.setDate(startOfWeek.getDate() + i);

        // Add day of the week to each date for better understanding
        return {
            date: weekDate,
            dayOfWeek: weekDate.toLocaleString('en-US', { weekday: 'long' }) // Adds the day of the week as a string
        };
    });
};
