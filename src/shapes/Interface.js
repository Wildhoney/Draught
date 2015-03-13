import Events  from './../helpers/Events.js';
import utility from './../helpers/Utility.js';

/**
 * @module Blueprint
 * @submodule Interface
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */
export default class Interface {

    /**
     * @method constructor
     * @param {String} [label='']
     * @return {Interface}
     */
    constructor(label = '') {
        this.label    = label;
        this.selected = false;
    }

    /**
     * @method remove
     * @return {void}
     */
    remove() {

        this.dispatcher.send(Events.REMOVE, {
            'interface': this
        });

    }

    /**
     * @method select
     * @return {Interface}
     */
    select() {
        this.selected = true;
        return this;
    }

    /**
     * @method deselect
     * @return {Interface}
     */
    deselect() {
        this.selected = false;
        return this;
    }

    /**
     * @method isSelected
     * @return {Boolean}
     */
    isSelected() {
        return this.selected;
    }

    /**
     * @method x
     * @param {Number} [value=undefined]
     * @return {Interface|Number}
     */
    x(value) {
        return this.attr('x', value);
    }

    /**
     * @method y
     * @param {Number} [value=undefined]
     * @return {Interface|Number}
     */
    y(value) {
        return this.attr('y', value);
    }

    /**
     * @method transform
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @return {Interface}
     */
    transform(x = null, y = null) {

        if (!_.isNull(x)) {
            this.x(x);
        }

        if (!_.isNull(y)) {
            this.y(y);
        }

        return this;

    }

    /**
     * @method opacity
     * @param {Number} value
     * @return {Interface|Number}
     */
    opacity(value) {
        return this.attr('opacity', value);
    }

    /**
     * @method stroke
     * @param {String} value
     * @return {Interface|String}
     */
    stroke(value) {
        return this.attr('stroke', value);
    }

    /**
     * @method strokeWidth
     * @param {Number} value
     * @return {Interface|Number}
     */
    strokeWidth(value) {
        return this.attr('stroke-width', value);
    }

    /**
     * @method strokeDashArray
     * @param {Array} value
     * @return {Interface|Number}
     */
    strokeDashArray(value) {

        if (!_.isUndefined(value)) {
            utility.assert(_.isArray(value), 'Method `strokeDashArray` expects an array value');
            return this.attr('stroke-dasharray', value.join(','));
        }

        return this.attr('stroke-dasharray');

    }

    /**
     * @method z
     * @param {Number} [value=undefined]
     * @return {Interface}
     */
    z(value) {
        return this.attr('z', value);
    }

    /**
     * @method boundingBox
     * @return {Object}
     */
    boundingBox() {

        let result = {};

        this.dispatcher.send(Events.BOUNDING_BOX, {}, (response) => {
            result = response;
        });

        return result;

    }

    /**
     * @method bringToFront
     * @return {Interface|Number}
     */
    bringToFront() {
        return this.attr('z', Infinity);
    }

    /**
     * @method sendToBack
     * @return {Interface|Number}
     */
    sendToBack() {
        return this.attr('z', -Infinity);
    }

    /**
     * @method sendBackwards
     * @return {Interface|Number}
     */
    sendBackwards() {
        return this.attr('z', (this.getAttr().z - 1));
    }

    /**
     * @method bringForwards
     * @return {Interface|Number}
     */
    bringForwards() {
        return this.attr('z', (this.getAttr().z + 1));
    }

    /**
     * @method width
     * @param {Number} [value=undefined]
     * @return {Interface|Number}
     */
    width(value) {
        return this.attr('width', value);
    }

    /**
     * @method height
     * @param {Number} [value=undefined]
     * @return {Interface|Number}
     */
    height(value) {
        return this.attr('height', value);
    }

    /**
     * @property attr
     * @param {String} property
     * @param {*} [value=null]
     * @return {*|void}
     */
    attr(property, value = null) {

        if (_.isNull(value)) {
            return this.getAttr()[property];
        }

        let model       = {};
        model[property] = value;
        return this.setAttr(model);

    }

    /**
     * @method setAttr
     * @param {Object} attributes
     * @return {Interface}
     */
    setAttr(attributes = {}) {

        this.dispatcher.send(Events.ATTRIBUTE_SET, {
            attributes: utility.kebabifyKeys(attributes)
        });

        return this;

    }

    /**
     * @method getAttr
     * @return {Object}
     */
    getAttr() {

        let result = {};

        this.dispatcher.send(Events.ATTRIBUTE_GET_ALL, {}, (response) => {
            result = response;
        });

        return result;

    }

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    setDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * @method toString
     * @return {String}
     */
    toString() {

        if (this.label) {
            return `[object Interface: ${this.label}]`;
        }

        return `[object Interface]`;

    }

}