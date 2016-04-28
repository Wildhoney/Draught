import React, { PropTypes } from 'react';
import { stitch } from 'keo';
import { move } from './actions';

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
 * @param {Function} dispatch
 * @return {XML}
 */
const render = ({ props, dispatch }) => {

    /**
     * @method createShape
     * @param {Object} model
     * @return {XML}
     */
    const createShape = model => {
        return <model.tag key={model.id} {...model.attributes}
                          onMouseMove={event => dispatch(move({ x: event.pageX, y: event.pageY }))} />;
    };

    return (
        <svg width={props.width} height={props.height}>
            {props.shapes.map(model => createShape(model))}
        </svg>
    )

};

export default stitch({ propTypes, getDefaultProps, render }, state => state);
