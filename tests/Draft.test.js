import Draft     from '../src/Draft.js';
import Symbols   from '../src/helpers/Symbols.js';
import Middleman from '../src/helpers/Middleman.js';

describe('Draft', () => {

    const mockSVGElement = document.createElement('svg');
    const getDraft       = (options) => new Draft(mockSVGElement, options);

    it('Should be able to instantiate the constructor function;', () => {
        expect(getDraft() instanceof Draft).toBeTruthy();
    });

    it('Should be able to pass in options that override the defaults;', () => {

        const draft   = getDraft({ documentHeight: '50%', gridSize: 5 });
        const options = draft[Symbols.OPTIONS];

        expect(options.documentHeight).toEqual('50%');
        expect(options.documentWidth).toEqual('100%');
        expect(draft.getOptions().gridSize).toEqual(5);

    });

    it('Should be able to manage shapes with add, remove, list;', () => {

        const draft  = getDraft();
        const shapes = { first: {}, second: {} };

        expect(draft.getShapes().length).toEqual(0);
        draft.addShape(shapes.first);
        draft.addShape(shapes.second);
        expect(draft.getShapes().length).toEqual(2);
        draft.removeShape(shapes.first);
        expect(draft.getShapes().length).toEqual(1);
        draft.removeShape(shapes.second);
        expect(draft.getShapes().length).toEqual(0);

    });

    it('Should be able to add the middleman object to each added shape;', () => {

        const draft = getDraft();
        const shape = {};

        expect(draft.addShape(shape)).toEqual(shape);
        expect(shape[Symbols.MIDDLEMAN] instanceof Middleman).toBeTruthy();

    });

});