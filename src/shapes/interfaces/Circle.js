import Interface from './../Interface.js';

/**
 * @module Blueprint
 * @submodule Circle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */
export default class Circle extends Interface {

    /**
     * @method fill
     * @param {String} [value=undefined]
     * @return {Interface}
     */
    fill(value) {
        return this.attr('fill', value);
    }

}