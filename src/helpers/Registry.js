/**
 * @module object
 * @submodule Registry
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */
export default class Registry {

    /**
     * @method constructor
     * @return {Registry}
     * @constructor
     */
    constructor() {
        this.properties = {};
    }

    /**
     * @method set
     * @param {String} property
     * @param {*} value
     * @return {void}
     */
    set(property, value) {
        this.properties[property] = value;
    }

    /**
     * @method increment
     * @param {String} property
     * @return {Number}
     */
    increment(property) {
        this.set(property, parseInt(this.get(property)) + 1);
        return this.properties[property];
    }

    /**
     * @method decrement
     * @param {String} property
     * @return {Number}
     */
    decrement(property) {
        this.set(property, parseInt(this.get(property)) - 1);
        return this.properties[property];
    }

    /**
     * @method get
     * @param {String} property
     * @return {*}
     */
    get(property) {
        return this.properties[property];
    }

}