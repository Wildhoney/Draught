import Symbols from '../helpers/Symbols.js';

/**
 * @module Draft
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Ability {

    /**
     * @method getShape
     * @return {Shape}
     */
    getShape() {
        return this[Symbols.SHAPE];
    }

    /**
     * @method getMiddleman
     * @return {Middleman}
     */
    getMiddleman() {
        return this.getShape()[Symbols.MIDDLEMAN];
    }

}