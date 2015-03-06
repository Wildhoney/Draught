/**
 * @module Blueprint
 * @submodule Dispatcher
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Dispatcher {

    /**
     * @method constructor
     * @constructor
     */
    constructor() {
        this.events = [];
    }

    /**
     * @method send
     * @param {String} name
     * @param {Object} [properties={}]
     * @return {void}
     */
    send(name, properties = {}) {
        _.forEach(this.events[name], (callbackFn) => callbackFn(properties));
    }

    /**
     * @method addEventListener
     * @param {String} name
     * @param {Function} [fn=function noop() {}]
     * @return {void}
     */
    addEventListener(name, fn) {

        if (!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push(fn);

    }

}