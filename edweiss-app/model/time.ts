
export type WeekDay = number & {};

export type Minutes = number & {};

/**
 * To only use with the util/time functions, this is an opaque type.
 */
export interface Timestamp {
    readonly seconds: number;
    readonly nanoseconds: number;
}
