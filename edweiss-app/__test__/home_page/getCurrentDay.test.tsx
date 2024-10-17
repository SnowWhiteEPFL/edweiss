import { getCurrentDay } from '@/components/core/getCurrentDay';

describe('getCurrentDay', () => {
        it('should return the current day of the week as a number', () => {
                const now = new Date();
                const expectedDay = now.getDay();
                const result = getCurrentDay();
                expect(result).toBe(expectedDay);
        });

        it('should return a number between 0 and 6', () => {
                const result = getCurrentDay();
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(7);
        });

        it('should return a number', () => {
                const result = getCurrentDay();
                expect(typeof result).toBe('number');
        });
});
