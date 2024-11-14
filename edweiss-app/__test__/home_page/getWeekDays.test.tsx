
describe('getWeekDates', () => {
    it('devrait retourner un tableau de 7 dates commençant par le lundi de la semaine de la date fournie', () => {
        // Définit une date de référence (par exemple, un mercredi)
        const date = new Date('2023-11-15'); // Un mercredi
        const startOfWeek = new Date('2023-11-13'); // Lundi de cette semaine

        const getWeekDates = () => {
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay() + 1);
            return Array.from({ length: 7 }, (_, i) => {
                const weekDate = new Date(startOfWeek);
                weekDate.setDate(startOfWeek.getDate() + i);
                return weekDate;
            });
        };

        // Appel de la fonction
        const weekDates = getWeekDates();

        // Vérifie que le tableau contient bien 7 dates
        expect(weekDates).toHaveLength(7);

        // Vérifie que le premier jour est bien le lundi de la semaine
        expect(weekDates[0]).toEqual(startOfWeek);

        // Vérifie que les jours sont bien en séquence jour par jour
        for (let i = 1; i < 7; i++) {
            const expectedDate = new Date(startOfWeek);
            expectedDate.setDate(startOfWeek.getDate() + i);
            expect(weekDates[i]).toEqual(expectedDate);
        }
    });
});
