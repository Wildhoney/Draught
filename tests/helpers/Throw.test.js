import Throw from '../../src/helpers/Throw.js';

describe('Throw', () => {

    it('Should be able to throw an exception once instantiated;', () => {
        expect(() => new Throw('Test')).toThrow(new Error('Draft.js: Test.'));
    });

});