import {getDraft} from '../Bootstrap';

import Symbols   from '../../src/helpers/Symbols';
import Rectangle from '../../src/shapes/Rectangle';

describe('Selectable', () => {

    it('Should be able to select and deselect shapes;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };

        draft.add(shapes.first);
        draft.add(shapes.second);

        spyOn(shapes.first, 'didSelect').and.callThrough();
        spyOn(shapes.second, 'didSelect').and.callThrough();
        spyOn(shapes.first, 'didDeselect').and.callThrough();
        spyOn(shapes.second, 'didDeselect').and.callThrough();

        draft.select(shapes.first);
        expect(shapes.first.didSelect.calls.count()).toEqual(1);
        expect(shapes.second.didSelect.calls.count()).toEqual(0);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

        draft.select();
        expect(shapes.first.didSelect.calls.count()).toEqual(2);
        expect(shapes.second.didSelect.calls.count()).toEqual(1);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeTruthy();

        draft.deselect(shapes.second);
        expect(shapes.first.didDeselect.calls.count()).toEqual(0);
        expect(shapes.second.didDeselect.calls.count()).toEqual(1);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

        draft.deselect();
        expect(shapes.first.didDeselect.calls.count()).toEqual(1);
        expect(shapes.second.didDeselect.calls.count()).toEqual(2);
        expect(shapes.first.isSelected()).toBeFalsy();
        expect(shapes.second.isSelected()).toBeFalsy();

    });

    it('Should be able to retain selection on element with naked click when more than one selected;', () => {

        d3.event = { sourceEvent: {} };

        const draft       = getDraft();
        const shapes      = { first: draft.add(new Rectangle()), second: draft.add(new Rectangle()) };

        Mousetrap.trigger('mod+a');
        expect(draft.selected().length).toEqual(2);

        const event = new MouseEvent('click', { bubbles: true, cancelable: false });
        shapes.first[Symbols.ELEMENT].node().dispatchEvent(event);
        expect(draft.selected().length).toEqual(1);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

    });

    it('Should be able to select the shapes when clicking on the bounding box;', () => {

        const draft       = getDraft();
        const shapes      = { first: draft.add(new Rectangle()), second: draft.add(new Rectangle()) };
        const boundingBox = draft[Symbols.BOUNDING_BOX];
        const middleman   = draft[Symbols.MIDDLEMAN];

        spyOn(shapes.first, 'didSelect').and.callThrough();

        spyOn(boundingBox, 'handleClick').and.callFake(() => {

            if (middleman.preventDeselect()) {
                middleman.preventDeselect(false);
                return;
            }

            const event = new MouseEvent('click', { bubbles: true, cancelable: false });
            shapes.first[Symbols.ELEMENT].node().dispatchEvent(event);

        });

        Mousetrap.trigger('mod+a');
        expect(draft.selected().length).toEqual(2);

        const bBox            = draft[Symbols.BOUNDING_BOX].bBox.node();
        const firstClickEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
        bBox.dispatchEvent(firstClickEvent);

        expect(draft.selected().length).toEqual(1);
        expect(shapes.first.didSelect).toHaveBeenCalled();
        expect(shapes.first.didSelect.calls.count()).toEqual(1);
        expect(middleman.preventDeselect()).toBeFalsy();

        // Simulate drag event on the bBox.
        boundingBox.dragStart(10, 10);
        boundingBox.drag();
        expect(middleman.preventDeselect()).toBeTruthy();
        const secondClickEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
        bBox.dispatchEvent(secondClickEvent);
        expect(middleman.preventDeselect()).toBeFalsy();

        boundingBox.drag();
        expect(middleman.preventDeselect()).toBeTruthy();
        const thirdClickEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
        bBox.dispatchEvent(thirdClickEvent);
        draft[Symbols.SVG].node().dispatchEvent(thirdClickEvent);
        expect(middleman.preventDeselect()).toBeFalsy();

    });

    it('Should be able to intercept drag handler and move solitude shape;', () => {

        const draft      = getDraft();
        const rectangle  = draft.add(new Rectangle()).attr('fill', 'orange');
        const selectable = rectangle[Symbols.ABILITIES].selectable;

        spyOn(selectable, 'handleClick').and.callThrough();

        d3.event = { sourceEvent: { pageX: 100, pageY: 250 } };
        const drag = selectable.handleDrag();
        expect(selectable.handleClick).toHaveBeenCalled();
        expect(drag.overrideX).toEqual(100);
        expect(drag.overrideY).toEqual(250);

    });

});