import { generate } from 'shortid';
import { MOVE } from '../types';

/**
 * @constant INITIAL_STATE
 * @type {Array}
 */
const INITIAL_STATE = [
    { id: 1, tag: 'rect', attributes: { fill: 'red', width: 50, height: 50 }}
];

/**
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        
        case MOVE:
            return [{ id: 1, tag: 'rect', attributes: { fill: 'red', width: 50, height: 50, x: action.x, y: action.y }}];
        
    }

    return state;

};
