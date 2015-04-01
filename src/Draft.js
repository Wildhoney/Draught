import Dispatcher from './dispatcher/Dispatcher.js';
import Events     from './dispatcher/Events.js';
import Rectangle  from './components/shape/Rectangle.js';
import zed        from './helpers/Zed.js';

class Draft {

    /**
     * @constructor
     * @param {SVGElement|String} element
     * @param {Object} options
     * @return {Draft}
     */
    constructor(element, options) {

        this.shapes     = [];
        this.index      = 1;
        this.keyboard   = { multiSelect: false, aspectRatio: false };
        //this.options    = Object.assign(this.getOptions(), options);
        this.options    = this.getOptions();
        this.dispatcher = new Dispatcher();

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
                     .on('click', () => this.dispatcher.send(Events.DESELECT_ALL));

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
            getSelected:            this.getSelected.bind(this),
            groups:                 this.groups,
            selectAll:   ()      => this.dispatcher.send(Events.SELECT_ALL),
            deselectAll: ()      => this.dispatcher.send(Events.DESELECT_ALL),
            reorder:     (group) => {
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

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Draft = Draft;

})(window);