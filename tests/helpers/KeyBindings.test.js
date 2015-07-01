import {getDraft} from '../Bootstrap.js';

import Rectangle   from '../../src/shapes/Rectangle.js';
import Symbols     from '../../src/helpers/Symbols.js';
import KeyBindings from '../../src/helpers/KeyBindings.js';

describe('Key Bindings', () => {

    it('Should be able to select all with mod+a key;', () => {

        const draft  = getDraft();
        const shapes = { first: new Rectangle(), second: new Rectangle() };
        draft.add(shapes.first);
        draft.add(shapes.second);
        const firstMiddleman  = shapes.first[Symbols.MIDDLEMAN];
        const secondMiddleman = shapes.first[Symbols.MIDDLEMAN];

        expect(typeof firstMiddleman.keyMap()).toBe('object');
        expect(firstMiddleman.keyMap().multiSelect).toBeFalsy();
        expect(firstMiddleman.keyMap().aspectRatio).toBeFalsy();

        spyOn(firstMiddleman, 'select').and.callThrough();

        Mousetrap.trigger('mod+a');
        expect(firstMiddleman.select).toHaveBeenCalled();
        expect(secondMiddleman.select).toHaveBeenCalled();

        Mousetrap.trigger('mod', 'keydown');
        expect(firstMiddleman.keyMap().multiSelect).toBeTruthy();
        expect(secondMiddleman.keyMap().multiSelect).toBeTruthy();
        expect(firstMiddleman.keyMap().aspectRatio).toBeFalsy();
        expect(secondMiddleman.keyMap().aspectRatio).toBeFalsy();

        Mousetrap.trigger('mod', 'keyup');
        expect(firstMiddleman.keyMap().multiSelect).toBeFalsy();
        expect(secondMiddleman.keyMap().multiSelect).toBeFalsy();
        expect(firstMiddleman.keyMap().aspectRatio).toBeFalsy();
        expect(secondMiddleman.keyMap().aspectRatio).toBeFalsy();

        Mousetrap.trigger('shift', 'keydown');
        expect(firstMiddleman.keyMap().aspectRatio).toBeTruthy();
        expect(secondMiddleman.keyMap().aspectRatio).toBeTruthy();
        expect(firstMiddleman.keyMap().multiSelect).toBeFalsy();
        expect(secondMiddleman.keyMap().multiSelect).toBeFalsy();

        Mousetrap.trigger('shift', 'keyup');
        expect(firstMiddleman.keyMap().aspectRatio).toBeFalsy();
        expect(secondMiddleman.keyMap().aspectRatio).toBeFalsy();
        expect(firstMiddleman.keyMap().multiSelect).toBeFalsy();
        expect(secondMiddleman.keyMap().multiSelect).toBeFalsy();

    });

});