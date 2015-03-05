import Interface from './../helpers/Interface.js';
import Events    from './../helpers/Events.js';

/**
 * @module Blueprint
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export class Shape {

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    setDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * @method getInterface
     * @return {void}
     */
    getInterface() {

        var facade = new Interface();

    }

    /**
     * @method dispatchAttributeEvent
     * @param {Object} properties = {}
     * @return {void}
     */
    dispatchAttributeEvent(properties = {}) {
        properties.element = this;
        this.dispatcher.send(Events.ATTRIBUTE, properties);
    }

}