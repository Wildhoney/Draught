import {getDraft} from '../Bootstrap';

import Symbols   from '../../src/helpers/Symbols';
import Rectangle from '../../src/shapes/Rectangle';

describe('Resizable', () => {

    it('Should be able to remove handles if they exist;', () => {

        const draft     = getDraft();
        const rectangle = draft.add(new Rectangle()).attr('x', 100).attr('y', 200).attr('width', 250).attr('height', 250);
        const resizable = rectangle[Symbols.ABILITIES].resizable;
        const layer     = draft[Symbols.LAYERS].resize;
        const svg       = draft[Symbols.SVG];
        const radius    = draft.options().handleRadius;

        spyOn(resizable, 'didSelect').and.callThrough();
        spyOn(resizable, 'didDeselect').and.callThrough();
        spyOn(resizable, 'reattachHandles').and.callThrough();
        spyOn(resizable, 'attachHandles').and.callThrough();
        spyOn(resizable, 'detachHandles').and.callThrough();

        const firstEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
        rectangle[Symbols.ELEMENT].node().dispatchEvent(firstEvent);

        expect(resizable.didSelect).toHaveBeenCalled();
        expect(resizable.didDeselect).not.toHaveBeenCalled();

        expect(resizable.reattachHandles.calls.count()).toEqual(1);
        expect(resizable.attachHandles.calls.count()).toEqual(1);
        expect(resizable.detachHandles.calls.count()).toEqual(1);

        const handles = layer.node().querySelectorAll('image');
        expect(handles.length).toEqual(8);

        expect(Number(handles[0].getAttribute('x'))).toEqual(100 - (radius / 2));
        expect(Number(handles[0].getAttribute('y'))).toEqual(200 - (radius / 2));

        expect(Number(handles[1].getAttribute('x'))).toEqual(225 - (radius / 2));
        expect(Number(handles[1].getAttribute('y'))).toEqual(200 - (radius / 2));

        expect(Number(handles[2].getAttribute('x'))).toEqual(350 - (radius / 2));
        expect(Number(handles[2].getAttribute('y'))).toEqual(200 - (radius / 2));

        expect(Number(handles[3].getAttribute('x'))).toEqual(100 - (radius / 2));
        expect(Number(handles[3].getAttribute('y'))).toEqual(325 - (radius / 2));

        expect(Number(handles[4].getAttribute('x'))).toEqual(100 - (radius / 2));
        expect(Number(handles[4].getAttribute('y'))).toEqual(450 - (radius / 2));

        expect(Number(handles[5].getAttribute('x'))).toEqual(225 - (radius / 2));
        expect(Number(handles[5].getAttribute('y'))).toEqual(450 - (radius / 2));

        expect(Number(handles[6].getAttribute('x'))).toEqual(350 - (radius / 2));
        expect(Number(handles[6].getAttribute('y'))).toEqual(450 - (radius / 2));

        expect(Number(handles[7].getAttribute('x'))).toEqual(350 - (radius / 2));
        expect(Number(handles[7].getAttribute('y'))).toEqual(325 - (radius / 2));
        //
        const secondEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
        svg.node().dispatchEvent(secondEvent);

        expect(resizable.didDeselect).toHaveBeenCalled();
        expect(layer.node().querySelectorAll('circle').length).toEqual(0);
        expect(resizable.reattachHandles.calls.count()).toEqual(1);
        expect(resizable.attachHandles.calls.count()).toEqual(1);
        expect(resizable.detachHandles.calls.count()).toEqual(2);

    });

    it('Should be able to call attach/detach when reattaching edges;', () => {

        const draft     = getDraft();
        const rectangle = draft.add('rectangle');
        const resizable = rectangle[Symbols.ABILITIES].resizable;

        spyOn(resizable, 'attachHandles');
        spyOn(resizable, 'detachHandles');

        resizable.reattachHandles();
        expect(resizable.detachHandles.calls.count()).toEqual(1);
        expect(resizable.attachHandles.calls.count()).toEqual(1);

    });

});