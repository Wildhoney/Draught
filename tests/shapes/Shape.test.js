import Draft     from '../../src/Draft.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Middleman from '../../src/helpers/Middleman.js';
import Shape     from '../../src/shapes/Shape.js';
import Rectangle from '../../src/shapes/Rectangle.js';
import Movable   from '../../src/abilities/Movable.js';

describe('Shape', () => {

    it('Should be able to define the abilities for each shape;', () => {

        const rectangle = new Rectangle();
        const abilities = rectangle[Symbols.ABILITIES];
        expect(abilities.movable instanceof Movable).toBeTruthy();

    });

    it('Should be able to throw an exception if the object does not define a `getTag` method;', () => {

        const shapeMock = new class ShapeMock extends Shape {};
        expect(() => shapeMock.getTag()).toThrow(new Error('Draft.js: Tag name must be defined for a shape using the `getTag` method.'));

    });

    it('Should be able to identify the shape tag;', () => {

        const rectangle = new Rectangle();
        expect(rectangle.getTag()).toEqual('rect');

    });

});