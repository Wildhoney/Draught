/**
 * @module Blueprint
 * @submodule Layers
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Layers {

    /**
     * @method reorder
     * @param {Array} groups
     * @return {Object}
     */
    reorder(groups) {

        var max = 1;

        groups.sort((a, b) => {

            if (a.z > max) { max = a.z }
            if (b.z > max) { max = b.z }

            return a.z - b.z;

        });

        return max;

    }

}