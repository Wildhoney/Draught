import React, { PropTypes } from 'react';
import { stitch } from 'keo';

/**
 * @constant propTypes
 * @type {Object}
 */
const propTypes = {
    shapes: PropTypes.array.isRequired
};

/**
 * @method render
 * @param {Object} props
 * @return {XML}
 */
const render = ({ props }) => {

    const selected = props.shapes.filter(x => x.meta.selected);
    const xCoords = selected.map(x => x.attrs.x);
    const yCoords = selected.map(x => x.attrs.y);

    if (xCoords) {

        const minX = Math.min(...[xCoords]);
        const maxX = Math.max(...[xCoords]);
        const minY = Math.min(...[yCoords]);
        const maxY = Math.max(...[yCoords]);

        console.log(minX, maxX, minY, maxY);

    }

    return (
        <rect fill="red" />
    );

};

export default stitch({ propTypes, render });
