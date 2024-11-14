const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);

    return Array.from({ length: 7 }, (_, i) => {
        const weekDate = new Date(startOfWeek);
        weekDate.setDate(startOfWeek.getDate() + i);
        return weekDate;
    });
};