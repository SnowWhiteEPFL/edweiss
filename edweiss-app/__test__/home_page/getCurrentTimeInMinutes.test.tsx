import { getCurrentTimeInMinutes } from '@/components/core/getCurrentTimeInMinutes';


describe('getCurrentTimeInMinutes', () => {
    it('should return the correct number of minutes since midnight', () => {
        const now = new Date();
        const expectedMinutes = now.getHours() * 60 + now.getMinutes();
        const result = getCurrentTimeInMinutes();
        expect(result).toBe(expectedMinutes);
    });

    it('should return a number', () => {
        const result = getCurrentTimeInMinutes();
        expect(typeof result).toBe('number');
    });

    it('should be in the range of 0 to 1440', () => {
        const result = getCurrentTimeInMinutes();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1441);
    });
});



describe('getCurrentTimeInMinutes', () => {
    it('should return the correct number of minutes since midnight', () => {
        const now = new Date();
        const expectedMinutes = now.getHours() * 60 + now.getMinutes();
        const result = getCurrentTimeInMinutes();
        expect(result).toBe(expectedMinutes);
    });

    it('should return a number', () => {
        const result = getCurrentTimeInMinutes();
        expect(typeof result).toBe('number');
    });

    it('should be in the range of 0 to 1440', () => {
        const result = getCurrentTimeInMinutes();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1441);
    });
});
