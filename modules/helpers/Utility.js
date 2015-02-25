/**
 * @module Blueprint
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default {

    /**
     * @method exception
     * @param {String} message
     * @throws {Exception}
     * @return {void}
     */
    exception(message) {
        throw `Blueprint: ${message}.`;
    },

    /**
     * @method assert
     * @param {Boolean} assertion
     * @param {String} message
     * @return {void}
     */
    assert(assertion, message) {

        if (!assertion) {
            this.exception(message);
        }

    }

}