import {getDraft, mockSVGElement} from '../Bootstrap.js';

import Symbols    from '../../src/helpers/Symbols.js';
import Middleman  from '../../src/helpers/Middleman.js';
import Shape      from '../../src/shapes/Shape.js';
import Rectangle  from '../../src/shapes/Rectangle.js';
import Selectable from '../../src/abilities/Selectable.js';

describe('Shape', () => {

    it('Should be able to define the abilities for each shape;', () => {

        const rectangle = new Rectangle();
        const abilities = rectangle[Symbols.ABILITIES];
        expect(abilities.selectable instanceof Selectable).toBeTruthy();

    });

    it('Should be able to throw an exception if the object does not define a `tagName` method;', () => {

        const shapeMock = new class ShapeMock extends Shape {};
        const message   = 'Draft.js: Tag name must be defined for a shape using the `tagName` method.';
        expect(() => shapeMock.tagName()).toThrow(new Error(message));

    });

    it('Should be able to identify the shape tag;', () => {

        const rectangle = new Rectangle();
        expect(rectangle.tagName()).toEqual('rect');

    });

    it('Should be able to apply default attributes to a shape;', () => {

        const draft     = getDraft();
        const rectangle = new Rectangle();
        draft.add(rectangle);
        const element   = rectangle[Symbols.ELEMENT];
        const defaults  = (new Rectangle()).defaultAttributes();

        expect(rectangle.attr('fill')).toEqual(defaults.fill);
        expect(element.node().getAttribute('fill')).toEqual(defaults.fill);
        expect(rectangle.attr('height')).toEqual(defaults.height);
        expect(element.node().getAttribute('height')).toEqual(String(defaults.height));

    });

    it('Should be able to overwrite default shape options and set options once instantiated;', () => {

        const draft     = getDraft();
        const rectangle = new Rectangle({ fill: 'red', height: 100 });
        draft.add(rectangle);
        const element   = rectangle[Symbols.ELEMENT];

        expect(rectangle.attr('fill')).toEqual('red');
        expect(element.node().getAttribute('fill')).toEqual('red');
        expect(rectangle.attr('height')).toEqual(100);
        expect(element.node().getAttribute('height')).toEqual('100');


        rectangle.attr('fill', 'green');
        expect(rectangle.attr('fill')).toEqual('green');
        expect(element.node().getAttribute('fill')).toEqual('green');
        expect(rectangle.attr('height')).toEqual(100);
        expect(element.node().getAttribute('height')).toEqual('100');

        rectangle.attr('height', 200);
        expect(rectangle.attr('fill')).toEqual('green');
        expect(element.node().getAttribute('fill')).toEqual('green');
        expect(rectangle.attr('height')).toEqual(200);
        expect(element.node().getAttribute('height')).toEqual('200');

    });

    it('Should be able to add the shape into each ability instance;', () => {

        const rectangle = new Rectangle();
        const abilities = rectangle[Symbols.ABILITIES];

        expect(abilities.selectable[Symbols.SHAPE] instanceof Rectangle).toBeTruthy();

    });

    it('Should be able to set the transform attribute when defining X and Y values;', () => {

        const draft     = getDraft();
        const rectangle = new Rectangle();

        draft.add(rectangle);
        rectangle.attr('x', 100).attr('y', 120);
        const element = rectangle[Symbols.ELEMENT];

        expect(rectangle.attr('x')).toEqual(100);
        expect(rectangle.attr('y')).toEqual(120);
        expect(element.node().getAttribute('transform')).toEqual('translate(100, 120)');
        expect(element.node().getAttribute('x')).toBeNull();
        expect(element.node().getAttribute('y')).toBeNull();

        rectangle.attr('y', 350);
        expect(element.node().getAttribute('transform')).toEqual('translate(100, 350)');

    });

    it('Should be able to render shapes in the shapes group;', () => {

        const draft = getDraft();
        draft.add('rectangle');

        expect(mockSVGElement.querySelectorAll('g.shapes').length).toEqual(1);
        expect(mockSVGElement.querySelectorAll('g.markers').length).toEqual(1);
        expect(mockSVGElement.querySelectorAll('g.shapes > g > rect').length).toEqual(1);

    });

});