import Shape from './Shape';

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Rectangle extends Shape {

    /**
     * @method tagName
     * @return {String}
     */
    tagName() {
        return 'rect';
    }

    /**
     * @method defaultAttributes
     * @return {Object}
     */
    defaultAttributes() {

        return {
            fill: 'blue',
            height: 100,
            width: 100,
            x: 0,
            y: 0
        };

    }

}