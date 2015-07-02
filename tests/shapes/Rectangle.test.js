import Rectangle from '../../src/shapes/Rectangle';

describe('Rectangle', () => {

    it('Should be able to render the correct element name;', () => {
        const rectangle = new Rectangle();
        expect(rectangle.tagName()).toEqual('rect');
    });

});