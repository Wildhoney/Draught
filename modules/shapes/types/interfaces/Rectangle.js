/**
 * @module Blueprint
 * @submodule RectInterface
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class RectangleInterface {

    /**
     * @method width
     * @param {Number} value
     * @return {RectangleInterface}
     */
    width(value) {
        this.shape.set('width', value);
        return this;
    }

    /**
     * @method height
     * @param {Number} value
     * @return {RectangleInterface}
     */
    height(value) {
        this.shape.set('height', value);
        return this;
    }

    /**
     * @method x
     * @param {Number} value
     * @return {RectangleInterface}
     */
    x(value) {
        this.shape.set('x', value);
        return this;
    }

    /**
     * @method y
     * @param {Number} value
     * @return {RectangleInterface}
     */
    y(value) {
        this.shape.set('y', value);
        return this;
    }

    /**
     * @method remove
     * @return {RectangleInterface}
     */
    remove() {
        this.shape.remove();
        return this;
    }

}