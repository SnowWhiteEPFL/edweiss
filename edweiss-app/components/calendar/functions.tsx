export const formatDateToReadable = (date: number | Date | undefined) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short', // Full day name (e.g., "lundi")
        day: 'numeric',  // Day of the month
        month: 'short',   // Full month name (e.g., "décembre")
    });
    return formatter.format(date);
};

export const formatDateToReadable2 = (date: number | Date | undefined) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', // Full day name (e.g., "lundi")
        day: 'numeric',  // Day of the month
        month: 'long',   // Full month name (e.g., "décembre")
    });
    return formatter.format(date);
};
export const calculateTopOffset = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);

    const offset = minutes / 60 * 80;  // Calculer la position de l'heure
    return offset;  // Calculer la hauteur en fonction de l'heure et des minutes
};

export const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const generateWeekDates = () => {
    const today = new Date();
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
};

export const getDaysOfWeekFromMonday = () => {
    const monday = getStartOfWeek(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        days.push(day.toISOString().split('T')[0]);
    }
    return days;
};

export const getStartOfWeek = (date: string | number | Date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday (1) or previous Monday if Sunday (0)
    currentDate.setDate(currentDate.getDate() + diff);
    return currentDate;
};
