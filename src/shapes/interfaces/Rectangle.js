import Interface from './../Interface.js';

/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */
export default class Rectangle extends Interface {

    /**
     * @method fill
     * @param {String} [value=undefined]
     * @return {Interface}
     */
    fill(value) {
        return this.attr('fill', value);
    }

}