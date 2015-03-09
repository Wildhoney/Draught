import Feature from './../Feature.js';

/**
 * @module Blueprint
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Selectable extends Feature {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Selectable}
     * @constructor
     */
    constructor(shape) {

        super.constructor(shape);

        shape.element.on('click', () => {
            this.original = shape.getInterface().fill();
            shape.getInterface().fill('red');
        });

    }

    /**
     * @method cancel
     * @return {void}
     */
    cancel() {
        this.shape.getInterface().fill(this.original);
    }

}