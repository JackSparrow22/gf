describe('models ', () => {
    it('test ', async () => {
        console.log('abcabc')
        const a = {
            hello: 'jest',
            hi: {
                name: 'jest'
            }
        };
        const b = {
            hello: 'jest',
            hi: {
                name: 'jest'
            }
        };

        expect(a).toEqual(b)
        expect([1, 2, 3]).toEqual([1, 2, 3])
        expect(null).toBeNull()
        expect([1, 2, 3]).toContain(1)
        expect(b).toHaveProperty('hi')
        expect('123').toContain('2')
        expect('123').toMatch(/^\d+$/)
        expect('123').not.toContain('4')
    });
});