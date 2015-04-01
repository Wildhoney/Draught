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
        this.shape = shape;
    }

    /**
     * @method select
     * @return {void}
     */
    select() {
        console.log('Here');
        //console.log(this.shape);
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