import symbols from 'Symbols.js';

/**
 * @module Draft
 * @submodule Facade
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Facade {

    /**
     * @constructor
     * @param {Draft} draft
     * @return {Facade}
     */
    constructor(draft) {
        this[symbols.draft] = draft;
    }

    /**
     * @method getShapes
     * @return {Array}
     */
    getShapes() {
        return this[symbols.draft].getShapes();
    }

}