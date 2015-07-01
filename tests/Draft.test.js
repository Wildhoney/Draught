import {getDraft, mockSVGElement} from './Bootstrap.js';

import Draft     from '../src/Draft.js';
import Symbols   from '../src/helpers/Symbols.js';
import Middleman from '../src/helpers/Middleman.js';
import Rectangle from '../src/shapes/Rectangle.js';

describe('Draft', () => {

    it('Should be able to instantiate the constructor function;', () => {
        expect(getDraft() instanceof Draft).toBeTruthy();
    });

    it('Should be able to setup the D3 using the passed in element;', () => {

        const draft = getDraft();
        expect(mockSVGElement.getAttribute('width')).toEqual('100%');
        expect(mockSVGElement.getAttribute('height')).toEqual('100%');
        expect(Array.isArray(draft[Symbols.SVG])).toBeTruthy();
        expect(draft[Symbols.SVG][0][0]).toEqual(mockSVGElement);

    });

    it('Should be able to pass in options that override the defaults;', () => {

        const draft   = getDraft({ documentHeight: '50%', gridSize: 5 });
        const options = draft[Symbols.OPTIONS];

        expect(options.documentHeight).toEqual('50%');
        expect(options.documentWidth).toEqual('100%');
        expect(draft.options().gridSize).toEqual(5);

    });

    it('Should be able to manage shapes with add, remove, clear, list;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        expect(draft.all().length).toEqual(0);
        draft.add(shapes.first);
        draft.add(shapes.second);
        expect(draft.all().length).toEqual(2);
        draft.remove(shapes.first);
        expect(draft.all().length).toEqual(1);
        draft.remove(shapes.second);
        expect(draft.all().length).toEqual(0);

        draft.add(shapes.first);
        draft.add(shapes.second);
        expect(draft.all().length).toEqual(2);
        draft.clear();
        expect(draft.all().length).toEqual(0);

    });

    it('Should be able to add the middleman object to each added shape;', () => {

        const draft = getDraft();
        const shape = new Rectangle();

        expect(draft.add(shape)).toEqual(shape);
        expect(shape[Symbols.MIDDLEMAN] instanceof Middleman).toBeTruthy();

    });

    it('Should be able to invoke the callback hooks from the invocator;', () => {

        const draft = getDraft();
        const shape = new Rectangle();

        spyOn(shape, 'didAdd').and.callThrough();
        spyOn(shape, 'didRemove').and.callThrough();

        expect(draft.add(shape)).toEqual(shape);
        expect(shape.didAdd.calls.count()).toEqual(1);

        expect(draft.remove(shape)).toEqual(0);
        expect(shape.didRemove.calls.count()).toEqual(1);

        draft.add(shape);
        expect(shape.didAdd.calls.count()).toEqual(2);

        const clearLength = draft.clear();
        expect(clearLength).toEqual(0);
        expect(shape.didRemove.calls.count()).toEqual(2);

    });

    it('Should be able to invoke the select/deselect invocator hooks;', () => {

        const draft = getDraft();
        const shape = new Rectangle();
        draft.add(shape);

        spyOn(shape, 'didSelect').and.callThrough();
        spyOn(shape, 'didDeselect').and.callThrough();

        draft.select();
        expect(shape.didSelect.calls.count()).toEqual(1);

        draft.deselect();
        expect(shape.didDeselect.calls.count()).toEqual(1);

    });

    it('Should be able to select/deselect only certain shapes;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        draft.add(shapes.first);
        draft.add(shapes.second);

        spyOn(shapes.first, 'didSelect').and.callThrough();
        spyOn(shapes.second, 'didSelect').and.callThrough();

        spyOn(shapes.first, 'didDeselect').and.callThrough();
        spyOn(shapes.second, 'didDeselect').and.callThrough();

        draft.select([shapes.first]);
        expect(shapes.first.didSelect.calls.count()).toEqual(1);
        expect(shapes.second.didSelect.calls.count()).toEqual(0);

        draft.deselect([shapes.first]);
        expect(shapes.first.didDeselect.calls.count()).toEqual(1);
        expect(shapes.second.didDeselect.calls.count()).toEqual(0);

        draft.select();
        expect(shapes.first.didSelect.calls.count()).toEqual(2);
        expect(shapes.second.didSelect.calls.count()).toEqual(1);

    });

    it('Should be able to add a shape by its name, and throw an exception when not found;', () => {

        const draft = getDraft();
        const shape = draft.add('rectangle');

        expect(shape.constructor.name).toEqual('Rectangle');

        expect(() => draft.add('non-existent')).toThrow(new Error('Draft.js: Cannot map "non-existent" to a shape object.'));

    });

});