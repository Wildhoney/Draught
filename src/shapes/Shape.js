import Symbols from '../helpers/Symbols.js';
import Movable from '../abilities/Movable.js';

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Shape {

    /**
     * @constructor
     * @return {Shape}
     */
    constructor() {

        this[Symbols.ABILITIES] = {
            movable: new Movable()
        };

    }

    /**
     * @method didAdd
     * @return {void}
     */
    didAdd() { }

    /**
     * @method didRemove
     * @return {void}
     */
    didRemove() { }

    /**
     * @method didSelect
     * @return {void}
     */
    didSelect() { }

    /**
     * @method didDeselect
     * @return {void}
     */
    didDeselect() { }

}