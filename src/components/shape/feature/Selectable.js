/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Selectable {

    /**
     * @constructor
     * @param {Shape} shape
     * @return {Selectable}
     */
    constructor(shape) {

        this.shape   = shape;
        let element  = shape.element,
            keyboard = shape.accessor.keyboard,
            facade   = shape.getFacade();

        element.on('click', () => {

            if (keyboard.multiSelect) {
                facade.selectInvert();
                return;
            }

            this.shape.accessor.deselectAll();
            facade.select();

        });

    }

    /**
     * @method select
     * @return {void}
     */
    select() {
        this.shape.selected = true;
    }

    /**
     * @method deselect
     * @return {void}
     */
    deselect() {
        this.shape.selected = false;
    }

}