import Dispatcher from './helpers/Dispatcher.js';
import Groups     from './helpers/Groups.js';
import Events     from './helpers/Events.js';
import Registry    from './helpers/Registry.js';
import utility    from './helpers/Utility.js';

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
        this.groups     = new Groups(this.element);
        this.label      = _.uniqueId('BP');
        this.map        = {};

        // Set the essential registry items.
        this.registry.set('z-index', 0);

        // Register our custom shapes.
        this.registerComponent('rect', Rectangle);

        // Apply our event listeners.
        this.dispatcher.listen(Events.REORDER, () => {
            var groups = d3.selectAll(`g[${DATA_ATTRIBUTE}]`);
            groups.sort((a, b) => a.z - b.z);
        });

    }

    /**
     * @method add
     * @param {String} name
     * @return {Interface}
     */
    add(name) {

        var shape = this.new(name);
        //this.registry.set('z-index', );

        // Insert the shape into D3 and apply the attributes.
        var group   = this.groups.shapes,
            element = group.append('g').attr(DATA_ATTRIBUTE, shape.label).append(shape.getTag()),
            zIndex  = { z: this.registry.increment('z-index') };

        // Set all the items required for the shape object.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);
        shape.setElement(element);
        shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

        shape.addElements(element);

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

    $window.Blueprint = Blueprint;

})(window);