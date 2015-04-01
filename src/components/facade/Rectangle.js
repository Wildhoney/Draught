import Facade from './../Facade.js';

export default class Rectangle extends Facade {

    /**
     * @method fill
     * @param {String} colour
     * @return {Rectangle}
     */
    fill(colour) {
        return this.attribute('fill', colour);
    }

}