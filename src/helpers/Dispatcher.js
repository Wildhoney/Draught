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
     * @param {Function} [fn=() => {}]
     * @return {void}
     */
    send(name, properties = {}, fn = null) {

        _.forEach(this.events[name], (callbackFn) => {

            let result = callbackFn(properties);

            if (_.isFunction(fn)) {

                // Event dispatcher's two-way communication via events.
                fn(result);

            }

        });

    }

    /**
     * @method listen
     * @param {String} name
     * @param {Function} fn
     * @return {Boolean}
     */
    listen(name, fn) {

        if (!_.isFunction(fn)) {
            return false;
        }

        if (!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push(fn);
        return true;

    }

}