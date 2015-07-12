(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersMiddleman = require('./helpers/Middleman');

var _helpersMiddleman2 = _interopRequireDefault(_helpersMiddleman);

var _helpersSymbols = require('./helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

var _helpersBoundingBox = require('./helpers/BoundingBox');

var _helpersBoundingBox2 = _interopRequireDefault(_helpersBoundingBox);

var _helpersPolyfills = require('./helpers/Polyfills');

var _helpersInvocator = require('./helpers/Invocator');

var _helpersInvocator2 = _interopRequireDefault(_helpersInvocator);

var _helpersMapper = require('./helpers/Mapper');

var _helpersMapper2 = _interopRequireDefault(_helpersMapper);

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
        var _this = this;

        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Draft);

        this[_helpersSymbols2['default'].SHAPES] = [];
        this[_helpersSymbols2['default'].OPTIONS] = (Object.assign || _helpersPolyfills.objectAssign)(this.options(), options);
        var middleman = this[_helpersSymbols2['default'].MIDDLEMAN] = new _helpersMiddleman2['default'](this);
        this[_helpersSymbols2['default'].BOUNDING_BOX] = new _helpersBoundingBox2['default'](middleman);

        // Render the SVG component using the defined options.
        var width = this[_helpersSymbols2['default'].OPTIONS].documentWidth;
        var height = this[_helpersSymbols2['default'].OPTIONS].documentHeight;
        var svg = this[_helpersSymbols2['default'].SVG] = d3.select(element).attr('width', width).attr('height', height);

        var stopPropagation = function stopPropagation() {
            return d3.event.stopPropagation();
        };
        this[_helpersSymbols2['default'].LAYERS] = {
            shapes: svg.append('g').attr('class', 'shapes').on('click', stopPropagation),
            markers: svg.append('g').attr('class', 'markers').on('click', stopPropagation)
        };

        // Deselect all shapes when the canvas is clicked.
        svg.on('click', function () {

            if (!middleman.preventDeselect()) {
                _this.deselect();
            }

            middleman.preventDeselect(false);
        });
    }

    _createClass(Draft, [{
        key: 'add',

        /**
         * @method add
         * @param {Shape|String} shape
         * @return {Shape}
         */
        value: function add(shape) {

            // Resolve the shape name to the shape object, if the user has passed the shape
            // as a string.
            shape = typeof shape === 'string' ? (0, _helpersMapper2['default'])(shape) : shape;

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            shapes.push(shape);

            // Put the interface for interacting with Draft into the shape object.
            shape[_helpersSymbols2['default'].MIDDLEMAN] = this[_helpersSymbols2['default'].MIDDLEMAN];
            _helpersInvocator2['default'].did('add', shape);

            return shape;
        }
    }, {
        key: 'remove',

        /**
         * @method remove
         * @param {Shape} shape
         * @return {Number}
         */
        value: function remove(shape) {

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            var index = shapes.indexOf(shape);

            shapes.splice(index, 1);
            _helpersInvocator2['default'].did('remove', shape);

            return shapes.length;
        }
    }, {
        key: 'clear',

        /**
         * @method clear
         * @return {Number}
         */
        value: function clear() {

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            _helpersInvocator2['default'].did('remove', shapes);
            shapes.length = 0;

            return shapes.length;
        }
    }, {
        key: 'all',

        /**
         * @method all
         * @return {Array}
         */
        value: function all() {
            return this[_helpersSymbols2['default'].SHAPES];
        }
    }, {
        key: 'select',

        /**
         * @method select
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function select() {
            var shapes = arguments[0] === undefined ? this.all() : arguments[0];

            _helpersInvocator2['default'].did('select', shapes);
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].markers);
        }
    }, {
        key: 'deselect',

        /**
         * @method deselect
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function deselect() {
            var shapes = arguments[0] === undefined ? this.all() : arguments[0];

            _helpersInvocator2['default'].did('deselect', shapes);
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].markers);
        }
    }, {
        key: 'selected',

        /**
         * @method selected
         * @return {Array}
         */
        value: function selected() {
            return this.all().filter(function (shape) {
                return shape.isSelected();
            });
        }
    }, {
        key: 'options',

        /**
         * @method options
         * @return {Object}
         */
        value: function options() {

            return this[_helpersSymbols2['default'].OPTIONS] || {
                documentHeight: '100%',
                documentWidth: '100%',
                gridSize: 10
            };
        }
    }]);

    return Draft;
})();

(function ($window) {

    'use strict';

    if ($window) {

        // Export draft if the `window` object is available.
        $window.Draft = Draft;
    }
})(window);

// Export for use in ES6 applications.
exports['default'] = Draft;
module.exports = exports['default'];

},{"./helpers/BoundingBox":6,"./helpers/Invocator":7,"./helpers/Mapper":9,"./helpers/Middleman":10,"./helpers/Polyfills":11,"./helpers/Symbols":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbols = require('../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Ability = (function () {
  function Ability() {
    _classCallCheck(this, Ability);
  }

  _createClass(Ability, [{
    key: 'shape',

    /**
     * @method shape
     * @return {Ability}
     */
    value: function shape() {
      return this[_helpersSymbols2['default'].SHAPE];
    }
  }, {
    key: 'middleman',

    /**
     * @method middleman
     * @return {Middleman}
     */
    value: function middleman() {
      return this.shape()[_helpersSymbols2['default'].MIDDLEMAN];
    }
  }]);

  return Ability;
})();

exports['default'] = Ability;
module.exports = exports['default'];

},{"../helpers/Symbols":12}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

/**
 * @module Draft
 * @submodule Resizable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Resizable = (function (_Ability) {

    /**
     * @constructor
     * @return {Resizable}
     */

    function Resizable() {
        _classCallCheck(this, Resizable);

        _get(Object.getPrototypeOf(Resizable.prototype), 'constructor', this).call(this);
        this.RADIUS = 22;
        this.edges = {};
    }

    _inherits(Resizable, _Ability);

    _createClass(Resizable, [{
        key: 'didSelect',

        /**
         * @method didSelect
         * @return {void}
         */
        value: function didSelect() {
            this.reattachHandles();
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this.detachHandles();
        }
    }, {
        key: 'reattachHandles',

        /**
         * @method reattachHandles
         * @return {void}
         */
        value: function reattachHandles() {
            this.detachHandles();
            this.attachHandles();
        }
    }, {
        key: 'attachHandles',

        /**
         * @method attachHandles
         * @return {void}
         */
        value: function attachHandles() {
            var _this = this;

            var shape = this.shape();
            var layer = this.middleman().layers().markers;
            this.handles = layer.append('g').attr('class', 'resize-handles');

            var x = shape.attr('x');
            var y = shape.attr('y');
            var width = shape.attr('width');
            var height = shape.attr('height');

            var edgeMap = {
                topLeft: { x: x, y: y },
                topMiddle: { x: x + width / 2, y: y },
                topRight: { x: x + width, y: y },
                leftMiddle: { x: x, y: y + height / 2 },
                bottomLeft: { x: x, y: y + height },
                bottomMiddle: { x: x + width / 2, y: y + height },
                bottomRight: { x: x + width, y: y + height },
                rightMiddle: { x: x + width, y: y + height / 2 }
            };

            Object.keys(edgeMap).forEach(function (key) {

                var edge = edgeMap[key];
                var dragBehaviour = _this.drag(shape, key);

                _this.edges[key] = _this.handles.append('image').attr('xlink:href', 'images/handle-main.png').attr('x', edge.x - _this.RADIUS / 2).attr('y', edge.y - _this.RADIUS / 2).attr('stroke', 'red').attr('stroke-width', 3).attr('width', _this.RADIUS).attr('height', _this.RADIUS).on('click', function () {
                    return d3.event.stopPropagation();
                }).call(d3.behavior.drag().on('dragstart', dragBehaviour.start).on('drag', dragBehaviour.drag).on('dragend', dragBehaviour.end));
            });
        }
    }, {
        key: 'detachHandles',

        /**
         * @method detachHandles
         * @return {void}
         */
        value: function detachHandles() {

            if (this.handles) {
                this.handles.remove();
            }
        }
    }, {
        key: 'popUnique',

        /**
         * @method popUnique
         * @param {Array} items
         * @return {Number}
         */
        value: function popUnique(items) {

            var counts = {};

            for (var index = 0; index < items.length; index++) {
                var num = items[index];
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }

            var unique = Object.keys(counts).filter(function (key) {
                return counts[key] === 1;
            });

            return unique.length ? Number(unique[0]) : items[0];
        }
    }, {
        key: 'shiftHandles',

        /**
         * @method shiftHandles
         * @param {String} currentKey
         * @return {void}
         */
        value: function shiftHandles(currentKey) {
            var _this2 = this;

            var coords = [];
            var regExp = /(?=[A-Z])/;
            var dimensions = Object.keys(this.edges);

            dimensions.forEach(function (key) {

                // Package all of the coordinates up into a more simple `coords` object for brevity.
                var edge = _this2.edges[key];
                coords[key] = { x: Number(edge.attr('x')), y: Number(edge.attr('y')) };
            });

            /**
             * @property cornerPositions
             * @type {{top: Number, right: Number, bottom: Number, left: Number}}
             */
            var cornerPositions = {

                // Find the coordinate that doesn't match the others, which means that is the coordinate that is currently
                // being modified without any conditional statements.
                top: this.popUnique([coords.topLeft.y, coords.topMiddle.y, coords.topRight.y]),
                right: this.popUnique([coords.topRight.x, coords.rightMiddle.x, coords.bottomRight.x]),
                bottom: this.popUnique([coords.bottomLeft.y, coords.bottomMiddle.y, coords.bottomRight.y]),
                left: this.popUnique([coords.topLeft.x, coords.leftMiddle.x, coords.bottomLeft.x])

            };

            /**
             * @constant middlePositions
             * @type {{topMiddle: number, rightMiddle: number, bottomMiddle: number, leftMiddle: number}}
             */
            var middlePositions = {

                // All of these middle positions are relative to the corner positions above.
                topMiddle: (cornerPositions.left + cornerPositions.right) / 2,
                rightMiddle: (cornerPositions.top + cornerPositions.bottom) / 2,
                bottomMiddle: (cornerPositions.left + cornerPositions.right) / 2,
                leftMiddle: (cornerPositions.top + cornerPositions.bottom) / 2

            };

            dimensions.forEach(function (key) {

                if (currentKey !== key) {

                    var parts = key.split(regExp).map(function (key) {
                        return key.toLowerCase();
                    });

                    if (parts[1] === 'middle') {

                        if (key === 'topMiddle' || key === 'bottomMiddle') {
                            _this2.edges[key].attr('y', cornerPositions[parts[0]]);
                            _this2.edges[key].attr('x', middlePositions[key]);
                            return;
                        }

                        _this2.edges[key].attr('y', middlePositions[key]);
                        _this2.edges[key].attr('x', cornerPositions[parts[0]]);
                        return;
                    }

                    _this2.edges[key].attr('y', cornerPositions[parts[0]]);
                    _this2.edges[key].attr('x', cornerPositions[parts[1]]);
                }
            });
        }
    }, {
        key: 'drag',

        /**
         * @method drag
         * @param {Shape} shape
         * @param {String} key
         * @return {{start: Function, drag: Function, end: Function}}
         */
        value: function drag(shape, key) {

            var middleman = this.middleman();
            var handles = this.handles;
            var radius = this.RADIUS;
            var reattachHandles = this.reattachHandles.bind(this);
            var shiftHandles = this.shiftHandles.bind(this);
            var startX = undefined,
                startY = undefined,
                ratio = undefined;

            return {

                /**
                 * @method start
                 * @return {{x: Number, y: Number}}
                 */
                start: function start() {

                    middleman.preventDeselect(true);

                    var handle = d3.select(this).classed('dragging', true);
                    ratio = shape.attr('width') / shape.attr('height');

                    startX = d3.event.sourceEvent.pageX - parseInt(handle.attr('x'));
                    startY = d3.event.sourceEvent.pageY - parseInt(handle.attr('y'));

                    return { x: startX, y: startY };
                },

                /**
                 * @method drag
                 * @return {{x: Number, y: Number}}
                 */
                drag: function drag() {

                    var options = middleman.options();
                    var handle = d3.select(this);
                    var moveX = d3.event.sourceEvent.pageX - startX;
                    var moveY = d3.event.sourceEvent.pageY - startY;
                    var finalX = Math.ceil(moveX / options.gridSize) * options.gridSize;
                    var finalY = Math.ceil(moveY / options.gridSize) * options.gridSize;
                    var bBox = handles.node().getBBox();

                    if (key !== 'topMiddle' && key !== 'bottomMiddle') {
                        handle.attr('x', finalX);
                    }

                    if (key !== 'rightMiddle' && key !== 'leftMiddle') {
                        handle.attr('y', finalY);
                    }

                    shiftHandles(key);

                    shape.attr('x', bBox.x + radius / 2).attr('y', bBox.y + radius / 2).attr('height', bBox.height - radius).attr('width', bBox.width - radius);

                    return { x: finalX, y: finalY };
                },

                /**
                 * @method end
                 * @return {void}
                 */
                end: function end() {
                    middleman.select([shape]);
                    reattachHandles();
                }

            };
        }
    }]);

    return Resizable;
})(_Ability3['default']);

