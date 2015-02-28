/**
 * @property eventCollection
 * @type {Array}
 */
var eventCollection = [];

/**
 * @module Blueprint
 * @submodule Emitter
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default {

    /**
     * @method dispatchEvent
     * @param {String} name
     * @param {Object} [properties={}]
     * @return {void}
     */
    dispatchEvent(name, properties = {}) {
        _.forEach(eventCollection[name], (callbackFn) => callbackFn(properties));
    },

    /**
     * @method addEventListener
     * @param {String} name
     * @param {Function} callbackFn
     * @return {void}
     */
    addEventListener(name, callbackFn) {

        if (!eventCollection[name]) {
            eventCollection[name] = [];
        }

        eventCollection[name].push(callbackFn);

    }

}