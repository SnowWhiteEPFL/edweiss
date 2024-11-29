export const TIME_CONSTANTS = {
	HOURS_IN_DAY: 24,
	MINUTES_IN_HOUR: 60,
	SECONDS_IN_MINUTE: 60,
	MILLISECONDS_IN_SECOND: 1000,
} as const;

export const timeInMS = {
	SECOND: TIME_CONSTANTS.MILLISECONDS_IN_SECOND,
	MINUTE: TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE,
	HOUR: TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MINUTES_IN_HOUR,
	DAY: TIME_CONSTANTS.MILLISECONDS_IN_SECOND * TIME_CONSTANTS.SECONDS_IN_MINUTE * TIME_CONSTANTS.MINUTES_IN_HOUR * TIME_CONSTANTS.HOURS_IN_DAY,
} as const;

export const dateFormats = {
	weekday: 'long',  // Displays the day of the week, like "Friday"
	month: 'long',    // Displays the month, like "October"
	day: 'numeric',    // Displays the day of the month, like "12"
} as const;


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