exports['default'] = Resizable;
module.exports = exports['default'];

},{"./Ability":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _helpersSymbols = require('./../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Selectable = (function (_Ability) {
    function Selectable() {
        _classCallCheck(this, Selectable);

        _get(Object.getPrototypeOf(Selectable.prototype), 'constructor', this).apply(this, arguments);
    }

    _inherits(Selectable, _Ability);

    _createClass(Selectable, [{
        key: 'didAdd',

        /**
         * @method didAdd
         * @return {void}
         */
        value: function didAdd() {
            var _this = this;

            var element = this.shape()[_helpersSymbols2['default'].ELEMENT];
            element.on('click', this.handleClick.bind(this));
            element.call(d3.behavior.drag().on('drag', function () {
                return _this.handleDrag();
            }));
        }
    }, {
        key: 'handleDrag',

        /**
         * @method handleDrag
         * @return {Object}
         */
        value: function handleDrag() {

            this.handleClick();

            var middleman = this.shape()[_helpersSymbols2['default'].MIDDLEMAN];
            middleman.preventDeselect(true);

            // Create a fake event to drag the shape with an override X and Y value.
            var event = new MouseEvent('mousedown', { bubbles: true, cancelable: false });
            event.overrideX = d3.event.sourceEvent.pageX;
            event.overrideY = d3.event.sourceEvent.pageY;

            var bBox = middleman.boundingBox().bBox.node();
            bBox.dispatchEvent(event);
            return event;
        }
    }, {
        key: 'handleClick',

        /**
         * @method handleClick
         * @return {void}
         */
        value: function handleClick() {

            var keyMap = this.middleman()[_helpersSymbols2['default'].KEY_MAP];

            if (this.shape().isSelected()) {

                if (!keyMap.multiSelect) {

                    // Deselect all others and select only the current shape.
                    return void this.middleman().deselect({ exclude: this.shape() });
                }

                // Deselect the shape if it's currently selected.
                return void this.middleman().deselect({ include: this.shape() });
            }

            if (!keyMap.multiSelect) {

                // Deselect all shapes except for the current.
                this.middleman().deselect({ exclude: this.shape() });
            }

            this.middleman().select({ include: this.shape() });
        }
    }]);

    return Selectable;
})(_Ability3['default']);

exports['default'] = Selectable;
module.exports = exports['default'];

},{"./../helpers/Symbols":12,"./Ability":2}],5:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Attributes
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

/*
 * @method setAttribute
 * @param {Array} element
 * @param {String} name
 * @param {*} value
 * @return {void}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = function (element, name, value) {

    'use strict';

    switch (name) {

        case 'x':
            var y = element.datum().y || 0;
            return void element.attr('transform', 'translate(' + value + ', ' + y + ')');

        case 'y':
            var x = element.datum().x || 0;
            return void element.attr('transform', 'translate(' + x + ', ' + value + ')');

    }

    element.attr(name, value);
};

module.exports = exports['default'];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var BoundingBox = (function () {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {BoundingBox}
     */

    function BoundingBox(middleman) {
        _classCallCheck(this, BoundingBox);

        this[_Symbols2['default'].MIDDLEMAN] = middleman;
    }

    _createClass(BoundingBox, [{
        key: 'handleClick',

        /**
         * @method handleClick
         * @return {void}
         */
        value: function handleClick() {

            var middleman = this[_Symbols2['default'].MIDDLEMAN];
            d3.event.stopPropagation();

            if (middleman.preventDeselect()) {
                middleman.preventDeselect(false);
                return;
            }

            var mouseX = d3.event.pageX;
            var mouseY = d3.event.pageY;

            this.bBox.attr('pointer-events', 'none');
            var element = document.elementFromPoint(mouseX, mouseY);
            this.bBox.attr('pointer-events', 'all');

            if (middleman.fromElement(element)) {
                var _event = new MouseEvent('click', { bubbles: true, cancelable: false });
                element.dispatchEvent(_event);
            }
        }
    }, {
        key: 'drawBoundingBox',

        /**
         * @method drawBoundingBox
         * @param {Array} selected
         * @param {Object} layer
         * @return {void}
         */
        value: function drawBoundingBox(selected, layer) {
            var _d3$behavior$drag$on$on,
                _d3$behavior$drag$on,
                _d3$behavior$drag,
                _this = this;

            if (this.bBox) {
                this.bBox.remove();
            }

            if (selected.length === 0) {
                return;
            }

            var model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

            /**
             * Responsible for computing the collective bounding box, based on all of the bounding boxes
             * from the current selected shapes.
             *
             * @method compute
             * @param {Array} bBoxes
             * @return {void}
             */
            var compute = function compute(bBoxes) {
                model.minX = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.x;
                })));
                model.minY = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.y;
                })));
                model.maxX = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.x + d.width;
                })));
                model.maxY = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.y + d.height;
                })));
            };

            // Compute the collective bounding box.
            compute(selected.map(function (shape) {
                return shape.boundingBox();
            }));

            this.bBox = layer.append('rect').datum(model).classed('drag-box', true).attr('x', function (d) {
                return d.minX;
            }).attr('y', function (d) {
                return d.minY;
            }).attr('width', function (d) {
                return d.maxX - d.minX;
            }).attr('height', function (d) {
                return d.maxY - d.minY;
            }).on('click', this.handleClick.bind(this));

            var dragStart = ['dragstart', function () {
                return _this.dragStart();
            }];
            var drag = ['drag', function () {
                return _this.drag();
            }];
            var dragEnd = ['dragend', function () {
                return _this.dragEnd();
            }];

            this.bBox.call((_d3$behavior$drag$on$on = (_d3$behavior$drag$on = (_d3$behavior$drag = d3.behavior.drag()).on.apply(_d3$behavior$drag, dragStart)).on.apply(_d3$behavior$drag$on, drag)).on.apply(_d3$behavior$drag$on$on, dragEnd));
        }
    }, {
        key: 'dragStart',

        /**
         * @method dragStart
         * @param {Number} [x=null]
         * @param {Number} [y=null]
         * @return {void}
         */
        value: function dragStart() {
            var x = arguments[0] === undefined ? null : arguments[0];
            var y = arguments[1] === undefined ? null : arguments[1];

            var sX = Number(this.bBox.attr('x'));
            var sY = Number(this.bBox.attr('y'));

            this.start = {
                x: x !== null ? x : (d3.event.sourceEvent.overrideX || d3.event.sourceEvent.pageX) - sX,
                y: y !== null ? y : (d3.event.sourceEvent.overrideY || d3.event.sourceEvent.pageY) - sY
            };

            this.move = {
                start: { x: sX, y: sY },
                end: {}
            };
        }
    }, {
        key: 'drag',

        /**
         * @method drag
         * @param {Number} [x=null]
         * @param {Number} [y=null]
         * @param {Number} [multipleOf=this[Symbols.MIDDLEMAN].options().gridSize]
         * @return {void}
         */
        value: function drag() {
            var x = arguments[0] === undefined ? null : arguments[0];
            var y = arguments[1] === undefined ? null : arguments[1];
            var multipleOf = arguments[2] === undefined ? this[_Symbols2['default'].MIDDLEMAN].options().gridSize : arguments[2];

            this[_Symbols2['default'].MIDDLEMAN].preventDeselect(true);

            x = x !== null ? x : d3.event.sourceEvent.pageX;
            y = y !== null ? y : d3.event.sourceEvent.pageY;

            var mX = x - this.start.x,
                mY = y - this.start.y,
                eX = Math.ceil(mX / multipleOf) * multipleOf,
                eY = Math.ceil(mY / multipleOf) * multipleOf;

            this.bBox.datum().x = eX;
            this.bBox.datum().y = eY;

            this.bBox.attr('x', eX);
            this.bBox.attr('y', eY);

            this.move.end = { x: eX, y: eY };
        }
    }, {
        key: 'dragEnd',

        /**
         * @method dragEnd
         * @return {void}
         */
        value: function dragEnd() {

            var eX = this.move.end.x - this.move.start.x;
            var eY = this.move.end.y - this.move.start.y;

            if (isNaN(eX) || isNaN(eY)) {
                return;
            }

            // Move each shape by the delta between the start and end points.
            this[_Symbols2['default'].MIDDLEMAN].selected().forEach(function (shape) {

                var currentX = shape.attr('x');
                var currentY = shape.attr('y');
                var moveX = currentX + eX;
                var moveY = currentY + eY;

                shape.attr('x', moveX).attr('y', moveY);
                shape.didMove();
            });
        }
    }]);

    return BoundingBox;
})();

