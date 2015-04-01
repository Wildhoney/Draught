/**
 * @module Draft
 * @submodule Dispatcher
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Dispatcher {

    /**
     * @constructor
     * @return {Dispatcher}
     */
    constructor() {
        this.events = [];
    }

    /**
     * @method send
     * @param {String} eventName
     * @param {Object} properties
     * @return {void}
     */
    send(eventName, properties) {

        if (!this.events.hasOwnProperty(eventName)) {
            return;
        }

        this.events[eventName].forEach((fn) => fn(properties));

    }

    /**
     * @method on
     * @param {String} eventName
     * @param {Function} fn
     * @return {void}
     */
    on(eventName, fn) {

        if (!this.events.hasOwnProperty(eventName)) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(fn);

    }

}