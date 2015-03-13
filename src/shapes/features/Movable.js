import Feature  from './../Feature.js';
//import utility  from './../../helpers/Utility.js';
import Events   from './../../helpers/Events.js';
import registry from './../../helpers/Registry.js';

/**
 * @module Blueprint
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Movable extends Feature {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Movable}
     * @constructor
     */
    constructor(shape) {

        super(shape);

        /**
         * @property start
         * @type {Object}
         */
        this.start = { x: 0, y: 0 };

        /**
         * Bounding box of the element(s) that are currently being dragged.
         *
         * @property boundingBox
         * @type {{width: number, height: number}}
         */
        this.boundingBox = { width: 0, height: 0 };

        let dragStart = ['dragstart', () => this.dragStart()],
            drag      = ['drag',      () => this.drag()],
            dragEnd   = ['dragend',   () => this.dragEnd()];

        shape.element.call(d3.behavior.drag().on(...dragStart).on(...drag).on(...dragEnd));

    }

    /**
     * @method selected
     * @param {Array} shapes
     * @return {Array|void}
     */
    selected(shapes) {

        var model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
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
        compute(shapes.map((shape) => shape.boundingBox()));

        console.log('Here');

        d3.select(document.querySelector('svg'))
          .append('rect')
          .datum(model)
          .classed('dragBox', true)
          .attr('pointer-events', 'none')
          .attr('x',      ((d) => d.minX))
          .attr('y',      ((d) => d.minY))
          .attr('width',  ((d) => d.maxX - d.minX))
          .attr('height', ((d) => d.maxY - d.minY))
          .attr('fill', 'transparent')
          .attr('stroke', 'black')
          .attr('stroke-dasharray', [3,3]);

    }

    /**
     * @method moveLeft
     * @param {Object} model
     * @return {void}
     */
    moveLeft(model) {
        this.shape.getInterface().x(this.shape.getInterface().x() - model.by);
    }

    /**
     * @method moveRight
     * @param {Object} model
     * @return {void}
     */
    moveRight(model) {
        this.shape.getInterface().x(this.shape.getInterface().x() + model.by);
    }

    /**
     * @method moveUp
     * @param {Object} model
     * @return {void}
     */
    moveUp(model) {
        this.shape.getInterface().y(this.shape.getInterface().y() - model.by);
    }

    /**
     * @method moveDown
     * @param {Object} model
     * @return {void}
     */
    moveDown(model) {
        this.shape.getInterface().y(this.shape.getInterface().y() + model.by);
    }

    /**
     * @method dragStart
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @return {void}
     */
    dragStart(x = null, y = null) {

        this.start = {
            x: !_.isNull(x) ? x : d3.event.sourceEvent.clientX - this.shape.getInterface().x(),
            y: !_.isNull(y) ? y : d3.event.sourceEvent.clientY - this.shape.getInterface().y()
        };

        this.dispatcher.send(Events.SELECTED_GET);
        this.shape.group.classed('dragging', true);

    }

    /**
     * @method drag
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @param {Number} [multipleOf=registry.snapGrid]
     * @return {void}
     */
    drag(x = null, y = null, multipleOf = registry.snapGrid) {

        x = !_.isNull(x) ? x : d3.event.sourceEvent.clientX;
        y = !_.isNull(y) ? y : d3.event.sourceEvent.clientY;

        let mX = (x - this.start.x),
            mY = (y - this.start.y),
            eX = Math.ceil(mX / multipleOf) * multipleOf,
            eY = Math.ceil(mY / multipleOf) * multipleOf;

        this.shape.getInterface().x(eX);
        this.shape.getInterface().y(eY);

    }

    /**
     * @method dragEnd
     * @return {void}
     */
    dragEnd() {
        this.shape.group.classed('dragging', false);
    }

}