exports['default'] = BoundingBox;
module.exports = exports['default'];

},{"./Symbols":12}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @method tryInvoke
 * @param {Object} context
 * @param {String} functionName
 * @param {Array} options
 * @return {Boolean}
 */
var tryInvoke = function tryInvoke(context, functionName) {

    'use strict';

    for (var _len = arguments.length, options = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        options[_key - 2] = arguments[_key];
    }

    if (typeof context[functionName] === 'function') {
        context[functionName].apply(context, options);
        return true;
    }

    return false;
};

/**
 * @method capitalize
 * @param {String} name
 * @return {string}
 */
var capitalize = function capitalize(name) {

    'use strict';

    return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * @module Draft
 * @submodule Invocator
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports['default'] = (function () {

    'use strict';

    return {

        /**
         * @method did
         * @param {String} type
         * @param {Array|Shape} shapes
         * @return {Boolean}
         */
        did: function did(type, shapes) {

            shapes = Array.isArray(shapes) ? shapes : [shapes];

            return shapes.every(function (shape) {
                return tryInvoke(shape, 'did' + capitalize(type));
            });
        },

        /**
         * @method includeExclude
         * @param {Draft} draft
         * @param {Function} fn
         * @param {Object} [options={}]
         * @return {void}
         */
        includeExclude: function includeExclude(draft, fn) {
            var options = arguments[2] === undefined ? {} : arguments[2];

            var include = options.include || undefined;
            var exclude = options.exclude || undefined;
            var middleman = draft[_Symbols2['default'].MIDDLEMAN];

            /**
             * @method allExcluding
             * @param {Array} excluding
             * @return {Array}
             */
            var allExcluding = function allExcluding(excluding) {

                excluding = Array.isArray(excluding) ? excluding : [excluding];

                return middleman.all().filter(function (shape) {
                    return ! ~excluding.indexOf(shape);
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

module.exports = exports['default'];

},{"./Symbols":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @module Draft
 * @submodule KeyBindings
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var KeyBindings = (function () {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {KeyBindings}
     */

    function KeyBindings(middleman) {
        _classCallCheck(this, KeyBindings);

        var keyMap = middleman[_Symbols2['default'].KEY_MAP];
        this[_Symbols2['default'].MIDDLEMAN] = middleman;

        // Default kep mappings
        keyMap.multiSelect = false;
        keyMap.aspectRatio = false;

        // Listen for changes to the key map.
        this.attachBindings(keyMap);
    }

    _createClass(KeyBindings, [{
        key: 'attachBindings',

        /**
         * @method attachBindings
         * @param {Object} keyMap
         * @return {void}
         */
        value: function attachBindings(keyMap) {
            var _this = this;

            // Select all of the available shapes.
            Mousetrap.bind('mod+a', function () {
                return _this[_Symbols2['default'].MIDDLEMAN].select();
            });

            // Multi-selecting shapes.
            Mousetrap.bind('mod', function () {
                return keyMap.multiSelect = true;
            }, 'keydown');
            Mousetrap.bind('mod', function () {
                return keyMap.multiSelect = false;
            }, 'keyup');

            // Maintain aspect ratios when resizing.
            Mousetrap.bind('shift', function () {
                return keyMap.aspectRatio = true;
            }, 'keydown');
            Mousetrap.bind('shift', function () {
                return keyMap.aspectRatio = false;
            }, 'keyup');
        }
    }]);

    return KeyBindings;
})();

exports['default'] = KeyBindings;
module.exports = exports['default'];

},{"./Symbols":12}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersThrow = require('../helpers/Throw');

var _helpersThrow2 = _interopRequireDefault(_helpersThrow);

var _shapesRectangle = require('../shapes/Rectangle');

var _shapesRectangle2 = _interopRequireDefault(_shapesRectangle);

/**
 * @module Draft
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports['default'] = function (name) {

    'use strict';

    var map = {
        rectangle: _shapesRectangle2['default']
    };

    return typeof map[name] !== 'undefined' ? new map[name]() : new _helpersThrow2['default']('Cannot map "' + name + '" to a shape object');
};

module.exports = exports['default'];

},{"../helpers/Throw":13,"../shapes/Rectangle":14}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

var _KeyBindings = require('./KeyBindings');

var _KeyBindings2 = _interopRequireDefault(_KeyBindings);

var _Invocator = require('./Invocator');

var _Invocator2 = _interopRequireDefault(_Invocator);

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
     * @return {Middleman}
     */

    function Middleman(draft) {
        _classCallCheck(this, Middleman);

        this[_Symbols2['default'].DRAFT] = draft;
        this[_Symbols2['default'].KEY_MAP] = {};
        this[_Symbols2['default'].CAN_DESELECT] = false;

        new _KeyBindings2['default'](this);
    }

    _createClass(Middleman, [{
        key: 'd3',

        /**
         * @method d3
         * @return {Object}
         */
        value: function d3() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].SVG];
        }
    }, {
        key: 'layers',

        /**
         * @method layers
         * @return {Object}
         */
        value: function layers() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].LAYERS];
        }
    }, {
        key: 'options',

        /**
         * @method options
         * @return {Object}
         */
        value: function options() {
            return this[_Symbols2['default'].DRAFT].options();
        }
    }, {
        key: 'keyMap',

        /**
         * @method keyMap
         * @return {Object}
         */
        value: function keyMap() {
            return this[_Symbols2['default'].KEY_MAP];
        }
    }, {
        key: 'select',

        /**
         * @method select
         * @param {Object} options
         * @return {void}
         */
        value: function select(options) {
            _Invocator2['default'].includeExclude(this[_Symbols2['default'].DRAFT], this[_Symbols2['default'].DRAFT].select, options);
        }
    }, {
        key: 'deselect',

        /**
         * @method deselect
         * @param {Object} options
         * @return {void}
         */
        value: function deselect(options) {
            _Invocator2['default'].includeExclude(this[_Symbols2['default'].DRAFT], this[_Symbols2['default'].DRAFT].deselect, options);
        }
    }, {
        key: 'all',

        /**
         * @method all
         * @return {Array}
         */
        value: function all() {
            return this[_Symbols2['default'].DRAFT].all();
        }
    }, {
        key: 'selected',

        /**
         * @method selected
         * @return {Array}
         */
        value: function selected() {
            return this[_Symbols2['default'].DRAFT].selected();
        }
    }, {
        key: 'fromElement',

        /**
         * @method fromElement
         * @param {HTMLElement} element
         * @return {Shape}
         */
        value: function fromElement(element) {

            return this.all().filter(function (shape) {
                return element === shape[_Symbols2['default'].ELEMENT].node();
            })[0];
        }
    }, {
        key: 'preventDeselect',

        /**
         * @method preventDeselect
         * @param {Boolean} [value=undefined]
         */
        value: function preventDeselect(value) {

            if (typeof value === 'undefined') {
                return this[_Symbols2['default'].CAN_DESELECT];
            }

            this[_Symbols2['default'].CAN_DESELECT] = value;
        }
    }, {
        key: 'boundingBox',

        /**
         * @method boundingBox
         * @return {BoundingBox}
         */
        value: function boundingBox() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].BOUNDING_BOX];
        }
    }]);

    return Middleman;
})();

exports['default'] = Middleman;
module.exports = exports['default'];

},{"./Invocator":7,"./KeyBindings":8,"./Symbols":12}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
    ELEMENT: Symbol('element'),
    IS_SELECTED: Symbol('isSelected'),
    ATTRIBUTES: Symbol('attributes'),
    MIDDLEMAN: Symbol('middleman'),
    SHAPE: Symbol('shape'),
    SHAPES: Symbol('shapes'),
    LAYERS: Symbol('layers'),
    GROUP: Symbol('group'),
    BOUNDING_BOX: Symbol('boundingBox'),
    OPTIONS: Symbol('options'),
    ABILITIES: Symbol('abilities'),
    KEY_MAP: Symbol('keyMap'),
    CAN_DESELECT: Symbol('canDeselect')
};
module.exports = exports['default'];

},{}],13:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Throw
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Throw =

