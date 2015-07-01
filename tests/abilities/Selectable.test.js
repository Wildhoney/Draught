import {getDraft} from '../Bootstrap.js';

import Symbols   from '../../src/helpers/Symbols.js';
import Rectangle from '../../src/shapes/Rectangle.js';

describe('Selectable', () => {

    it('Should be able to select and deselect shapes;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        draft.add(shapes.first);
        draft.add(shapes.second);

        spyOn(shapes.first, 'didSelect').and.callThrough();
        spyOn(shapes.second, 'didSelect').and.callThrough();

        draft.selectShapes(shapes.first);
        expect(shapes.first.didSelect.calls.count()).toEqual(1);
        expect(shapes.second.didSelect.calls.count()).toEqual(0);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

    });

});