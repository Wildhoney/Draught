import Shape     = require('./shapes/Shape');
import Rectangle = require('./shapes/types/Rectangle');

/**
 * @class PrivateInterface
 */
class PrivateInterface {

    /**
     * @property element
     * @type {HTMLElement}
     */
    private element: HTMLElement;

    /**
     * @method element
     * @return {HTMLElement}
     */
    protected element(): HTMLElement {
        return this.element;
    }

    /**
     * Helper method for defining an attribute on the shape.
     *
     * @method attr
     * @param {String} name
     * @param {*} value
     * @return {*}
     */
    protected attr(name: string, value: any): any {

        if (typeof value !== 'undefined') {
            this.element().attr(name, value);
        }

        return this.element().attr(name);

    }

}

/**
 * @class Blueprint
 */
class Blueprint {

    /**
     * @property element
     * @type {Object}
     */
    private element: Object;

    /**
     * @property shapes
     * @type {Shape[]}
     */
    private shapes: Shape[];

    /**
     * @property options
     * @type {Array}
     */
    private options: Object;

    /**
     * @method constructor
     * @param {SVGElement} element
     * @param {Object} [options={}]
     * @return {void}
     */
    constructor(element: SVGElement, options: Object = {}) {
        this.element = d3.select(element);
        this.options = _.assign(this.defaultOptions(), options);
    }

    /**
     * @method adam
     * @param {String} name
     * @return {Shape}
     */
    public add(name: string) {

        var shape = this.instantiate(name);

        // Set all the items required for the shape object.
        //shape.setOptions(this.options);
        //shape.setEmitter(emitter);

        this.shapes.push(shape);
        return shape;

    }

    /**
     * @method remove
     * @param {Shape} shape
     * @return {void}
     */
    public remove(shape: Shape): void {
        shape.remove();
        var index = this.shapes.indexOf(shape);
        this.shapes.splice(index, 1);
    }

    /**
     * @method all
     * @return {Shape[]}
     */
    public all(): Shape[] {
        return this.shapes;
    }

    /**
     * @method clear
     * @return {void}
     */
    public clear(): void {
        _.forEach(this.shapes, (shape) => this.remove(shape));
    }

    /**
     * @method instantiate
     * @param {String} name
     * @return {Shape}
     */
    private instantiate(name: string): Shape {

        var map = {
            rect: Rectangle
        };

        return new map[name.toLowerCase()];

    }

    /**
     * @method defaultOptions
     * @return {Object}
     */
    private defaultOptions(): Object {
        return {};
    }

}