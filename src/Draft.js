import Dispatcher from './helpers/Dispatcher.js';
import Groups     from './helpers/Groups.js';
import Events     from './helpers/Events.js';
import ZIndex     from './helpers/ZIndex.js';
import registry   from './helpers/Registry.js';
import utility    from './helpers/Utility.js';

// Shapes.
import Shape      from './shapes/Shape.js';
import Rectangle  from './shapes/types/Rectangle.js';
import Circle     from './shapes/types/Circle.js';

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
class Draft {

    /**
     * @method constructor
     * @param {SVGElement|String} element
     * @param {Object} [options={}]
     * @return {void}
     */
    constructor(element, options = {}) {

        this.options     = _.assign(this.defaultOptions(), options);
        this.element     = d3.select(utility.elementReference(element))
                            .attr('width', this.options.documentWidth)
                            .attr('height', this.options.documentHeight);
        this.shapes      = [];
        this.index       = 1;
        this.boundingBox = { selected: false, element: { remove: () => {}} };

        // Helpers required by Draft and the rest of the system.
        this.dispatcher  = new Dispatcher();
        this.zIndex      = new ZIndex();
        this.groups      = new Groups().addTo(this.element);

        // Register our default components.
        this.map = {
            rect:   Rectangle,
            circle: Circle
        };

        // Configure our interface for each shape object.
        this.accessor = {
            getCount: () => this.selected().length
        };

        // Add the event listeners, and setup Mousetrap to listen for keyboard events.
        this.addEventListeners();
        this.setupMousetrap();

    }

    /**
     * @method add
     * @param {String|HTMLElement} name
     * @return {Interface}
     */
    add(name) {

        let shape   = this.instantiate(utility.elementName(name)),
            group   = this.groups.shapes.append('g').attr(this.options.dataAttribute, shape.label),
            element = group.append(shape.getTag()),
            zIndex  = { z: this.index - 1 };

        // Set all of the essential objects that the shape requires.
        shape.setOptions(this.options);
        shape.setDispatcher(this.dispatcher);
        shape.setAccessor(this.accessor);
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

        let index = 0,
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
     * @method selected
     * @return {Array}
     */
    selected() {
        return this.all().filter((shapeInterface) => shapeInterface.isSelected());
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

        this.dispatcher.listen(Events.REMOVE, (event)  => this.remove(event.interface));
        this.dispatcher.listen(Events.CREATE_BOUNDING_BOX, () => this.createBoundingBox());
        this.dispatcher.listen(Events.SELECTED_COUNT, () => this.selected().length);
        this.dispatcher.listen(Events.REORDER, (event) => {
            let groups = this.element.selectAll(`g[${this.options.dataAttribute}]`);
            this.zIndex.reorder(groups, event.group);
        });

        // When the user clicks on the SVG layer that isn't a part of the shape group, then we'll emit
        // the `Events.DESELECT` event to deselect all selected shapes.
        this.element.on('click', () => {

            if (!this.boundingBox.selected) {
                this.dispatcher.send(Events.DESELECT_ALL);
                this.boundingBox.element.remove();
            }

            this.boundingBox.selected = false;

        });

    }

    /**
     * @method createBoundingBox
     * @return {void}
     */
    createBoundingBox() {

        let model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                      maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

        /**
         * Responsible for computing the collective bounding box, based on all of the bounding boxes
         * from the current selected shapes.
         *
         * @method compute
         * @param {Array} bBoxes
         * @return {void}
         */
        let compute = (bBoxes) => {
            model.minX = Math.min(...bBoxes.map((d) => d.x));
            model.minY = Math.min(...bBoxes.map((d) => d.y));
            model.maxX = Math.max(...bBoxes.map((d) => d.x + d.width));
            model.maxY = Math.max(...bBoxes.map((d) => d.y + d.height));
        };

        // Compute the collective bounding box.
        compute(this.selected().map((shape) => shape.boundingBox()));

        this.boundingBox.element.remove();
        this.boundingBox.element = this.groups.handles
                                       .append('rect')
                                       .datum(model)
                                       .classed('drag-box', true)
                                       .attr('pointer-events', 'none')
                                       .attr('x',      ((d) => d.minX))
                                       .attr('y',      ((d) => d.minY))
                                       .attr('width',  ((d) => d.maxX - d.minX))
                                       .attr('height', ((d) => d.maxY - d.minY))
                                       .attr('fill', 'transparent')
                                       .attr('stroke', 'red')
                                       .attr('stroke-dasharray', [3, 3])
                                       .on('mouseup', () => {
                                           this.boundingBox.selected = true;
                                       });

    }

    /**
     * @method setupMousetrap
     * @return {void}
     */
    setupMousetrap() {

        Mousetrap.bind('mod',   () => registry.keys.multiSelect = true, 'keydown');
        Mousetrap.bind('mod',   () => registry.keys.multiSelect = false, 'keyup');

        Mousetrap.bind('shift', () => registry.keys.aspectRatio = true, 'keydown');
        Mousetrap.bind('shift', () => registry.keys.aspectRatio = false, 'keyup');

        Mousetrap.bind('mod+a', () => this.dispatcher.send(Events.SELECT_ALL));

        /**
         * @method move
         * @param {String} name
         * @param {Number} value
         * @return {Boolean}
         */
        let move = (name, value) => {
            this.dispatcher.send(name, { by: value });
            return false;
        };

        Mousetrap.bind('left',  () => move(Events.MOVE_LEFT, this.options.moveSmall));
        Mousetrap.bind('right', () => move(Events.MOVE_RIGHT, this.options.moveSmall));
        Mousetrap.bind('up',    () => move(Events.MOVE_UP, this.options.moveSmall));
        Mousetrap.bind('down',  () => move(Events.MOVE_DOWN, this.options.moveSmall));

        Mousetrap.bind('shift+left',  () => move(Events.MOVE_LEFT, this.options.moveLarge));
        Mousetrap.bind('shift+right', () => move(Events.MOVE_RIGHT, this.options.moveLarge));
        Mousetrap.bind('shift+up',    () => move(Events.MOVE_UP, this.options.moveLarge));
        Mousetrap.bind('shift+down',  () => move(Events.MOVE_DOWN, this.options.moveLarge));

    }

    /**
     * @method defaultOptions
     * @return {Object}
     */
    defaultOptions() {

        return {
            dataAttribute: 'data-id',
            documentHeight: '100%',
            documentWidth: '100%',
            moveSmall: 1,
            moveLarge: 10
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
    $window.draft = Draft;

})(window);