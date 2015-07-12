import {getDraft} from '../Bootstrap';

import Symbols   from '../../src/helpers/Symbols';
import Rectangle from '../../src/shapes/Rectangle';

//describe('Selectable', () => {
//
//    it('Should be able to remove handles if they exist;', () => {
//
//        const draft     = getDraft();
//        const rectangle = draft.add(new Rectangle()).attr('x', 100).attr('y', 200).attr('width', 250).attr('height', 250);
//        const resizable = rectangle[Symbols.ABILITIES].resizable;
//        const layer     = draft[Symbols.LAYERS].markers;
//        const svg       = draft[Symbols.SVG];
//
//        spyOn(resizable, 'didSelect').and.callThrough();
//        spyOn(resizable, 'didDeselect').and.callThrough();
//        spyOn(resizable, 'reattachHandles').and.callThrough();
//        spyOn(resizable, 'attachHandles').and.callThrough();
//        spyOn(resizable, 'detachHandles').and.callThrough();
//
//        const firstEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
//        rectangle[Symbols.ELEMENT].node().dispatchEvent(firstEvent);
//
//        expect(resizable.didSelect).toHaveBeenCalled();
//        expect(resizable.didDeselect).not.toHaveBeenCalled();
//
//        expect(resizable.reattachHandles.calls.count()).toEqual(1);
//        expect(resizable.attachHandles.calls.count()).toEqual(1);
//        expect(resizable.detachHandles.calls.count()).toEqual(1);
//
//        const circles = layer.node().querySelectorAll('circle');
//        expect(circles.length).toEqual(8);
//
//        expect(Number(circles[0].getAttribute('cx'))).toEqual(100);
//        expect(Number(circles[0].getAttribute('cy'))).toEqual(200);
//
//        expect(Number(circles[1].getAttribute('cx'))).toEqual(225);
//        expect(Number(circles[1].getAttribute('cy'))).toEqual(200);
//
//        expect(Number(circles[2].getAttribute('cx'))).toEqual(350);
//        expect(Number(circles[2].getAttribute('cy'))).toEqual(200);
//
//        expect(Number(circles[3].getAttribute('cx'))).toEqual(100);
//        expect(Number(circles[3].getAttribute('cy'))).toEqual(325);
//
//        expect(Number(circles[4].getAttribute('cx'))).toEqual(100);
//        expect(Number(circles[4].getAttribute('cy'))).toEqual(450);
//
//        expect(Number(circles[5].getAttribute('cx'))).toEqual(225);
//        expect(Number(circles[5].getAttribute('cy'))).toEqual(450);
//
//        expect(Number(circles[6].getAttribute('cx'))).toEqual(350);
//        expect(Number(circles[6].getAttribute('cy'))).toEqual(450);
//
//        expect(Number(circles[7].getAttribute('cx'))).toEqual(350);
//        expect(Number(circles[7].getAttribute('cy'))).toEqual(325);
//
//        const secondEvent = new MouseEvent('click', { bubbles: false, cancelable: false });
//        svg.node().dispatchEvent(secondEvent);
//
//        expect(resizable.didDeselect).toHaveBeenCalled();
//        expect(layer.node().querySelectorAll('circle').length).toEqual(0);
//        expect(resizable.reattachHandles.calls.count()).toEqual(1);
//        expect(resizable.attachHandles.calls.count()).toEqual(1);
//        expect(resizable.detachHandles.calls.count()).toEqual(2);
//
//    });
//
//    it('Should be able to call attach/detach when reattaching edges;', () => {
//
//        const draft     = getDraft();
//        const rectangle = draft.add('rectangle');
//        const resizable = rectangle[Symbols.ABILITIES].resizable;
//
//        spyOn(resizable, 'attachHandles');
//        spyOn(resizable, 'detachHandles');
//
//        resizable.reattachHandles();
//        expect(resizable.detachHandles.calls.count()).toEqual(1);
//        expect(resizable.attachHandles.calls.count()).toEqual(1);
//
//    });
//
//});