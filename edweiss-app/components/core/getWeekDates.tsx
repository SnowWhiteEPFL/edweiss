/**
 * Function to get all dates of a week based on a given date.
 * @param date - The reference date to get the week's dates.
 * @returns An array of dates representing each day of the week.
 */
const getWeekDates = (date: Date) => {
    // Create a new date to avoid modifying the original date
    const startOfWeek = new Date(date);

    // Calculate the start of the week by setting the date to the Monday of the current week
    // `date.getDay()` returns the day of the week (0 = Sunday, 1 = Monday, etc.)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);

    // Generate an array of 7 days, each based on the calculated start of the week
    return Array.from({ length: 7 }, (_, i) => {
        // Create a new date for each day of the week by adding `i` days
        const weekDate = new Date(startOfWeek);
        weekDate.setDate(startOfWeek.getDate() + i);
        return weekDate;
    });
};
