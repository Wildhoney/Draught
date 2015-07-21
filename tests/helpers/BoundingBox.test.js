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

    it('Should be able to move items using the keyboard;', () => {

        const draft       = getDraft();
        const shapes      = {
            first: draft.add('rectangle').attr('width', 100).attr('height', 100).attr('x', 200).attr('y', 300),
            second: draft.add('rectangle').attr('width', 250).attr('height', 200).attr('x', 400).attr('y', 500) };
        const boundingBox = draft[Symbols.BOUNDING_BOX];

        draft.select(shapes.first);
        draft.select(shapes.second);
        const bBoxElement = boundingBox.bBox;

        spyOn(boundingBox, 'moveSelectedBy').and.callThrough();

        Mousetrap.trigger('left');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(-1, 0, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(399);

        Mousetrap.trigger('right');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(1, 0, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(400);

        Mousetrap.trigger('shift+right');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(10, 0, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(410);

        Mousetrap.trigger('down');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(0, 1, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(410);
        expect(Number(bBoxElement.attr('y'))).toEqual(501);

        Mousetrap.trigger('shift+down');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(0, 10, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(410);
        expect(Number(bBoxElement.attr('y'))).toEqual(511);

        Mousetrap.trigger('up');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(0, -1, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(410);
        expect(Number(bBoxElement.attr('y'))).toEqual(510);

        Mousetrap.trigger('shift+left');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(-10, 0, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(400);
        expect(Number(bBoxElement.attr('y'))).toEqual(510);

        Mousetrap.trigger('shift+up');
        expect(boundingBox.moveSelectedBy).toHaveBeenCalledWith(-10, 0, true);
        expect(Number(bBoxElement.attr('x'))).toEqual(400);
        expect(Number(bBoxElement.attr('y'))).toEqual(500);

    });

});