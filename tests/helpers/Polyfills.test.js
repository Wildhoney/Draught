import {objectAssign} from '../../src/helpers/Polyfills';

describe('Polyfills', () => {

    it('Should be able to assign objects using the polyfill;', () => {
        const firstObject = { a: 1, b: 2 };
        expect(objectAssign(firstObject, { c: 3, a: 0 })).toEqual({ a: 0, b: 2, c: 3 });
    });

});