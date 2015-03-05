import Interface from './../Shape.js';

/**
 * @class Rectangle
 * @extends Shape
 */
export class Rectangle extends Shape {

    /**
     * @method addInterfaceMethods
     */
    public function addInterfaceMethods() {

        return {
            width: (value) => this.dispatchAttributeEvent({ value: value })
        }

    }

}