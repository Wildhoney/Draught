import Draft     from '../../src/Draft.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Middleman from '../../src/helpers/Middleman.js';
import Shape     from '../../src/shapes/Shape.js';
import Rectangle from '../../src/shapes/Rectangle.js';
import Movable   from '../../src/abilities/Movable.js';

describe('Shape', () => {

    const mockSVGElement = document.createElement('svg');
    const getDraft       = (options) => new Draft(mockSVGElement, options);

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

        const draft     = getDraft();
        const rectangle = new Rectangle({ fill: 'red', opacity: 1 });
        draft.addShape(rectangle);
        const element   = rectangle[Symbols.ELEMENT];

        expect(rectangle.attribute('fill')).toEqual('red');
        expect(element.node().getAttribute('fill')).toEqual('red');
        expect(rectangle.attribute('opacity')).toEqual(1);
        expect(element.node().getAttribute('opacity')).toEqual('1');


        rectangle.attribute('fill', 'green');
        expect(rectangle.attribute('fill')).toEqual('green');
        expect(element.node().getAttribute('fill')).toEqual('green');
        expect(rectangle.attribute('opacity')).toEqual(1);
        expect(element.node().getAttribute('opacity')).toEqual('1');

        rectangle.attribute('opacity', 0.5);
        expect(rectangle.attribute('fill')).toEqual('green');
        expect(element.node().getAttribute('fill')).toEqual('green');
        expect(rectangle.attribute('opacity')).toEqual(0.5);
        expect(element.node().getAttribute('opacity')).toEqual('0.5');

    });

    it('Should be able to add the shape into each ability instance;', () => {

        const rectangle = new Rectangle();
        const abilities = rectangle[Symbols.ABILITIES];

        expect(abilities.movable[Symbols.SHAPE] instanceof Rectangle).toBeTruthy();

    });

});