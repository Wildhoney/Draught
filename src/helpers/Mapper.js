import Throw     from '../helpers/Throw';
import Rectangle from '../shapes/Rectangle';

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

    return typeof map[name] !== 'undefined' ? new map[name]()
                                            : new Throw(`Cannot map "${name}" to a shape object`);

};