/**
 * @module Blueprint
 * @submodule Feature
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Feature {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Feature}
     */
    constructor(shape) {
        this.shape = shape;
    }

    /**
     * @method setDispatcher
     * @param {Object} dispatcher
     * @return {Feature}
     */
    setDispatcher(dispatcher) {

        this.dispatcher = dispatcher;

        if (_.isFunction(this.addEvents)) {
            this.addEvents(dispatcher);
        }

        return this;
    }

}