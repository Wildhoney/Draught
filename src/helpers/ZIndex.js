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
     * @param {Object} group
     * @return {Object}
     */
    reorder(groups, group) {

        var maxZ = groups.size();

        if (group.datum().z > maxZ) {

            // Ensure the maximum Z is below the maximum.
            group.datum().z = maxZ;

        }

        if (group.datum().z < 1) {

            // Also ensure it's not below the minimum.
            group.datum().z = 1;

        }

        var targetZ  = group.datum().z,
            currentZ = 1;

        group = group.node();

        // Initial sort into z-index order.
        groups.sort((a, b) => a.z - b.z);

        _.forEach(groups[0], (model) => {

            if (model === group) {
                return;
            }

            // Skip the target Z index.
            if (currentZ === targetZ) {
                currentZ++;
            }

            var shape = d3.select(model),
                datum = shape.datum();
            datum.z = currentZ++;
            shape.datum(datum);

        });

        // Final sort pass.
        groups.sort((a, b) => a.z - b.z);

    }

}