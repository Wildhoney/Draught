import {getDraft} from '../Bootstrap.js';

import Middleman from '../../src/helpers/Middleman.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Rectangle from '../../src/shapes/Rectangle.js';

describe('Middleman', () => {

    it('Should be able to get all of the shapes;', () => {

        const draft     = getDraft();
        const middleman = draft[Symbols.MIDDLEMAN];
        const shape     = new Rectangle();

        expect(middleman.constructor).toEqual(Middleman);
        expect(middleman.all().length).toEqual(0);
        draft.add(shape);
        expect(middleman.all().length).toEqual(1);
        draft.clear();
        expect(middleman.all().length).toEqual(0);

    });

    it('Should be able to invoke select/deselect with include/exclude;', () => {

        const draft     = getDraft();
        const middleman = draft[Symbols.MIDDLEMAN];
        const shapes    = { first: draft.add(new Rectangle()), second: draft.add(new Rectangle()) };

        middleman.select({ exclude: shapes.first });
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeTruthy();

        middleman.select();
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

        middleman.deselect({ exclude: shapes.second });
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeTruthy();

        middleman.select({ include: [shapes.first, shapes.second] });
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

        middleman.deselect({ include: [shapes.first] });
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeTruthy();

        middleman.deselect();
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeFalsy();

        const firstEvent = new MouseEvent('click', { bubbles: true, cancelable: false });
        shapes.first[Symbols.ELEMENT].node().dispatchEvent(firstEvent);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

        const secondEvent = new MouseEvent('click', { bubbles: true, cancelable: false });
        Mousetrap.trigger('mod', 'keydown');
        shapes.second[Symbols.ELEMENT].node().dispatchEvent(secondEvent);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

    });

    it('Should be able to deselect all selected shapes when the canvas is clicked and not propagated;', () => {

        const draft     = getDraft();
        const svg       = draft[Symbols.SVG];
        const middleman = draft[Symbols.MIDDLEMAN];
        const shapes    = { first: draft.add(new Rectangle()), second: draft.add(new Rectangle()) };

        middleman.select();
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

        const rootEvent = new MouseEvent('click', { bubbles: true, cancelable: false });
        svg.node().dispatchEvent(rootEvent);
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeFalsy();

        middleman.select();
        const shapeGroup = draft[Symbols.LAYERS].shapes;
        const groupEvent = new MouseEvent('click', { bubbles: true, cancelable: false });
        shapeGroup.node().dispatchEvent(groupEvent);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

    });

    it('Should be able to resolve a shape given an element;', () => {

        const draft     = getDraft();
        const shape     = draft.add('rectangle');
        const element   = shape[Symbols.ELEMENT].node();
        const middleman = draft[Symbols.MIDDLEMAN];

        expect(middleman.fromElement(element)).toEqual(shape);
        expect(middleman.fromElement({})).toBeUndefined();

    });

    it('Should be able to return the D3 instance;', () => {

        const draft     = getDraft();
        const middleman = draft[Symbols.MIDDLEMAN];
        expect(middleman.d3()).toEqual(draft[Symbols.SVG]);

    });

    it('Should be able to return the key map object;', () => {

        const draft     = getDraft();
        const middleman = draft[Symbols.MIDDLEMAN];
        expect(typeof middleman.keyMap()).toBe('object');
        expect(middleman.keyMap().multiSelect).toBeFalsy();
        expect(middleman.keyMap().aspectRatio).toBeFalsy();

    });

    it('Should be able to yield the D3 layers;', () => {

        const draft     = getDraft();
        const middleman = draft[Symbols.MIDDLEMAN];
        expect(typeof middleman.layers()).toBe('object');
        expect(Object.keys(middleman.layers())).toEqual(['shapes', 'markers']);
        expect(middleman.layers().shapes.node().nodeName.toLowerCase()).toEqual('g');
        expect(middleman.layers().markers.node().nodeName.toLowerCase()).toEqual('g');

    });

});