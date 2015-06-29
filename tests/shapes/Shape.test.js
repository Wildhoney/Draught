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
        const message   = 'Draft.js: Tag name must be defined for a shape using the `getTag` method.';
        expect(() => shapeMock.getTag()).toThrow(new Error(message));

    });

    it('Should be able to identify the shape tag;', () => {

        const rectangle = new Rectangle();
        expect(rectangle.getTag()).toEqual('rect');

    });

    it('Should be able to overwrite default shape options and set options once instantiated;', () => {

        const rectangle = new Rectangle({ fill: 'red' });
        expect(rectangle.attribute('fill')).toEqual('red');

        rectangle.attribute('fill', 'green');
        expect(rectangle.attribute('fill')).toEqual('green');

        rectangle.setAttribute('opacity', 0.5);
        expect(rectangle.getAttribute('opacity')).toEqual(0.5);

    });

});