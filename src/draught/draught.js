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
            <rect fill="red" x="100" y="100" width="200" height="200" />
        </svg>
    )

};

export default stitch({ getDefaultProps, render });
