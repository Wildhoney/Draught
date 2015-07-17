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
            boundingBox: svg.append('g').attr('class', 'bounding-box').on('click', stopPropagation),
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
            var layer = this.middleman().layers().boundingBox;
            this.layer = layer.append('g').attr('class', 'resize-handles');

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1Jlc2l6YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0F0dHJpYnV0ZXMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Cb3VuZGluZ0JveC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0ludm9jYXRvci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0tleUJpbmRpbmdzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2dDQ0EyQixxQkFBcUI7Ozs7OEJBQ3JCLG1CQUFtQjs7OztrQ0FDbkIsdUJBQXVCOzs7O2dDQUN2QixxQkFBcUI7O2dDQUNyQixxQkFBcUI7Ozs7NkJBQ3JCLGtCQUFrQjs7Ozs7Ozs7OztJQU92QyxLQUFLOzs7Ozs7Ozs7QUFRSSxhQVJULEtBQUssQ0FRSyxPQUFPLEVBQWdCOzs7WUFBZCxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixLQUFLOztBQVVILFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBUyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sc0JBcEIzQyxZQUFZLENBb0IrQyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RixZQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQU0sa0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLDRCQUFRLFlBQVksQ0FBQyxHQUFHLG9DQUFnQixTQUFTLENBQUMsQ0FBQzs7O0FBR3hELFlBQU0sS0FBSyxHQUFJLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDbkQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUNwRCxZQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsNEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxHLFlBQU0s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UyxFQUFFLENBQUM7U0FDakQ7Ozs7Ozs7O2VBTVUsdUJBQUc7QUFDVixnQkFBSSxDQUFDLDRCQUFRLFdBQVcsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNsQyxnQkFBSSxDQUFDLDRCQUFRLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNuRDs7Ozs7Ozs7ZUFNVSx1QkFBRzs7QUFFVixnQkFBTSxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsNEJBQVEsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxLQUFLLFVBQVUsQ0FBQzs7QUFFekUsbUJBQU8sT0FBTyxHQUFHLElBQUksQ0FBQyw0QkFBUSxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRztBQUNwRCxzQkFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCLHFCQUFLLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDMUIsaUJBQUMsRUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN0QixpQkFBQyxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQ3pCLENBQUM7U0FFTDs7Ozs7Ozs7ZUFNZ0IsNkJBQUc7QUFDaEIsbUJBQU8sRUFBRSxDQUFDO1NBQ2I7OztXQXZJZ0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4nO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBCb3VuZGluZ0JveCAgICBmcm9tICcuL2hlbHBlcnMvQm91bmRpbmdCb3gnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IG1hcHBlciAgICAgICAgIGZyb20gJy4vaGVscGVycy9NYXBwZXInO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLlNIQVBFU10gICAgICAgPSBbXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk9QVElPTlNdICAgICAgPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbWlkZGxlbWFuICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSAgICA9IG5ldyBNaWRkbGVtYW4odGhpcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdID0gbmV3IEJvdW5kaW5nQm94KG1pZGRsZW1hbik7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBTVkcgY29tcG9uZW50IHVzaW5nIHRoZSBkZWZpbmVkIG9wdGlvbnMuXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHN2ZyAgICA9IHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5MQVlFUlNdICA9IHtcbiAgICAgICAgICAgIHNoYXBlczogICAgICBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgc3RvcFByb3BhZ2F0aW9uKSxcbiAgICAgICAgICAgIGJvdW5kaW5nQm94OiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnYm91bmRpbmctYm94Jykub24oJ2NsaWNrJywgc3RvcFByb3BhZ2F0aW9uKSxcbiAgICAgICAgICAgIG1hcmtlcnM6ICAgICBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VycycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIHdoZW4gdGhlIGNhbnZhcyBpcyBjbGlja2VkLlxuICAgICAgICBzdmcub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIW1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgLy8gYXMgYSBzdHJpbmcuXG4gICAgICAgIHNoYXBlID0gKHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycpID8gbWFwcGVyKHNoYXBlKSA6IHNoYXBlO1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBzaGFwZXMucHVzaChzaGFwZSk7XG5cbiAgICAgICAgLy8gUHV0IHRoZSBpbnRlcmZhY2UgZm9yIGludGVyYWN0aW5nIHdpdGggRHJhZnQgaW50byB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICBzaGFwZVtTeW1ib2xzLk1JRERMRU1BTl0gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHNoYXBlcy5pbmRleE9mKHNoYXBlKTtcblxuICAgICAgICBzaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGVzKTtcbiAgICAgICAgc2hhcGVzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10uYm91bmRpbmdCb3gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdChzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2Rlc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10uYm91bmRpbmdCb3gpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4gc2hhcGUuaXNTZWxlY3RlZCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTAsXG4gICAgICAgICAgICBoYW5kbGVSYWRpdXM6IDIyXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKCgkd2luZG93KSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICgkd2luZG93KSB7XG5cbiAgICAgICAgLy8gRXhwb3J0IGRyYWZ0IGlmIHRoZSBgd2luZG93YCBvYmplY3QgaXMgYXZhaWxhYmxlLlxuICAgICAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbiAgICB9XG5cbn0pKHdpbmRvdyk7XG5cbi8vIEV4cG9ydCBmb3IgdXNlIGluIEVTNiBhcHBsaWNhdGlvbnMuXG5leHBvcnQgZGVmYXVsdCBEcmFmdDsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNoYXBlXG4gICAgICogQHJldHVybiB7QWJpbGl0eX1cbiAgICAgKi9cbiAgICBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgbWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVzaXphYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1Jlc2l6YWJsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lZGdlcyAgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzLlJBRElVUyA9IHRoaXMubWlkZGxlbWFuKCkub3B0aW9ucygpLmhhbmRsZVJhZGl1cztcbiAgICAgICAgdGhpcy5yZWF0dGFjaEhhbmRsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWF0dGFjaEhhbmRsZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlYXR0YWNoSGFuZGxlcygpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoSGFuZGxlc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoSGFuZGxlcygpIHtcblxuICAgICAgICBjb25zdCBzaGFwZSAgPSB0aGlzLnNoYXBlKCk7XG4gICAgICAgIGNvbnN0IGxheWVyICA9IHRoaXMubWlkZGxlbWFuKCkubGF5ZXJzKCkuYm91bmRpbmdCb3g7XG4gICAgICAgIHRoaXMubGF5ZXIgICA9IGxheWVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3Jlc2l6ZS1oYW5kbGVzJyk7XG5cbiAgICAgICAgY29uc3QgeCAgICAgID0gc2hhcGUuYXR0cigneCcpO1xuICAgICAgICBjb25zdCB5ICAgICAgPSBzaGFwZS5hdHRyKCd5Jyk7XG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHNoYXBlLmF0dHIoJ3dpZHRoJyk7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHNoYXBlLmF0dHIoJ2hlaWdodCcpO1xuXG4gICAgICAgIGNvbnN0IGVkZ2VNYXAgPSB7XG4gICAgICAgICAgICB0b3BMZWZ0OiAgICAgIHsgeCwgICAgICAgICAgICAgICAgICB5IH0sXG4gICAgICAgICAgICB0b3BNaWRkbGU6ICAgIHsgeDogeCArICh3aWR0aCAvIDIpLCB5IH0sXG4gICAgICAgICAgICB0b3BSaWdodDogICAgIHsgeDogeCArIHdpZHRoLCAgICAgICB5IH0sXG4gICAgICAgICAgICBsZWZ0TWlkZGxlOiAgIHsgeDogeCwgICAgICAgICAgICAgICB5OiB5ICsgKGhlaWdodCAvIDIpIH0sXG4gICAgICAgICAgICBib3R0b21MZWZ0OiAgIHsgeDogeCwgICAgICAgICAgICAgICB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICBib3R0b21NaWRkbGU6IHsgeDogeCArICh3aWR0aCAvIDIpLCB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICBib3R0b21SaWdodDogIHsgeDogeCArIHdpZHRoLCAgICAgICB5OiB5ICsgaGVpZ2h0IH0sXG4gICAgICAgICAgICByaWdodE1pZGRsZTogIHsgeDogeCArIHdpZHRoLCAgICAgICB5OiB5ICsgKGhlaWdodCAvIDIpIH1cbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhlZGdlTWFwKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgZWRnZSAgICAgICAgICA9IGVkZ2VNYXBba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGRyYWdCZWhhdmlvdXIgPSB0aGlzLmRyYWcoc2hhcGUsIGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XSA9IHRoaXMubGF5ZXIuYXBwZW5kKCdpbWFnZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCAnaW1hZ2VzL2hhbmRsZS1tYWluLnBuZycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBlZGdlLnggLSAodGhpcy5SQURJVVMgLyAyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsIGVkZ2UueSAtICh0aGlzLlJBRElVUyAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2UnLCAncmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLlJBRElVUylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5SQURJVVMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2RyYWdzdGFydCcsIGRyYWdCZWhhdmlvdXIuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZHJhZycsIGRyYWdCZWhhdmlvdXIuZHJhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdkcmFnZW5kJywgZHJhZ0JlaGF2aW91ci5lbmQpKTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGV0YWNoSGFuZGxlc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGV0YWNoSGFuZGxlcygpIHtcblxuICAgICAgICBpZiAodGhpcy5sYXllcikge1xuICAgICAgICAgICAgdGhpcy5sYXllci5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBwb3BVbmlxdWVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBwb3BVbmlxdWUoaXRlbXMpIHtcblxuICAgICAgICBjb25zdCBjb3VudHMgPSB7fTtcblxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgaXRlbXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCBudW0gICA9IGl0ZW1zW2luZGV4XTtcbiAgICAgICAgICAgIGNvdW50c1tudW1dID0gY291bnRzW251bV0gPyBjb3VudHNbbnVtXSArIDEgOiAxO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdW5pcXVlID0gT2JqZWN0LmtleXMoY291bnRzKS5maWx0ZXIoKGtleSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvdW50c1trZXldID09PSAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdW5pcXVlLmxlbmd0aCA/IE51bWJlcih1bmlxdWVbMF0pIDogaXRlbXNbMF07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlYXJyYW5nZUhhbmRsZXNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3VycmVudEtleVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVhcnJhbmdlSGFuZGxlcyhjdXJyZW50S2V5KSB7XG5cbiAgICAgICAgY29uc3QgY29vcmRzICAgICA9IFtdO1xuICAgICAgICBjb25zdCByZWdFeHAgICAgID0gLyg/PVtBLVpdKS87XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmVkZ2VzKTtcblxuICAgICAgICBkaW1lbnNpb25zLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICAvLyBQYWNrYWdlIGFsbCBvZiB0aGUgY29vcmRpbmF0ZXMgdXAgaW50byBhIG1vcmUgc2ltcGxlIGBjb29yZHNgIG9iamVjdCBmb3IgYnJldml0eS5cbiAgICAgICAgICAgIGNvbnN0IGVkZ2UgID0gdGhpcy5lZGdlc1trZXldO1xuICAgICAgICAgICAgY29vcmRzW2tleV0gPSB7IHg6IE51bWJlcihlZGdlLmF0dHIoJ3gnKSksIHk6IE51bWJlcihlZGdlLmF0dHIoJ3knKSkgfTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IGNvcm5lclBvc2l0aW9uc1xuICAgICAgICAgKiBAdHlwZSB7e3RvcDogTnVtYmVyLCByaWdodDogTnVtYmVyLCBib3R0b206IE51bWJlciwgbGVmdDogTnVtYmVyfX1cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGNvcm5lclBvc2l0aW9ucyA9IHtcblxuICAgICAgICAgICAgLy8gRmluZCB0aGUgY29vcmRpbmF0ZSB0aGF0IGRvZXNuJ3QgbWF0Y2ggdGhlIG90aGVycywgd2hpY2ggbWVhbnMgdGhhdCBpcyB0aGUgY29vcmRpbmF0ZSB0aGF0IGlzIGN1cnJlbnRseVxuICAgICAgICAgICAgLy8gYmVpbmcgbW9kaWZpZWQgd2l0aG91dCBhbnkgY29uZGl0aW9uYWwgc3RhdGVtZW50cy5cbiAgICAgICAgICAgIHRvcDogICAgdGhpcy5wb3BVbmlxdWUoW2Nvb3Jkcy50b3BMZWZ0LnksICAgIGNvb3Jkcy50b3BNaWRkbGUueSwgICAgY29vcmRzLnRvcFJpZ2h0LnldKSxcbiAgICAgICAgICAgIHJpZ2h0OiAgdGhpcy5wb3BVbmlxdWUoW2Nvb3Jkcy50b3BSaWdodC54LCAgIGNvb3Jkcy5yaWdodE1pZGRsZS54LCAgY29vcmRzLmJvdHRvbVJpZ2h0LnhdKSxcbiAgICAgICAgICAgIGJvdHRvbTogdGhpcy5wb3BVbmlxdWUoW2Nvb3Jkcy5ib3R0b21MZWZ0LnksIGNvb3Jkcy5ib3R0b21NaWRkbGUueSwgY29vcmRzLmJvdHRvbVJpZ2h0LnldKSxcbiAgICAgICAgICAgIGxlZnQ6ICAgdGhpcy5wb3BVbmlxdWUoW2Nvb3Jkcy50b3BMZWZ0LngsICAgIGNvb3Jkcy5sZWZ0TWlkZGxlLngsICAgY29vcmRzLmJvdHRvbUxlZnQueF0pXG5cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGNvbnN0YW50IG1pZGRsZVBvc2l0aW9uc1xuICAgICAgICAgKiBAdHlwZSB7e3RvcE1pZGRsZTogbnVtYmVyLCByaWdodE1pZGRsZTogbnVtYmVyLCBib3R0b21NaWRkbGU6IG51bWJlciwgbGVmdE1pZGRsZTogbnVtYmVyfX1cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG1pZGRsZVBvc2l0aW9ucyA9IHtcblxuICAgICAgICAgICAgLy8gQWxsIG9mIHRoZXNlIG1pZGRsZSBwb3NpdGlvbnMgYXJlIHJlbGF0aXZlIHRvIHRoZSBjb3JuZXIgcG9zaXRpb25zIGFib3ZlLlxuICAgICAgICAgICAgdG9wTWlkZGxlOiAgICAoY29ybmVyUG9zaXRpb25zLmxlZnQgKyBjb3JuZXJQb3NpdGlvbnMucmlnaHQpIC8gMixcbiAgICAgICAgICAgIHJpZ2h0TWlkZGxlOiAgKGNvcm5lclBvc2l0aW9ucy50b3AgKyBjb3JuZXJQb3NpdGlvbnMuYm90dG9tKSAvIDIsXG4gICAgICAgICAgICBib3R0b21NaWRkbGU6IChjb3JuZXJQb3NpdGlvbnMubGVmdCArIGNvcm5lclBvc2l0aW9ucy5yaWdodCkgLyAyLFxuICAgICAgICAgICAgbGVmdE1pZGRsZTogICAoY29ybmVyUG9zaXRpb25zLnRvcCArIGNvcm5lclBvc2l0aW9ucy5ib3R0b20pIC8gMlxuXG4gICAgICAgIH07XG5cbiAgICAgICAgZGltZW5zaW9ucy5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRLZXkgIT09IGtleSkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBrZXkuc3BsaXQocmVnRXhwKS5tYXAoa2V5ID0+IGtleS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICAgICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJ21pZGRsZScpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAndG9wTWlkZGxlJyB8fCBrZXkgPT09ICdib3R0b21NaWRkbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneScsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGdlc1trZXldLmF0dHIoJ3gnLCBtaWRkbGVQb3NpdGlvbnNba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneScsIG1pZGRsZVBvc2l0aW9uc1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGdlc1trZXldLmF0dHIoJ3gnLCBjb3JuZXJQb3NpdGlvbnNbcGFydHNbMF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGdlc1trZXldLmF0dHIoJ3knLCBjb3JuZXJQb3NpdGlvbnNbcGFydHNbMF1dKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1sxXV0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICAgKiBAcmV0dXJuIHt7c3RhcnQ6IEZ1bmN0aW9uLCBkcmFnOiBGdW5jdGlvbiwgZW5kOiBGdW5jdGlvbn19XG4gICAgICovXG4gICAgZHJhZyhzaGFwZSwga2V5KSB7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuICAgICAgICA9IHRoaXMubWlkZGxlbWFuKCk7XG4gICAgICAgIGNvbnN0IGhhbmRsZXMgICAgICAgICAgPSB0aGlzLmxheWVyO1xuICAgICAgICBjb25zdCByYWRpdXMgICAgICAgICAgID0gdGhpcy5SQURJVVM7XG4gICAgICAgIGNvbnN0IHJlYXR0YWNoSGFuZGxlcyAgPSB0aGlzLnJlYXR0YWNoSGFuZGxlcy5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCByZWFycmFuZ2VIYW5kbGVzICAgICA9IHRoaXMucmVhcnJhbmdlSGFuZGxlcy5iaW5kKHRoaXMpO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveExheWVyID0gbWlkZGxlbWFuW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuTEFZRVJTXS5ib3VuZGluZ0JveDtcbiAgICAgICAgbGV0IHN0YXJ0WCwgc3RhcnRZLCByYXRpbztcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2Qgc3RhcnRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3t4OiBOdW1iZXIsIHk6IE51bWJlcn19XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydCgpIHtcblxuICAgICAgICAgICAgICAgIG1pZGRsZW1hbi5ib3VuZGluZ0JveCgpLmJCb3gucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKCdkcmFnZ2luZycsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJhdGlvICAgICAgICA9IHNoYXBlLmF0dHIoJ3dpZHRoJykgLyBzaGFwZS5hdHRyKCdoZWlnaHQnKTtcblxuICAgICAgICAgICAgICAgIHN0YXJ0WCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYIC0gcGFyc2VJbnQoaGFuZGxlLmF0dHIoJ3gnKSk7XG4gICAgICAgICAgICAgICAgc3RhcnRZID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkgLSBwYXJzZUludChoYW5kbGUuYXR0cigneScpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7IHg6IHN0YXJ0WCwgeTogc3RhcnRZIH07XG5cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBkcmFnXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt7eDogTnVtYmVyLCB5OiBOdW1iZXJ9fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkcmFnOiBmdW5jdGlvbiBkcmFnKCkge1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IG1pZGRsZW1hbi5vcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlICA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3ZlWCAgID0gKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYIC0gc3RhcnRYKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3ZlWSAgID0gKGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZIC0gc3RhcnRZKTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaW5hbFggID0gTWF0aC5jZWlsKG1vdmVYIC8gb3B0aW9ucy5ncmlkU2l6ZSkgKiBvcHRpb25zLmdyaWRTaXplO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsWSAgPSBNYXRoLmNlaWwobW92ZVkgLyBvcHRpb25zLmdyaWRTaXplKSAqIG9wdGlvbnMuZ3JpZFNpemU7XG5cbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAndG9wTWlkZGxlJyAmJiBrZXkgIT09ICdib3R0b21NaWRkbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZS5hdHRyKCd4JywgZmluYWxYKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAncmlnaHRNaWRkbGUnICYmIGtleSAhPT0gJ2xlZnRNaWRkbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZS5hdHRyKCd5JywgZmluYWxZKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZWFycmFuZ2VIYW5kbGVzKGtleSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgYkJveCA9IGhhbmRsZXMubm9kZSgpLmdldEJCb3goKTtcbiAgICAgICAgICAgICAgICBzaGFwZS5hdHRyKCd4JywgYkJveC54ICsgKHJhZGl1cyAvIDIpKS5hdHRyKCd5JywgYkJveC55ICsgKHJhZGl1cyAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGJCb3guaGVpZ2h0IC0gcmFkaXVzKS5hdHRyKCd3aWR0aCcsIGJCb3gud2lkdGggLSByYWRpdXMpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgeDogZmluYWxYLCB5OiBmaW5hbFkgfTtcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGVuZFxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZW5kOiBmdW5jdGlvbiBlbmQoKSB7XG4gICAgICAgICAgICAgICAgbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuZHJhd0JvdW5kaW5nQm94KG1pZGRsZW1hbi5zZWxlY3RlZCgpLCBib3VuZGluZ0JveExheWVyKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZWF0dGFjaEhhbmRsZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5JztcbmltcG9ydCBTeW1ib2xzIGZyb20gJy4vLi4vaGVscGVycy9TeW1ib2xzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkQWRkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRBZGQoKSB7XG5cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuc2hhcGUoKVtTeW1ib2xzLkVMRU1FTlRdO1xuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIGVsZW1lbnQuY2FsbChkMy5iZWhhdmlvci5kcmFnKCkub24oJ2RyYWcnLCAoKSA9PiB0aGlzLmhhbmRsZURyYWcoKSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVEcmFnXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGhhbmRsZURyYWcoKSB7XG5cbiAgICAgICAgdGhpcy5oYW5kbGVDbGljaygpO1xuXG4gICAgICAgIGNvbnN0IG1pZGRsZW1hbiA9IHRoaXMuc2hhcGUoKVtTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QodHJ1ZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgZmFrZSBldmVudCB0byBkcmFnIHRoZSBzaGFwZSB3aXRoIGFuIG92ZXJyaWRlIFggYW5kIFkgdmFsdWUuXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZG93bicsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogZmFsc2UgfSk7XG4gICAgICAgIGV2ZW50Lm92ZXJyaWRlWCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYO1xuICAgICAgICBldmVudC5vdmVycmlkZVkgPSBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWTtcblxuICAgICAgICBjb25zdCBiQm94ID0gbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuYkJveC5ub2RlKCk7XG4gICAgICAgIGJCb3guZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIHJldHVybiBldmVudDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGFuZGxlQ2xpY2tcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGhhbmRsZUNsaWNrKCkge1xuXG4gICAgICAgIGNvbnN0IGtleU1hcCA9IHRoaXMubWlkZGxlbWFuKClbU3ltYm9scy5LRVlfTUFQXTtcblxuICAgICAgICBpZiAodGhpcy5zaGFwZSgpLmlzU2VsZWN0ZWQoKSkge1xuXG4gICAgICAgICAgICBpZiAoIWtleU1hcC5tdWx0aVNlbGVjdCkge1xuXG4gICAgICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWxsIG90aGVycyBhbmQgc2VsZWN0IG9ubHkgdGhlIGN1cnJlbnQgc2hhcGUuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGV4Y2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCB0aGUgc2hhcGUgaWYgaXQncyBjdXJyZW50bHkgc2VsZWN0ZWQuXG4gICAgICAgICAgICByZXR1cm4gdm9pZCB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgaW5jbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWtleU1hcC5tdWx0aVNlbGVjdCkge1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIGV4Y2VwdCBmb3IgdGhlIGN1cnJlbnQuXG4gICAgICAgICAgICB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgZXhjbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1pZGRsZW1hbigpLnNlbGVjdCh7IGluY2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBBdHRyaWJ1dGVzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5cbi8qXG4gKiBAbWV0aG9kIHNldEF0dHJpYnV0ZVxuICogQHBhcmFtIHtBcnJheX0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCBuYW1lLCB2YWx1ZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBzd2l0Y2ggKG5hbWUpIHtcblxuICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlbGVtZW50LmRhdHVtKCkueSB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7dmFsdWV9LCAke3l9KWApO1xuXG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgY29uc3QgeCA9IGVsZW1lbnQuZGF0dW0oKS54IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt2YWx1ZX0pYCk7XG5cbiAgICB9XG5cbiAgICBlbGVtZW50LmF0dHIobmFtZSwgdmFsdWUpO1xuXG59OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBCb3VuZGluZ0JveFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm91bmRpbmdCb3gge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge0JvdW5kaW5nQm94fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1pZGRsZW1hbikge1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZUNsaWNrXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBoYW5kbGVDbGljaygpIHtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb3VzZVggPSBkMy5ldmVudC5wYWdlWDtcbiAgICAgICAgY29uc3QgbW91c2VZID0gZDMuZXZlbnQucGFnZVk7XG5cbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICB0aGlzLmJCb3guYXR0cigncG9pbnRlci1ldmVudHMnLCAnYWxsJyk7XG5cbiAgICAgICAgaWYgKG1pZGRsZW1hbi5mcm9tRWxlbWVudChlbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7IGJ1YmJsZXM6IHRydWUsIGNhbmNlbGFibGU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhd0JvdW5kaW5nQm94XG4gICAgICogQHBhcmFtIHtBcnJheX0gc2VsZWN0ZWRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbGF5ZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYXdCb3VuZGluZ0JveChzZWxlY3RlZCwgbGF5ZXIpIHtcblxuICAgICAgICBpZiAodGhpcy5iQm94KSB7XG4gICAgICAgICAgICB0aGlzLmJCb3gucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb2RlbCA9IHsgbWluWDogTnVtYmVyLk1BWF9WQUxVRSwgbWluWTogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFg6IE51bWJlci5NSU5fVkFMVUUsIG1heFk6IE51bWJlci5NSU5fVkFMVUUgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzcG9uc2libGUgZm9yIGNvbXB1dGluZyB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3gsIGJhc2VkIG9uIGFsbCBvZiB0aGUgYm91bmRpbmcgYm94ZXNcbiAgICAgICAgICogZnJvbSB0aGUgY3VycmVudCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29tcHV0ZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBiQm94ZXNcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGNvbXB1dGUgPSAoYkJveGVzKSA9PiB7XG4gICAgICAgICAgICBtb2RlbC5taW5YID0gTWF0aC5taW4oLi4uYkJveGVzLm1hcCgoZCkgPT4gZC54KSk7XG4gICAgICAgICAgICBtb2RlbC5taW5ZID0gTWF0aC5taW4oLi4uYkJveGVzLm1hcCgoZCkgPT4gZC55KSk7XG4gICAgICAgICAgICBtb2RlbC5tYXhYID0gTWF0aC5tYXgoLi4uYkJveGVzLm1hcCgoZCkgPT4gZC54ICsgZC53aWR0aCkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WSA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSArIGQuaGVpZ2h0KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3guXG4gICAgICAgIGNvbXB1dGUoc2VsZWN0ZWQubWFwKChzaGFwZSkgPT4gc2hhcGUuYm91bmRpbmdCb3goKSkpO1xuXG4gICAgICAgIHRoaXMuYkJveCA9IGxheWVyLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmRhdHVtKG1vZGVsKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdkcmFnLWJveCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAgICAgICgoZCkgPT4gZC5taW5YKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsICAgICAgKChkKSA9PiBkLm1pblkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsICAoKGQpID0+IGQubWF4WCAtIGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsICgoZCkgPT4gZC5tYXhZIC0gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb25zdCBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldO1xuICAgICAgICBjb25zdCBkcmFnICAgICAgPSBbJ2RyYWcnLCAgICAgICgpID0+IHRoaXMuZHJhZygpXTtcbiAgICAgICAgY29uc3QgZHJhZ0VuZCAgID0gWydkcmFnZW5kJywgICAoKSA9PiB0aGlzLmRyYWdFbmQoKV07XG5cbiAgICAgICAgdGhpcy5iQm94LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKC4uLmRyYWdTdGFydCkub24oLi4uZHJhZykub24oLi4uZHJhZ0VuZCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnU3RhcnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdTdGFydCh4ID0gbnVsbCwgeSA9IG51bGwpIHtcblxuICAgICAgICBjb25zdCBzWCA9IE51bWJlcih0aGlzLmJCb3guYXR0cigneCcpKTtcbiAgICAgICAgY29uc3Qgc1kgPSBOdW1iZXIodGhpcy5iQm94LmF0dHIoJ3knKSk7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IHtcbiAgICAgICAgICAgIHg6ICh4ICE9PSBudWxsKSA/IHggOiAoZDMuZXZlbnQuc291cmNlRXZlbnQub3ZlcnJpZGVYIHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYKSAtIHNYLFxuICAgICAgICAgICAgeTogKHkgIT09IG51bGwpID8geSA6IChkMy5ldmVudC5zb3VyY2VFdmVudC5vdmVycmlkZVkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkpIC0gc1lcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm1vdmUgPSB7XG4gICAgICAgICAgICBzdGFydDogeyB4OiBzWCwgeTogc1kgfSxcbiAgICAgICAgICAgIGVuZDogICB7IH1cbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbXVsdGlwbGVPZj10aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCkuZ3JpZFNpemVdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnKHggPSBudWxsLCB5ID0gbnVsbCwgbXVsdGlwbGVPZiA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLm9wdGlvbnMoKS5ncmlkU2l6ZSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICB4ID0gKHggIT09IG51bGwpID8geCA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYO1xuICAgICAgICB5ID0gKHkgIT09IG51bGwpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGNvbnN0IG1YID0gKHggLSB0aGlzLnN0YXJ0LngpLFxuICAgICAgICAgICAgICBtWSA9ICh5IC0gdGhpcy5zdGFydC55KSxcbiAgICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICAgIGVZID0gTWF0aC5jZWlsKG1ZIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mO1xuXG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnggPSBlWDtcbiAgICAgICAgdGhpcy5iQm94LmRhdHVtKCkueSA9IGVZO1xuXG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCd4JywgZVgpO1xuICAgICAgICB0aGlzLmJCb3guYXR0cigneScsIGVZKTtcblxuICAgICAgICB0aGlzLm1vdmUuZW5kID0geyB4OiBlWCwgeTogZVkgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ0VuZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ0VuZCgpIHtcblxuICAgICAgICBjb25zdCBlWCAgICA9IHRoaXMubW92ZS5lbmQueCAtIHRoaXMubW92ZS5zdGFydC54O1xuICAgICAgICBjb25zdCBlWSAgICA9IHRoaXMubW92ZS5lbmQueSAtIHRoaXMubW92ZS5zdGFydC55O1xuXG4gICAgICAgIGlmIChpc05hTihlWCkgfHwgaXNOYU4oZVkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3ZlIGVhY2ggc2hhcGUgYnkgdGhlIGRlbHRhIGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmQgcG9pbnRzLlxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3RlZCgpLmZvckVhY2goKHNoYXBlKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gc2hhcGUuYXR0cigneCcpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFkgPSBzaGFwZS5hdHRyKCd5Jyk7XG4gICAgICAgICAgICBjb25zdCBtb3ZlWCAgICA9IGN1cnJlbnRYICsgZVg7XG4gICAgICAgICAgICBjb25zdCBtb3ZlWSAgICA9IGN1cnJlbnRZICsgZVk7XG5cbiAgICAgICAgICAgIHNoYXBlLmF0dHIoJ3gnLCBtb3ZlWCkuYXR0cigneScsIG1vdmVZKTtcbiAgICAgICAgICAgIHNoYXBlLmRpZE1vdmUoKTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1ldGhvZCB0cnlJbnZva2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge1N0cmluZ30gZnVuY3Rpb25OYW1lXG4gKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCB0cnlJbnZva2UgPSAoY29udGV4dCwgZnVuY3Rpb25OYW1lLCAuLi5vcHRpb25zKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dFtmdW5jdGlvbk5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRleHRbZnVuY3Rpb25OYW1lXSguLi5vcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuXG59O1xuXG4vKipcbiAqIEBtZXRob2QgY2FwaXRhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgY2FwaXRhbGl6ZSA9IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcblxufTtcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEludm9jYXRvclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCgpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaWRcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTaGFwZX0gc2hhcGVzXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBkaWQodHlwZSwgc2hhcGVzKSB7XG5cbiAgICAgICAgICAgIHNoYXBlcyA9IEFycmF5LmlzQXJyYXkoc2hhcGVzKSA/IHNoYXBlcyA6IFtzaGFwZXNdO1xuXG4gICAgICAgICAgICByZXR1cm4gc2hhcGVzLmV2ZXJ5KChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnlJbnZva2Uoc2hhcGUsIGBkaWQke2NhcGl0YWxpemUodHlwZSl9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluY2x1ZGVFeGNsdWRlXG4gICAgICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGluY2x1ZGVFeGNsdWRlKGRyYWZ0LCBmbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluY2x1ZGUgICA9IG9wdGlvbnMuaW5jbHVkZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBleGNsdWRlICAgPSBvcHRpb25zLmV4Y2x1ZGUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gZHJhZnRbU3ltYm9scy5NSURETEVNQU5dO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgYWxsRXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBleGNsdWRpbmdcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBhbGxFeGNsdWRpbmcgPSAoZXhjbHVkaW5nKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBleGNsdWRpbmcgPSBBcnJheS5pc0FycmF5KGV4Y2x1ZGluZykgPyBleGNsdWRpbmcgOiBbZXhjbHVkaW5nXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtaWRkbGVtYW4uYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIX5leGNsdWRpbmcuaW5kZXhPZihzaGFwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgZm4uYXBwbHkoZHJhZnQsIFtpbmNsdWRlXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZXhjbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KGRyYWZ0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm4uYXBwbHkoZHJhZnQsIFthbGxFeGNsdWRpbmcoZXhjbHVkZSldKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBLZXlCaW5kaW5nc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5QmluZGluZ3Mge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge0tleUJpbmRpbmdzfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1pZGRsZW1hbikge1xuXG4gICAgICAgIGNvbnN0IGtleU1hcCAgICAgICAgICAgID0gbWlkZGxlbWFuW1N5bWJvbHMuS0VZX01BUF07XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbWlkZGxlbWFuO1xuXG4gICAgICAgIC8vIERlZmF1bHQga2VwIG1hcHBpbmdzXG4gICAgICAgIGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlO1xuICAgICAgICBrZXlNYXAuYXNwZWN0UmF0aW8gPSBmYWxzZTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGtleSBtYXAuXG4gICAgICAgIHRoaXMuYXR0YWNoQmluZGluZ3Moa2V5TWFwKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoQmluZGluZ3NcbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5TWFwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhdHRhY2hCaW5kaW5ncyhrZXlNYXApIHtcblxuICAgICAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBhdmFpbGFibGUgc2hhcGVzLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3QoKSk7XG5cbiAgICAgICAgLy8gTXVsdGktc2VsZWN0aW5nIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIC8vIE1haW50YWluIGFzcGVjdCByYXRpb3Mgd2hlbiByZXNpemluZy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFRocm93ICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93JztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vc2hhcGVzL1JlY3RhbmdsZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNYXBwZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgcmVjdGFuZ2xlOiBSZWN0YW5nbGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHR5cGVvZiBtYXBbbmFtZV0gIT09ICd1bmRlZmluZWQnID8gbmV3IG1hcFtuYW1lXSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IFRocm93KGBDYW5ub3QgbWFwIFwiJHtuYW1lfVwiIHRvIGEgc2hhcGUgb2JqZWN0YCk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgICAgIGZyb20gJy4vU3ltYm9scyc7XG5pbXBvcnQgS2V5QmluZGluZ3MgZnJvbSAnLi9LZXlCaW5kaW5ncyc7XG5pbXBvcnQgaW52b2NhdG9yICAgZnJvbSAnLi9JbnZvY2F0b3InO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWlkZGxlbWFuXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWRkbGVtYW4ge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtEcmFmdH0gZHJhZnRcbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZHJhZnQpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuRFJBRlRdICAgICAgICA9IGRyYWZ0O1xuICAgICAgICB0aGlzW1N5bWJvbHMuS0VZX01BUF0gICAgICA9IHt9O1xuICAgICAgICB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXSA9IGZhbHNlO1xuXG4gICAgICAgIG5ldyBLZXlCaW5kaW5ncyh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZDNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZDMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuU1ZHXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxheWVyc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBsYXllcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuTEFZRVJTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0ub3B0aW9ucygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qga2V5TWFwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGtleU1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5LRVlfTUFQXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3Qob3B0aW9ucykge1xuICAgICAgICBpbnZvY2F0b3IuaW5jbHVkZUV4Y2x1ZGUodGhpc1tTeW1ib2xzLkRSQUZUXSwgdGhpc1tTeW1ib2xzLkRSQUZUXS5zZWxlY3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3Qob3B0aW9ucykge1xuICAgICAgICBpbnZvY2F0b3IuaW5jbHVkZUV4Y2x1ZGUodGhpc1tTeW1ib2xzLkRSQUZUXSwgdGhpc1tTeW1ib2xzLkRSQUZUXS5kZXNlbGVjdCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLmFsbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0ZWQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGZyb21FbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGZyb21FbGVtZW50KGVsZW1lbnQpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKS5maWx0ZXIoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudCA9PT0gc2hhcGVbU3ltYm9scy5FTEVNRU5UXS5ub2RlKCk7XG4gICAgICAgIH0pWzBdO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBwcmV2ZW50RGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICovXG4gICAgcHJldmVudERlc2VsZWN0KHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdID0gdmFsdWU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7Qm91bmRpbmdCb3h9XG4gICAgICovXG4gICAgYm91bmRpbmdCb3goKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuQk9VTkRJTkdfQk9YXTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUG9seWZpbGxzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0QXNzaWduKHRhcmdldCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdCcpO1xuICAgIH1cblxuICAgIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGlmIChuZXh0U291cmNlID09PSB1bmRlZmluZWQgfHwgbmV4dFNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFNvdXJjZSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgICAgICB2YXIga2V5c0FycmF5ID0gT2JqZWN0LmtleXMoT2JqZWN0KG5leHRTb3VyY2UpKTtcblxuICAgICAgICBmb3IgKHZhciBuZXh0SW5kZXggPSAwLCBsZW4gPSBrZXlzQXJyYXkubGVuZ3RoOyBuZXh0SW5kZXggPCBsZW47IG5leHRJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IGtleXNBcnJheVtuZXh0SW5kZXhdO1xuICAgICAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5leHRTb3VyY2UsIG5leHRLZXkpO1xuICAgICAgICAgICAgaWYgKGRlc2MgIT09IHVuZGVmaW5lZCAmJiBkZXNjLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG87XG5cbn1cbiIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTeW1ib2xzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgRFJBRlQ6ICAgICAgICBTeW1ib2woJ2RyYWZ0JyksXG4gICAgU1ZHOiAgICAgICAgICBTeW1ib2woJ3N2ZycpLFxuICAgIEVMRU1FTlQ6ICAgICAgU3ltYm9sKCdlbGVtZW50JyksXG4gICAgSVNfU0VMRUNURUQ6ICBTeW1ib2woJ2lzU2VsZWN0ZWQnKSxcbiAgICBBVFRSSUJVVEVTOiAgIFN5bWJvbCgnYXR0cmlidXRlcycpLFxuICAgIE1JRERMRU1BTjogICAgU3ltYm9sKCdtaWRkbGVtYW4nKSxcbiAgICBTSEFQRTogICAgICAgIFN5bWJvbCgnc2hhcGUnKSxcbiAgICBTSEFQRVM6ICAgICAgIFN5bWJvbCgnc2hhcGVzJyksXG4gICAgTEFZRVJTOiAgICAgICBTeW1ib2woJ2xheWVycycpLFxuICAgIEdST1VQOiAgICAgICAgU3ltYm9sKCdncm91cCcpLFxuICAgIEJPVU5ESU5HX0JPWDogU3ltYm9sKCdib3VuZGluZ0JveCcpLFxuICAgIE9QVElPTlM6ICAgICAgU3ltYm9sKCdvcHRpb25zJyksXG4gICAgQUJJTElUSUVTOiAgICBTeW1ib2woJ2FiaWxpdGllcycpLFxuICAgIEtFWV9NQVA6ICAgICAgU3ltYm9sKCdrZXlNYXAnKSxcbiAgICBDQU5fREVTRUxFQ1Q6IFN5bWJvbCgnY2FuRGVzZWxlY3QnKVxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBUaHJvd1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhyb3cge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJuIHtUaHJvd31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRHJhZnQuanM6ICR7bWVzc2FnZX0uYCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiAnYmx1ZScsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scyc7XG5pbXBvcnQgVGhyb3cgICAgICAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZSAgIGZyb20gJy4uL2hlbHBlcnMvQXR0cmlidXRlcyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IFNlbGVjdGFibGUgICAgIGZyb20gJy4uL2FiaWxpdGllcy9TZWxlY3RhYmxlJztcbmltcG9ydCBSZXNpemFibGUgICAgICBmcm9tICcuLi9hYmlsaXRpZXMvUmVzaXphYmxlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSA9IGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHRocm93cyB7RXJyb3J9IFdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSBgdGFnTmFtZWAgbWV0aG9kIGhhc24ndCBiZWVuIGRlZmluZWQgb24gdGhlIGNoaWxkIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIG5ldyBUaHJvdygnVGFnIG5hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhIHNoYXBlIHVzaW5nIHRoZSBgdGFnTmFtZWAgbWV0aG9kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZXwqfVxuICAgICAqL1xuICAgIGF0dHIobmFtZSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgc2V0QXR0cmlidXRlKHRoaXNbU3ltYm9scy5FTEVNRU5UXSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBsYXllciAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5sYXllcnMoKS5zaGFwZXM7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgICAgICA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRBdHRyaWJ1dGVzKCksIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5HUk9VUF0gICA9IGxheWVyLmFwcGVuZCgnZycpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0gPSB0aGlzW1N5bWJvbHMuR1JPVVBdLmFwcGVuZCh0aGlzLnRhZ05hbWUoKSkuZGF0dW0oe30pO1xuXG4gICAgICAgIC8vIEFzc2lnbiBlYWNoIGF0dHJpYnV0ZSBmcm9tIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGUgc2hhcGUsIGFzIHdlbGwgYXMgdGhvc2UgZGVmaW5lZFxuICAgICAgICAvLyBieSB0aGUgdXNlciB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIHNoYXBlLlxuICAgICAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHRoaXMuYXR0cihrZXksIGF0dHJpYnV0ZXNba2V5XSkpO1xuXG4gICAgICAgIGNvbnN0IGFiaWxpdGllcyAgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSgpLFxuICAgICAgICAgICAgcmVzaXphYmxlOiAgbmV3IFJlc2l6YWJsZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMoYWJpbGl0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzaGFwZSBvYmplY3QgaW50byBlYWNoIGFiaWxpdHkgaW5zdGFuY2UsIGFuZCBpbnZva2UgdGhlIGBkaWRBZGRgIG1ldGhvZC5cbiAgICAgICAgICAgIGNvbnN0IGFiaWxpdHkgPSBhYmlsaXRpZXNba2V5XTtcbiAgICAgICAgICAgIGFiaWxpdHlbU3ltYm9scy5TSEFQRV0gPSB0aGlzO1xuICAgICAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgYWJpbGl0eSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10gPSBhYmlsaXRpZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkUmVtb3ZlKCkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZE1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZE1vdmUoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdLnJlc2l6YWJsZS5yZWF0dGFjaEhhbmRsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gdHJ1ZTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLmRpZFNlbGVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkRGVzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZERlc2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gZmFsc2U7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdLnJlc2l6YWJsZS5kaWREZXNlbGVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYm91bmRpbmdCb3hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYm91bmRpbmdCb3goKSB7XG5cbiAgICAgICAgY29uc3QgaGFzQkJveCA9IHR5cGVvZiB0aGlzW1N5bWJvbHMuR1JPVVBdLm5vZGUoKS5nZXRCQm94ID09PSAnZnVuY3Rpb24nO1xuXG4gICAgICAgIHJldHVybiBoYXNCQm94ID8gdGhpc1tTeW1ib2xzLkdST1VQXS5ub2RlKCkuZ2V0QkJveCgpIDoge1xuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmF0dHIoJ2hlaWdodCcpLFxuICAgICAgICAgICAgd2lkdGg6ICB0aGlzLmF0dHIoJ3dpZHRoJyksXG4gICAgICAgICAgICB4OiAgICAgIHRoaXMuYXR0cigneCcpLFxuICAgICAgICAgICAgeTogICAgICB0aGlzLmF0dHIoJ3knKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0QXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxufSJdfQ==
