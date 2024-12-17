import { FunctionFolder, FunctionOf, NoResult } from './functions';

namespace Events {

    export interface Event {
        name: string;
        time: string;
        date: string; // format YYYY-MM-DD
        userId: string; // ID de l'utilisateur pour l'authentification
    }


    export const Functions = FunctionFolder("events", {
        createEvent: FunctionOf<{
            name: string;
            time: string;
            date: string;
            userId: string;
        }, NoResult, 'invalid_arg' | 'firebase_error'>("createEvent"),
        updateEvent: FunctionOf<{
            name?: string;
            time?: string;
            date?: string;
            userId?: string;
        }, NoResult, 'invalid_arg' | 'invalid_id' | 'firebase_error'>("updateEvent"),
        deleteEvent: FunctionOf<{ eventId: string }, NoResult, 'invalid_id' | 'firebase_error'>("deleteEvent")
    });
}
export default Events;
