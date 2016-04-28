import { MOVE } from './types';

/**
 * @method move
 * @param {Number} x
 * @param {Number} y
 * @return {Object}
 */
export const move = ({ x, y }) => {
    return { type: MOVE, x, y };
};
