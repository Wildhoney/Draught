import Shape from './Shape.js';

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
     * @method getDefaultAttributes
     * @return {Object}
     */
    getDefaultAttributes() {

        return {
            fill: 'blue'
        };

    }

}