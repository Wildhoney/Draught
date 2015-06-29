import Symbols from './Symbols.js';

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
     * @return {Facade}
     */
    constructor(draft) {
        this[Symbols.DRAFT] = draft;
    }

    /**
     * @method getD3
     * @return {Object}
     */
    getD3() {
        return this[Symbols.DRAFT][Symbols.SVG];
    }

    /**
     * @method getShapes
     * @return {Array}
     */
    getShapes() {
        return this[Symbols.DRAFT].getShapes();
    }

}