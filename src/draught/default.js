import React, { PropTypes } from 'react';
import { stitch } from 'keo';
import Shape from './components/shape';

/**
 * @method propTypes
 * @type {Object}
 */
const propTypes = {
    shapes: PropTypes.array.isRequired
};

/**
 * @method getDefaultProps
 * @return {Object}
 */
const getDefaultProps = () => {
    return { width: '100%', height: '100%' };
};

/**
 * @method render
 * @param {Object} props
 * @return {XML}
 */
const render = ({ props }) => {
    
    return (
        <svg width={props.width} height={props.height}>
            {props.shapes.map(model => <Shape key={model.id} {...props} model={model} />)}
        </svg>
    )

};

export default stitch({ propTypes, getDefaultProps, render }, state => state);
