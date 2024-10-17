import { GetCurrentDay } from '@/components/core/GetCurrentDay';


describe('getCurrentDay', () => {
    it('should return the current day of the week as a number', () => {
        const now = new Date();
        const expectedDay = now.getDay();
        const result = GetCurrentDay();
        expect(result).toBe(expectedDay);
    });

    it('should return a number between 0 and 6', () => {
        const result = GetCurrentDay();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(7);
    });

    it('should return a number', () => {
        const result = GetCurrentDay();
        expect(typeof result).toBe('number');
    });
});
