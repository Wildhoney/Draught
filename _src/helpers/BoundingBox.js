/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
var boundingBox = (function() {

    "use strict";

    /**
     * @property bBox
     * @type {Object}
     */
    let bBox = {};

    /**
     * @property bBoxSelected
     * @type {Boolean}
     */
    let bBoxSelected = false;

    return {

        /**
         * @method create
         * @property {Array} selected
         * @property {Object} group
         * @return {void}
         */
        create(selected, group) {

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
            boundingBox.remove();

            bBox = group
                .append('rect')
                .datum(model)
                .classed('drag-box', true)
                //.attr('pointer-events', 'none')
                .attr('x',      ((d) => d.minX))
                .attr('y',      ((d) => d.minY))
                .attr('width',  ((d) => d.maxX - d.minX))
                .attr('height', ((d) => d.maxY - d.minY))
                .attr('fill', 'transparent')
                .attr('stroke', 'red')
                .attr('stroke-dasharray', [3, 3])
                .on('mouseup', () => {
                    bBoxSelected = true;
                });

            //function dragEnd() {
            //    console.log('END');
            //}
            //
            //let
            //    //dragStart = ['dragstart', () => dragStart()],
            //    //drag      = ['drag',      () => drag()],
            //    dragEnd   = ['dragend',   () => dragEnd()];
            //
            //bBox.call(d3.behavior.drag().on(...dragStart).on(...drag).on(...dragEnd));


        },

        /**
         * @method remove
         * @return {void}
         */
        remove() {

            if (_.isFunction(bBox.remove)) {
                bBox.remove();
            }

        },

        /**
         * @method setSelected
         * @param {Boolean} value
         * @return {void}
         */
        setSelected(value) {
            bBoxSelected = value;
        },

        /**
         * @method isSelected
         * @return {Boolean}
         */
        isSelected() {
            return bBoxSelected;
        }

    };

})();

export default boundingBox;