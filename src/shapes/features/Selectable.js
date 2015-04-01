import Feature  from './../Feature.js';
import Events   from './../../helpers/Events.js';
import registry from './../../helpers/Registry.js';

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
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

            let isSelected = this.selected;

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                this.dispatcher.send(Events.DESELECT_ALL);

            }

            if (!isSelected || this.accessor.getCount() === 0) {

                // Simply select the element.
                this.select();
                return;

            }

            if (this.accessor.getCount() === 1) {
                this.dispatcher.send(Events.DESELECT_ALL);
            }

        });

    }

    /**
     * @method addEvents
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    addEvents(dispatcher) {
        dispatcher.listen(Events.SELECT_ALL,   () => this.select());
        dispatcher.listen(Events.DESELECT_ALL, () => this.deselect());
    }

    /**
     * @method select
     * @return {void}
     */
    select() {

        if (!this.selected) {
            this.shape.group.classed('selected', true);
            this.shape.getInterface().select();
            this.shape.getInterface().stroke('#333').strokeWidth(1);
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