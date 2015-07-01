import Rectangle from '../shapes/Rectangle.js';

/**
 * @module Draft
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default (name) => {

    "use strict";

    const map = {
        rectangle: Rectangle
    };

    return new map[name]();

};