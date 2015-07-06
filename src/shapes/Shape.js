import Symbols        from '../helpers/Symbols';
import Throw          from '../helpers/Throw';
import {objectAssign} from '../helpers/Polyfills';
import setAttribute   from '../helpers/Attributes';
import invocator      from '../helpers/Invocator';
import Selectable     from '../abilities/Selectable';

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
     * @param {*} [value=undefined]
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

        const layer           = this[Symbols.MIDDLEMAN].layers().shapes;
        const attributes      = objectAssign(this.defaultAttributes(), this[Symbols.ATTRIBUTES]);
        this[Symbols.GROUP]   = layer.append('g');
        this[Symbols.ELEMENT] = this[Symbols.GROUP].append(this.tagName()).datum({});

        // Assign each attribute from the default attributes defined on the shape, as well as those defined
        // by the user when instantiating the shape.
        Object.keys(attributes).forEach((key) => this.attr(key, attributes[key]));

        const abilities  = {
            selectable: new Selectable()
        };

        Object.keys(abilities).forEach((key) => {

            // Add the shape object into each ability instance, and invoke the `didAdd` method.
            const ability = abilities[key];
            ability[Symbols.SHAPE] = this;
            invocator.did('add', ability);

        });

        this[Symbols.ABILITIES] = abilities;

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
     * @method boundingBox
     * @return {Object}
     */
    boundingBox() {

        const hasBBox = typeof this[Symbols.GROUP].node().getBBox === 'function';

        return hasBBox ? this[Symbols.GROUP].node().getBBox() : {
            height: this.attr('height'),
            width:  this.attr('width'),
            x:      this.attr('x'),
            y:      this.attr('y')
        };

    }

    /**
     * @method defaultAttributes
     * @return {Object}
     */
    defaultAttributes() {
        return {};
    }

}