/**
 * @constructor
 * @param {String} message
 * @return {Throw}
 */
function Throw(message) {
  _classCallCheck(this, Throw);

  throw new Error("Draft.js: " + message + ".");
};

exports["default"] = Throw;
module.exports = exports["default"];

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Shape2 = require('./Shape');

var _Shape3 = _interopRequireDefault(_Shape2);

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Rectangle = (function (_Shape) {
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        _get(Object.getPrototypeOf(Rectangle.prototype), 'constructor', this).apply(this, arguments);
    }

    _inherits(Rectangle, _Shape);

    _createClass(Rectangle, [{
        key: 'tagName',

        /**
         * @method tagName
         * @return {String}
         */
        value: function tagName() {
            return 'rect';
        }
    }, {
        key: 'defaultAttributes',

        /**
         * @method defaultAttributes
         * @return {Object}
         */
        value: function defaultAttributes() {

            return {
                fill: 'blue',
                height: 100,
                width: 100,
                x: 0,
                y: 0
            };
        }
    }]);

    return Rectangle;
})(_Shape3['default']);

exports['default'] = Rectangle;
module.exports = exports['default'];

},{"./Shape":15}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbols = require('../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

var _helpersThrow = require('../helpers/Throw');

var _helpersThrow2 = _interopRequireDefault(_helpersThrow);

var _helpersPolyfills = require('../helpers/Polyfills');

var _helpersAttributes = require('../helpers/Attributes');

var _helpersAttributes2 = _interopRequireDefault(_helpersAttributes);

var _helpersInvocator = require('../helpers/Invocator');

var _helpersInvocator2 = _interopRequireDefault(_helpersInvocator);

var _abilitiesSelectable = require('../abilities/Selectable');

var _abilitiesSelectable2 = _interopRequireDefault(_abilitiesSelectable);

var _abilitiesResizable = require('../abilities/Resizable');

var _abilitiesResizable2 = _interopRequireDefault(_abilitiesResizable);

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Shape = (function () {

    /**
     * @constructor
     * @param {Object} [attributes={}]
     * @return {Shape}
     */

    function Shape() {
        var attributes = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Shape);

        this[_helpersSymbols2['default'].ATTRIBUTES] = attributes;
    }

    _createClass(Shape, [{
        key: 'tagName',

        /**
         * @method tagName
         * @throws {Error} Will throw an exception if the `tagName` method hasn't been defined on the child object.
         * @return {void}
         */
        value: function tagName() {
            new _helpersThrow2['default']('Tag name must be defined for a shape using the `tagName` method');
        }
    }, {
        key: 'isSelected',

        /**
         * @method isSelected
         * @return {Boolean}
         */
        value: function isSelected() {
            return this[_helpersSymbols2['default'].IS_SELECTED];
        }
    }, {
        key: 'attr',

        /**
         * @method attr
         * @param {String} name
         * @param {*} [value=undefined]
         * @return {Shape|*}
         */
        value: function attr(name, value) {

            if (typeof value === 'undefined') {
                return this[_helpersSymbols2['default'].ELEMENT].datum()[name];
            }

            this[_helpersSymbols2['default'].ELEMENT].datum()[name] = value;
            (0, _helpersAttributes2['default'])(this[_helpersSymbols2['default'].ELEMENT], name, value);

            return this;
        }
    }, {
        key: 'didAdd',

        /**
         * @method didAdd
         * @return {void}
         */
        value: function didAdd() {
            var _this = this;

            var layer = this[_helpersSymbols2['default'].MIDDLEMAN].layers().shapes;
            var attributes = (0, _helpersPolyfills.objectAssign)(this.defaultAttributes(), this[_helpersSymbols2['default'].ATTRIBUTES]);
            this[_helpersSymbols2['default'].GROUP] = layer.append('g');
            this[_helpersSymbols2['default'].ELEMENT] = this[_helpersSymbols2['default'].GROUP].append(this.tagName()).datum({});

            // Assign each attribute from the default attributes defined on the shape, as well as those defined
            // by the user when instantiating the shape.
            Object.keys(attributes).forEach(function (key) {
                return _this.attr(key, attributes[key]);
            });

            var abilities = {
                selectable: new _abilitiesSelectable2['default'](),
                resizable: new _abilitiesResizable2['default']()
            };

            Object.keys(abilities).forEach(function (key) {

                // Add the shape object into each ability instance, and invoke the `didAdd` method.
                var ability = abilities[key];
                ability[_helpersSymbols2['default'].SHAPE] = _this;
                _helpersInvocator2['default'].did('add', ability);
            });

            this[_helpersSymbols2['default'].ABILITIES] = abilities;
        }
    }, {
        key: 'didRemove',

        /**
         * @method didRemove
         * @return {void}
         */
        value: function didRemove() {}
    }, {
        key: 'didMove',

        /**
         * @method didMove
         * @return {void}
         */
        value: function didMove() {
            this[_helpersSymbols2['default'].ABILITIES].resizable.reattachHandles();
        }
    }, {
        key: 'didSelect',

        /**
         * @method didSelect
         * @return {void}
         */
        value: function didSelect() {
            this[_helpersSymbols2['default'].IS_SELECTED] = true;
            this[_helpersSymbols2['default'].ABILITIES].resizable.didSelect();
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this[_helpersSymbols2['default'].IS_SELECTED] = false;
            this[_helpersSymbols2['default'].ABILITIES].resizable.didDeselect();
        }
    }, {
        key: 'boundingBox',

        /**
         * @method boundingBox
         * @return {Object}
         */
        value: function boundingBox() {

            var hasBBox = typeof this[_helpersSymbols2['default'].GROUP].node().getBBox === 'function';

            return hasBBox ? this[_helpersSymbols2['default'].GROUP].node().getBBox() : {
                height: this.attr('height'),
                width: this.attr('width'),
                x: this.attr('x'),
                y: this.attr('y')
            };
        }
    }, {
        key: 'defaultAttributes',

        /**
         * @method defaultAttributes
         * @return {Object}
         */
        value: function defaultAttributes() {
            return {};
        }
    }]);

    return Shape;
})();

