import {getDraft} from '../Bootstrap';

import Symbols    from '../../src/helpers/Symbols';
import Selectable from '../../src/abilities/Selectable';
import Rectangle  from '../../src/shapes/Rectangle';

describe('Ability', () => {

    it('Should be able to return the shape instance from the ability instance;', () => {

        const draft      = getDraft();
        const rectangle  = draft.add(new Rectangle());
        const selectable = rectangle[Symbols.ABILITIES].selectable;

        expect(typeof selectable.shape).toBe('function');
        expect(selectable.shape()).toEqual(rectangle);

    });

    it('Should be able to return the middleman instance;', () => {

        const draft     = getDraft();
        const rectangle = draft.add(new Rectangle());

        const selectable = rectangle[Symbols.ABILITIES].selectable;
        expect(selectable.middleman()).toEqual(draft[Symbols.MIDDLEMAN]);

    });

});