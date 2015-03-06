import Dispatcher from './helpers/Dispatcher.js';
import Groups     from './helpers/Groups.js';
import Events     from './helpers/Events.js';
import Layers     from './helpers/Layers.js';
import Registry   from './helpers/Registry.js';

// Shapes.
import Rectangle  from './shapes/types/Rectangle.js';

/**
 * @constant DATA_ATTRIBUTE
 * @type {String}
 */
const DATA_ATTRIBUTE = 'data-id';

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
        this.registry   = new Registry();
        this.layers     = new Layers();
        this.groups     = new Groups(this.element);
        this.label      = _.uniqueId('BP');

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Set the essential registry items.
        this.registry.set('z-index-max', 0);

        // Apply our event listeners.
        this.dispatcher.listen(Events.REORDER, () => {

            var groups       = this.element.selectAll(`g[${DATA_ATTRIBUTE}]`);
            var { min, max } = this.layers.reorder(groups);

            this.registry.set('z-index-min', min);
            this.registry.set('z-index-max', max);

        });

    }

    /**
     * @method add
     * @param {String} name
     * @return {Interface}
     */
    add(name) {

        var shape   = this.new(name),
            group   = this.groups.shapes,
            element = group.append('g').attr(DATA_ATTRIBUTE, shape.label).append(shape.getTag()),
            zIndex  = { z: this.registry.increment('z-index-max') };

        // Set all of the essential objects that the shape requires.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);
        shape.setElement(element);
        shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

        // Last chance to define any further elements for the group.
        shape.addElements(element);

        // Create a mapping from the actual shape object, to the interface object that the developer
        // interacts with.
        this.shapes.push({ shape: shape, interface: shape.getInterface()});
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

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Blueprint = Blueprint;

})(window);