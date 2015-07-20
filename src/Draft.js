import Middleman      from './helpers/Middleman';
import Symbols        from './helpers/Symbols';
import BoundingBox    from './helpers/BoundingBox';
import {objectAssign} from './helpers/Polyfills';
import invocator      from './helpers/Invocator';
import mapper         from './helpers/Mapper';

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

        this[Symbols.SHAPES]       = [];
        this[Symbols.OPTIONS]      = (Object.assign || objectAssign)(this.options(), options);
        const middleman            = this[Symbols.MIDDLEMAN]    = new Middleman(this);
        this[Symbols.BOUNDING_BOX] = new BoundingBox(middleman);

        // Render the SVG component using the defined options.
        const width  = this[Symbols.OPTIONS].documentWidth;
        const height = this[Symbols.OPTIONS].documentHeight;
        const svg    = this[Symbols.SVG] = d3.select(element).attr('width', width).attr('height', height);

        const stopPropagation = () => d3.event.stopPropagation();
        this[Symbols.LAYERS]  = {
            shapes:      svg.append('g').attr('class', 'shapes').on('click', stopPropagation),
            boundingBox: svg.append('g').attr('class', 'bounding').on('click', stopPropagation),
            resize:      svg.append('g').attr('class', 'resize').on('click', stopPropagation)
        };

        // Deselect all shapes when the canvas is clicked.
        svg.on('click', () => {

            if (!middleman.preventDeselect()) {
                this.deselect();
            }

            middleman.preventDeselect(false);

        });

    }

    /**
     * @method add
     * @param {Shape|String} shape
     * @return {Shape}
     */
    add(shape) {

        // Resolve the shape name to the shape object, if the user has passed the shape
        // as a string.
        shape = (typeof shape === 'string') ? mapper(shape) : shape;

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
     * @method select
     * @param {Array} [shapes=this.all()]
     * @return {void}
     */
    select(shapes = this.all()) {
        invocator.did('select', shapes);
        this[Symbols.BOUNDING_BOX].drawBoundingBox(this.selected(), this[Symbols.LAYERS].boundingBox);
    }

    /**
     * @method deselect
     * @param {Array} [shapes=this.all()]
     * @return {void}
     */
    deselect(shapes = this.all()) {
        invocator.did('deselect', shapes);
        this[Symbols.BOUNDING_BOX].drawBoundingBox(this.selected(), this[Symbols.LAYERS].boundingBox);
    }

    /**
     * @method selected
     * @return {Array}
     */
    selected() {
        return this.all().filter((shape) => shape.isSelected());
    }

    /**
     * @method options
     * @return {Object}
     */
    options() {

        return this[Symbols.OPTIONS] || {
            documentHeight: '100%',
            documentWidth: '100%',
            gridSize: 10,
            handleRadius: 22,
            defaultMoveStep: 1,
            shiftMoveStep: 10
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