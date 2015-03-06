import Events  from './../helpers/Events.js';
import utility from './../helpers/Utility.js';

/**
 * @module object
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
        this.label = label;
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
     * @method x
     * @param {Number} value
     * @return {Interface}
     */
    x(value) {
        return this.setAttr({ x: value });
    }

    /**
     * @method y
     * @param {Number} value
     * @return {Interface}
     */
    y(value) {
        return this.setAttr({ y: value });
    }

    /**
     * @method z
     * @param {Number} value
     * @return {Interface}
     */
    z(value) {
        return this.setAttr({ z: value });
    }

    /**
     * @method width
     * @param {Number} value
     * @return {Interface}
     */
    width(value) {
        return this.setAttr({ width: value });
    }

    /**
     * @method height
     * @param {Number} value
     * @return {Interface}
     */
    height(value) {
        return this.setAttr({ height: value });
    }

    /**
     * @method setAttr
     * @param {Object} attributes
     * @return {Interface}
     */
    setAttr(attributes = {}) {
        return this.set(utility.kebabifyKeys(attributes));
    }

    /**
     * @method getAttr
     * @return {Object}
     */
    getAttr() {

        var result = {};

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