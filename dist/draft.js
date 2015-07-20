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
            boundingBox: svg.append('g').attr('class', 'bounding').on('click', stopPropagation),
            resize: svg.append('g').attr('class', 'resize').on('click', stopPropagation)
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
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].boundingBox);
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
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].boundingBox);
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
                gridSize: 10,
                handleRadius: 22
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

var _helpersSymbols = require('./../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

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
            this.RADIUS = this.middleman().options().handleRadius;
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
            var layer = this.middleman().layers().resize;
            this.layer = layer.append('g');

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

                _this.edges[key] = _this.layer.append('image').attr('xlink:href', 'images/handle-main.png').attr('x', edge.x - _this.RADIUS / 2).attr('y', edge.y - _this.RADIUS / 2).attr('stroke', 'red').attr('stroke-width', 3).attr('width', _this.RADIUS).attr('height', _this.RADIUS).on('click', function () {
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

            if (this.layer) {
                this.layer.remove();
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
        key: 'rearrangeHandles',

        /**
         * @method rearrangeHandles
         * @param {String} currentKey
         * @return {void}
         */
        value: function rearrangeHandles(currentKey) {
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
            var handles = this.layer;
            var radius = this.RADIUS;
            var reattachHandles = this.reattachHandles.bind(this);
            var rearrangeHandles = this.rearrangeHandles.bind(this);
            var boundingBoxLayer = middleman[_helpersSymbols2['default'].DRAFT][_helpersSymbols2['default'].LAYERS].boundingBox;
            var startX = undefined,
                startY = undefined,
                ratio = undefined;

            return {

                /**
                 * @method start
                 * @return {{x: Number, y: Number}}
                 */
                start: function start() {

                    middleman.boundingBox().bBox.remove();
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

                    if (key !== 'topMiddle' && key !== 'bottomMiddle') {
                        handle.attr('x', finalX);
                    }

                    if (key !== 'rightMiddle' && key !== 'leftMiddle') {
                        handle.attr('y', finalY);
                    }

                    rearrangeHandles(key);

                    var bBox = handles.node().getBBox();
                    shape.attr('x', bBox.x + radius / 2).attr('y', bBox.y + radius / 2).attr('height', bBox.height - radius).attr('width', bBox.width - radius);

                    return { x: finalX, y: finalY };
                },

                /**
                 * @method end
                 * @return {void}
                 */
                end: function end() {
                    middleman.boundingBox().drawBoundingBox(middleman.selected(), boundingBoxLayer);
                    middleman.preventDeselect(false);
                    reattachHandles();
                }

            };
        }
    }]);

    return Resizable;
})(_Ability3['default']);

