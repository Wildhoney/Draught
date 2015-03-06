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
        return this;
    }

    /**
     * @method y
     * @param {Number} value
     * @return {Interface}
     */
    y(value) {
        return this;
    }

    /**
     * @method attribute
     * @param {String} name
     * @param {*} value
     * @return {*}
     */
    attribute(name, value) {
        return this;
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