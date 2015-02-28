import mapper  from './helpers/Mapper.js';
import options from './helpers/Options.js';
import utility from './helpers/Utility.js';
import emitter from './helpers/Emitter.js';

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

        var Shape = mapper.getShape(tagName),
            shape = new Shape(attributes);

        // Set all the items required for the shape object.
        shape.setOptions(this.options);
        shape.setEmitter(emitter);

        this.shapes.push(shape);
        return shape.getInterface();

    }

    /**
     * @method remove
     * @param {Shape} shape
     * @return {void}
     */
    remove(shape) {
        shape.remove();
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