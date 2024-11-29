/**
 * Function to format a given time in minutes into "HH:MM" format.
 * @param minutes - The time in minutes to be formatted.
 * @returns A string representing the formatted time as "HH:MM".
 */
const formatTime = (minutes: number) => {
    // Calculate hours by dividing minutes by 60 and taking the integer part
    const hours = Math.floor(minutes / 60);

    // Calculate remaining minutes by taking the modulus of 60
    const mins = minutes % 60;

    // If hours exceed 23, cap the time to "23:59" to prevent overflow
    if (hours > 23) {
        return "23:59";
    }

    // Format and return time as "HH:MM", padding single-digit minutes with a leading zero
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

export default formatTime;
