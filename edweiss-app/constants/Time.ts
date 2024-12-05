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
