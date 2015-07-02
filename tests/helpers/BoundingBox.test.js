import {getDraft, mockSVGElement} from '../Bootstrap';

import Symbols from '../../src/helpers/Symbols';
import BoundingBox from '../../src/helpers/BoundingBox';

describe('Bounding Box', () => {

    it('Should be able to determine the bBox shape from the selected shapes;', () => {

        const draft  = getDraft();
        const shapes = { first: draft.add('rectangle'), second: draft.add('rectangle') };

        expect(draft.selected().length).toEqual(0);
        shapes.first.attr('x', 100).attr('y', 100).attr('height', 400).attr('width', 200);
        shapes.second.attr('x', 300).attr('y', 300).attr('height', 100).attr('width', 100);
        Mousetrap.trigger('mod+a');
        expect(draft.selected().length).toEqual(2);

        const boundingBox = mockSVGElement.querySelector('.drag-box');
        expect(Number(boundingBox.getAttribute('height'))).toEqual(400);
        expect(Number(boundingBox.getAttribute('width'))).toEqual(300);
        expect(Number(boundingBox.getAttribute('y'))).toEqual(100);
        expect(Number(boundingBox.getAttribute('x'))).toEqual(100);

    });

});