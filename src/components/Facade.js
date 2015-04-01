export default class Facade {

    /**
     * @constructor
     * @param {Shape} shape
     * @return {Facade}
     */
    constructor(shape) {
        this.shape    = shape;
        this.selected = false;
    }

    /**
     * @method select
     * @return {void}
     */
    select() {
        this.shape.features.selectable.select();
        this.selected = true;
    }

    /**
     * @method deselect
     * @return {void}
     */
    deselect() {
        this.shape.features.selectable.deselect();
        this.selected = false;
    }

    /**
     * @method invert
     * @return {void}
     */
    invert() {
        this.selected = !this.selected;
    }

    /**
     * @method attribute
     * @param {String} property
     * @param {*} [value=null]
     * @return {*}
     */
    attribute(property, value = null) {

        if (value === null) {
            return this.shape.element.attr(property);
        }

        this.shape.element.datum()[property] = value;
        this.shape.element.attr(property, value);
        return this;

    }

    /**
     * @method transform
     * @param {Number} x
     * @param {Number} y
     * @return {*}
     */
    transform(x, y) {
        return this.attribute('transform', `translate(${x}, ${y})`);
    }

    /**
     * @method x
     * @param {Number} [x=null]
     * @return {*}
     */
    x(x = null) {

        if (x === null) {
            return this.parseTranslate(this.shape.element.datum().transform).x;
        }

        return this.transform(x, this.y());

    }

    /**
     * @method y
     * @param {Number} [y=null]
     * @return {*}
     */
    y(y = null) {

        if (y === null) {
            return this.parseTranslate(this.shape.element.datum().transform).y;
        }

        return this.transform(this.x(), y);

    }

    /**
     * @method dimension
     * @param {Number} height
     * @param {Number} width
     * @return {*}
     */
    dimension(height, width) {
        return this.height(height).width(width);
    }

    /**
     * @method height
     * @param {Number} [height]
     * @return {*}
     */
    height(height) {
        return this.attribute('height', height);
    }

    /**
     * @method width
     * @param {Number} [width]
     * @return {*}
     */
    width(width) {
        return this.attribute('width', width);
    }

    /**
     * @method getShape
     * @return {Shape}
     */
    getShape() {
        return this.shape;
    }

    /**
     * @method parseTranslate
     * @param {String} transform
     * @return {Object}
     */
    parseTranslate(transform) {
        let result = String(transform).match(/translate\(([0-9]+)\s*,\s*([0-9]+)/i);
        return { x: result[1], y: result[2] };
    }

    /**
     * @method isSelected
     * @return {Boolean}
     */
    isSelected() {
        return this.selected;
    }

}