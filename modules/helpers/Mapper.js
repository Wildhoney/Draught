// Facades.
import TextFacade from './../shapes/facades/types/Text.js';
import RectFacade from './../shapes/facades/types/Rectangle.js';

// Internals.
import TextInternal   from './../shapes/internals/types/Text.js';
import RectInternal   from './../shapes/internals/types/Rectangle.js';

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
     * @method getClasses
     * @param {String} tagName
     * @return {Object}
     */
    getClasses(tagName) {

        tagName = tagName.toLowerCase();

        var facadeMap = {
            rect: RectFacade,
            text: TextFacade
        };

        var internalMap = {
            rect: RectInternal,
            text: TextInternal
        };

        return { facade: facadeMap[tagName], internal: internalMap[tagName] };

    },

    /**
     * @method createAssociation
     * @param {Internal} internal
     * @param {Facade} facade
     */
    createAssociation(internal, facade) {
        mappings.push({ facade: facade, internal: internal });
    },

    /**
     * @method getInternalClass
     * @param {Facade} shape
     */
    getInternalClass(shape) {

        return mappings.find((model) => {
            return model.facade === shape;
        });

    }

}