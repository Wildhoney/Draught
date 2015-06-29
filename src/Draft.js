import Middleman      from './helpers/Middleman.js';
import Symbols        from './helpers/Symbols.js';
import {objectAssign} from './helpers/Polyfills.js';
import invocator      from './helpers/Invocator.js';

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

        this[Symbols.SHAPES]    = [];
        this[Symbols.OPTIONS]   = (Object.assign || objectAssign)(this.getOptions(), options);
        this[Symbols.MIDDLEMAN] = new Middleman(this);

        // Render the SVG component using the defined options.
        const width       = this[Symbols.OPTIONS].documentWidth;
        const height      = this[Symbols.OPTIONS].documentHeight;
        this[Symbols.SVG] = d3.select(element).attr('width', width).attr('height', height);

    }

    /**
     * @method addShape
     * @param {Shape} shape
     * @return {Number}
     */
    addShape(shape) {

        const shapes = this[Symbols.SHAPES];

        shapes.push(shape);

        // Put the interface for interacting with Draft into the shape object.
        shape[Symbols.MIDDLEMAN] = this[Symbols.MIDDLEMAN];

        invocator.did('add', shape);

        return shapes.length;

    }

    /**
     * @method removeShape
     * @param {Shape} shape
     * @return {Number}
     */
    removeShape(shape) {

        const shapes = this[Symbols.SHAPES];
        const index  = shapes.indexOf(shape);

        shapes.splice(index, 1);
        invocator.did('remove', shape);

        return shapes.length;

    }

    /**
     * @method clearShapes
     * @return {Number}
     */
    clearShapes() {

        const shapes = this[Symbols.SHAPES];
        invocator.did('remove', shapes);
        shapes.length = 0;

        return shapes.length;

    }

    /**
     * @method getShapes
     * @return {Array}
     */
    getShapes() {
        return this[Symbols.SHAPES];
    }

    /**
     * @method selectShapes
     * @param {Array} [shapes=this.getShapes()]
     * @return {void}
     */
    selectShapes(shapes = this.getShapes()) {
        invocator.did('select', shapes);
    }

    /**
     * @method deselectShapes
     * @param {Array} [shapes=this.getShapes()]
     * @return {void}
     */
    deselectShapes(shapes = this.getShapes()) {
        invocator.did('deselect', shapes);
    }

    /**
     * @method getOptions
     * @return {Object}
     */
    getOptions() {

        return this[Symbols.OPTIONS] || {
            documentHeight: '100%',
            documentWidth: '100%',
            gridSize: 10
        };

    }

}