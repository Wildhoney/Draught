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

    });

});