/**
 * @module Draft
 * @submodule Facade
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
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
     * @method remove
     * @return {void}
     */
    remove() {
        this.shape.group.remove();
        this.shape.accessor.remove(this);
    }

    /**
     * @method select
     * @return {Facade}
     */
    select() {
        this.shape.features.selectable.select();
        this.shape.accessor.hasSelected();
        return this;
    }

    /**
     * @method deselect
     * @return {Facade}
     */
    deselect() {
        this.shape.features.selectable.deselect();
        this.shape.accessor.hasSelected();
        return this;
    }

    /**
     * @method selectInvert
     * @return {Facade}
     */
    selectInvert() {

        if (this.selected) {
            this.deselect();
        } else {
            this.select();
        }

        this.shape.accessor.hasSelected();
        return this;

    }

    /**
     * @method attribute
     * @param {String} property
     * @param {*} [value=null]
     * @return {*}
     */
    attribute(property, value = null) {

        if (property === 'z') {

            // Special behaviour must be applied to the `z` property, because it is applied
            // to the group element, rather than directly to the shape element.
            return this.z(value);

        }

        if (value === null) {
            return this.shape.element.datum()[property];
        }

        this.shape.element.datum()[property] = value;
        this.shape.element.attr(property, value);
        return this;

    }

    /**
     * @method transform
     * @param {Number} [x=null]
     * @param {Number} [y=null]
     * @return {*}
     */
    transform(x = null, y = null) {
        return (x === null && y === null) ? [this.x(), this.y()]
                                          : this.attribute('transform', `translate(${x}, ${y})`);
    }

    /**
     * @method x
     * @param {Number} [x=null]
     * @return {*}
     */
    x(x = null) {
        return (x === null) ? this.parseTranslate(this.shape.element.datum().transform).x
                            : this.transform(x, this.y());
    }

    /**
     * @method y
     * @param {Number} [y=null]
     * @return {*}
     */
    y(y = null) {
        return (y === null) ? this.parseTranslate(this.shape.element.datum().transform).y
                            : this.transform(this.x(), y);
    }

    /**
     * @method z
     * @param {Number} z
     * @return {*}
     */
    z(z = null) {
        return (z === null) ? this.shape.group.datum().z
                            : this.shape.group.datum().z = z;
    }

    /**
     * @method dimension
     * @param {Number} [height=null]
     * @param {Number} [width=null]
     * @return {*}
     */
    dimension(height = null, width = null) {
        return (height === null && width === null) ? [this.height(), this.width()]
                                                   : this.height(height).width(width);
    }

    /**
     * @method height
     * @param {Number} [height=null]
     * @return {*}
     */
    height(height = null) {
        return this.attribute('height', height);
    }

    /**
     * @method width
     * @param {Number} [width=null]
     * @return {*}
     */
    width(width = null) {
        return this.attribute('width', width);
    }

    /**
     * @method boundingBox
     * @return {Object}
     */
    boundingBox() {
        return this.shape.group.node().getBBox();
    }

    /**
     * @method bringToFront
     * @return {Facade}
     */
    bringToFront() {
        this.attribute('z', Infinity);
        this.shape.accessor.reorder(this.shape.group);
        return this;
    }

    /**
     * @method bringForwards
     * @return {Facade}
     */
    bringForwards() {
        this.attribute('z', this.attribute('z') + 1);
        this.shape.accessor.reorder(this.shape.group);
        return this;
    }

    /**
     * @method sendToBack
     * @return {Facade}
     */
    sendToBack() {
        this.attribute('z', -Infinity);
        this.shape.accessor.reorder(this.shape.group);
        return this;
    }

    /**
     * @method sendBackwards
     * @return {Facade}
     */
    sendBackwards() {
        this.attribute('z', this.attribute('z') - 1);
        this.shape.accessor.reorder(this.shape.group);
        return this;
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
        return { x: parseInt(result[1]), y: parseInt(result[2]) };
    }

    /**
     * @method isSelected
     * @return {Boolean}
     */
    isSelected() {
        return this.selected;
    }

}