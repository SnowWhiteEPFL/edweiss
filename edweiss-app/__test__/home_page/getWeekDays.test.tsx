import { getWeekDates } from '@/components/core/getWeekDates';

describe('getWeekDates', () => {

    // Test de base avec une date en milieu de semaine (mercredi)
    it('should return an array of 7 dates starting with the Monday of the week of the given date', () => {
        const date = new Date('2023-11-15'); // Mercredi 15 novembre 2023
        const startOfWeek = new Date('2023-11-13'); // Lundi 13 novembre 2023

        const weekDates = getWeekDates(date);

        expect(weekDates).toHaveLength(7);
        expect(weekDates[0]).toEqual(startOfWeek);

        for (let i = 1; i < 7; i++) {
            const expectedDate = new Date(startOfWeek);
            expectedDate.setDate(startOfWeek.getDate() + i);
            expect(weekDates[i]).toEqual(expectedDate);
        }
    });

    // Test pour une date un dimanche
    it('should handle a Sunday date correctly and return the correct week starting from Monday', () => {
        const date = new Date('2023-11-12'); // Dimanche 12 novembre 2023
        const startOfWeek = new Date('2023-11-06'); // Lundi 6 novembre 2023

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test avec une date au début de l'année
    it('should handle dates at the beginning of the year correctly', () => {
        const date = new Date('2023-01-01'); // 1er janvier 2023 (dimanche)
        const startOfWeek = new Date('2022-12-26'); // Lundi 26 décembre 2022

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test avec une date à la fin de l'année
    it('should handle dates at the end of the year correctly', () => {
        const date = new Date('2023-12-31'); // Dimanche 31 décembre 2023
        const startOfWeek = new Date('2023-12-25'); // Lundi 25 décembre 2023

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test avec une date très ancienne
    it('should handle very old dates correctly', () => {
        const date = new Date('2000-02-29'); // 29 février 2000 (année bissextile)
        const startOfWeek = new Date('2000-02-28'); // Lundi 28 février 2000

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

    // Test avec une date future
    it('should handle future dates correctly', () => {
        const date = new Date('2024-02-01'); // 1er janvier 2100 (dimanche)
        const startOfWeek = new Date('2024-01-29'); // Lundi 25 décembre 2099

        const weekDates = getWeekDates(date);

        expect(weekDates[0]).toEqual(startOfWeek);
    });

});
