import Draft     from '../../src/Draft.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Rectangle from '../../src/shapes/Rectangle.js';

describe('Ability', () => {

    const mockSVGElement = document.createElement('svg');
    const getDraft       = (options) => new Draft(mockSVGElement, options);

    it('Should be able to return the shape instance from the ability instance;', () => {

        const rectangle = new Rectangle();
        const movable   = rectangle[Symbols.ABILITIES].movable;

        expect(typeof movable.getShape).toBe('function');
        expect(movable.getShape()).toEqual(rectangle);

    });

    it('Should be able to return the middleman instance;', () => {

        const draft     = getDraft();
        const rectangle = new Rectangle();

        const movable = rectangle[Symbols.ABILITIES].movable;
        expect(movable.getMiddleman()).toBeUndefined();

        draft.addShape(rectangle);
        expect(movable.getMiddleman()).toEqual(draft[Symbols.MIDDLEMAN]);

    });

});