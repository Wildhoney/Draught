import Draft     from '../src/Draft.js';
import Symbols   from '../src/helpers/Symbols.js';
import Middleman from '../src/helpers/Middleman.js';
import Rectangle from '../src/shapes/Rectangle.js';

describe('Draft', () => {

    const mockSVGElement = document.createElement('svg');
    const getDraft       = (options) => new Draft(mockSVGElement, options);

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
        expect(draft.getOptions().gridSize).toEqual(5);

    });

    it('Should be able to manage shapes with add, remove, clear, list;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        expect(draft.getShapes().length).toEqual(0);
        draft.addShape(shapes.first);
        draft.addShape(shapes.second);
        expect(draft.getShapes().length).toEqual(2);
        draft.removeShape(shapes.first);
        expect(draft.getShapes().length).toEqual(1);
        draft.removeShape(shapes.second);
        expect(draft.getShapes().length).toEqual(0);

        draft.addShape(shapes.first);
        draft.addShape(shapes.second);
        expect(draft.getShapes().length).toEqual(2);
        draft.clearShapes();
        expect(draft.getShapes().length).toEqual(0);

    });

    it('Should be able to add the middleman object to each added shape;', () => {

        const draft = getDraft();
        const shape = new Rectangle();

        expect(draft.addShape(shape)).toEqual(1);
        expect(shape[Symbols.MIDDLEMAN] instanceof Middleman).toBeTruthy();

    });

    it('Should be able to invoke the callback hooks from the invocator;', () => {

        const draft = getDraft();
        const shape = new Rectangle();

        spyOn(shape, 'didAdd').and.callThrough();
        spyOn(shape, 'didRemove').and.callThrough();

        const addLength = draft.addShape(shape);
        expect(addLength).toEqual(1);
        expect(shape.didAdd.calls.count()).toEqual(1);

        const removeLength = draft.removeShape(shape);
        expect(removeLength).toEqual(0);
        expect(shape.didRemove.calls.count()).toEqual(1);

        draft.addShape(shape);
        expect(shape.didAdd.calls.count()).toEqual(2);

        const clearLength = draft.clearShapes();
        expect(clearLength).toEqual(0);
        expect(shape.didRemove.calls.count()).toEqual(2);

    });

    it('Should be able to invoke the select/deselect invocator hooks;', () => {

        const draft = getDraft();
        const shape = new Rectangle();
        draft.addShape(shape);

        spyOn(shape, 'didSelect').and.callThrough();
        spyOn(shape, 'didDeselect').and.callThrough();

        draft.selectShapes();
        expect(shape.didSelect.calls.count()).toEqual(1);

        draft.deselectShapes();
        expect(shape.didDeselect.calls.count()).toEqual(1);

    });

    it('Should be able to select/deselect only certain shapes;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        draft.addShape(shapes.first);
        draft.addShape(shapes.second);

        spyOn(shapes.first, 'didSelect').and.callThrough();
        spyOn(shapes.second, 'didSelect').and.callThrough();

        spyOn(shapes.first, 'didDeselect').and.callThrough();
        spyOn(shapes.second, 'didDeselect').and.callThrough();

        draft.selectShapes([shapes.first]);
        expect(shapes.first.didSelect.calls.count()).toEqual(1);
        expect(shapes.second.didSelect.calls.count()).toEqual(0);

        draft.deselectShapes([shapes.first]);
        expect(shapes.first.didDeselect.calls.count()).toEqual(1);
        expect(shapes.second.didDeselect.calls.count()).toEqual(0);

        draft.selectShapes();
        expect(shapes.first.didSelect.calls.count()).toEqual(2);
        expect(shapes.second.didSelect.calls.count()).toEqual(1);

    });

});