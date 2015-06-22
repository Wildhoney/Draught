import Dispatcher  from './dispatcher/Dispatcher.js';
import Events      from './dispatcher/Events.js';
import Rectangle   from './components/shape/Rectangle.js';
import zed         from './helpers/Zed.js';
import BoundingBox from './helpers/BoundingBox.js';

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
class Draft {

    /**
     * @constructor
     * @param {SVGElement|String} element
     * @param {Object} options
     * @return {Draft}
     */
    constructor(element, options) {

        this.shapes      = [];
        this.index       = 1;
        this.keyboard    = { multiSelect: false, aspectRatio: false };
        this.options     = Object.assign(this.getOptions(), options);
        this.dispatcher  = new Dispatcher();
        this.boundingBox = new BoundingBox();
        this.boundingBox.setAccessor(this.getAccessor());

        // Responsible for setting up Mousetrap events, if it's available, otherwise all attached
        // events will be ghost events.
        ((mousetrap) => {

            // Select all of the available shapes.
            mousetrap.bind('mod+a', () => this.dispatcher.send(Events.SELECT_ALL));

            // Multi-selecting shapes.
            mousetrap.bind('mod',   () => this.keyboard.multiSelect = true, 'keydown');
            mousetrap.bind('mod',   () => this.keyboard.multiSelect = false, 'keyup');

            // Maintain aspect ratios when resizing.
            mousetrap.bind('shift', () => this.keyboard.aspectRatio = true, 'keydown');
            mousetrap.bind('shift', () => this.keyboard.aspectRatio = false, 'keyup');

        })(Mousetrap || { bind: () => {} });

        // Voila...
        this.svg = d3.select(typeof element === 'string' ? document.querySelector(element) : element)
                     .attr('width', this.options.documentWidth)
                     .attr('height', this.options.documentHeight)
                     .on('click', () => {
                         //this.dispatcher.send(Events.DESELECT_ALL);
                     });

        // Add groups to the SVG element.
        this.groups = {
            shapes:  this.svg.append('g').attr('class', 'shapes').on('click', () => d3.event.stopPropagation()),
            handles: this.svg.append('g').attr('class', 'handles').on('click', () => d3.event.stopPropagation())
        };

    }

    /**
     * @method add
     * @param {String} name
     * @return {Facade}
     */
    add(name) {

        let shape  = this.getInstance(name),
            facade = shape.getFacade();

        this.shapes.push(facade);
        return facade;

    }

    /**
     * @method on
     * @param {String} eventName
     * @param {Function} fn
     * @return {void}
     */
    on(eventName, fn) {
        this.dispatcher.on(eventName, fn);
    }

    /**
     * @method remove
     * @param facade {Facade}
     * @return {void}
     */
    remove(facade) {
        facade.remove();
    }

    /**
     * @method getSelected
     * @return {Array}
     */
    getSelected() {
        return this.shapes.filter((shape) => shape.isSelected());
    }

    /**
     * Accessors that are accessible by the shapes and their associated facades.
     *
     * @method getAccessor
     * @return {Object}
     */
    getAccessor() {

        return {
            getSelected:             this.getSelected.bind(this),
            groups:                  this.groups,
            dragBBox:    ()       => this.boundingBox.dragStart(),
            createBBox:  ()       => this.boundingBox.create(this.getSelected(), this.groups.handles),
            keyboard:                this.keyboard,
            hasSelected: ()       => this.dispatcher.send(Events.SELECTED, {
                                        shapes: this.getSelected()
                                    }),
            selectAll:   ()       => this.dispatcher.send(Events.SELECT_ALL),
            deselectAll: ()       => this.dispatcher.send(Events.DESELECT_ALL),
            remove:      (facade) => {
                let index = this.shapes.indexOf(facade);
                this.shapes.splice(index, 1);
            },
            reorder:     (group)  => {
                let groups = this.svg.selectAll('g.shapes g');
                zed.reorder(groups, group);
            }
        }

    }

    /**
     * @method getInstance
     * @param {String} name
     * @return {Shape}
     */
    getInstance(name) {

        let map = {
            rect: Rectangle
        };

        // Instantiate the shape object, and inject the accessor and listener.
        let shape = new map[name.toLowerCase()]();
        shape.setAccessor(this.getAccessor());
        shape.setDispatcher(this.dispatcher);
        shape.insert(this.groups.shapes, this.index++);
        return shape;

    }

    /**
     * @method getOptions
     * @return {Object}
     */
    getOptions() {

        return {
            documentHeight: '100%',
            documentWidth: '100%',
            gridSize: 10
        };

    }

}

/**
 * @property Object.assign
 * @type {Function}
 * @see https://github.com/sindresorhus/object-assign
 */
Object.assign = Object.assign || function assign(target, source) {

    "use strict";

    let from, keys, to = Object(target);

    for (let s = 1; s < arguments.length; s++) {
        from = arguments[s];
        keys = Object.keys(Object(from));

        for (let i = 0; i < keys.length; i++) {
            to[keys[i]] = from[keys[i]];
        }
    }

    return to;

};

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Draft = Draft;

})(window);