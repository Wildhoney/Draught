(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersMiddlemanJs = require('./helpers/Middleman.js');

var _helpersMiddlemanJs2 = _interopRequireDefault(_helpersMiddlemanJs);

var _helpersSymbolsJs = require('./helpers/Symbols.js');

var _helpersSymbolsJs2 = _interopRequireDefault(_helpersSymbolsJs);

var _helpersPolyfillsJs = require('./helpers/Polyfills.js');

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Draft = (function () {

    /**
     * @constructor
     * @param {HTMLElement} element
     * @param {Object} [options={}]
     * @return {Draft}
     */

    function Draft(element) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Draft);

        this[_helpersSymbolsJs2['default'].SHAPES] = [];
        this[_helpersSymbolsJs2['default'].OPTIONS] = (Object.assign || _helpersPolyfillsJs.objectAssign)(this.getOptions(), options);
        this[_helpersSymbolsJs2['default'].MIDDLEMAN] = new _helpersMiddlemanJs2['default'](this);

        // Render the SVG component using the defined options.
        var width = this[_helpersSymbolsJs2['default'].OPTIONS].documentWidth;
        var height = this[_helpersSymbolsJs2['default'].OPTIONS].documentHeight;
        this[_helpersSymbolsJs2['default'].svg] = d3.select(element).attr('width', width).attr('height', height);
    }

    _createClass(Draft, [{
        key: 'addShape',

        /**
         * @method addShape
         * @param {Shape} shape
         */
        value: function addShape(shape) {

            this[_helpersSymbolsJs2['default'].SHAPES].push(shape);

            // Put the interface for interacting with Draft into the shape object.
            shape[_helpersSymbolsJs2['default'].MIDDLEMAN] = this[_helpersSymbolsJs2['default'].MIDDLEMAN];

            return shape;
        }
    }, {
        key: 'removeShape',

        /**
         * @method removeShape
         * @param {Shape} shape
         * @return {Number}
         */
        value: function removeShape(shape) {

            var shapes = this[_helpersSymbolsJs2['default'].SHAPES];
            var index = shapes.indexOf(shape);
            shapes.splice(index, 1);
            return shapes.length;
        }
    }, {
        key: 'getShapes',

        /**
         * @method getShapes
         * @return {Array}
         */
        value: function getShapes() {
            return this[_helpersSymbolsJs2['default'].SHAPES];
        }
    }, {
        key: 'getOptions',

        /**
         * @method getOptions
         * @return {Object}
         */
        value: function getOptions() {

            return this[_helpersSymbolsJs2['default'].OPTIONS] || {
                documentHeight: '100%',
                documentWidth: '100%',
                gridSize: 10
            };
        }
    }]);

    return Draft;
})();

exports['default'] = Draft;
module.exports = exports['default'];

},{"./helpers/Middleman.js":2,"./helpers/Polyfills.js":3,"./helpers/Symbols.js":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SymbolsJs = require('./Symbols.js');

var _SymbolsJs2 = _interopRequireDefault(_SymbolsJs);

/**
 * @module Draft
 * @submodule Middleman
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Middleman = (function () {

  /**
   * @constructor
   * @param {Draft} draft
   * @return {Facade}
   */

  function Middleman(draft) {
    _classCallCheck(this, Middleman);

    this[_SymbolsJs2['default'].draft] = draft;
  }

  _createClass(Middleman, [{
    key: 'getShapes',

    /**
     * @method getShapes
     * @return {Array}
     */
    value: function getShapes() {
      return this[_SymbolsJs2['default'].draft].getShapes();
    }
  }]);

  return Middleman;
})();

exports['default'] = Middleman;
module.exports = exports['default'];

},{"./Symbols.js":4}],3:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Polyfills
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.objectAssign = objectAssign;

