import Symbols from './Symbols';

/**
 * @method tryInvoke
 * @param {Object} context
 * @param {String} functionName
 * @param {Array} options
 * @return {Boolean}
 */
const tryInvoke = (context, functionName, ...options) => {

    "use strict";

    if (typeof context[functionName] === 'function') {
        context[functionName](...options);
        return true;
    }

    return false;

};

/**
 * @method capitalize
 * @param {String} name
 * @return {string}
 */
const capitalize = (name) => {

    "use strict";

    return name.charAt(0).toUpperCase() + name.slice(1);

};

/**
 * @module Draft
 * @submodule Invocator
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default (() => {

    "use strict";

    return {

        /**
         * @method did
         * @param {String} type
         * @param {Array|Shape} shapes
         * @return {Boolean}
         */
        did(type, shapes) {

            shapes = Array.isArray(shapes) ? shapes : [shapes];

            return shapes.every((shape) => {
                return tryInvoke(shape, `did${capitalize(type)}`);
            });

        },

        /**
         * @method includeExclude
         * @param {Draft} draft
         * @param {Function} fn
         * @param {Object} [options={}]
         * @return {void}
         */
        includeExclude(draft, fn, options = {}) {

            const include   = options.include || undefined;
            const exclude   = options.exclude || undefined;
            const middleman = draft[Symbols.MIDDLEMAN];

            /**
             * @method allExcluding
             * @param {Array} excluding
             * @return {Array}
             */
            const allExcluding = (excluding) => {

                excluding = Array.isArray(excluding) ? excluding : [excluding];

                return middleman.all().filter((shape) => {
                    return !~excluding.indexOf(shape);
                });

            };

            if (include) {
                return void fn.apply(draft, [include]);
            }

            if (!exclude) {
                return void fn.apply(draft);
            }

            fn.apply(draft, [allExcluding(exclude)]);

        }

    };

})();