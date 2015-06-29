import Symbols        from '../helpers/Symbols.js';
import Movable        from '../abilities/Movable.js';
import Throw          from '../helpers/Throw.js';
import {objectAssign} from '../helpers/Polyfills.js';

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Shape {

    /**
     * @constructor
     * @param {Object} [attributes={}]
     * @return {Shape}
     */
    constructor(attributes = {}) {

        const defaultAttributes  = (typeof this.getDefaultAttributes === 'function') ? this.getDefaultAttributes() : {};
        this[Symbols.ATTRIBUTES] = objectAssign(defaultAttributes, attributes);

        this[Symbols.ABILITIES] = {
            movable: new Movable()
        };

    }

    /**
     * @method getTag
     * @throws {Error} Will throw an exception if the `getTag` method hasn't been defined on the child object.
     * @return {void}
     */
    getTag() {
        new Throw('Tag name must be defined for a shape using the `getTag` method');
    }

    /**
     * @method attribute
     * @param {String} name
     * @param {String} [value=undefined]
     * @return {Shape|*}
     */
    attribute(name, value) {

        if (typeof value === 'undefined') {
            return this.getAttribute(name);
        }

        this.setAttribute(name, value);
        return this;

    }

    /**
     * @method getAttribute
     * @param {String} name
     * @return {String}
     */
    getAttribute(name) {
        return this[Symbols.ATTRIBUTES][name];
    }

    /**
     * @method setAttribute
     * @param {String} name
     * @param {*} value
     * @return {void}
     */
    setAttribute(name, value) {
        this[Symbols.ATTRIBUTES][name] = value;
    }

    /**
     * @method didAdd
     * @return {void}
     */
    didAdd() { }

    /**
     * @method didRemove
     * @return {void}
     */
    didRemove() { }

    /**
     * @method didSelect
     * @return {void}
     */
    didSelect() { }

    /**
     * @method didDeselect
     * @return {void}
     */
    didDeselect() { }

}