/**
 * @module Blueprint
 * @submodule ZIndex
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class ZIndex {

    /**
     * @method reorder
     * @param {Array} groups
     * @return {Object}
     */
    reorder(groups) {

        var min = 1, max = 1;

        groups.sort((a, b) => {

            if (a.z > max) { max = a.z }
            if (b.z > max) { max = b.z }
            if (a.z < min) { min = a.z }
            if (b.z < min) { min = b.z }

            return a.z - b.z;

        });

        return { min: min, max: max };

    }

}