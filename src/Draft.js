import Middleman      from './helpers/Middleman.js';
import Symbols        from './helpers/Symbols.js';
import {objectAssign} from './helpers/Polyfills.js';

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Draft {

    /**
     * @constructor
     * @param {HTMLElement} element
     * @param {Object} [options={}]
     * @return {Draft}
     */
    constructor(element, options = {}) {

        this[Symbols.shapes]    = [];
        this[Symbols.options]   = (Object.assign || objectAssign)(this.getOptions(), options);
        this[Symbols.middleman] = new Middleman(this);

        // Render the SVG component using the defined options.
        const width       = this[Symbols.options].documentWidth;
        const height      = this[Symbols.options].documentHeight;
        this[Symbols.svg] = d3.select(element).attr('width', width).attr('height', height);

    }

    /**
     * @method addShape
     * @param {Shape} shape
     */
    addShape(shape) {
        this[Symbols.shapes].push(shape);
        return shape;
    }

    /**
     * @method removeShape
     * @param {Shape} shape
     * @return {Number}
     */
    removeShape(shape) {

        const shapes = this[Symbols.shapes];
        const index  = shapes.indexOf(shape);
        shapes.splice(index, 1);

        // Put the interface for interacting with Draft into the shape object.
        shape[Symbols.middleman] = this[Symbols.middleman];

        return shapes.length;

    }

    /**
     * @method getShapes
     * @return {Array}
     */
    getShapes() {
        return this[Symbols.shapes];
    }

    /**
     * @method getOptions
     * @return {Object}
     */
    getOptions() {

        return this[Symbols.options] || {
            documentHeight: '100%',
            documentWidth: '100%',
            gridSize: 10
        };

    }

}