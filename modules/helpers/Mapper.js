import Rectangle from './../shapes/types/Rectangle.js';

/**
 * @property mappings
 * @type {Array}
 */
var mappings = [];

/**
 * @module Blueprint
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default {

    /**
     * @method getShape
     * @param {String} tagName
     * @return {Object}
     */
    getShape(tagName) {

        var map = {
            rect: Rectangle
        };

        return map[tagName.toLowerCase()];

    }

}