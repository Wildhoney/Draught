import { generate } from 'shortid';
import { META } from '../types';

/**
 * @constant INITIAL_STATE
 * @type {Array}
 */
const INITIAL_STATE = [
    {
        id: generate(),
        tag: 'rect',
        ref: null,
        meta: { selected: false },
        attrs: { fill: 'red', width: 50, height: 50 }
    }
];

/**
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        
        case META:

            const index = state.indexOf(action.shape);
            const model = state[index];

            return [
                ...state.slice(0, index),
                { ...model, ref: action.ref, [action.type]: { ...model[action.type], ...action[action.type] } },
                ...state.slice(index + 1)
            ];

    }

    return state;

};
