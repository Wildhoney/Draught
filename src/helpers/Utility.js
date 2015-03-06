/**
 * @module Blueprint
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
var utility = (function() {

    "use strict";

    return {

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

            if (attributes.transform) {

                var match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i),
                    x     = parseInt(match[1]),
                    y     = parseInt(match[2]);

                if (!_.isUndefined(attributes.x) && _.isUndefined(attributes.y)) {
                    attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, y));
                    delete attributes.x;
                }

                if (_.isUndefined(attributes.x) && !_.isUndefined(attributes.y)) {
                    attributes = _.assign(attributes, utility.pointsToTransform(x, attributes.y));
                    delete attributes.y;
                }

            }

            if (!_.isUndefined(attributes.x) && !_.isUndefined(attributes.y)) {

                // We're using the `transform: translate(x, y)` format instead.
                attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, attributes.y));
                delete attributes.x;
                delete attributes.y;

            }

            return attributes;

        },

        /**
         * @method retransformAttributes
         * @param {Object} attributes
         * @return {Object}
         */
        retransformAttributes(attributes) {

            if (attributes.transform) {

                var match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i);
                attributes.x = parseInt(match[1]);
                attributes.y = parseInt(match[2]);
                delete attributes.transform;

            }

            return utility.camelifyKeys(attributes);

        },

        /**
         * @method pointsToTransform
         * @param {Number} x
         * @param {Number} y
         * @return {String}
         */
        pointsToTransform(x, y) {
            return { transform: `translate(${x}, ${y})` };
        },

        /**
         * @method kebabifyKeys
         * @param {Object} model
         * @return {Object}
         */
        kebabifyKeys(model) {

            var transformedModel = {};

            _.forIn(model, (value, key) => {
                transformedModel[_.kebabCase(key)] = value;
            });

            return transformedModel;

        },

        /**
         * @method camelifyKeys
         * @param {Object} model
         * @return {Object}
         */
        camelifyKeys(model) {

            var transformedModel = {};

            _.forIn(model, (value, key) => {
                transformedModel[_.camelCase(key)] = value;
            });

            return transformedModel;

        }

    };

})();

export default utility;