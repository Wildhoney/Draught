/**
 * @module Blueprint
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Blueprint {

    /**
     * @constructor
     * @param {SVGElement} svgElement
     */
    constructor(svgElement) {
        this.shapes = [];
    }

    /**
     * @method add
     * @param {String} tagName
     * @param {Object} [attributes={}]
     * @return {Shape}
     */
    add(tagName, attributes = {}) {

    }

    /**
     * @method remove
     * @param {Shape} shape
     * @return {void}
     */
    remove(shape) {

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