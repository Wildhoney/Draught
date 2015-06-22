/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class BoundingBox {

    /**
     * @method setAccessor
     * @param {Object} accessor
     * @return {void}
     */
    setAccessor(accessor) {
        this.accessor = accessor;
    }

    /**
     * @method create
     * @property {Array} selected
     * @property {Object} group
     * @return {void}
     */
    create(selected, group) {

        if (this.bBox) {
            this.bBox.remove();
        }

        if (selected.length === 0) {
            return;
        }

        let model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                      maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

        /**
         * Responsible for computing the collective bounding box, based on all of the bounding boxes
         * from the current selected shapes.
         *
         * @method compute
         * @param {Array} bBoxes
         * @return {void}
         */
        let compute = (bBoxes) => {
            model.minX = Math.min(...bBoxes.map((d) => d.x));
            model.minY = Math.min(...bBoxes.map((d) => d.y));
            model.maxX = Math.max(...bBoxes.map((d) => d.x + d.width));
            model.maxY = Math.max(...bBoxes.map((d) => d.y + d.height));
        };

        // Compute the collective bounding box.
        compute(selected.map((shape) => shape.boundingBox()));

        this.bBox = group.append('rect')
                         .datum(model)
                         .classed('drag-box', true)
                         //.attr('pointer-events', 'none')
                         .attr('x',      ((d) => d.minX))
                         .attr('y',      ((d) => d.minY))
                         .attr('width',  ((d) => d.maxX - d.minX))
                         .attr('height', ((d) => d.maxY - d.minY));

        let dragStart = ['dragstart', () => this.dragStart()],
            drag      = ['drag',      () => this.drag()],
            dragEnd   = ['dragend',   () => this.dragEnd()];

        this.bBox.call(d3.behavior.drag().on(...dragStart).on(...drag).on(...dragEnd));

    }

    /**
     * @method dragStart
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @return {void}
     */
    dragStart(x = null, y = null) {

        console.log('Ah');

        this.start = {
            x: (x !== null) ? x : d3.event.sourceEvent.clientX - parseInt(this.bBox.attr('x')),
            y: (y !== null) ? y : d3.event.sourceEvent.clientY - parseInt(this.bBox.attr('y'))
        };

    }

    /**
     * @method drag
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @param {Number} [multipleOf=10]
     * @return {void}
     */
    drag(x = null, y = null, multipleOf = 10) {

        x = (x !== null) ? x : d3.event.sourceEvent.clientX;
        y = (y !== null) ? y : d3.event.sourceEvent.clientY;

        let mX = (x - this.start.x),
            mY = (y - this.start.y),
            eX = Math.ceil(mX / multipleOf) * multipleOf,
            eY = Math.ceil(mY / multipleOf) * multipleOf;

        //console.log(x, y);

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