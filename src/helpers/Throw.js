/**
 * @module Draft
 * @submodule Throw
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Throw {

    /**
     * @constructor
     * @param {String} message
     * @return {Facade}
     */
    constructor(message) {
        throw new Error(`Draft.js: ${message}.`);
    }

}