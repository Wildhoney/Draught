import Feature  from './../Feature.js';
import Events   from './../../helpers/Events.js';
import registry from './../../helpers/Registry.js';

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

        super(shape);

        shape.element.on('click', () => {

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                this.dispatcher.send(Events.DESELECT);

            }

            if (!this.original) {
                this.original = shape.getInterface().fill();
                shape.getInterface().fill('grey');
            }

        });

    }

    /**
     * @method cancel
     * @return {void}
     */
    cancel() {

        if (this.original) {
            this.shape.getInterface().fill(this.original);
            this.original = null;
        }

    }

}