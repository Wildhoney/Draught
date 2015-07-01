import Symbols from '../helpers/Symbols.js';

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Ability {

    /**
     * @method shape
     * @return {Ability}
     */
    shape() {
        return this[Symbols.SHAPE];
    }

    /**
     * @method middleman
     * @return {Middleman}
     */
    middleman() {
        return this.shape()[Symbols.MIDDLEMAN];
    }

}