import Symbols from '../../src/helpers/Symbols';

describe('Symbols', () => {

    it('Should be able to return an object of symbols;', () => {

        expect(typeof Symbols).toBe('object');

        Object.keys(Symbols).forEach((key) => {
            expect(!!String(Symbols[key].valueOf()).match(/^Symbol/i)).toBeTruthy();
        });

    });

});