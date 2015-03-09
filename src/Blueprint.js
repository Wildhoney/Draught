import Dispatcher from './helpers/Dispatcher.js';
import Groups     from './helpers/Groups.js';
import Events     from './helpers/Events.js';
import ZIndex     from './helpers/ZIndex.js';
import utility    from './helpers/Utility.js';

// Shapes.
import Shape      from './shapes/Shape.js';
import Rectangle  from './shapes/types/Rectangle.js';

/**
 * @module Blueprint
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Blueprint {

    /**
     * @method constructor
     * @param {SVGElement|String} element
     * @param {Object} [options={}]
     * @return {void}
     */
    constructor(element, options = {}) {

        this.options    = _.assign(this.defaultOptions(), options);
        this.element    = d3.select(utility.elementReference(element))
                            .attr('width', this.options.documentWidth)
                            .attr('height', this.options.documentHeight);
        this.shapes     = [];
        this.index      = 1;

        // Helpers required by Blueprint and the rest of the system.
        this.dispatcher = new Dispatcher();
        this.zIndex     = new ZIndex();
        this.groups     = new Groups().addTo(this.element);

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Add the event listeners.
        this.addEventListeners();

    }

    /**
     * @method add
     * @param {String|HTMLElement} name
     * @return {Interface}
     */
    add(name) {

        var shape   = this.instantiate(utility.elementName(name)),
            group   = this.groups.shapes.append('g').attr(this.options.dataAttribute, shape.label),
            element = group.append(shape.getTag()),
            zIndex  = { z: this.index - 1 };

        // Set all of the essential objects that the shape requires.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);
        shape.setElement(element);
        shape.setGroup(group);
        shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

        // Last chance to define any further elements for the group, and the application of the
        // features which a shape should have, such as being draggable, selectable, resizeable, etc...
        shape.addElements();
        shape.addFeatures();

        // Create a mapping from the actual shape object, to the interface object that the developer
        // interacts with.
        this.shapes.push({ shape: shape, interface: shape.getInterface()});
        return shape.getInterface();

    }

    /**
     * @method remove
     * @param {Interface} model
     * @return {Array}
     */
    remove(model) {

        var index = 0,
            item  = _.find(this.shapes, (shape, i) => {

            if (shape.interface === model) {
                index = i;
                return model;
            }

        });

        item.shape.element.remove();
        this.shapes.splice(index, 1);
        return this.all();
    }

    /**
     * @method all
     * @return {Shape[]}
     */
    all() {
        return this.shapes.map((model) => model.interface);
    }

    /**
     * @method clear
     * @return {void}
     */
    clear() {
        _.forEach(this.shapes, (shape) => this.remove(shape));
    }

    /**
     * @method ident
     * @return {String}
     */
    ident() {
        return ['BP', this.index++].join('');
    }

    /**
     * @method register
     * @param {String} name
     * @param {Shape} shape
     * @param {Boolean} [overwrite=false]
     * @return {void}
     */
    register(name, shape, overwrite = false) {

        // Ensure the shape is a valid instance.
        utility.assert(Object.getPrototypeOf(shape) === Shape, 'Custom shape must be an instance of `Shape`', 'Instance of Shape');

        if (!overwrite && this.map.hasOwnProperty(name)) {

            // Existing shapes cannot be overwritten.
            utility.throwException(`Refusing to overwrite existing ${name} shape without explicit overwrite`, 'Overwriting Existing Shapes');

        }

        this.map[name] = shape;

    }

    /**
     * @method instantiate
     * @param {String} name
     * @return {Shape}
     */
    instantiate(name) {
        return new this.map[name.toLowerCase()](this.ident());
    }

    /**
     * @method addEventListeners
     * @return {void}
     */
    addEventListeners() {

        this.dispatcher.listen(Events.REORDER, (event) => {
            var groups = this.element.selectAll(`g[${this.options.dataAttribute}]`);
            this.zIndex.reorder(groups, event.group);
        });

        this.dispatcher.listen(Events.REMOVE, (event) => this.remove(event.interface));

        // When the user clicks on the SVG layer that isn't a part of the shape group, then we'll emit
        // the `Events.DESELECT` event to deselect all selected shapes.
        this.element.on('click', () => this.dispatcher.send(Events.DESELECT))

    }

    /**
     * @method defaultOptions
     * @return {Object}
     */
    defaultOptions() {

        return {
            dataAttribute: 'data-id',
            documentHeight: '100%',
            documentWidth: '100%'
        };

    }

    /**
     * @method getShapePrototype
     * @return {Shape}
     */
    getShapePrototype() {
        return Shape;
    }

}

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Blueprint = Blueprint;

})(window);