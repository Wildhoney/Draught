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
     * @method x
     * @param {Number} value
     * @return {Interface}
     */
    x(value) {
        return this.attr({ x: value });
    }

    /**
     * @method y
     * @param {Number} value
     * @return {Interface}
     */
    y(value) {
        return this.attr({ y: value });
    }

    /**
     * @method z
     * @param {Number} value
     * @return {Interface}
     */
    z(value) {
        return this.attr({ z: value });
    }

    /**
     * @method width
     * @param {Number} value
     * @return {Interface}
     */
    width(value) {
        return this.attr({ width: value });
    }

    /**
     * @method height
     * @param {Number} value
     * @return {Interface}
     */
    height(value) {
        return this.attr({ height: value });
    }

    /**
     * @method attr
     * @param {Object} attributes
     * @return {Interface}
     */
    attr(attributes = {}) {
        return this.applyAttributes(utility.camelifyKeys(attributes));
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