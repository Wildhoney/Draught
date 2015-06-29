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

        this[Symbols.ATTRIBUTES] = attributes;
        this[Symbols.ABILITIES]  = {
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
            return this[Symbols.ELEMENT].datum()[name];
        }

        this[Symbols.ELEMENT].datum()[name] = value;
        this[Symbols.ELEMENT].attr(name, value);
        return this;

    }

    /**
     * @method didAdd
     * @return {void}
     */
    didAdd() {

        const svg               = this[Symbols.MIDDLEMAN].getD3();
        const defaultAttributes = (typeof this.getDefaultAttributes === 'function') ? this.getDefaultAttributes() : {};
        const attributes        = objectAssign(defaultAttributes, this[Symbols.ATTRIBUTES]);

        this[Symbols.ELEMENT]   = svg.append(this.getTag()).datum({});

        // Assign each attribute from the default attributes defined on the shape, as well as those defined
        // by the user when instantiating the shape.
        Object.keys(attributes).forEach((key) => this.attribute(key, attributes[key]));

    }

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