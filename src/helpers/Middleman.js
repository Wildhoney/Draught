import symbols from './Symbols.js';

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
        this[symbols.DRAFT] = draft;
    }

    /**
     * @method getShapes
     * @return {Array}
     */
    getShapes() {
        return this[symbols.DRAFT].getShapes();
    }

}