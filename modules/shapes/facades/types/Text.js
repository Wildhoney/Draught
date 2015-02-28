import Shape from './../Shape.js';

/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Rectangle extends Shape {

    /**
     * @method getTag
     * @return {String}
     */
    getTag() {
        return 'rect';
    }

    /**
     * @method getIdent
     * @return {String}
     */
    getIdent() {
        return 'text';
    }

}