import Symbols        from '../helpers/Symbols.js';
import Selectable     from '../abilities/Selectable.js';
import Throw          from '../helpers/Throw.js';
import {objectAssign} from '../helpers/Polyfills.js';
import setAttribute   from '../helpers/Attributes.js';

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

        const abilities  = {
            selectable: new Selectable()
        };

        Object.keys(abilities).forEach((key) => {

            // Add the shape object into each ability instance.
            abilities[key][Symbols.SHAPE] = this;

        });

        this[Symbols.ATTRIBUTES] = attributes;
        this[Symbols.ABILITIES]  = abilities;

    }

    /**
     * @method tagName
     * @throws {Error} Will throw an exception if the `tagName` method hasn't been defined on the child object.
     * @return {void}
     */
    tagName() {
        new Throw('Tag name must be defined for a shape using the `tagName` method');
    }

    /**
     * @method isSelected
     * @return {Boolean}
     */
    isSelected() {
        return this[Symbols.IS_SELECTED];
    }

    /**
     * @method attr
     * @param {String} name
     * @param {String} [value=undefined]
     * @return {Shape|*}
     */
    attr(name, value) {

        if (typeof value === 'undefined') {
            return this[Symbols.ELEMENT].datum()[name];
        }

        this[Symbols.ELEMENT].datum()[name] = value;
        setAttribute(this[Symbols.ELEMENT], name, value);

        return this;

    }

    /**
     * @method didAdd
     * @return {void}
     */
    didAdd() {

        const svg        = this[Symbols.MIDDLEMAN].getD3();
        const attributes = objectAssign(this.defaultAttributes(), this[Symbols.ATTRIBUTES]);

        this[Symbols.ELEMENT] = svg.append(this.tagName()).datum({});

        // Assign each attribute from the default attributes defined on the shape, as well as those defined
        // by the user when instantiating the shape.
        Object.keys(attributes).forEach((key) => this.attr(key, attributes[key]));

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
    didSelect() {
        this[Symbols.IS_SELECTED] = true;
    }

    /**
     * @method didDeselect
     * @return {void}
     */
    didDeselect() {
        this[Symbols.IS_SELECTED] = false;
    }

    /**
     * @method defaultAttributes
     * @return {Object}
     */
    defaultAttributes() {
        return {};
    }

}