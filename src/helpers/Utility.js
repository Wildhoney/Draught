import Constants from './Constants.js';

/**
 * @module Draft
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
var utility = (function() {

    "use strict";

    return {

        /**
         * @method throwException
         * @param {String} message
         * @param {String} [exceptionsTitle='']
         * @throws Error
         * @return {void}
         */
        throwException: (message, exceptionsTitle = '') => {

            if (exceptionsTitle) {
                let link = Constants.EXCEPTIONS_URL.replace(/{(.+?)}/i, () => _.kebabCase(exceptionsTitle));
                throw new Error(`Draft.js: ${message}. See: ${link}`);
            }

            throw new Error(`Draft.js: ${message}.`);

        },

        /**
         * @method assert
         * @param {Boolean} assertion
         * @param {String} message
         * @param {String} exceptionsTitle
         * @return {void}
         */
        assert(assertion, message, exceptionsTitle) {

            if (!assertion) {
                utility.throwException(message, exceptionsTitle);
            }

        },

        /**
         * @method transformAttributes
         * @param {Object} attributes
         * @return {Object}
         */
        transformAttributes: (attributes) => {

            if (attributes.transform) {

                let match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i),
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

                let match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i);
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

            let transformedModel = {};

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

            let transformedModel = {};

            _.forIn(model, (value, key) => {
                transformedModel[_.camelCase(key)] = value;
            });

            return transformedModel;

        },

        /**
         * @method elementName
         * @param {String|HTMLElement} model
         * @return {String}
         */
        elementName(model) {

            if (model.nodeName) {
                return model.nodeName.toLowerCase();
            }

            return model.toLowerCase();

        },

        /**
         * @method elementReference
         * @param {String|HTMLElement} model
         * @return {HTMLElement}
         */
        elementReference(model) {

            if (model.nodeName) {
                return model;
            }

            return document.querySelector(model);

        }

    };

})();

export default utility;