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

        let zMax = groups.size();

        // Ensure the maximum Z is above zero and below the maximum.
        if (group.datum().z < 1)    { group.datum().z = 1;    }
        if (group.datum().z > zMax) { group.datum().z = zMax; }

        var zTarget = group.datum().z, zCurrent = 1;

        // Initial sort into z-index order.
        groups.sort((a, b) => a.z - b.z);

        _.forEach(groups[0], (model) => {

            // Current group is immutable in this iteration.
            if (model === group.node()) {
                return;
            }

            // Skip the target Z index.
            if (zCurrent === zTarget) {
                zCurrent++;
            }

            let shape = d3.select(model),
                datum = shape.datum();
            datum.z = zCurrent++;
            shape.datum(datum);

        });

        // Final sort pass.
        groups.sort((a, b) => a.z - b.z);

    }

}