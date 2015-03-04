/**
 * @class Dispatcher
 */
export class Dispatcher {

    /**
     * @property events
     * @type {Object}
     */
    events: Object = {};

    /**
     * @method dispatchEvent
     * @param {String} name
     * @param {Object} [properties={}]
     * @return {void}
     */
    dispatchEvent(name: string, properties: Object = {}): void {
        _.forEach(this.events[name], (callbackFn) => callbackFn(properties));
    }

    /**
     * @method addEventListener
     * @param {String} name
     * @param {Function} [fn=function noop() {}]
     * @return {void}
     */
    addEventListener(name: string, fn: Function = function noop() {}): void {

        if (!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push(fn);

    }

}