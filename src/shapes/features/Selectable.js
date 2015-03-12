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
        this.selected = false;

        shape.element.on('mousedown', () => {

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                this.dispatcher.send(Events.SELECTABLE.DESELECT, {
                    shape: shape.getInterface()
                });

            }

            if (!this.selected) {
                this.dispatcher.send(Events.SELECTABLE.SELECT, {
                    shape: shape.getInterface()
                });
            }

        });

    }

    /**
     * @method select
     * @return {void}
     */
    select() {

        if (!this.selected) {
            this.shape.group.classed('selected', true);
            this.shape.getInterface().select();
            this.shape.getInterface().stroke('black').strokeWidth(1).strokeDashArray([3, 3]);
            this.selected = true;
        }

    }

    /**
     * @method deselect
     * @return {void}
     */
    deselect() {

        if (this.selected) {
            this.shape.group.classed('selected', false);
            this.shape.getInterface().deselect();
            this.shape.getInterface().stroke('none');
            this.selected = false;
        }

    }

}