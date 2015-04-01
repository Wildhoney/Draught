import Facade from './../Facade.js';

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Rectangle extends Facade {

    /**
     * @method fill
     * @param {String} colour
     * @return {Rectangle}
     */
    fill(colour) {
        return this.attribute('fill', colour);
    }

}