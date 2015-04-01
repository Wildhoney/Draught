import Shape     from './../Shape.js';
import Interface from './../interfaces/Rectangle.js';

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Rectangle extends Shape {

    /**
     * @method getTag
     * @return {String}
     */
    getTag() {
        return 'rect';
    }

    /**
     * @method addInterface
     * @return {Interface}
     */
    addInterface() {
        return new Interface(this.label);
    }

    /**
     * @method addAttributes
     * @return {Object}
     */
    addAttributes() {
        return { fill: 'red', width: 100, height: 100, x: 100, y: 20 };
    }

}