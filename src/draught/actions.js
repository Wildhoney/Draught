import { curry } from 'ramda'
import { META } from './types';

/**
 * @method setMeta
 * @param {Object} ref
 * @param {Object} shape
 * @param {Object} attrs
 * @return {Object}
 */
export const setMeta = curry((ref, shape, meta) => {
    return { type: META, ref, shape, meta };
});
