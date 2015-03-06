/**
 * @module Blueprint
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
var utility = {

    /**
     * @method throwException
     * @param {String} message
     * @throws Exception
     * @return {void}
     */
    throwException: (message) => {
        throw `Blueprint.js: ${message}.`;
    },

    /**
     * @method transformAttributes
     * @param {Object} attributes
     * @return {Object}
     */
    transformAttributes: (attributes) => {

        if (attributes.x && attributes.y) {

            // We're using the `transform: translate(x, y)` format instead.
            attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, attributes.y));
            delete attributes.x;
            delete attributes.y;

        }

        return attributes;

    },

    /**
     * @method pointsToTransform
     * @param {Number} x
     * @param {Number} y
     * @return {String}
     */
    pointsToTransform(x, y) {
        return { transform: `translate(${x}, ${y})` };
    }

};

export default utility;