import Interface from './types/interfaces/Rectangle.js';

/**
 * @module Blueprint
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Shape {

    /**
     * @method constructor
     * @return {Shape}
     */
    constructor() {
        //this.interface =
    }

    /**
     * @method getIdent
     * @return {String}
     */
    getIdent() {
        return this.getTag();
    }

    /**
     * @method setEmitter
     * @param {Object} emitter
     * @return {void}
     */
    setEmitter(emitter) {
        this.emitter = emitter;
    }

    /**
     * @method setOptions
     * @param {Object} options
     * @return {void}
     */
    setOptions(options) {
        this.options = options;
    }

    /**
     * @method getInterface
     * @return {Shape}
     */
    getInterface() {
        return this.interface;
    }

}