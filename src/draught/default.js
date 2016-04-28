import React from 'react';
import { stitch } from 'keo';

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
            {props.shapes.map(model => <model.tag key={model.id} {...model.attributes} />)}
        </svg>
    )

};

export default stitch({ getDefaultProps, render }, state => state);
