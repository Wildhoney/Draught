import Dispatcher from './helpers/Dispatcher.js';

// Shapes.
import Rectangle  from './shapes/types/Rectangle.js';

/**
 * @module Blueprint
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Blueprint {

    /**
     * @method constructor
     * @param {SVGElement} element
     * @param {Object} [options={}]
     * @return {void}
     */
    constructor(element, options = {}) {
        this.element    = d3.select(element);
        this.shapes     = [];
        this.options    = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
    }

    /**
     * @method add
     * @param {String} name
     * @return {Shape}
     */
    add(name) {

        var shape = this.instantiate(name);

        // Set all the items required for the shape object.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);

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
        var index = this.shapes.indexOf(shape);
        this.shapes.splice(index, 1);
    }

    /**
     * @method all
     * @return {Shape[]}
     */
    all() {
        return this.shapes;
    }

    /**
     * @method clear
     * @return {void}
     */
    clear() {
        _.forEach(this.shapes, (shape) => this.remove(shape));
    }

    /**
     * @method instantiate
     * @param {String} name
     * @return {Shape}
     */
    instantiate(name) {

        var map = {
            rect: Rectangle
        };

        return new map[name.toLowerCase()]();

    }

    /**
     * @method defaultOptions
     * @return {Object}
     */
    defaultOptions() {
        return {};
    }

}

(function main($window) {

    "use strict";

    $window.Blueprint = Blueprint;

})(window);