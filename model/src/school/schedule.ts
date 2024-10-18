import { Geopoint } from '../geo';
import { Minutes, Timestamp, WeekDay } from '../time';

export type CourseTimePeriodType = "lecture" | "exercises" | "lab" | "project";

export type CyclicTimePeriodType = CourseTimePeriodType | "association";

interface Room {
	name: string;
	geoloc: Geopoint;
}


export interface CyclicTimePeriod {
	type: CyclicTimePeriodType;
	dayIndex: WeekDay;
	start: Minutes;
	end: Minutes;
	rooms: Room[];
	activityId?: string;
}

export interface PonctualEvent {
	type: "association",
	start: Timestamp,
	end: Timestamp;
	rooms: Room[];
}
