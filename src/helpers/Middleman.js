import Symbols     from './Symbols.js';
import KeyBindings from './KeyBindings.js';
import invocator   from './Invocator.js';

/**
 * @module Draft
 * @submodule Middleman
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Middleman {

    /**
     * @constructor
     * @param {Draft} draft
     * @return {Middleman}
     */
    constructor(draft) {

        this[Symbols.DRAFT]        = draft;
        this[Symbols.KEY_MAP]      = {};
        this[Symbols.CAN_DESELECT] = false;

        new KeyBindings(this);

    }

    /**
     * @method d3
     * @return {Object}
     */
    d3() {
        return this[Symbols.DRAFT][Symbols.SVG];
    }

    /**
     * @method layers
     * @return {Object}
     */
    layers() {
        return this[Symbols.DRAFT][Symbols.LAYERS];
    }

    /**
     * @method keyMap
     * @return {Object}
     */
    keyMap() {
        return this[Symbols.KEY_MAP];
    }

    /**
     * @method select
     * @param {Object} options
     * @return {void}
     */
    select(options) {
        invocator.includeExclude(this[Symbols.DRAFT], this[Symbols.DRAFT].select, options);
    }

    /**
     * @method deselect
     * @param {Object} options
     * @return {void}
     */
    deselect(options) {
        invocator.includeExclude(this[Symbols.DRAFT], this[Symbols.DRAFT].deselect, options);
    }

    /**
     * @method all
     * @return {Array}
     */
    all() {
        return this[Symbols.DRAFT].all();
    }

    /**
     * @method fromElement
     * @param {HTMLElement} element
     * @return {Shape}
     */
    fromElement(element) {

        return this.all().filter((shape) => {
            return element === shape[Symbols.ELEMENT].node();
        })[0];

    }

    /**
     * @method preventDeselect
     * @param {Boolean} [value=undefined]
     */
    preventDeselect(value) {

        if (typeof value === 'undefined') {
            return this[Symbols.CAN_DESELECT];
        }

        this[Symbols.CAN_DESELECT] = value;

    }

}