exports['default'] = Resizable;
module.exports = exports['default'];

},{"./../helpers/Symbols":12,"./Ability":2}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1Jlc2l6YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0F0dHJpYnV0ZXMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Cb3VuZGluZ0JveC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0ludm9jYXRvci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0tleUJpbmRpbmdzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2dDQ0EyQixxQkFBcUI7Ozs7OEJBQ3JCLG1CQUFtQjs7OztrQ0FDbkIsdUJBQXVCOzs7O2dDQUN2QixxQkFBcUI7O2dDQUNyQixxQkFBcUI7Ozs7NkJBQ3JCLGtCQUFrQjs7Ozs7Ozs7OztJQU92QyxLQUFLOzs7Ozs7Ozs7QUFRSSxhQVJULEtBQUssQ0FRSyxPQUFPLEVBQWdCOzs7WUFBZCxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixLQUFLOztBQVVILFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBUyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sc0JBcEIzQyxZQUFZLENBb0IrQyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RixZQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQU0sa0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLDRCQUFRLFlBQVksQ0FBQyxHQUFHLG9DQUFnQixTQUFTLENBQUMsQ0FBQzs7O0FBR3hELFlBQU0sS0FBSyxHQUFJLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDbkQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUNwRCxZQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsNEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxHLFlBQU0s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QUNWLGdCQUFJLENBQUMsNEJBQVEsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2xDLGdCQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ25EOzs7Ozs7OztlQU1VLHVCQUFHOztBQUVWLGdCQUFNLE9BQU8sR0FBRyxPQUFPLElBQUksQ0FBQyw0QkFBUSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDOztBQUV6RSxtQkFBTyxPQUFPLEdBQUcsSUFBSSxDQUFDLDRCQUFRLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHO0FBQ3BELHNCQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0IscUJBQUssRUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMxQixpQkFBQyxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGlCQUFDLEVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7YUFDekIsQ0FBQztTQUVMOzs7Ozs7OztlQU1nQiw2QkFBRztBQUNoQixtQkFBTyxFQUFFLENBQUM7U0FDYjs7O1dBdklnQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgTWlkZGxlbWFuICAgICAgZnJvbSAnLi9oZWxwZXJzL01pZGRsZW1hbic7XG5pbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1N5bWJvbHMnO1xuaW1wb3J0IEJvdW5kaW5nQm94ICAgIGZyb20gJy4vaGVscGVycy9Cb3VuZGluZ0JveCc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi9oZWxwZXJzL1BvbHlmaWxscyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi9oZWxwZXJzL0ludm9jYXRvcic7XG5pbXBvcnQgbWFwcGVyICAgICAgICAgZnJvbSAnLi9oZWxwZXJzL01hcHBlcic7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuU0hBUEVTXSAgICAgICA9IFtdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuT1BUSU9OU10gICAgICA9IChPYmplY3QuYXNzaWduIHx8IG9iamVjdEFzc2lnbikodGhpcy5vcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBtaWRkbGVtYW4gICAgICAgICAgICA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dICAgID0gbmV3IE1pZGRsZW1hbih0aGlzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0gPSBuZXcgQm91bmRpbmdCb3gobWlkZGxlbWFuKTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIFNWRyBjb21wb25lbnQgdXNpbmcgdGhlIGRlZmluZWQgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2lkdGggID0gdGhpc1tTeW1ib2xzLk9QVElPTlNdLmRvY3VtZW50V2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudEhlaWdodDtcbiAgICAgICAgY29uc3Qgc3ZnICAgID0gdGhpc1tTeW1ib2xzLlNWR10gPSBkMy5zZWxlY3QoZWxlbWVudCkuYXR0cignd2lkdGgnLCB3aWR0aCkuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgICAgICBjb25zdCBzdG9wUHJvcGFnYXRpb24gPSAoKSA9PiBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkxBWUVSU10gID0ge1xuICAgICAgICAgICAgc2hhcGVzOiAgICAgIHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzaGFwZXMnKS5vbignY2xpY2snLCBzdG9wUHJvcGFnYXRpb24pLFxuICAgICAgICAgICAgYm91bmRpbmdCb3g6IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdib3VuZGluZycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbiksXG4gICAgICAgICAgICByZXNpemU6ICAgICAgc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3Jlc2l6ZScpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIHdoZW4gdGhlIGNhbnZhcyBpcyBjbGlja2VkLlxuICAgICAgICBzdmcub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIW1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgLy8gYXMgYSBzdHJpbmcuXG4gICAgICAgIHNoYXBlID0gKHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycpID8gbWFwcGVyKHNoYXBlKSA6IHNoYXBlO1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBzaGFwZXMucHVzaChzaGFwZSk7XG5cbiAgICAgICAgLy8gUHV0IHRoZSBpbnRlcmZhY2UgZm9yIGludGVyYWN0aW5nIHdpdGggRHJhZnQgaW50byB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICBzaGFwZVtTeW1ib2xzLk1JRERMRU1BTl0gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHNoYXBlcy5pbmRleE9mKHNoYXBlKTtcblxuICAgICAgICBzaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGVzKTtcbiAgICAgICAgc2hhcGVzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10uYm91bmRpbmdCb3gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdChzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2Rlc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10uYm91bmRpbmdCb3gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUuaXNTZWxlY3RlZCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTAsXG4gICAgICAgICAgICBoYW5kbGVSYWRpdXM6IDIyXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKCgkd2luZG93KSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICgkd2luZG93KSB7XG5cbiAgICAgICAgLy8gRXhwb3J0IGRyYWZ0IGlmIHRoZSBgd2luZG93YCBvYmplY3QgaXMgYXZhaWxhYmxlLlxuICAgICAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbiAgICB9XG5cbn0pKHdpbmRvdyk7XG5cbi8vIEV4cG9ydCBmb3IgdXNlIGluIEVTNiBhcHBsaWNhdGlvbnMuXG5leHBvcnQgZGVmYXVsdCBEcmFmdDsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNoYXBlXG4gICAgICogQHJldHVybiB7QWJpbGl0eX1cbiAgICAgKi9cbiAgICBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgbWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVzaXphYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1Jlc2l6YWJsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lZGdlcyAgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzLlJBRElVUyA9IHRoaXMubWlkZGxlbWFuKCkub3B0aW9ucygpLmhhbmRsZVJhZGl1cztcbiAgICAgICAgdGhpcy5yZWF0dGFjaEhhbmRsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWF0dGFjaEhhbmRsZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlYXR0YWNoSGFuZGxlcygpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoSGFuZGxlc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoSGFuZGxlcygpIHtcblxuICAgICAgICBjb25zdCBzaGFwZSAgPSB0aGlzLnNoYXBlKCk7XG4gICAgICAgIGNvbnN0IGxheWVyICA9IHRoaXMubWlkZGxlbWFuKCkubGF5ZXJzKCkucmVzaXplO1xuICAgICAgICB0aGlzLmxheWVyICAgPSBsYXllci5hcHBlbmQoJ2cnKTtcblxuICAgICAgICBjb25zdCB4ICAgICAgPSBzaGFwZS5hdHRyKCd4Jyk7XG4gICAgICAgIGNvbnN0IHkgICAgICA9IHNoYXBlLmF0dHIoJ3knKTtcbiAgICAgICAgY29uc3Qgd2lkdGggID0gc2hhcGUuYXR0cignd2lkdGgnKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gc2hhcGUuYXR0cignaGVpZ2h0Jyk7XG5cbiAgICAgICAgY29uc3QgZWRnZU1hcCA9IHtcbiAgICAgICAgICAgIHRvcExlZnQ6ICAgICAgeyB4LCAgICAgICAgICAgICAgICAgIHkgfSxcbiAgICAgICAgICAgIHRvcE1pZGRsZTogICAgeyB4OiB4ICsgKHdpZHRoIC8gMiksIHkgfSxcbiAgICAgICAgICAgIHRvcFJpZ2h0OiAgICAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHkgfSxcbiAgICAgICAgICAgIGxlZnRNaWRkbGU6ICAgeyB4OiB4LCAgICAgICAgICAgICAgIHk6IHkgKyAoaGVpZ2h0IC8gMikgfSxcbiAgICAgICAgICAgIGJvdHRvbUxlZnQ6ICAgeyB4OiB4LCAgICAgICAgICAgICAgIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIGJvdHRvbU1pZGRsZTogeyB4OiB4ICsgKHdpZHRoIC8gMiksIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIHJpZ2h0TWlkZGxlOiAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHk6IHkgKyAoaGVpZ2h0IC8gMikgfVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGVkZ2VNYXApLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBlZGdlICAgICAgICAgID0gZWRnZU1hcFtrZXldO1xuICAgICAgICAgICAgY29uc3QgZHJhZ0JlaGF2aW91ciA9IHRoaXMuZHJhZyhzaGFwZSwga2V5KTtcblxuICAgICAgICAgICAgdGhpcy5lZGdlc1trZXldID0gdGhpcy5sYXllci5hcHBlbmQoJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsICdpbWFnZXMvaGFuZGxlLW1haW4ucG5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsIGVkZ2UueCAtICh0aGlzLlJBRElVUyAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgZWRnZS55IC0gKHRoaXMuUkFESVVTIC8gMikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuUkFESVVTKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLlJBRElVUylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZHJhZ0JlaGF2aW91ci5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdkcmFnJywgZHJhZ0JlaGF2aW91ci5kcmFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2RyYWdlbmQnLCBkcmFnQmVoYXZpb3VyLmVuZCkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXRhY2hIYW5kbGVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXRhY2hIYW5kbGVzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVyLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBvcFVuaXF1ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHBvcFVuaXF1ZShpdGVtcykge1xuXG4gICAgICAgIGNvbnN0IGNvdW50cyA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBpdGVtcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IG51bSAgID0gaXRlbXNbaW5kZXhdO1xuICAgICAgICAgICAgY291bnRzW251bV0gPSBjb3VudHNbbnVtXSA/IGNvdW50c1tudW1dICsgMSA6IDE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1bmlxdWUgPSBPYmplY3Qua2V5cyhjb3VudHMpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY291bnRzW2tleV0gPT09IDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB1bmlxdWUubGVuZ3RoID8gTnVtYmVyKHVuaXF1ZVswXSkgOiBpdGVtc1swXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVhcnJhbmdlSGFuZGxlc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjdXJyZW50S2V5XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWFycmFuZ2VIYW5kbGVzKGN1cnJlbnRLZXkpIHtcblxuICAgICAgICBjb25zdCBjb29yZHMgICAgID0gW107XG4gICAgICAgIGNvbnN0IHJlZ0V4cCAgICAgPSAvKD89W0EtWl0pLztcbiAgICAgICAgY29uc3QgZGltZW5zaW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZWRnZXMpO1xuXG4gICAgICAgIGRpbWVuc2lvbnMuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFBhY2thZ2UgYWxsIG9mIHRoZSBjb29yZGluYXRlcyB1cCBpbnRvIGEgbW9yZSBzaW1wbGUgYGNvb3Jkc2Agb2JqZWN0IGZvciBicmV2aXR5LlxuICAgICAgICAgICAgY29uc3QgZWRnZSAgPSB0aGlzLmVkZ2VzW2tleV07XG4gICAgICAgICAgICBjb29yZHNba2V5XSA9IHsgeDogTnVtYmVyKGVkZ2UuYXR0cigneCcpKSwgeTogTnVtYmVyKGVkZ2UuYXR0cigneScpKSB9O1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgY29ybmVyUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wOiBOdW1iZXIsIHJpZ2h0OiBOdW1iZXIsIGJvdHRvbTogTnVtYmVyLCBsZWZ0OiBOdW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY29ybmVyUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBjb29yZGluYXRlIHRoYXQgZG9lc24ndCBtYXRjaCB0aGUgb3RoZXJzLCB3aGljaCBtZWFucyB0aGF0IGlzIHRoZSBjb29yZGluYXRlIHRoYXQgaXMgY3VycmVudGx5XG4gICAgICAgICAgICAvLyBiZWluZyBtb2RpZmllZCB3aXRob3V0IGFueSBjb25kaXRpb25hbCBzdGF0ZW1lbnRzLlxuICAgICAgICAgICAgdG9wOiAgICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueSwgICAgY29vcmRzLnRvcE1pZGRsZS55LCAgICBjb29yZHMudG9wUmlnaHQueV0pLFxuICAgICAgICAgICAgcmlnaHQ6ICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcFJpZ2h0LngsICAgY29vcmRzLnJpZ2h0TWlkZGxlLngsICBjb29yZHMuYm90dG9tUmlnaHQueF0pLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLmJvdHRvbUxlZnQueSwgY29vcmRzLmJvdHRvbU1pZGRsZS55LCBjb29yZHMuYm90dG9tUmlnaHQueV0pLFxuICAgICAgICAgICAgbGVmdDogICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueCwgICAgY29vcmRzLmxlZnRNaWRkbGUueCwgICBjb29yZHMuYm90dG9tTGVmdC54XSlcblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAY29uc3RhbnQgbWlkZGxlUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wTWlkZGxlOiBudW1iZXIsIHJpZ2h0TWlkZGxlOiBudW1iZXIsIGJvdHRvbU1pZGRsZTogbnVtYmVyLCBsZWZ0TWlkZGxlOiBudW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbWlkZGxlUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBBbGwgb2YgdGhlc2UgbWlkZGxlIHBvc2l0aW9ucyBhcmUgcmVsYXRpdmUgdG8gdGhlIGNvcm5lciBwb3NpdGlvbnMgYWJvdmUuXG4gICAgICAgICAgICB0b3BNaWRkbGU6ICAgIChjb3JuZXJQb3NpdGlvbnMubGVmdCArIGNvcm5lclBvc2l0aW9ucy5yaWdodCkgLyAyLFxuICAgICAgICAgICAgcmlnaHRNaWRkbGU6ICAoY29ybmVyUG9zaXRpb25zLnRvcCArIGNvcm5lclBvc2l0aW9ucy5ib3R0b20pIC8gMixcbiAgICAgICAgICAgIGJvdHRvbU1pZGRsZTogKGNvcm5lclBvc2l0aW9ucy5sZWZ0ICsgY29ybmVyUG9zaXRpb25zLnJpZ2h0KSAvIDIsXG4gICAgICAgICAgICBsZWZ0TWlkZGxlOiAgIChjb3JuZXJQb3NpdGlvbnMudG9wICsgY29ybmVyUG9zaXRpb25zLmJvdHRvbSkgLyAyXG5cbiAgICAgICAgfTtcblxuICAgICAgICBkaW1lbnNpb25zLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudEtleSAhPT0ga2V5KSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdChyZWdFeHApLm1hcChrZXkgPT4ga2V5LnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnbWlkZGxlJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICd0b3BNaWRkbGUnIHx8IGtleSA9PT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzBdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIG1pZGRsZVBvc2l0aW9uc1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgbWlkZGxlUG9zaXRpb25zW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneScsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd4JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzFdXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgICAqIEByZXR1cm4ge3tzdGFydDogRnVuY3Rpb24sIGRyYWc6IEZ1bmN0aW9uLCBlbmQ6IEZ1bmN0aW9ufX1cbiAgICAgKi9cbiAgICBkcmFnKHNoYXBlLCBrZXkpIHtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gICAgICAgID0gdGhpcy5taWRkbGVtYW4oKTtcbiAgICAgICAgY29uc3QgaGFuZGxlcyAgICAgICAgICA9IHRoaXMubGF5ZXI7XG4gICAgICAgIGNvbnN0IHJhZGl1cyAgICAgICAgICAgPSB0aGlzLlJBRElVUztcbiAgICAgICAgY29uc3QgcmVhdHRhY2hIYW5kbGVzICA9IHRoaXMucmVhdHRhY2hIYW5kbGVzLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IHJlYXJyYW5nZUhhbmRsZXMgICAgID0gdGhpcy5yZWFycmFuZ2VIYW5kbGVzLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94TGF5ZXIgPSBtaWRkbGVtYW5bU3ltYm9scy5EUkFGVF1bU3ltYm9scy5MQVlFUlNdLmJvdW5kaW5nQm94O1xuICAgICAgICBsZXQgc3RhcnRYLCBzdGFydFksIHJhdGlvO1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBzdGFydFxuICAgICAgICAgICAgICogQHJldHVybiB7e3g6IE51bWJlciwgeTogTnVtYmVyfX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuXG4gICAgICAgICAgICAgICAgbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuYkJveC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KHRydWUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2RyYWdnaW5nJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmF0aW8gICAgICAgID0gc2hhcGUuYXR0cignd2lkdGgnKSAvIHNoYXBlLmF0dHIoJ2hlaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgc3RhcnRYID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVggLSBwYXJzZUludChoYW5kbGUuYXR0cigneCcpKTtcbiAgICAgICAgICAgICAgICBzdGFydFkgPSBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWSAtIHBhcnNlSW50KGhhbmRsZS5hdHRyKCd5JykpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgeDogc3RhcnRYLCB5OiBzdGFydFkgfTtcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3t4OiBOdW1iZXIsIHk6IE51bWJlcn19XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRyYWc6IGZ1bmN0aW9uIGRyYWcoKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gbWlkZGxlbWFuLm9wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGUgID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vdmVYICAgPSAoZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVggLSBzdGFydFgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vdmVZICAgPSAoZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkgLSBzdGFydFkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsWCAgPSBNYXRoLmNlaWwobW92ZVggLyBvcHRpb25zLmdyaWRTaXplKSAqIG9wdGlvbnMuZ3JpZFNpemU7XG4gICAgICAgICAgICAgICAgY29uc3QgZmluYWxZICA9IE1hdGguY2VpbChtb3ZlWSAvIG9wdGlvbnMuZ3JpZFNpemUpICogb3B0aW9ucy5ncmlkU2l6ZTtcblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0b3BNaWRkbGUnICYmIGtleSAhPT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3gnLCBmaW5hbFgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdyaWdodE1pZGRsZScgJiYga2V5ICE9PSAnbGVmdE1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3knLCBmaW5hbFkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlYXJyYW5nZUhhbmRsZXMoa2V5KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBiQm94ID0gaGFuZGxlcy5ub2RlKCkuZ2V0QkJveCgpO1xuICAgICAgICAgICAgICAgIHNoYXBlLmF0dHIoJ3gnLCBiQm94LnggKyAocmFkaXVzIC8gMikpLmF0dHIoJ3knLCBiQm94LnkgKyAocmFkaXVzIC8gMikpXG4gICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgYkJveC5oZWlnaHQgLSByYWRpdXMpLmF0dHIoJ3dpZHRoJywgYkJveC53aWR0aCAtIHJhZGl1cyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4geyB4OiBmaW5hbFgsIHk6IGZpbmFsWSB9O1xuXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZW5kXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBlbmQ6IGZ1bmN0aW9uIGVuZCgpIHtcbiAgICAgICAgICAgICAgICBtaWRkbGVtYW4uYm91bmRpbmdCb3goKS5kcmF3Qm91bmRpbmdCb3gobWlkZGxlbWFuLnNlbGVjdGVkKCksIGJvdW5kaW5nQm94TGF5ZXIpO1xuICAgICAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJlYXR0YWNoSGFuZGxlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSBleHRlbmRzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuRUxFTUVOVF07XG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgZWxlbWVudC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbignZHJhZycsICgpID0+IHRoaXMuaGFuZGxlRHJhZygpKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZURyYWdcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgaGFuZGxlRHJhZygpIHtcblxuICAgICAgICB0aGlzLmhhbmRsZUNsaWNrKCk7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBmYWtlIGV2ZW50IHRvIGRyYWcgdGhlIHNoYXBlIHdpdGggYW4gb3ZlcnJpZGUgWCBhbmQgWSB2YWx1ZS5cbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCgnbW91c2Vkb3duJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgZXZlbnQub3ZlcnJpZGVYID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVg7XG4gICAgICAgIGV2ZW50Lm92ZXJyaWRlWSA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGNvbnN0IGJCb3ggPSBtaWRkbGVtYW4uYm91bmRpbmdCb3goKS5iQm94Lm5vZGUoKTtcbiAgICAgICAgYkJveC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3Qga2V5TWFwID0gdGhpcy5taWRkbGVtYW4oKVtTeW1ib2xzLktFWV9NQVBdO1xuXG4gICAgICAgIGlmICh0aGlzLnNoYXBlKCkuaXNTZWxlY3RlZCgpKSB7XG5cbiAgICAgICAgICAgIGlmICgha2V5TWFwLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb3RoZXJzIGFuZCBzZWxlY3Qgb25seSB0aGUgY3VycmVudCBzaGFwZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgZXhjbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IHRoZSBzaGFwZSBpZiBpdCdzIGN1cnJlbnRseSBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiB2b2lkIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBpbmNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5TWFwLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBzaGFwZXMgZXhjZXB0IGZvciB0aGUgY3VycmVudC5cbiAgICAgICAgICAgIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBleGNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWlkZGxlbWFuKCkuc2VsZWN0KHsgaW5jbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEF0dHJpYnV0ZXNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cblxuLypcbiAqIEBtZXRob2Qgc2V0QXR0cmlidXRlXG4gKiBAcGFyYW0ge0FycmF5fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgY29uc3QgeSA9IGVsZW1lbnQuZGF0dW0oKS55IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt2YWx1ZX0sICR7eX0pYCk7XG5cbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICBjb25zdCB4ID0gZWxlbWVudC5kYXR1bSgpLnggfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3ZhbHVlfSlgKTtcblxuICAgIH1cblxuICAgIGVsZW1lbnQuYXR0cihuYW1lLCB2YWx1ZSk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi9TeW1ib2xzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEJvdW5kaW5nQm94XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3VuZGluZ0JveCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge01pZGRsZW1hbn0gbWlkZGxlbWFuXG4gICAgICogQHJldHVybiB7Qm91bmRpbmdCb3h9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWlkZGxlbWFuKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbWlkZGxlbWFuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGFuZGxlQ2xpY2tcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGhhbmRsZUNsaWNrKCkge1xuXG4gICAgICAgIGNvbnN0IG1pZGRsZW1hbiA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAobWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCgpKSB7XG4gICAgICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1vdXNlWCA9IGQzLmV2ZW50LnBhZ2VYO1xuICAgICAgICBjb25zdCBtb3VzZVkgPSBkMy5ldmVudC5wYWdlWTtcblxuICAgICAgICB0aGlzLmJCb3guYXR0cigncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdhbGwnKTtcblxuICAgICAgICBpZiAobWlkZGxlbWFuLmZyb21FbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogZmFsc2UgfSk7XG4gICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmF3Qm91bmRpbmdCb3hcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBzZWxlY3RlZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBsYXllclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhd0JvdW5kaW5nQm94KHNlbGVjdGVkLCBsYXllcikge1xuXG4gICAgICAgIGlmICh0aGlzLmJCb3gpIHtcbiAgICAgICAgICAgIHRoaXMuYkJveC5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1vZGVsID0geyBtaW5YOiBOdW1iZXIuTUFYX1ZBTFVFLCBtaW5ZOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4WDogTnVtYmVyLk1JTl9WQUxVRSwgbWF4WTogTnVtYmVyLk1JTl9WQUxVRSB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNwb25zaWJsZSBmb3IgY29tcHV0aW5nIHRoZSBjb2xsZWN0aXZlIGJvdW5kaW5nIGJveCwgYmFzZWQgb24gYWxsIG9mIHRoZSBib3VuZGluZyBib3hlc1xuICAgICAgICAgKiBmcm9tIHRoZSBjdXJyZW50IHNlbGVjdGVkIHNoYXBlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1ldGhvZCBjb21wdXRlXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGJCb3hlc1xuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY29tcHV0ZSA9IChiQm94ZXMpID0+IHtcbiAgICAgICAgICAgIG1vZGVsLm1pblggPSBNYXRoLm1pbiguLi5iQm94ZXMubWFwKChkKSA9PiBkLngpKTtcbiAgICAgICAgICAgIG1vZGVsLm1pblkgPSBNYXRoLm1pbiguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFggPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnggKyBkLndpZHRoKSk7XG4gICAgICAgICAgICBtb2RlbC5tYXhZID0gTWF0aC5tYXgoLi4uYkJveGVzLm1hcCgoZCkgPT4gZC55ICsgZC5oZWlnaHQpKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb21wdXRlIHRoZSBjb2xsZWN0aXZlIGJvdW5kaW5nIGJveC5cbiAgICAgICAgY29tcHV0ZShzZWxlY3RlZC5tYXAoKHNoYXBlKSA9PiBzaGFwZS5ib3VuZGluZ0JveCgpKSk7XG5cbiAgICAgICAgdGhpcy5iQm94ID0gbGF5ZXIuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0obW9kZWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2RyYWctYm94JywgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsICAgICAgKChkKSA9PiBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgICAgICAoKGQpID0+IGQubWluWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgICgoZCkgPT4gZC5tYXhYIC0gZC5taW5YKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgKChkKSA9PiBkLm1heFkgLSBkLm1pblkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuXG4gICAgICAgIGNvbnN0IGRyYWdTdGFydCA9IFsnZHJhZ3N0YXJ0JywgKCkgPT4gdGhpcy5kcmFnU3RhcnQoKV07XG4gICAgICAgIGNvbnN0IGRyYWcgICAgICA9IFsnZHJhZycsICAgICAgKCkgPT4gdGhpcy5kcmFnKCldO1xuICAgICAgICBjb25zdCBkcmFnRW5kICAgPSBbJ2RyYWdlbmQnLCAgICgpID0+IHRoaXMuZHJhZ0VuZCgpXTtcblxuICAgICAgICB0aGlzLmJCb3guY2FsbChkMy5iZWhhdmlvci5kcmFnKCkub24oLi4uZHJhZ1N0YXJ0KS5vbiguLi5kcmFnKS5vbiguLi5kcmFnRW5kKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdTdGFydFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ1N0YXJ0KHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIGNvbnN0IHNYID0gTnVtYmVyKHRoaXMuYkJveC5hdHRyKCd4JykpO1xuICAgICAgICBjb25zdCBzWSA9IE51bWJlcih0aGlzLmJCb3guYXR0cigneScpKTtcblxuICAgICAgICB0aGlzLnN0YXJ0ID0ge1xuICAgICAgICAgICAgeDogKHggIT09IG51bGwpID8geCA6IChkMy5ldmVudC5zb3VyY2VFdmVudC5vdmVycmlkZVggfHwgZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVgpIC0gc1gsXG4gICAgICAgICAgICB5OiAoeSAhPT0gbnVsbCkgPyB5IDogKGQzLmV2ZW50LnNvdXJjZUV2ZW50Lm92ZXJyaWRlWSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWSkgLSBzWVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubW92ZSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiB7IHg6IHNYLCB5OiBzWSB9LFxuICAgICAgICAgICAgZW5kOiAgIHsgfVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFttdWx0aXBsZU9mPXRoaXNbU3ltYm9scy5NSURETEVNQU5dLm9wdGlvbnMoKS5ncmlkU2l6ZV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWcoeCA9IG51bGwsIHkgPSBudWxsLCBtdWx0aXBsZU9mID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ub3B0aW9ucygpLmdyaWRTaXplKSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ucHJldmVudERlc2VsZWN0KHRydWUpO1xuXG4gICAgICAgIHggPSAoeCAhPT0gbnVsbCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVg7XG4gICAgICAgIHkgPSAoeSAhPT0gbnVsbCkgPyB5IDogZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVk7XG5cbiAgICAgICAgY29uc3QgbVggPSAoeCAtIHRoaXMuc3RhcnQueCksXG4gICAgICAgICAgICAgIG1ZID0gKHkgLSB0aGlzLnN0YXJ0LnkpLFxuICAgICAgICAgICAgICBlWCA9IE1hdGguY2VpbChtWCAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZixcbiAgICAgICAgICAgICAgZVkgPSBNYXRoLmNlaWwobVkgLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2Y7XG5cbiAgICAgICAgdGhpcy5iQm94LmRhdHVtKCkueCA9IGVYO1xuICAgICAgICB0aGlzLmJCb3guZGF0dW0oKS55ID0gZVk7XG5cbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3gnLCBlWCk7XG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCd5JywgZVkpO1xuXG4gICAgICAgIHRoaXMubW92ZS5lbmQgPSB7IHg6IGVYLCB5OiBlWSB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnRW5kXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnRW5kKCkge1xuXG4gICAgICAgIGNvbnN0IGVYICAgID0gdGhpcy5tb3ZlLmVuZC54IC0gdGhpcy5tb3ZlLnN0YXJ0Lng7XG4gICAgICAgIGNvbnN0IGVZICAgID0gdGhpcy5tb3ZlLmVuZC55IC0gdGhpcy5tb3ZlLnN0YXJ0Lnk7XG5cbiAgICAgICAgaWYgKGlzTmFOKGVYKSB8fCBpc05hTihlWSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdmUgZWFjaCBzaGFwZSBieSB0aGUgZGVsdGEgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZCBwb2ludHMuXG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dLnNlbGVjdGVkKCkuZm9yRWFjaCgoc2hhcGUpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSBzaGFwZS5hdHRyKCd4Jyk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50WSA9IHNoYXBlLmF0dHIoJ3knKTtcbiAgICAgICAgICAgIGNvbnN0IG1vdmVYICAgID0gY3VycmVudFggKyBlWDtcbiAgICAgICAgICAgIGNvbnN0IG1vdmVZICAgID0gY3VycmVudFkgKyBlWTtcblxuICAgICAgICAgICAgc2hhcGUuYXR0cigneCcsIG1vdmVYKS5hdHRyKCd5JywgbW92ZVkpO1xuICAgICAgICAgICAgc2hhcGUuZGlkTW92ZSgpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi9TeW1ib2xzJztcblxuLyoqXG4gKiBAbWV0aG9kIHRyeUludm9rZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7U3RyaW5nfSBmdW5jdGlvbk5hbWVcbiAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IHRyeUludm9rZSA9IChjb250ZXh0LCBmdW5jdGlvbk5hbWUsIC4uLm9wdGlvbnMpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0W2Z1bmN0aW9uTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29udGV4dFtmdW5jdGlvbk5hbWVdKC4uLm9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG5cbn07XG5cbi8qKlxuICogQG1ldGhvZCBjYXBpdGFsaXplXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBjYXBpdGFsaXplID0gKG5hbWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgSW52b2NhdG9yXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAoKCkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRpZFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fFNoYXBlfSBzaGFwZXNcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGRpZCh0eXBlLCBzaGFwZXMpIHtcblxuICAgICAgICAgICAgc2hhcGVzID0gQXJyYXkuaXNBcnJheShzaGFwZXMpID8gc2hhcGVzIDogW3NoYXBlc107XG5cbiAgICAgICAgICAgIHJldHVybiBzaGFwZXMuZXZlcnkoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyeUludm9rZShzaGFwZSwgYGRpZCR7Y2FwaXRhbGl6ZSh0eXBlKX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW5jbHVkZUV4Y2x1ZGVcbiAgICAgICAgICogQHBhcmFtIHtEcmFmdH0gZHJhZnRcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgaW5jbHVkZUV4Y2x1ZGUoZHJhZnQsIGZuLCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICAgICAgY29uc3QgaW5jbHVkZSAgID0gb3B0aW9ucy5pbmNsdWRlIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGV4Y2x1ZGUgICA9IG9wdGlvbnMuZXhjbHVkZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBtaWRkbGVtYW4gPSBkcmFmdFtTeW1ib2xzLk1JRERMRU1BTl07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBhbGxFeGNsdWRpbmdcbiAgICAgICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGV4Y2x1ZGluZ1xuICAgICAgICAgICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGFsbEV4Y2x1ZGluZyA9IChleGNsdWRpbmcpID0+IHtcblxuICAgICAgICAgICAgICAgIGV4Y2x1ZGluZyA9IEFycmF5LmlzQXJyYXkoZXhjbHVkaW5nKSA/IGV4Y2x1ZGluZyA6IFtleGNsdWRpbmddO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1pZGRsZW1hbi5hbGwoKS5maWx0ZXIoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhfmV4Y2x1ZGluZy5pbmRleE9mKHNoYXBlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGluY2x1ZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCBmbi5hcHBseShkcmFmdCwgW2luY2x1ZGVdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFleGNsdWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgZm4uYXBwbHkoZHJhZnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmbi5hcHBseShkcmFmdCwgW2FsbEV4Y2x1ZGluZyhleGNsdWRlKV0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi9TeW1ib2xzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEtleUJpbmRpbmdzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXlCaW5kaW5ncyB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge01pZGRsZW1hbn0gbWlkZGxlbWFuXG4gICAgICogQHJldHVybiB7S2V5QmluZGluZ3N9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWlkZGxlbWFuKSB7XG5cbiAgICAgICAgY29uc3Qga2V5TWFwICAgICAgICAgICAgPSBtaWRkbGVtYW5bU3ltYm9scy5LRVlfTUFQXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBtaWRkbGVtYW47XG5cbiAgICAgICAgLy8gRGVmYXVsdCBrZXAgbWFwcGluZ3NcbiAgICAgICAga2V5TWFwLm11bHRpU2VsZWN0ID0gZmFsc2U7XG4gICAgICAgIGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUga2V5IG1hcC5cbiAgICAgICAgdGhpcy5hdHRhY2hCaW5kaW5ncyhrZXlNYXApO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRhY2hCaW5kaW5nc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXlNYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGF0dGFjaEJpbmRpbmdzKGtleU1hcCkge1xuXG4gICAgICAgIC8vIFNlbGVjdCBhbGwgb2YgdGhlIGF2YWlsYWJsZSBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLnNlbGVjdCgpKTtcblxuICAgICAgICAvLyBNdWx0aS1zZWxlY3Rpbmcgc2hhcGVzLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiBrZXlNYXAubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICAgICAgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvcyB3aGVuIHJlc2l6aW5nLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiBrZXlNYXAuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiBrZXlNYXAuYXNwZWN0UmF0aW8gPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgVGhyb3cgICAgIGZyb20gJy4uL2hlbHBlcnMvVGhyb3cnO1xuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi9zaGFwZXMvUmVjdGFuZ2xlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1hcHBlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG5hbWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgICByZWN0YW5nbGU6IFJlY3RhbmdsZVxuICAgIH07XG5cbiAgICByZXR1cm4gdHlwZW9mIG1hcFtuYW1lXSAhPT0gJ3VuZGVmaW5lZCcgPyBuZXcgbWFwW25hbWVdKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgVGhyb3coYENhbm5vdCBtYXAgXCIke25hbWV9XCIgdG8gYSBzaGFwZSBvYmplY3RgKTtcblxufTsiLCJpbXBvcnQgU3ltYm9scyAgICAgZnJvbSAnLi9TeW1ib2xzJztcbmltcG9ydCBLZXlCaW5kaW5ncyBmcm9tICcuL0tleUJpbmRpbmdzJztcbmltcG9ydCBpbnZvY2F0b3IgICBmcm9tICcuL0ludm9jYXRvcic7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNaWRkbGVtYW5cbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZGRsZW1hbiB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkcmFmdCkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0gICAgICAgID0gZHJhZnQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5LRVlfTUFQXSAgICAgID0ge307XG4gICAgICAgIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdID0gZmFsc2U7XG5cbiAgICAgICAgbmV3IEtleUJpbmRpbmdzKHRoaXMpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkM1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkMygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5TVkddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGF5ZXJzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGxheWVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5MQVlFUlNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5vcHRpb25zKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBrZXlNYXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5TWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLktFWV9NQVBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdChvcHRpb25zKSB7XG4gICAgICAgIGludm9jYXRvci5pbmNsdWRlRXhjbHVkZSh0aGlzW1N5bWJvbHMuRFJBRlRdLCB0aGlzW1N5bWJvbHMuRFJBRlRdLnNlbGVjdCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdChvcHRpb25zKSB7XG4gICAgICAgIGludm9jYXRvci5pbmNsdWRlRXhjbHVkZSh0aGlzW1N5bWJvbHMuRFJBRlRdLCB0aGlzW1N5bWJvbHMuRFJBRlRdLmRlc2VsZWN0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0uYWxsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIHNlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5zZWxlY3RlZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZnJvbUVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZnJvbUVsZW1lbnQoZWxlbWVudCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50ID09PSBzaGFwZVtTeW1ib2xzLkVMRU1FTlRdLm5vZGUoKTtcbiAgICAgICAgfSlbMF07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHByZXZlbnREZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKi9cbiAgICBwcmV2ZW50RGVzZWxlY3QodmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF0gPSB2YWx1ZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYm91bmRpbmdCb3hcbiAgICAgKiBAcmV0dXJuIHtCb3VuZGluZ0JveH1cbiAgICAgKi9cbiAgICBib3VuZGluZ0JveCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5CT1VORElOR19CT1hdO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgICAgIFN5bWJvbCgnZHJhZnQnKSxcbiAgICBTVkc6ICAgICAgICAgIFN5bWJvbCgnc3ZnJyksXG4gICAgRUxFTUVOVDogICAgICBTeW1ib2woJ2VsZW1lbnQnKSxcbiAgICBJU19TRUxFQ1RFRDogIFN5bWJvbCgnaXNTZWxlY3RlZCcpLFxuICAgIEFUVFJJQlVURVM6ICAgU3ltYm9sKCdhdHRyaWJ1dGVzJyksXG4gICAgTUlERExFTUFOOiAgICBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFOiAgICAgICAgU3ltYm9sKCdzaGFwZScpLFxuICAgIFNIQVBFUzogICAgICAgU3ltYm9sKCdzaGFwZXMnKSxcbiAgICBMQVlFUlM6ICAgICAgIFN5bWJvbCgnbGF5ZXJzJyksXG4gICAgR1JPVVA6ICAgICAgICBTeW1ib2woJ2dyb3VwJyksXG4gICAgQk9VTkRJTkdfQk9YOiBTeW1ib2woJ2JvdW5kaW5nQm94JyksXG4gICAgT1BUSU9OUzogICAgICBTeW1ib2woJ29wdGlvbnMnKSxcbiAgICBBQklMSVRJRVM6ICAgIFN5bWJvbCgnYWJpbGl0aWVzJyksXG4gICAgS0VZX01BUDogICAgICBTeW1ib2woJ2tleU1hcCcpLFxuICAgIENBTl9ERVNFTEVDVDogU3ltYm9sKCdjYW5EZXNlbGVjdCcpXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFRocm93XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaHJvdyB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAqIEByZXR1cm4ge1Rocm93fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS5gKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGw6ICdibHVlJyxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBUaHJvdyAgICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93JztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuLi9oZWxwZXJzL1BvbHlmaWxscyc7XG5pbXBvcnQgc2V0QXR0cmlidXRlICAgZnJvbSAnLi4vaGVscGVycy9BdHRyaWJ1dGVzJztcbmltcG9ydCBpbnZvY2F0b3IgICAgICBmcm9tICcuLi9oZWxwZXJzL0ludm9jYXRvcic7XG5pbXBvcnQgU2VsZWN0YWJsZSAgICAgZnJvbSAnLi4vYWJpbGl0aWVzL1NlbGVjdGFibGUnO1xuaW1wb3J0IFJlc2l6YWJsZSAgICAgIGZyb20gJy4uL2FiaWxpdGllcy9SZXNpemFibGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXR0cmlidXRlcz17fV1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdID0gYXR0cmlidXRlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gV2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIGB0YWdOYW1lYCBtZXRob2QgaGFzbid0IGJlZW4gZGVmaW5lZCBvbiB0aGUgY2hpbGQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgbmV3IFRocm93KCdUYWcgbmFtZSBtdXN0IGJlIGRlZmluZWQgZm9yIGEgc2hhcGUgdXNpbmcgdGhlIGB0YWdOYW1lYCBtZXRob2QnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge1NoYXBlfCp9XG4gICAgICovXG4gICAgYXR0cihuYW1lLCB2YWx1ZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICBzZXRBdHRyaWJ1dGUodGhpc1tTeW1ib2xzLkVMRU1FTlRdLCBuYW1lLCB2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnN0IGxheWVyICAgICAgICAgICA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLmxheWVycygpLnNoYXBlcztcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyAgICAgID0gb2JqZWN0QXNzaWduKHRoaXMuZGVmYXVsdEF0dHJpYnV0ZXMoKSwgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkdST1VQXSAgID0gbGF5ZXIuYXBwZW5kKCdnJyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXSA9IHRoaXNbU3ltYm9scy5HUk9VUF0uYXBwZW5kKHRoaXMudGFnTmFtZSgpKS5kYXR1bSh7fSk7XG5cbiAgICAgICAgLy8gQXNzaWduIGVhY2ggYXR0cmlidXRlIGZyb20gdGhlIGRlZmF1bHQgYXR0cmlidXRlcyBkZWZpbmVkIG9uIHRoZSBzaGFwZSwgYXMgd2VsbCBhcyB0aG9zZSBkZWZpbmVkXG4gICAgICAgIC8vIGJ5IHRoZSB1c2VyIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgc2hhcGUuXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4gdGhpcy5hdHRyKGtleSwgYXR0cmlidXRlc1trZXldKSk7XG5cbiAgICAgICAgY29uc3QgYWJpbGl0aWVzICA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKCksXG4gICAgICAgICAgICByZXNpemFibGU6ICBuZXcgUmVzaXphYmxlKClcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhYmlsaXRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNoYXBlIG9iamVjdCBpbnRvIGVhY2ggYWJpbGl0eSBpbnN0YW5jZSwgYW5kIGludm9rZSB0aGUgYGRpZEFkZGAgbWV0aG9kLlxuICAgICAgICAgICAgY29uc3QgYWJpbGl0eSA9IGFiaWxpdGllc1trZXldO1xuICAgICAgICAgICAgYWJpbGl0eVtTeW1ib2xzLlNIQVBFXSA9IHRoaXM7XG4gICAgICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBhYmlsaXR5KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXSA9IGFiaWxpdGllcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkUmVtb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRSZW1vdmUoKSB7IH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkTW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkTW92ZSgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLnJlYXR0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkU2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRTZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSB0cnVlO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXS5yZXNpemFibGUuZGlkU2VsZWN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSBmYWxzZTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLmRpZERlc2VsZWN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBib3VuZGluZ0JveFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBib3VuZGluZ0JveCgpIHtcblxuICAgICAgICBjb25zdCBoYXNCQm94ID0gdHlwZW9mIHRoaXNbU3ltYm9scy5HUk9VUF0ubm9kZSgpLmdldEJCb3ggPT09ICdmdW5jdGlvbic7XG5cbiAgICAgICAgcmV0dXJuIGhhc0JCb3ggPyB0aGlzW1N5bWJvbHMuR1JPVVBdLm5vZGUoKS5nZXRCQm94KCkgOiB7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuYXR0cignaGVpZ2h0JyksXG4gICAgICAgICAgICB3aWR0aDogIHRoaXMuYXR0cignd2lkdGgnKSxcbiAgICAgICAgICAgIHg6ICAgICAgdGhpcy5hdHRyKCd4JyksXG4gICAgICAgICAgICB5OiAgICAgIHRoaXMuYXR0cigneScpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG59Il19
