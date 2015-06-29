/**
 * @module Draft
 * @submodule Reorder
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

 /*
 * @method reorder
 * @param {Array} groups
 * @param {Object} group
 * @return {Object}
 */
export default (groups, group) => {

    "use strict";

    const maxZ = groups.size();

    // Ensure the maximum Z is above zero and below the maximum.
    if (group.datum().z < 1)    { group.datum().z = 1;    }
    if (group.datum().z > maxZ) { group.datum().z = maxZ; }

    const targetZ  = group.datum().z;
    let   currentZ = 1;

    // Initial sort into z-index order.
    groups.sort((a, b) => a.z - b.z);

    groups[0].forEach((model) => {

        // Current group is immutable in this iteration.
        if (model === group.node()) {
            return;
        }

        // Skip the target Z index.
        if (currentZ === targetZ) {
            currentZ++;
        }

        const shape = d3.select(model);
        const datum = shape.datum();

        datum.z = currentZ++;
        shape.datum(datum);

    });

    // Final sort pass.
    groups.sort((a, b) => a.z - b.z);

};