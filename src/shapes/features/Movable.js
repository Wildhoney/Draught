import Feature  from './../Feature.js';
import Events   from './../../helpers/Events.js';
import registry from './../../helpers/Registry.js';

/**
 * @module Draft
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
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
     * @method addEvents
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    addEvents(dispatcher) {

        /**
         * @method invokeIfSelected
         * @param {Function} fn
         * @param {Object} model
         * @return {void}
         */
        let invokeIfSelected = (fn, model) => {

            if (this.shape.getInterface().isSelected()) {
                fn.apply(this, [model]);
            }

        };

        dispatcher.listen(Events.MOVE_LEFT,  (model) => invokeIfSelected(this.moveLeft, model));
        dispatcher.listen(Events.MOVE_RIGHT, (model) => invokeIfSelected(this.moveRight, model));
        dispatcher.listen(Events.MOVE_UP,    (model) => invokeIfSelected(this.moveUp, model));
        dispatcher.listen(Events.MOVE_DOWN,  (model) => invokeIfSelected(this.moveDown, model));

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

        if (!this.shape.getInterface().isSelected()) {
            return;
        }

        this.start = {
            x: !_.isNull(x) ? x : d3.event.sourceEvent.clientX - this.shape.getInterface().x(),
            y: !_.isNull(y) ? y : d3.event.sourceEvent.clientY - this.shape.getInterface().y()
        };

        this.dispatcher.send(Events.CREATE_BOUNDING_BOX);
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