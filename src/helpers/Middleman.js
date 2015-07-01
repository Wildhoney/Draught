import Symbols     from './Symbols.js';
import KeyBindings from './KeyBindings.js';

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

        this[Symbols.DRAFT]   = draft;
        this[Symbols.KEY_MAP] = {};

        new KeyBindings(this);

    }

    /**
     * @method getD3
     * @return {Object}
     */
    getD3() {
        return this[Symbols.DRAFT][Symbols.SVG];
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
     * @param {Array} [shapes]
     */
    select(shapes) {
        this[Symbols.DRAFT].selectShapes(shapes);
    }

    /**
     * @method deselect
     * @param {Array} [shapes]
     */
    deselect(shapes) {
        this[Symbols.DRAFT].deselectShapes(shapes);
    }

    /**
     * @method all
     * @return {Array}
     */
    all() {
        return this[Symbols.DRAFT].all();
    }

}