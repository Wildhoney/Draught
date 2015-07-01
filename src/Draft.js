import Middleman      from './helpers/Middleman.js';
import Symbols        from './helpers/Symbols.js';
import {objectAssign} from './helpers/Polyfills.js';
import invocator      from './helpers/Invocator.js';
import mapper         from './helpers/Mapper.js';

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
class Draft {

    /**
     * @constructor
     * @param {HTMLElement} element
     * @param {Object} [options={}]
     * @return {Draft}
     */
    constructor(element, options = {}) {

        this[Symbols.SHAPES]    = [];
        this[Symbols.OPTIONS]   = (Object.assign || objectAssign)(this.options(), options);
        this[Symbols.MIDDLEMAN] = new Middleman(this);

        // Render the SVG component using the defined options.
        const width       = this[Symbols.OPTIONS].documentWidth;
        const height      = this[Symbols.OPTIONS].documentHeight;
        this[Symbols.SVG] = d3.select(element).attr('width', width).attr('height', height);

    }

    /**
     * @method add
     * @param {Shape|String} shape
     * @return {Shape}
     */
    add(shape) {

        if (typeof shape === 'string') {

            // Resolve the shape name to the shape object, if the user has passed the shape
            // as a string.
            shape = mapper(shape);

        }

        const shapes = this[Symbols.SHAPES];
        shapes.push(shape);

        // Put the interface for interacting with Draft into the shape object.
        shape[Symbols.MIDDLEMAN] = this[Symbols.MIDDLEMAN];
        invocator.did('add', shape);

        return shape;

    }

    /**
     * @method remove
     * @param {Shape} shape
     * @return {Number}
     */
    remove(shape) {

        const shapes = this[Symbols.SHAPES];
        const index  = shapes.indexOf(shape);

        shapes.splice(index, 1);
        invocator.did('remove', shape);

        return shapes.length;

    }

    /**
     * @method clear
     * @return {Number}
     */
    clear() {

        const shapes = this[Symbols.SHAPES];
        invocator.did('remove', shapes);
        shapes.length = 0;

        return shapes.length;

    }

    /**
     * @method all
     * @return {Array}
     */
    all() {
        return this[Symbols.SHAPES];
    }

    /**
     * @method selectShapes
     * @param {Array} [shapes=this.all()]
     * @return {void}
     */
    selectShapes(shapes = this.all()) {
        invocator.did('select', shapes);
    }

    /**
     * @method deselectShapes
     * @param {Array} [shapes=this.all()]
     * @return {void}
     */
    deselectShapes(shapes = this.all()) {
        invocator.did('deselect', shapes);
    }

    /**
     * @method options
     * @return {Object}
     */
    options() {

        return this[Symbols.OPTIONS] || {
            documentHeight: '100%',
            documentWidth: '100%',
            gridSize: 10
        };

    }

}

(($window) => {

    "use strict";

    if ($window) {

        // Export draft if the `window` object is available.
        $window.Draft = Draft;

    }

})(window);

// Export for use in ES6 applications.
export default Draft;