import Ability from './Ability';

/**
 * @module Draft
 * @submodule Resizable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Resizable extends Ability {

    /**
     * @constructor
     * @return {Resizable}
     */
    constructor() {
        super();
        this.RADIUS = 22;
        this.edges  = {};
    }

    /**
     * @method didSelect
     * @return {void}
     */
    didSelect() {
        this.reattachHandles();
    }

    /**
     * @method didDeselect
     * @return {void}
     */
    didDeselect() {
        this.detachHandles();
    }

    /**
     * @method reattachHandles
     * @return {void}
     */
    reattachHandles() {
        this.detachHandles();
        this.attachHandles();
    }

    /**
     * @method attachHandles
     * @return {void}
     */
    attachHandles() {

        const shape  = this.shape();
        const layer  = this.middleman().layers().markers;
        this.handles = layer.append('g').attr('class', 'resize-handles');

        const x      = shape.attr('x');
        const y      = shape.attr('y');
        const width  = shape.attr('width');
        const height = shape.attr('height');

        const edgeMap = {
            topLeft:      { x,                  y },
            topMiddle:    { x: x + (width / 2), y },
            topRight:     { x: x + width,       y },
            leftMiddle:   { x: x,               y: y + (height / 2) },
            bottomLeft:   { x: x,               y: y + height },
            bottomMiddle: { x: x + (width / 2), y: y + height },
            bottomRight:  { x: x + width,       y: y + height },
            rightMiddle:  { x: x + width,       y: y + (height / 2) }
        };

        Object.keys(edgeMap).forEach((key) => {

            const edge          = edgeMap[key];
            const dragBehaviour = this.drag(shape, key);

            this.edges[key] = this.handles.append('image')
                                          .attr('xlink:href', 'images/handle-main.png')
                                          .attr('x', edge.x - (this.RADIUS / 2))
                                          .attr('y', edge.y - (this.RADIUS / 2))
                                          .attr('stroke', 'red')
                                          .attr('stroke-width', 3)
                                          .attr('width', this.RADIUS)
                                          .attr('height', this.RADIUS)
                                          .on('click', () => d3.event.stopPropagation())
                                          .call(d3.behavior.drag()
                                              .on('dragstart', dragBehaviour.start)
                                              .on('drag', dragBehaviour.drag)
                                              .on('dragend', dragBehaviour.end));

        });

    }

    /**
     * @method detachHandles
     * @return {void}
     */
    detachHandles() {
        
        if (this.handles) {
            this.handles.remove();
        }
        
    }

    /**
     * @method popUnique
     * @param {Array} items
     * @return {Number}
     */
    popUnique(items) {

        const counts = {};

        for (let index = 0; index < items.length; index++) {
            const num   = items[index];
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }

        const unique = Object.keys(counts).filter((key) => {
            return counts[key] === 1;
        });

        return unique.length ? Number(unique[0]) : items[0];

    }

    /**
     * @method shiftHandles
     * @param {String} currentKey
     * @return {void}
     */
    shiftHandles(currentKey) {

        const coords = [];

        Object.keys(this.edges).forEach((key) => {

            // Package all of the coordinates up into a more simple `coords` object for brevity.
            const edge  = this.edges[key];
            coords[key] = { x: Number(edge.attr('x')), y: Number(edge.attr('y')) };

        });

        /**
         * @property cornerPositions
         * @type {{top: Number, right: Number, bottom: Number, left: Number}}
         */
        const cornerPositions = {

            // Find the coordinate that doesn't match the others, which means that is the coordinate that is currently
            // being modified without any conditional statements.
            top:    this.popUnique([coords.topLeft.y,    coords.topMiddle.y,    coords.topRight.y]),
            right:  this.popUnique([coords.topRight.x,   coords.rightMiddle.x,  coords.bottomRight.x]),
            bottom: this.popUnique([coords.bottomLeft.y, coords.bottomMiddle.y, coords.bottomRight.y]),
            left:   this.popUnique([coords.topLeft.x,    coords.leftMiddle.x,   coords.bottomLeft.x])

        };

        /**
         * @constant middlePositions
         * @type {{topMiddle: number, rightMiddle: number, bottomMiddle: number, leftMiddle: number}}
         */
        const middlePositions = {

            // All of these middle positions are relative to the corner positions above.
            topMiddle:    (cornerPositions.left + cornerPositions.right) / 2,
            rightMiddle:  (cornerPositions.top + cornerPositions.bottom) / 2,
            bottomMiddle: (cornerPositions.left + cornerPositions.right) / 2,
            leftMiddle:   (cornerPositions.top + cornerPositions.bottom) / 2

        };

        ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].forEach((key) => {

            if (currentKey !== key) {

                // First we need to reposition all of the corner handles, so that the handles in the middle can be
                // positioned relative to these.
                const parts = key.split(/(?=[A-Z])/).map(key => key.toLowerCase());
                this.edges[key].attr('y', cornerPositions[parts[0]]);
                this.edges[key].attr('x', cornerPositions[parts[1]]);

            }

        });

        ['topMiddle', 'bottomMiddle'].forEach((key) => {

            if (currentKey !== key) {

                // Lastly we modify the position handles to be relative to the aforementioned corner handles.
                const parts = key.split(/(?=[A-Z])/).map(key => key.toLowerCase());
                this.edges[key].attr('y', cornerPositions[parts[0]]);
                this.edges[key].attr('x', middlePositions[key]);

            }

        });

        ['leftMiddle', 'rightMiddle'].forEach((key) => {

            if (currentKey !== key) {

                // Lastly we modify the position handles to be relative to the aforementioned corner handles.
                const parts = key.split(/(?=[A-Z])/).map(key => key.toLowerCase());
                this.edges[key].attr('y', middlePositions[key]);
                this.edges[key].attr('x', cornerPositions[parts[0]]);

            }

        });

    }

    /**
     * @method drag
     * @param {Shape} shape
     * @param {String} key
     * @return {{start: Function, drag: Function, end: Function}}
     */
    drag(shape, key) {

        const middleman        = this.middleman();
        const handles          = this.handles;
        const radius           = this.RADIUS;
        const reattachHandles  = this.reattachHandles.bind(this);
        const shiftHandles = this.shiftHandles.bind(this);
        let startX, startY, ratio;

        return {

            /**
             * @method start
             * @return {{x: Number, y: Number}}
             */
            start: function start() {

                middleman.preventDeselect(true);

                const handle = d3.select(this).classed('dragging', true);
                ratio        = shape.attr('width') / shape.attr('height');

                startX = d3.event.sourceEvent.pageX - parseInt(handle.attr('x'));
                startY = d3.event.sourceEvent.pageY - parseInt(handle.attr('y'));

                return { x: startX, y: startY };

            },

            /**
             * @method drag
             * @return {{x: Number, y: Number}}
             */
            drag: function drag() {

                const options = middleman.options();
                const handle  = d3.select(this);
                const moveX   = (d3.event.sourceEvent.pageX - startX);
                const moveY   = (d3.event.sourceEvent.pageY - startY);
                const finalX  = Math.ceil(moveX / options.gridSize) * options.gridSize;
                const finalY  = Math.ceil(moveY / options.gridSize) * options.gridSize;
                const bBox    = handles.node().getBBox();

                handle.attr('x', finalX).attr('y', finalY);
                shiftHandles(key);

                shape.attr('x', bBox.x + (radius / 2)).attr('y', bBox.y + (radius / 2))
                     .attr('height', bBox.height - radius).attr('width', bBox.width - radius);

                return { x: finalX, y: finalY };

            },

            /**
             * @method end
             * @return {void}
             */
            end: function end() {
                middleman.select([shape]);
                reattachHandles();
            }

        };

    }

}