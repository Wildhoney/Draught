import Shape     from './../shapes/Shape.js';
import Text      from './../shapes/types/Text.js';
import Rectangle from './../shapes/types/Rectangle.js';

/**
 * @module Blueprint
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default {

    /**
     * @method getShapeClass
     * @param {String} tagName
     * @return {Shape}
     */
    getShapeClass(tagName) {

        var map = {
            rect: Rectangle,
            text: Text
        };

        return map[tagName.toLowerCase()];

    }

}