import { UserID } from '../users';
import { CyclicTimePeriod } from './schedule';

export interface Association {
	name: string;
	description: string;
	managers: UserID[];
	periods: CyclicAssociationTimePeriod[];
}

export interface CyclicAssociationTimePeriod extends CyclicTimePeriod {
	type: "association";
}
