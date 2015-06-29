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

        }

    };

})();