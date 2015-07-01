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

        const draft  = getDraft();
        const shapes = { first: draft.add(new Rectangle()), second: draft.add(new Rectangle()) };

        Mousetrap.trigger('mod+a');
        expect(draft.selected().length).toEqual(2);

        const event = new MouseEvent('click', { bubbles: true, cancelable: false });
        shapes.first[Symbols.ELEMENT].node().dispatchEvent(event);
        expect(draft.selected().length).toEqual(1);
        expect(shapes.first.isSelected()).toBeTruthy();
        expect(shapes.second.isSelected()).toBeFalsy();

    });

});