function objectAssign(target) {

    "use strict";

    if (target === undefined || target === null) {
        throw new TypeError("Cannot convert first argument to object");
    }

    var to = Object(target);

    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));

        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }

    return to;
}

},{}],4:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Symbols
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  DRAFT: Symbol('draft'),
  SVG: Symbol('svg'),
  MIDDLEMAN: Symbol('middleman'),
  SHAPES: Symbol('shapes'),
  OPTIONS: Symbol('options')
};
module.exports = exports['default'];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NaWRkbGVtYW4uanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Qb2x5ZmlsbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9TeW1ib2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tDQ0EyQix3QkFBd0I7Ozs7Z0NBQ3hCLHNCQUFzQjs7OztrQ0FDdEIsd0JBQXdCOzs7Ozs7OztJQU85QixLQUFLOzs7Ozs7Ozs7QUFRWCxhQVJNLEtBQUssQ0FRVixPQUFPLEVBQWdCO1lBQWQsT0FBTyxnQ0FBRyxFQUFFOzs4QkFSaEIsS0FBSzs7QUFVbEIsWUFBSSxDQUFDLDhCQUFRLE1BQU0sQ0FBQyxHQUFNLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsOEJBQVEsT0FBTyxDQUFDLEdBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSx3QkFsQnhDLFlBQVksQ0FrQjRDLENBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RGLFlBQUksQ0FBQyw4QkFBUSxTQUFTLENBQUMsR0FBRyxvQ0FBYyxJQUFJLENBQUMsQ0FBQzs7O0FBRzlDLFlBQU0sS0FBSyxHQUFTLElBQUksQ0FBQyw4QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDeEQsWUFBTSxNQUFNLEdBQVEsSUFBSSxDQUFDLDhCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUN6RCxZQUFJLENBQUMsOEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0s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LElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUN2QyxrQkFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNyQztTQUNKO0tBQ0o7O0FBRUQsV0FBTyxFQUFFLENBQUM7Q0FFYjs7Ozs7Ozs7Ozs7Ozs7cUJDOUJjO0FBQ1gsT0FBSyxFQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDMUIsS0FBRyxFQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDeEIsV0FBUyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDOUIsUUFBTSxFQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDM0IsU0FBTyxFQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUM7Q0FDL0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4uanMnO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzLmpzJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuL2hlbHBlcnMvUG9seWZpbGxzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge0RyYWZ0fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5TSEFQRVNdICAgID0gW107XG4gICAgICAgIHRoaXNbU3ltYm9scy5PUFRJT05TXSAgID0gKE9iamVjdC5hc3NpZ24gfHwgb2JqZWN0QXNzaWduKSh0aGlzLmdldE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbmV3IE1pZGRsZW1hbih0aGlzKTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIFNWRyBjb21wb25lbnQgdXNpbmcgdGhlIGRlZmluZWQgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2lkdGggICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRXaWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5zdmddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFNoYXBlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKi9cbiAgICBhZGRTaGFwZShzaGFwZSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5TSEFQRVNdLnB1c2goc2hhcGUpO1xuXG4gICAgICAgIC8vIFB1dCB0aGUgaW50ZXJmYWNlIGZvciBpbnRlcmFjdGluZyB3aXRoIERyYWZ0IGludG8gdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgc2hhcGVbU3ltYm9scy5NSURETEVNQU5dID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVTaGFwZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHJlbW92ZVNoYXBlKHNoYXBlKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHNoYXBlcy5pbmRleE9mKHNoYXBlKTtcbiAgICAgICAgc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZXNcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBzeW1ib2xzIGZyb20gJy4vU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNaWRkbGVtYW5cbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZGRsZW1hbiB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkcmFmdCkge1xuICAgICAgICB0aGlzW3N5bWJvbHMuZHJhZnRdID0gZHJhZnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZXNcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBnZXRTaGFwZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW3N5bWJvbHMuZHJhZnRdLmdldFNoYXBlcygpO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgIFN5bWJvbCgnZHJhZnQnKSxcbiAgICBTVkc6ICAgICAgIFN5bWJvbCgnc3ZnJyksXG4gICAgTUlERExFTUFOOiBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFUzogICAgU3ltYm9sKCdzaGFwZXMnKSxcbiAgICBPUFRJT05TOiAgIFN5bWJvbCgnb3B0aW9ucycpXG59Il19
