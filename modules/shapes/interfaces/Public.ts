import PrivateInterface = require('./Private');

/**
 * @class PublicInterface
 * @extends PrivateInterface
 */
export class PublicInterface extends PrivateInterface {

    /**
     * @method width
     * @param {Number} value
     * @return {Number}
     */
    public width(value): number {
        return this.attr('width', value);
    }

}