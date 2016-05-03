import React, { PropTypes } from 'react';
import { stitch } from 'keo';
import { setMeta } from '../actions';

/**
 * @constant propTypes
 * @type {Object}
 */
const propTypes = {
    model: PropTypes.object.isRequired
};

/**
 * @method shouldComponentUpdate
 * @param {Object} id
 * @param {String} props
 * @return {boolean}
 */
const shouldComponentUpdate = ({ id, props }) => {
    const {ref} = props.model;
    return ref === null || ref === id;
};

/**
 * @method render
 * @param {Object} id
 * @param {Object} props
 * @param {Function} dispatch
 * @return {XML}
 */
const render = ({ id, props, dispatch }) => {

    const {model} = props;
    const meta = setMeta(id, model);

    return (
        <model.tag key={model.id} {...model.attrs}
                   onClick={() => dispatch(meta({ selected: !model.meta.selected }))} />
    );

};

export default stitch({ propTypes, shouldComponentUpdate, render });
