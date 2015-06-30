/**
 * @module Draft
 * @submodule Attributes
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

/*
 * @method setAttribute
 * @param {Array} element
 * @param {String} name
 * @param {*} value
 * @return {void}
 */
export default (element, name, value) => {

    "use strict";

    switch (name) {

        case 'x':
            const y = element.datum().y || 0;
            return void element.attr('transform', `translate(${value}, ${y})`);

        case 'y':
            const x = element.datum().x || 0;
            return void element.attr('transform', `translate(${x}, ${value})`);

    }

    element.attr(name, value);

};