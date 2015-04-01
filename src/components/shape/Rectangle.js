import Shape      from './../Shape.js';
import Facade     from './../facade/Rectangle.js';

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Rectangle extends Shape {

    /**
     * @constructor
     * @return {Rectangle}
     */
    constructor() {

        super();
        this.facade = new Facade(this);

    }

    /**
     * @method getTag
     * @return {String}
     */
    getTag() {
        return 'rect';
    }

}