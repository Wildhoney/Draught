/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export class Rectangle extends Shape {

    /**
     * @method addInterfaceMethods
     * @return {Object}
     */
    addInterfaceMethods() {

        return {
            width: (value) => this.dispatchAttributeEvent({ value: value })
        }

    }

}