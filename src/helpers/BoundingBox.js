import Symbols from './Symbols';

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

        this.start = {
            x: (x !== null) ? x : d3.event.sourceEvent.clientX - Number(this.bBox.attr('x')),
            y: (y !== null) ? y : d3.event.sourceEvent.clientY - Number(this.bBox.attr('y'))
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

        x = (x !== null) ? x : d3.event.sourceEvent.clientX;
        y = (y !== null) ? y : d3.event.sourceEvent.clientY;

        const mX = (x - this.start.x),
              mY = (y - this.start.y),
              eX = Math.ceil(mX / multipleOf) * multipleOf,
              eY = Math.ceil(mY / multipleOf) * multipleOf;

        this.bBox.datum().x = eX;
        this.bBox.attr('x', eX);

        this.bBox.datum().y = eY;
        this.bBox.attr('y', eY);

    }

    /**
     * @method dragEnd
     * @return {void}
     */
    dragEnd() {
        //this.bBox.remove();
    }

}