import Shape     from './../Shape.js';
import Interface from './../interfaces/Circle.js';
import utility   from './../../helpers/Utility.js';

/**
 * @module Draft
 * @submodule Circle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Circle extends Shape {

    /**
     * @method getTag
     * @return {String}
     */
    getTag() {
        return 'circle';
    }

    /**
     * @method addInterface
     * @return {Interface}
     */
    addInterface() {
        return new Interface(this.label);
    }

    /**
     * @method addAttributes
     * @return {Object}
     */
    addAttributes() {
        let transform = utility.pointsToTransform(200, 200).transform;
        return { fill: 'red', width: 100, height: 100, r: 50, transform: transform };
    }

}