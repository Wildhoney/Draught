import {getDraft} from '../Bootstrap.js';

import Symbols   from '../../src/helpers/Symbols.js';
import Rectangle from '../../src/shapes/Rectangle.js';

describe('Ability', () => {

    it('Should be able to return the shape instance from the ability instance;', () => {

        const rectangle = new Rectangle();
        const movable   = rectangle[Symbols.ABILITIES].selectable;

        expect(typeof movable.getShape).toBe('function');
        expect(movable.getShape()).toEqual(rectangle);

    });

    it('Should be able to return the middleman instance;', () => {

        const draft     = getDraft();
        const rectangle = new Rectangle();

        const movable = rectangle[Symbols.ABILITIES].selectable;
        expect(movable.getMiddleman()).toBeUndefined();

        draft.add(rectangle);
        expect(movable.getMiddleman()).toEqual(draft[Symbols.MIDDLEMAN]);

    });

});