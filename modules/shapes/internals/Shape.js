/**
 * @module Blueprint
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
class Shape {

    /**
     * @method getIdent
     * @return {String}
     */
    getIdent() {
        return this.getTag();
    }

    /**
     * @method setOptions
     * @param {Object} options
     * @return {void}
     */
    setOptions(options) {
        this.options = options;
    }

}