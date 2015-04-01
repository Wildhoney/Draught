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
     * @return {void}
     */
    send(eventName) {

        if (!this.events.hasOwnProperty(eventName)) {
            return;
        }

        this.events[eventName].forEach((fn) => fn());

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