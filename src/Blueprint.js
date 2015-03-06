import Dispatcher from './helpers/Dispatcher.js';
import Groups     from './helpers/Groups.js';
import utility    from './helpers/Utility.js';

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

        this.element    = d3.select(element).attr('width', '100%').attr('height', '100%');
        this.shapes     = [];
        this.options    = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
        this.groups     = new Groups(this.element);
        this.label      = _.uniqueId('BP');
        this.map        = {};

        // Register our custom shapes.
        this.registerComponent('rect', Rectangle)

    }

    /**
     * @method add
     * @param {String} name
     * @return {Interface}
     */
    add(name) {

        var shape = this.new(name);

        // Set all the items required for the shape object.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);

        // Insert the shape into D3 and apply the attributes.
        var group   = this.groups.shapes,
            element = group.append('g').attr('data-id', shape.label)
                           .append(shape.getTag()).datum(utility.transformAttributes(shape.getAttributes()));
        element.attr(element.datum());

        shape.addElements(element);

        this.shapes.push({
            shape: shape,
            interface: shape.getInterface()
        });

        return shape.getInterface();

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
        return this.shapes.map((shape) => shape.interface);
    }

    /**
     * @method clear
     * @return {void}
     */
    clear() {
        _.forEach(this.shapes, (shape) => this.remove(shape));
    }

    /**
     * @method new
     * @param {String} name
     * @return {Shape}
     */
    new(name) {
        return new this.map[name.toLowerCase()](this.label);
    }

    /**
     * @method registerComponent
     * @param {String} name
     * @param {Shape} shape
     * @return {void}
     */
    registerComponent(name, shape) {
        this.map[name] = shape;
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