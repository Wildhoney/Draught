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

});