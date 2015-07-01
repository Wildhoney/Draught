import Rectangle from '../../src/shapes/Rectangle.js';

describe('Rectangle', () => {

    it('Should be able to render the correct element name;', () => {
        const rectangle = new Rectangle();
        expect(rectangle.tagName()).toEqual('rect');
    });

});