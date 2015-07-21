import Mousetrap from 'mousetrap';
import Symbols   from './Symbols';

/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class BoundingBox {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {BoundingBox}
     */
    constructor(middleman) {
        this[Symbols.MIDDLEMAN] = middleman;
        this.listenToKeyboardEvents();
    }

    /**
     * @method listenToKeyboardEvents
     * @return {void}
     */
    listenToKeyboardEvents() {

        /**
         * @method moveBy
         * @param {Object} event
         * @param {Number} x
         * @param {Number} y
         * @return {void}
         */
        const moveBy = (event, x, y) => {

            if (typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            this.moveSelectedBy(x, y, true);

        };

        const options         = this[Symbols.MIDDLEMAN].options();
        const defaultMoveStep = options.defaultMoveStep;
        const shiftMoveStep   = options.shiftMoveStep;

        Mousetrap.bind('left',        (event) => moveBy(event, -defaultMoveStep, 0));
        Mousetrap.bind('right',       (event) => moveBy(event, defaultMoveStep, 0));
        Mousetrap.bind('up',          (event) => moveBy(event, 0, -defaultMoveStep));
        Mousetrap.bind('down',        (event) => moveBy(event, 0, defaultMoveStep));

        Mousetrap.bind('shift+left',  (event) => moveBy(event, -shiftMoveStep, 0));
        Mousetrap.bind('shift+right', (event) => moveBy(event, shiftMoveStep, 0));
        Mousetrap.bind('shift+up',    (event) => moveBy(event, 0, -shiftMoveStep));
        Mousetrap.bind('shift+down',  (event) => moveBy(event, 0, shiftMoveStep));

    }

    /**
     * @method handleClick
     * @return {void}
     */
    handleClick() {

        const middleman = this[Symbols.MIDDLEMAN];
        d3.event.stopPropagation();

        if (middleman.preventDeselect()) {
            middleman.preventDeselect(false);
            return;
        }

        const mouseX = d3.event.pageX;
        const mouseY = d3.event.pageY;

        this.bBox.attr('pointer-events', 'none');
        const element = document.elementFromPoint(mouseX, mouseY);
        this.bBox.attr('pointer-events', 'all');

        if (middleman.fromElement(element)) {
            const event = new MouseEvent('click', { bubbles: true, cancelable: false });
            element.dispatchEvent(event);
        }
    }

    /**
     * @method drawBoundingBox
     * @param {Array} selected
     * @param {Object} layer
     * @return {void}
     */
    drawBoundingBox(selected, layer) {

        if (this.bBox) {
            this.bBox.remove();
        }

        if (selected.length === 0) {
            return;
        }

        const model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                        maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

        /**
         * Responsible for computing the collective bounding box, based on all of the bounding boxes
         * from the current selected shapes.
         *
         * @method compute
         * @param {Array} bBoxes
         * @return {void}
         */
        const compute = (bBoxes) => {
            model.minX = Math.min(...bBoxes.map((d) => d.x));
            model.minY = Math.min(...bBoxes.map((d) => d.y));
            model.maxX = Math.max(...bBoxes.map((d) => d.x + d.width));
            model.maxY = Math.max(...bBoxes.map((d) => d.y + d.height));
        };

        // Compute the collective bounding box.
        compute(selected.map((shape) => shape.boundingBox()));

        this.bBox = layer.append('rect')
                         .datum(model)
                         .classed('drag-box', true)
                         .attr('x',      ((d) => d.minX))
                         .attr('y',      ((d) => d.minY))
                         .attr('width',  ((d) => d.maxX - d.minX))
                         .attr('height', ((d) => d.maxY - d.minY))
                         .on('click', this.handleClick.bind(this));

        const dragStart = ['dragstart', () => this.dragStart()];
        const drag      = ['drag',      () => this.drag()];
        const dragEnd   = ['dragend',   () => this.dragEnd()];

        this.bBox.call(d3.behavior.drag().on(...dragStart).on(...drag).on(...dragEnd));

    }

    /**
     * @method dragStart
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @return {void}
     */
    dragStart(x = null, y = null) {

        const sX = Number(this.bBox.attr('x'));
        const sY = Number(this.bBox.attr('y'));

        this.start = {
            x: (x !== null) ? x : (d3.event.sourceEvent.overrideX || d3.event.sourceEvent.pageX) - sX,
            y: (y !== null) ? y : (d3.event.sourceEvent.overrideY || d3.event.sourceEvent.pageY) - sY
        };

        this.move = {
            start: { x: sX, y: sY },
            end:   { }
        };

    }

    /**
     * @method drag
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @param {Number} [multipleOf=this[Symbols.MIDDLEMAN].options().gridSize]
     * @return {void}
     */
    drag(x = null, y = null, multipleOf = this[Symbols.MIDDLEMAN].options().gridSize) {

        this[Symbols.MIDDLEMAN].preventDeselect(true);

        x = (x !== null) ? x : d3.event.sourceEvent.pageX;
        y = (y !== null) ? y : d3.event.sourceEvent.pageY;

        const mX = (x - this.start.x),
              mY = (y - this.start.y),
              eX = Math.ceil(mX / multipleOf) * multipleOf,
              eY = Math.ceil(mY / multipleOf) * multipleOf;

        this.bBox.datum().x = eX;
        this.bBox.datum().y = eY;

        this.bBox.attr('x', eX);
        this.bBox.attr('y', eY);

        this.move.end = { x: eX, y: eY };

    }

    /**
     * @method dragEnd
     * @return {void}
     */
    dragEnd() {

        const eX = this.move.end.x - this.move.start.x;
        const eY = this.move.end.y - this.move.start.y;

        if (isNaN(eX) || isNaN(eY)) {
            return;
        }

        // Move each shape by the delta between the start and end points.
        this.moveSelectedBy(eX, eY);

    }

    /**
     * @method moveSelectedBy
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [moveBBox=false]
     * @return {void}
     */
    moveSelectedBy(x, y, moveBBox = false) {

        this[Symbols.MIDDLEMAN].selected().forEach((shape) => {

            const currentX = shape.attr('x');
            const currentY = shape.attr('y');
            const moveX    = currentX + x;
            const moveY    = currentY + y;

            shape.attr('x', moveX).attr('y', moveY);
            shape.attr('x', moveX).attr('y', moveY);
            shape.didMove();

            if (moveBBox) {
                this.bBox.attr('x', moveX).attr('y', moveY);
                this.bBox.attr('x', moveX).attr('y', moveY);
            }

        });

    }

}