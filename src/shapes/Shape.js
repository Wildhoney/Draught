import Symbols from '../helpers/Symbols.js';
import Movable from '../abilities/Movable.js';
import Throw   from '../helpers/Throw.js';

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
     * @method getTag
     * @throws {Error} Will throw an exception if the `getTag` method hasn't been defined on the child object.
     * @return {void}
     */
    getTag() {
        new Throw('Tag name must be defined for a shape using the `getTag` method');
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