exports['default'] = Shape;
module.exports = exports['default'];

},{"../abilities/Resizable":3,"../abilities/Selectable":4,"../helpers/Attributes":5,"../helpers/Invocator":7,"../helpers/Polyfills":11,"../helpers/Symbols":12,"../helpers/Throw":13}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1Jlc2l6YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0F0dHJpYnV0ZXMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Cb3VuZGluZ0JveC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0ludm9jYXRvci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0tleUJpbmRpbmdzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2dDQ0EyQixxQkFBcUI7Ozs7OEJBQ3JCLG1CQUFtQjs7OztrQ0FDbkIsdUJBQXVCOzs7O2dDQUN2QixxQkFBcUI7O2dDQUNyQixxQkFBcUI7Ozs7NkJBQ3JCLGtCQUFrQjs7Ozs7Ozs7OztJQU92QyxLQUFLOzs7Ozs7Ozs7QUFRSSxhQVJULEtBQUssQ0FRSyxPQUFPLEVBQWdCOzs7WUFBZCxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixLQUFLOztBQVVILFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBUyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sc0JBcEIzQyxZQUFZLENBb0IrQyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RixZQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQU0sa0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLDRCQUFRLFlBQVksQ0FBQyxHQUFHLG9DQUFnQixTQUFTLENBQUMsQ0FBQzs7O0FBR3hELFlBQU0sS0FBSyxHQUFJLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDbkQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUNwRCxZQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsNEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxHLFlBQU0s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QUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQzs7QUFFbEQsZ0JBQU0sRUFBRSxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQztnQkFDdkIsRUFBRSxHQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQztnQkFDdkIsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLFVBQVU7Z0JBQzVDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxVQUFVLENBQUM7O0FBRW5ELGdCQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsZ0JBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFekIsZ0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUV4QixnQkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztTQUVwQzs7Ozs7Ozs7ZUFNTSxtQkFBRzs7QUFFTixnQkFBTSxFQUFFLEdBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNsRCxnQkFBTSxFQUFFLEdBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFbEQsZ0JBQUksS0FBSyxDQUFD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QUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMxQixpQkFBQyxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGlCQUFDLEVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7YUFDekIsQ0FBQztTQUVMOzs7Ozs7OztlQU1nQiw2QkFBRztBQUNoQixtQkFBTyxFQUFFLENBQUM7U0FDYjs7O1dBdklnQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgTWlkZGxlbWFuICAgICAgZnJvbSAnLi9oZWxwZXJzL01pZGRsZW1hbic7XG5pbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1N5bWJvbHMnO1xuaW1wb3J0IEJvdW5kaW5nQm94ICAgIGZyb20gJy4vaGVscGVycy9Cb3VuZGluZ0JveCc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi9oZWxwZXJzL1BvbHlmaWxscyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi9oZWxwZXJzL0ludm9jYXRvcic7XG5pbXBvcnQgbWFwcGVyICAgICAgICAgZnJvbSAnLi9oZWxwZXJzL01hcHBlcic7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuU0hBUEVTXSAgICAgICA9IFtdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuT1BUSU9OU10gICAgICA9IChPYmplY3QuYXNzaWduIHx8IG9iamVjdEFzc2lnbikodGhpcy5vcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBtaWRkbGVtYW4gICAgICAgICAgICA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dICAgID0gbmV3IE1pZGRsZW1hbih0aGlzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0gPSBuZXcgQm91bmRpbmdCb3gobWlkZGxlbWFuKTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIFNWRyBjb21wb25lbnQgdXNpbmcgdGhlIGRlZmluZWQgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2lkdGggID0gdGhpc1tTeW1ib2xzLk9QVElPTlNdLmRvY3VtZW50V2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudEhlaWdodDtcbiAgICAgICAgY29uc3Qgc3ZnICAgID0gdGhpc1tTeW1ib2xzLlNWR10gPSBkMy5zZWxlY3QoZWxlbWVudCkuYXR0cignd2lkdGgnLCB3aWR0aCkuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgICAgICBjb25zdCBzdG9wUHJvcGFnYXRpb24gPSAoKSA9PiBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkxBWUVSU10gID0ge1xuICAgICAgICAgICAgc2hhcGVzOiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgc3RvcFByb3BhZ2F0aW9uKSxcbiAgICAgICAgICAgIG1hcmtlcnM6IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXJrZXJzJykub24oJ2NsaWNrJywgc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIERlc2VsZWN0IGFsbCBzaGFwZXMgd2hlbiB0aGUgY2FudmFzIGlzIGNsaWNrZWQuXG4gICAgICAgIHN2Zy5vbignY2xpY2snLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KGZhbHNlKTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTaGFwZXxTdHJpbmd9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgYWRkKHNoYXBlKSB7XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgc2hhcGUgbmFtZSB0byB0aGUgc2hhcGUgb2JqZWN0LCBpZiB0aGUgdXNlciBoYXMgcGFzc2VkIHRoZSBzaGFwZVxuICAgICAgICAvLyBhcyBhIHN0cmluZy5cbiAgICAgICAgc2hhcGUgPSAodHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJykgPyBtYXBwZXIoc2hhcGUpIDogc2hhcGU7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIHNoYXBlcy5wdXNoKHNoYXBlKTtcblxuICAgICAgICAvLyBQdXQgdGhlIGludGVyZmFjZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBEcmFmdCBpbnRvIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlW1N5bWJvbHMuTUlERExFTUFOXSA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgY29uc3QgaW5kZXggID0gc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuXG4gICAgICAgIHNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZXMpO1xuICAgICAgICBzaGFwZXMubGVuZ3RoID0gMDtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3Qoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdzZWxlY3QnLCBzaGFwZXMpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQk9VTkRJTkdfQk9YXS5kcmF3Qm91bmRpbmdCb3godGhpcy5zZWxlY3RlZCgpLCB0aGlzW1N5bWJvbHMuTEFZRVJTXS5tYXJrZXJzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3Qoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdkZXNlbGVjdCcsIHNoYXBlcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdLmRyYXdCb3VuZGluZ0JveCh0aGlzLnNlbGVjdGVkKCksIHRoaXNbU3ltYm9scy5MQVlFUlNdLm1hcmtlcnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUuaXNTZWxlY3RlZCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oKCR3aW5kb3cpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCR3aW5kb3cpIHtcblxuICAgICAgICAvLyBFeHBvcnQgZHJhZnQgaWYgdGhlIGB3aW5kb3dgIG9iamVjdCBpcyBhdmFpbGFibGUuXG4gICAgICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxuICAgIH1cblxufSkod2luZG93KTtcblxuLy8gRXhwb3J0IGZvciB1c2UgaW4gRVM2IGFwcGxpY2F0aW9ucy5cbmV4cG9ydCBkZWZhdWx0IERyYWZ0OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtBYmlsaXR5fVxuICAgICAqL1xuICAgIHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBtaWRkbGVtYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlKClbU3ltYm9scy5NSURETEVNQU5dO1xuICAgIH1cblxufSIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZXNpemFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6YWJsZSBleHRlbmRzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVzaXphYmxlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLlJBRElVUyA9IDIyO1xuICAgICAgICB0aGlzLmVkZ2VzICA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkU2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRTZWxlY3QoKSB7XG4gICAgICAgIHRoaXMucmVhdHRhY2hIYW5kbGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuZGV0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVhdHRhY2hIYW5kbGVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWF0dGFjaEhhbmRsZXMoKSB7XG4gICAgICAgIHRoaXMuZGV0YWNoSGFuZGxlcygpO1xuICAgICAgICB0aGlzLmF0dGFjaEhhbmRsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dGFjaEhhbmRsZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGF0dGFjaEhhbmRsZXMoKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGUgID0gdGhpcy5zaGFwZSgpO1xuICAgICAgICBjb25zdCBsYXllciAgPSB0aGlzLm1pZGRsZW1hbigpLmxheWVycygpLm1hcmtlcnM7XG4gICAgICAgIHRoaXMuaGFuZGxlcyA9IGxheWVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3Jlc2l6ZS1oYW5kbGVzJyk7XG5cbiAgICAgICAgY29uc3QgeCAgICAgID0gc2hhcGUuYXR0cigneCcpO1xuICAgICAgICBjb25zdCB5ICAgICAgPSBzaGFwZS5hdHRyKCd5Jyk7XG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHNoYXBlLmF0dHIoJ3dpZHRoJyk7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHNoYXBlLmF0dHIoJ2hlaWdodCcpO1xuXG4gICAgICAgIGNvbnN0IGVkZ2VNYXAgPSB7XG4gICAgICAgICAgICB0b3BMZWZ0OiAgICAgIHsgeCwgICAgICAgICAgICAgICAgICB5IH0sXG4gICAgICAgICAgICB0b3BNaWRkbGU6ICAgIHsgeDogeCArICh3aWR0aCAvIDIpLCB5IH0sXG4gICAgICAgICAgICB0b3BSaWdodDogICAgIHsgeDogeCArIHdpZHRoLCAgICAgICB5IH0sXG4gICAgICAgICAgICBsZWZ0TWlkZGxlOiAgIHsgeDogeCwgICAgICAgICAgICAgICB5OiB5ICsgKGhlaWdodCAvIDIpIH0sXG4gICAgICAgICAgICBib3R0b21MZWZ0OiAgIHsgeDogeCwgICAgICAgICAgICAgICB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICBib3R0b21NaWRkbGU6IHsgeDogeCArICh3aWR0aCAvIDIpLCB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICBib3R0b21SaWdodDogIHsgeDogeCArIHdpZHRoLCAgICAgICB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICByaWdodE1pZGRsZTogIHsgeDogeCArIHdpZHRoLCAgICAgICB5OiB5ICsgKGhlaWdodCAvIDIpIH1cbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhlZGdlTWFwKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgZWRnZSAgICAgICAgICA9IGVkZ2VNYXBba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGRyYWdCZWhhdmlvdXIgPSB0aGlzLmRyYWcoc2hhcGUsIGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XSA9IHRoaXMuaGFuZGxlcy5hcHBlbmQoJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4bGluazpocmVmJywgJ2ltYWdlcy9oYW5kbGUtbWFpbi5wbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBlZGdlLnggLSAodGhpcy5SQURJVVMgLyAyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgZWRnZS55IC0gKHRoaXMuUkFESVVTIC8gMikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlJywgJ3JlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuUkFESVVTKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMuUkFESVVTKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdkcmFnc3RhcnQnLCBkcmFnQmVoYXZpb3VyLnN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZHJhZycsIGRyYWdCZWhhdmlvdXIuZHJhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2RyYWdlbmQnLCBkcmFnQmVoYXZpb3VyLmVuZCkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXRhY2hIYW5kbGVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXRhY2hIYW5kbGVzKCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaGFuZGxlcykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVzLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcG9wVW5pcXVlXG4gICAgICogQHBhcmFtIHtBcnJheX0gaXRlbXNcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgcG9wVW5pcXVlKGl0ZW1zKSB7XG5cbiAgICAgICAgY29uc3QgY291bnRzID0ge307XG5cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGl0ZW1zLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgbnVtICAgPSBpdGVtc1tpbmRleF07XG4gICAgICAgICAgICBjb3VudHNbbnVtXSA9IGNvdW50c1tudW1dID8gY291bnRzW251bV0gKyAxIDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVuaXF1ZSA9IE9iamVjdC5rZXlzKGNvdW50cykuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb3VudHNba2V5XSA9PT0gMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHVuaXF1ZS5sZW5ndGggPyBOdW1iZXIodW5pcXVlWzBdKSA6IGl0ZW1zWzBdO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzaGlmdEhhbmRsZXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3VycmVudEtleVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2hpZnRIYW5kbGVzKGN1cnJlbnRLZXkpIHtcblxuICAgICAgICBjb25zdCBjb29yZHMgICAgID0gW107XG4gICAgICAgIGNvbnN0IHJlZ0V4cCAgICAgPSAvKD89W0EtWl0pLztcbiAgICAgICAgY29uc3QgZGltZW5zaW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZWRnZXMpO1xuXG4gICAgICAgIGRpbWVuc2lvbnMuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFBhY2thZ2UgYWxsIG9mIHRoZSBjb29yZGluYXRlcyB1cCBpbnRvIGEgbW9yZSBzaW1wbGUgYGNvb3Jkc2Agb2JqZWN0IGZvciBicmV2aXR5LlxuICAgICAgICAgICAgY29uc3QgZWRnZSAgPSB0aGlzLmVkZ2VzW2tleV07XG4gICAgICAgICAgICBjb29yZHNba2V5XSA9IHsgeDogTnVtYmVyKGVkZ2UuYXR0cigneCcpKSwgeTogTnVtYmVyKGVkZ2UuYXR0cigneScpKSB9O1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgY29ybmVyUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wOiBOdW1iZXIsIHJpZ2h0OiBOdW1iZXIsIGJvdHRvbTogTnVtYmVyLCBsZWZ0OiBOdW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY29ybmVyUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBjb29yZGluYXRlIHRoYXQgZG9lc24ndCBtYXRjaCB0aGUgb3RoZXJzLCB3aGljaCBtZWFucyB0aGF0IGlzIHRoZSBjb29yZGluYXRlIHRoYXQgaXMgY3VycmVudGx5XG4gICAgICAgICAgICAvLyBiZWluZyBtb2RpZmllZCB3aXRob3V0IGFueSBjb25kaXRpb25hbCBzdGF0ZW1lbnRzLlxuICAgICAgICAgICAgdG9wOiAgICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueSwgICAgY29vcmRzLnRvcE1pZGRsZS55LCAgICBjb29yZHMudG9wUmlnaHQueV0pLFxuICAgICAgICAgICAgcmlnaHQ6ICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcFJpZ2h0LngsICAgY29vcmRzLnJpZ2h0TWlkZGxlLngsICBjb29yZHMuYm90dG9tUmlnaHQueF0pLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLmJvdHRvbUxlZnQueSwgY29vcmRzLmJvdHRvbU1pZGRsZS55LCBjb29yZHMuYm90dG9tUmlnaHQueV0pLFxuICAgICAgICAgICAgbGVmdDogICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueCwgICAgY29vcmRzLmxlZnRNaWRkbGUueCwgICBjb29yZHMuYm90dG9tTGVmdC54XSlcblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAY29uc3RhbnQgbWlkZGxlUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wTWlkZGxlOiBudW1iZXIsIHJpZ2h0TWlkZGxlOiBudW1iZXIsIGJvdHRvbU1pZGRsZTogbnVtYmVyLCBsZWZ0TWlkZGxlOiBudW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbWlkZGxlUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBBbGwgb2YgdGhlc2UgbWlkZGxlIHBvc2l0aW9ucyBhcmUgcmVsYXRpdmUgdG8gdGhlIGNvcm5lciBwb3NpdGlvbnMgYWJvdmUuXG4gICAgICAgICAgICB0b3BNaWRkbGU6ICAgIChjb3JuZXJQb3NpdGlvbnMubGVmdCArIGNvcm5lclBvc2l0aW9ucy5yaWdodCkgLyAyLFxuICAgICAgICAgICAgcmlnaHRNaWRkbGU6ICAoY29ybmVyUG9zaXRpb25zLnRvcCArIGNvcm5lclBvc2l0aW9ucy5ib3R0b20pIC8gMixcbiAgICAgICAgICAgIGJvdHRvbU1pZGRsZTogKGNvcm5lclBvc2l0aW9ucy5sZWZ0ICsgY29ybmVyUG9zaXRpb25zLnJpZ2h0KSAvIDIsXG4gICAgICAgICAgICBsZWZ0TWlkZGxlOiAgIChjb3JuZXJQb3NpdGlvbnMudG9wICsgY29ybmVyUG9zaXRpb25zLmJvdHRvbSkgLyAyXG5cbiAgICAgICAgfTtcblxuICAgICAgICBkaW1lbnNpb25zLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudEtleSAhPT0ga2V5KSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdChyZWdFeHApLm1hcChrZXkgPT4ga2V5LnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnbWlkZGxlJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICd0b3BNaWRkbGUnIHx8IGtleSA9PT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzBdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIG1pZGRsZVBvc2l0aW9uc1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgbWlkZGxlUG9zaXRpb25zW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneScsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd4JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzFdXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgICAqIEByZXR1cm4ge3tzdGFydDogRnVuY3Rpb24sIGRyYWc6IEZ1bmN0aW9uLCBlbmQ6IEZ1bmN0aW9ufX1cbiAgICAgKi9cbiAgICBkcmFnKHNoYXBlLCBrZXkpIHtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gICAgICAgPSB0aGlzLm1pZGRsZW1hbigpO1xuICAgICAgICBjb25zdCBoYW5kbGVzICAgICAgICAgPSB0aGlzLmhhbmRsZXM7XG4gICAgICAgIGNvbnN0IHJhZGl1cyAgICAgICAgICA9IHRoaXMuUkFESVVTO1xuICAgICAgICBjb25zdCByZWF0dGFjaEhhbmRsZXMgPSB0aGlzLnJlYXR0YWNoSGFuZGxlcy5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCBzaGlmdEhhbmRsZXMgICAgPSB0aGlzLnNoaWZ0SGFuZGxlcy5iaW5kKHRoaXMpO1xuICAgICAgICBsZXQgc3RhcnRYLCBzdGFydFksIHJhdGlvO1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBzdGFydFxuICAgICAgICAgICAgICogQHJldHVybiB7e3g6IE51bWJlciwgeTogTnVtYmVyfX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuXG4gICAgICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdkcmFnZ2luZycsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJhdGlvICAgICAgICA9IHNoYXBlLmF0dHIoJ3dpZHRoJykgLyBzaGFwZS5hdHRyKCdoZWlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHN0YXJ0WCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYIC0gcGFyc2VJbnQoaGFuZGxlLmF0dHIoJ3gnKSk7XG4gICAgICAgICAgICAgICAgc3RhcnRZID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkgLSBwYXJzZUludChoYW5kbGUuYXR0cigneScpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7IHg6IHN0YXJ0WCwgeTogc3RhcnRZIH07XG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBkcmFnXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt7eDogTnVtYmVyLCB5OiBOdW1iZXJ9fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkcmFnOiBmdW5jdGlvbiBkcmFnKCkge1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG1pZGRsZW1hbi5vcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlICA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3ZlWCAgID0gKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYIC0gc3RhcnRYKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3ZlWSAgID0gKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZIC0gc3RhcnRZKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaW5hbFggID0gTWF0aC5jZWlsKG1vdmVYIC8gb3B0aW9ucy5ncmlkU2l6ZSkgKiBvcHRpb25zLmdyaWRTaXplO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsWSAgPSBNYXRoLmNlaWwobW92ZVkgLyBvcHRpb25zLmdyaWRTaXplKSAqIG9wdGlvbnMuZ3JpZFNpemU7XG4gICAgICAgICAgICAgICAgY29uc3QgYkJveCAgICA9IGhhbmRsZXMubm9kZSgpLmdldEJCb3goKTtcblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0b3BNaWRkbGUnICYmIGtleSAhPT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3gnLCBmaW5hbFgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdyaWdodE1pZGRsZScgJiYga2V5ICE9PSAnbGVmdE1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3knLCBmaW5hbFkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNoaWZ0SGFuZGxlcyhrZXkpO1xuXG4gICAgICAgICAgICAgICAgc2hhcGUuYXR0cigneCcsIGJCb3gueCArIChyYWRpdXMgLyAyKSkuYXR0cigneScsIGJCb3gueSArIChyYWRpdXMgLyAyKSlcbiAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBiQm94LmhlaWdodCAtIHJhZGl1cykuYXR0cignd2lkdGgnLCBiQm94LndpZHRoIC0gcmFkaXVzKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7IHg6IGZpbmFsWCwgeTogZmluYWxZIH07XG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBlbmRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGVuZDogZnVuY3Rpb24gZW5kKCkge1xuICAgICAgICAgICAgICAgIG1pZGRsZW1hbi5zZWxlY3QoW3NoYXBlXSk7XG4gICAgICAgICAgICAgICAgcmVhdHRhY2hIYW5kbGVzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eSc7XG5pbXBvcnQgU3ltYm9scyBmcm9tICcuLy4uL2hlbHBlcnMvU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnNoYXBlKClbU3ltYm9scy5FTEVNRU5UXTtcbiAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICBlbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKCdkcmFnJywgKCkgPT4gdGhpcy5oYW5kbGVEcmFnKCkpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGFuZGxlRHJhZ1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBoYW5kbGVEcmFnKCkge1xuXG4gICAgICAgIHRoaXMuaGFuZGxlQ2xpY2soKTtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gPSB0aGlzLnNoYXBlKClbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KHRydWUpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGZha2UgZXZlbnQgdG8gZHJhZyB0aGUgc2hhcGUgd2l0aCBhbiBvdmVycmlkZSBYIGFuZCBZIHZhbHVlLlxuICAgICAgICBjb25zdCBldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZWRvd24nLCB7IGJ1YmJsZXM6IHRydWUsIGNhbmNlbGFibGU6IGZhbHNlIH0pO1xuICAgICAgICBldmVudC5vdmVycmlkZVggPSBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWDtcbiAgICAgICAgZXZlbnQub3ZlcnJpZGVZID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVk7XG5cbiAgICAgICAgY29uc3QgYkJveCA9IG1pZGRsZW1hbi5ib3VuZGluZ0JveCgpLmJCb3gubm9kZSgpO1xuICAgICAgICBiQm94LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZUNsaWNrXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBoYW5kbGVDbGljaygpIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgPSB0aGlzLm1pZGRsZW1hbigpW1N5bWJvbHMuS0VZX01BUF07XG5cbiAgICAgICAgaWYgKHRoaXMuc2hhcGUoKS5pc1NlbGVjdGVkKCkpIHtcblxuICAgICAgICAgICAgaWYgKCFrZXlNYXAubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBvdGhlcnMgYW5kIHNlbGVjdCBvbmx5IHRoZSBjdXJyZW50IHNoYXBlLlxuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBleGNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgdGhlIHNoYXBlIGlmIGl0J3MgY3VycmVudGx5IHNlbGVjdGVkLlxuICAgICAgICAgICAgcmV0dXJuIHZvaWQgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGluY2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZXlNYXAubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWxsIHNoYXBlcyBleGNlcHQgZm9yIHRoZSBjdXJyZW50LlxuICAgICAgICAgICAgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGV4Y2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5taWRkbGVtYW4oKS5zZWxlY3QoeyBpbmNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQXR0cmlidXRlc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuXG4vKlxuICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVcbiAqIEBwYXJhbSB7QXJyYXl9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgbmFtZSwgdmFsdWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgc3dpdGNoIChuYW1lKSB7XG5cbiAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICBjb25zdCB5ID0gZWxlbWVudC5kYXR1bSgpLnkgfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3ZhbHVlfSwgJHt5fSlgKTtcblxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIGNvbnN0IHggPSBlbGVtZW50LmRhdHVtKCkueCB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7dmFsdWV9KWApO1xuXG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyKG5hbWUsIHZhbHVlKTtcblxufTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQm91bmRpbmdCb3hcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvdW5kaW5nQm94IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtCb3VuZGluZ0JveH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBtaWRkbGVtYW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KCkpIHtcbiAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW91c2VYID0gZDMuZXZlbnQucGFnZVg7XG4gICAgICAgIGNvbnN0IG1vdXNlWSA9IGQzLmV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4uZnJvbUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYXdCb3VuZGluZ0JveFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNlbGVjdGVkXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGxheWVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmF3Qm91bmRpbmdCb3goc2VsZWN0ZWQsIGxheWVyKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYkJveCkge1xuICAgICAgICAgICAgdGhpcy5iQm94LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kZWwgPSB7IG1pblg6IE51bWJlci5NQVhfVkFMVUUsIG1pblk6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhYOiBOdW1iZXIuTUlOX1ZBTFVFLCBtYXhZOiBOdW1iZXIuTUlOX1ZBTFVFIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3BvbnNpYmxlIGZvciBjb21wdXRpbmcgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LCBiYXNlZCBvbiBhbGwgb2YgdGhlIGJvdW5kaW5nIGJveGVzXG4gICAgICAgICAqIGZyb20gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgc2hhcGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGNvbXB1dGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYkJveGVzXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjb21wdXRlID0gKGJCb3hlcykgPT4ge1xuICAgICAgICAgICAgbW9kZWwubWluWCA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCkpO1xuICAgICAgICAgICAgbW9kZWwubWluWSA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WCA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCArIGQud2lkdGgpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFkgPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkgKyBkLmhlaWdodCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LlxuICAgICAgICBjb21wdXRlKHNlbGVjdGVkLm1hcCgoc2hhcGUpID0+IHNoYXBlLmJvdW5kaW5nQm94KCkpKTtcblxuICAgICAgICB0aGlzLmJCb3ggPSBsYXllci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZHJhZy1ib3gnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgICAgICAoKGQpID0+IGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAgICAgICgoZCkgPT4gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAgKChkKSA9PiBkLm1heFggLSBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAoKGQpID0+IGQubWF4WSAtIGQubWluWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG5cbiAgICAgICAgY29uc3QgZHJhZ1N0YXJ0ID0gWydkcmFnc3RhcnQnLCAoKSA9PiB0aGlzLmRyYWdTdGFydCgpXTtcbiAgICAgICAgY29uc3QgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV07XG4gICAgICAgIGNvbnN0IGRyYWdFbmQgICA9IFsnZHJhZ2VuZCcsICAgKCkgPT4gdGhpcy5kcmFnRW5kKCldO1xuXG4gICAgICAgIHRoaXMuYkJveC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbiguLi5kcmFnU3RhcnQpLm9uKC4uLmRyYWcpLm9uKC4uLmRyYWdFbmQpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1N0YXJ0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnU3RhcnQoeCA9IG51bGwsIHkgPSBudWxsKSB7XG5cbiAgICAgICAgY29uc3Qgc1ggPSBOdW1iZXIodGhpcy5iQm94LmF0dHIoJ3gnKSk7XG4gICAgICAgIGNvbnN0IHNZID0gTnVtYmVyKHRoaXMuYkJveC5hdHRyKCd5JykpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAoeCAhPT0gbnVsbCkgPyB4IDogKGQzLmV2ZW50LnNvdXJjZUV2ZW50Lm92ZXJyaWRlWCB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWCkgLSBzWCxcbiAgICAgICAgICAgIHk6ICh5ICE9PSBudWxsKSA/IHkgOiAoZDMuZXZlbnQuc291cmNlRXZlbnQub3ZlcnJpZGVZIHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZKSAtIHNZXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb3ZlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHsgeDogc1gsIHk6IHNZIH0sXG4gICAgICAgICAgICBlbmQ6ICAgeyB9XG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW211bHRpcGxlT2Y9dGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ub3B0aW9ucygpLmdyaWRTaXplXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCkuZ3JpZFNpemUpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5wcmV2ZW50RGVzZWxlY3QodHJ1ZSk7XG5cbiAgICAgICAgeCA9ICh4ICE9PSBudWxsKSA/IHggOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWDtcbiAgICAgICAgeSA9ICh5ICE9PSBudWxsKSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWTtcblxuICAgICAgICBjb25zdCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgICAgbVkgPSAoeSAtIHRoaXMuc3RhcnQueSksXG4gICAgICAgICAgICAgIGVYID0gTWF0aC5jZWlsKG1YIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mLFxuICAgICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLmJCb3guZGF0dW0oKS54ID0gZVg7XG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnkgPSBlWTtcblxuICAgICAgICB0aGlzLmJCb3guYXR0cigneCcsIGVYKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3knLCBlWSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlLmVuZCA9IHsgeDogZVgsIHk6IGVZIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdFbmRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdFbmQoKSB7XG5cbiAgICAgICAgY29uc3QgZVggICAgPSB0aGlzLm1vdmUuZW5kLnggLSB0aGlzLm1vdmUuc3RhcnQueDtcbiAgICAgICAgY29uc3QgZVkgICAgPSB0aGlzLm1vdmUuZW5kLnkgLSB0aGlzLm1vdmUuc3RhcnQueTtcblxuICAgICAgICBpZiAoaXNOYU4oZVgpIHx8IGlzTmFOKGVZKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW92ZSBlYWNoIHNoYXBlIGJ5IHRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cy5cbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0ZWQoKS5mb3JFYWNoKChzaGFwZSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50WCA9IHNoYXBlLmF0dHIoJ3gnKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRZID0gc2hhcGUuYXR0cigneScpO1xuICAgICAgICAgICAgY29uc3QgbW92ZVggICAgPSBjdXJyZW50WCArIGVYO1xuICAgICAgICAgICAgY29uc3QgbW92ZVkgICAgPSBjdXJyZW50WSArIGVZO1xuXG4gICAgICAgICAgICBzaGFwZS5hdHRyKCd4JywgbW92ZVgpLmF0dHIoJ3knLCBtb3ZlWSk7XG4gICAgICAgICAgICBzaGFwZS5kaWRNb3ZlKCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtZXRob2QgdHJ5SW52b2tlXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHtTdHJpbmd9IGZ1bmN0aW9uTmFtZVxuICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgdHJ5SW52b2tlID0gKGNvbnRleHQsIGZ1bmN0aW9uTmFtZSwgLi4ub3B0aW9ucykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHRbZnVuY3Rpb25OYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb250ZXh0W2Z1bmN0aW9uTmFtZV0oLi4ub3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcblxufTtcblxuLyoqXG4gKiBAbWV0aG9kIGNhcGl0YWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGNhcGl0YWxpemUgPSAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG5cbn07XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBJbnZvY2F0b3JcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgoKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGlkXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl8U2hhcGV9IHNoYXBlc1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgZGlkKHR5cGUsIHNoYXBlcykge1xuXG4gICAgICAgICAgICBzaGFwZXMgPSBBcnJheS5pc0FycmF5KHNoYXBlcykgPyBzaGFwZXMgOiBbc2hhcGVzXTtcblxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlcy5ldmVyeSgoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ5SW52b2tlKHNoYXBlLCBgZGlkJHtjYXBpdGFsaXplKHR5cGUpfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpbmNsdWRlRXhjbHVkZVxuICAgICAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBpbmNsdWRlRXhjbHVkZShkcmFmdCwgZm4sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgICAgICBjb25zdCBpbmNsdWRlICAgPSBvcHRpb25zLmluY2x1ZGUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgZXhjbHVkZSAgID0gb3B0aW9ucy5leGNsdWRlIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IG1pZGRsZW1hbiA9IGRyYWZ0W1N5bWJvbHMuTUlERExFTUFOXTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGFsbEV4Y2x1ZGluZ1xuICAgICAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgYWxsRXhjbHVkaW5nID0gKGV4Y2x1ZGluZykgPT4ge1xuXG4gICAgICAgICAgICAgICAgZXhjbHVkaW5nID0gQXJyYXkuaXNBcnJheShleGNsdWRpbmcpID8gZXhjbHVkaW5nIDogW2V4Y2x1ZGluZ107XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWlkZGxlbWFuLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF+ZXhjbHVkaW5nLmluZGV4T2Yoc2hhcGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KGRyYWZ0LCBbaW5jbHVkZV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWV4Y2x1ZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCBmbi5hcHBseShkcmFmdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZuLmFwcGx5KGRyYWZ0LCBbYWxsRXhjbHVkaW5nKGV4Y2x1ZGUpXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgS2V5QmluZGluZ3NcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUJpbmRpbmdzIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtLZXlCaW5kaW5nc31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgICAgICAgICAgICA9IG1pZGRsZW1hbltTeW1ib2xzLktFWV9NQVBdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcblxuICAgICAgICAvLyBEZWZhdWx0IGtlcCBtYXBwaW5nc1xuICAgICAgICBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZTtcbiAgICAgICAga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2U7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBrZXkgbWFwLlxuICAgICAgICB0aGlzLmF0dGFjaEJpbmRpbmdzKGtleU1hcCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dGFjaEJpbmRpbmdzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleU1hcFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoQmluZGluZ3Moa2V5TWFwKSB7XG5cbiAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0KCkpO1xuXG4gICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAvLyBNYWludGFpbiBhc3BlY3QgcmF0aW9zIHdoZW4gcmVzaXppbmcuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgIH1cblxufSIsImltcG9ydCBUaHJvdyAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdyc7XG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL3NoYXBlcy9SZWN0YW5nbGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWFwcGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgIHJlY3RhbmdsZTogUmVjdGFuZ2xlXG4gICAgfTtcblxuICAgIHJldHVybiB0eXBlb2YgbWFwW25hbWVdICE9PSAndW5kZWZpbmVkJyA/IG5ldyBtYXBbbmFtZV0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBUaHJvdyhgQ2Fubm90IG1hcCBcIiR7bmFtZX1cIiB0byBhIHNoYXBlIG9iamVjdGApO1xuXG59OyIsImltcG9ydCBTeW1ib2xzICAgICBmcm9tICcuL1N5bWJvbHMnO1xuaW1wb3J0IEtleUJpbmRpbmdzIGZyb20gJy4vS2V5QmluZGluZ3MnO1xuaW1wb3J0IGludm9jYXRvciAgIGZyb20gJy4vSW52b2NhdG9yJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1pZGRsZW1hblxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlkZGxlbWFuIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICogQHJldHVybiB7TWlkZGxlbWFufVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRyYWZ0KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkRSQUZUXSAgICAgICAgPSBkcmFmdDtcbiAgICAgICAgdGhpc1tTeW1ib2xzLktFWV9NQVBdICAgICAgPSB7fTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF0gPSBmYWxzZTtcblxuICAgICAgICBuZXcgS2V5QmluZGluZ3ModGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGQzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGQzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLlNWR107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBsYXllcnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgbGF5ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLkxBWUVSU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLm9wdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGtleU1hcFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBrZXlNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuS0VZX01BUF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXNbU3ltYm9scy5EUkFGVF0sIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXNbU3ltYm9scy5EUkFGVF0sIHRoaXNbU3ltYm9scy5EUkFGVF0uZGVzZWxlY3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5hbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLnNlbGVjdGVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmcm9tRWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBmcm9tRWxlbWVudChlbGVtZW50KSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQgPT09IHNoYXBlW1N5bWJvbHMuRUxFTUVOVF0ubm9kZSgpO1xuICAgICAgICB9KVswXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcHJldmVudERlc2VsZWN0XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqL1xuICAgIHByZXZlbnREZXNlbGVjdCh2YWx1ZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXSA9IHZhbHVlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBib3VuZGluZ0JveFxuICAgICAqIEByZXR1cm4ge0JvdW5kaW5nQm94fVxuICAgICAqL1xuICAgIGJvdW5kaW5nQm94KCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLkJPVU5ESU5HX0JPWF07XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFBvbHlmaWxsc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEFzc2lnbih0YXJnZXQpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBmaXJzdCBhcmd1bWVudCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuZXh0U291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBpZiAobmV4dFNvdXJjZSA9PT0gdW5kZWZpbmVkIHx8IG5leHRTb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG5leHRTb3VyY2UgPSBPYmplY3QobmV4dFNvdXJjZSk7XG5cbiAgICAgICAgdmFyIGtleXNBcnJheSA9IE9iamVjdC5rZXlzKE9iamVjdChuZXh0U291cmNlKSk7XG5cbiAgICAgICAgZm9yICh2YXIgbmV4dEluZGV4ID0gMCwgbGVuID0ga2V5c0FycmF5Lmxlbmd0aDsgbmV4dEluZGV4IDwgbGVuOyBuZXh0SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBrZXlzQXJyYXlbbmV4dEluZGV4XTtcbiAgICAgICAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuZXh0U291cmNlLCBuZXh0S2V5KTtcbiAgICAgICAgICAgIGlmIChkZXNjICE9PSB1bmRlZmluZWQgJiYgZGVzYy5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvO1xuXG59XG4iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU3ltYm9sc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIERSQUZUOiAgICAgICAgU3ltYm9sKCdkcmFmdCcpLFxuICAgIFNWRzogICAgICAgICAgU3ltYm9sKCdzdmcnKSxcbiAgICBFTEVNRU5UOiAgICAgIFN5bWJvbCgnZWxlbWVudCcpLFxuICAgIElTX1NFTEVDVEVEOiAgU3ltYm9sKCdpc1NlbGVjdGVkJyksXG4gICAgQVRUUklCVVRFUzogICBTeW1ib2woJ2F0dHJpYnV0ZXMnKSxcbiAgICBNSURETEVNQU46ICAgIFN5bWJvbCgnbWlkZGxlbWFuJyksXG4gICAgU0hBUEU6ICAgICAgICBTeW1ib2woJ3NoYXBlJyksXG4gICAgU0hBUEVTOiAgICAgICBTeW1ib2woJ3NoYXBlcycpLFxuICAgIExBWUVSUzogICAgICAgU3ltYm9sKCdsYXllcnMnKSxcbiAgICBHUk9VUDogICAgICAgIFN5bWJvbCgnZ3JvdXAnKSxcbiAgICBCT1VORElOR19CT1g6IFN5bWJvbCgnYm91bmRpbmdCb3gnKSxcbiAgICBPUFRJT05TOiAgICAgIFN5bWJvbCgnb3B0aW9ucycpLFxuICAgIEFCSUxJVElFUzogICAgU3ltYm9sKCdhYmlsaXRpZXMnKSxcbiAgICBLRVlfTUFQOiAgICAgIFN5bWJvbCgna2V5TWFwJyksXG4gICAgQ0FOX0RFU0VMRUNUOiBTeW1ib2woJ2NhbkRlc2VsZWN0Jylcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVGhyb3dcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocm93IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICogQHJldHVybiB7VGhyb3d9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERyYWZ0LmpzOiAke21lc3NhZ2V9LmApO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuL1NoYXBlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0QXR0cmlidXRlcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogJ2JsdWUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuaW1wb3J0IFRocm93ICAgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvVGhyb3cnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4uL2hlbHBlcnMvUG9seWZpbGxzJztcbmltcG9ydCBzZXRBdHRyaWJ1dGUgICBmcm9tICcuLi9oZWxwZXJzL0F0dHJpYnV0ZXMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4uL2hlbHBlcnMvSW52b2NhdG9yJztcbmltcG9ydCBTZWxlY3RhYmxlICAgICBmcm9tICcuLi9hYmlsaXRpZXMvU2VsZWN0YWJsZSc7XG5pbXBvcnQgUmVzaXphYmxlICAgICAgZnJvbSAnLi4vYWJpbGl0aWVzL1Jlc2l6YWJsZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFthdHRyaWJ1dGVzPXt9XVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10gPSBhdHRyaWJ1dGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiB0aGUgYHRhZ05hbWVgIG1ldGhvZCBoYXNuJ3QgYmVlbiBkZWZpbmVkIG9uIHRoZSBjaGlsZCBvYmplY3QuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICBuZXcgVGhyb3coJ1RhZyBuYW1lIG11c3QgYmUgZGVmaW5lZCBmb3IgYSBzaGFwZSB1c2luZyB0aGUgYHRhZ05hbWVgIG1ldGhvZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaXNTZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7U2hhcGV8Kn1cbiAgICAgKi9cbiAgICBhdHRyKG5hbWUsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHNldEF0dHJpYnV0ZSh0aGlzW1N5bWJvbHMuRUxFTUVOVF0sIG5hbWUsIHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkQWRkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRBZGQoKSB7XG5cbiAgICAgICAgY29uc3QgbGF5ZXIgICAgICAgICAgID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ubGF5ZXJzKCkuc2hhcGVzO1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzICAgICAgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0QXR0cmlidXRlcygpLCB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10pO1xuICAgICAgICB0aGlzW1N5bWJvbHMuR1JPVVBdICAgPSBsYXllci5hcHBlbmQoJ2cnKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdID0gdGhpc1tTeW1ib2xzLkdST1VQXS5hcHBlbmQodGhpcy50YWdOYW1lKCkpLmRhdHVtKHt9KTtcblxuICAgICAgICAvLyBBc3NpZ24gZWFjaCBhdHRyaWJ1dGUgZnJvbSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGVzIGRlZmluZWQgb24gdGhlIHNoYXBlLCBhcyB3ZWxsIGFzIHRob3NlIGRlZmluZWRcbiAgICAgICAgLy8gYnkgdGhlIHVzZXIgd2hlbiBpbnN0YW50aWF0aW5nIHRoZSBzaGFwZS5cbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB0aGlzLmF0dHIoa2V5LCBhdHRyaWJ1dGVzW2tleV0pKTtcblxuICAgICAgICBjb25zdCBhYmlsaXRpZXMgID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUoKSxcbiAgICAgICAgICAgIHJlc2l6YWJsZTogIG5ldyBSZXNpemFibGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGFiaWxpdGllcykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2hhcGUgb2JqZWN0IGludG8gZWFjaCBhYmlsaXR5IGluc3RhbmNlLCBhbmQgaW52b2tlIHRoZSBgZGlkQWRkYCBtZXRob2QuXG4gICAgICAgICAgICBjb25zdCBhYmlsaXR5ID0gYWJpbGl0aWVzW2tleV07XG4gICAgICAgICAgICBhYmlsaXR5W1N5bWJvbHMuU0hBUEVdID0gdGhpcztcbiAgICAgICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIGFiaWxpdHkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdID0gYWJpbGl0aWVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRSZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFJlbW92ZSgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRNb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRNb3ZlKCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXS5yZXNpemFibGUucmVhdHRhY2hIYW5kbGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRTZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IHRydWU7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdLnJlc2l6YWJsZS5kaWRTZWxlY3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IGZhbHNlO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXS5yZXNpemFibGUuZGlkRGVzZWxlY3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGJvdW5kaW5nQm94KCkge1xuXG4gICAgICAgIGNvbnN0IGhhc0JCb3ggPSB0eXBlb2YgdGhpc1tTeW1ib2xzLkdST1VQXS5ub2RlKCkuZ2V0QkJveCA9PT0gJ2Z1bmN0aW9uJztcblxuICAgICAgICByZXR1cm4gaGFzQkJveCA/IHRoaXNbU3ltYm9scy5HUk9VUF0ubm9kZSgpLmdldEJCb3goKSA6IHtcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5hdHRyKCdoZWlnaHQnKSxcbiAgICAgICAgICAgIHdpZHRoOiAgdGhpcy5hdHRyKCd3aWR0aCcpLFxuICAgICAgICAgICAgeDogICAgICB0aGlzLmF0dHIoJ3gnKSxcbiAgICAgICAgICAgIHk6ICAgICAgdGhpcy5hdHRyKCd5JylcbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
