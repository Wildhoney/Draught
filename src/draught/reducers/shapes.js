import { generate } from 'shortid';

/**
 * @constant INITIAL_STATE
 * @type {Array}
 */
const INITIAL_STATE = [
    { id: generate(), tag: 'rect', attributes: { fill: 'red', width: 50, height: 50 }}
];

/**
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export default (state = INITIAL_STATE, action) => {
    return state;
};
