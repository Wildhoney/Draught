import mapper from '../../src/helpers/Mapper';

describe('Mapper', () => {

    it('Should be able to return a shape object when given a shape name;', () => {
        expect(typeof mapper('rectangle')).toEqual('object');
        expect(mapper('rectangle').constructor.name).toEqual('Rectangle');
    });

    it('Should be able to raise an exception when shape cannot be found;', () => {
        expect(() => mapper('non-existent')).toThrow(new Error('Draft.js: Cannot map "non-existent" to a shape object.'));
    });

});