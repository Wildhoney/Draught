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

        element.on('mousedown', () => {

            if (this.clickDisabled) {
                this.clickDisabled = false;
                return;
            }

            if (keyboard.multiSelect) {
                facade.selectInvert();
                return;
            }

            this.shape.accessor.deselectAll();
            facade.select();

        });

        shape.element.call(d3.behavior.drag().on('drag', () => {
            this.clickDisabled = true;
            facade.shape.accessor.dragBBox();
        }));

    }

    /**
     * @method select
     * @return {void}
     */
    select() {
        this.shape.getFacade().selected = true;
        this.shape.getFacade().fill('green');
        this.shape.accessor.createBBox();
    }

    /**
     * @method deselect
     * @return {void}
     */
    deselect() {
        this.shape.getFacade().selected = false;
        this.shape.getFacade().fill('lightgrey');
        this.shape.accessor.createBBox();
    }

}