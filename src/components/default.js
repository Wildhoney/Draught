import React, { PropTypes } from 'react';
import { stitch } from 'keo';
import Shape from './shape';
import Selected from './selected';

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

    return (
        <g className="draught">
            <g className="guides">
                <Selected {...props} />
            </g>
            <g className="shapes">
                {props.shapes.map(model => <Shape key={model.id} {...props} model={model} />)}
            </g>
        </g>
    )

};

export default stitch({ propTypes, render }, state => state);
