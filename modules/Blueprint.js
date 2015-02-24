import mapper  from './helpers/Mapper.js';
import options from './helpers/Options.js';

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

        var shape = mapper.getShapeClass(tagName);
        shape.setOptions(this.options);

        this.shapes.push(shape);
        return shape;

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

    }

}

(($window) => {

    // My dear, here we must run as fast as we can, just to stay in place.
    // And if you wish to go anywhere you must run twice as fast as that.
    $window.Blueprint = Blueprint;

})(window);