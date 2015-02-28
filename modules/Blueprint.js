import mapper  from './helpers/Mapper.js';
import options from './helpers/Options.js';
import utility from './helpers/Utility.js';

/**
 * @module Blueprint
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Blueprint {

    /**
     * @constructor
     * @param {SVGElement} svgElement
     * @param {Object} [options={}]
     * @return {Blueprint}
     */
    constructor(svgElement, options = {}) {
        this.svg     = d3.select(svgElement);
        this.shapes  = [];
        this.options = _.assign(options.defaults(), options);
    }

    /**
     * @method add
     * @param {String} tagName
     * @param {Object} [attributes={}]
     * @return {Shape}
     */
    add(tagName, attributes = {}) {

        var { Facade, Internal } = mapper.getClasses(tagName);

        var facade   = new Facade(),
            internal = new Internal();

        mapper.createAssociation(internal, facade);

        // Set all the items required for the Internal shape object.
        Internal.setOptions(this.options);

        this.shapes.push(Facade);
        return Facade;

    }

    /**
     * @method remove
     * @param {Shape} shape
     * @return {void}
     */
    remove(shape) {
        mapper.getInternalClass(shape).remove();
    }

    /**
     * @method clear
     * @return {void}
     */
    clear() {
        _.forEach(this.shapes, (shape) => this.remove(shape));
    }

}

(($window) => {

    "use strict";

    // My dear, here we must run as fast as we can, just to stay in place.
    // And if you wish to go anywhere you must run twice as fast as that.
    $window.Blueprint = Blueprint;

})(window);