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

var _helpersSymbols = require('./../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Resizable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Resizable = (function (_Ability) {
  function Resizable() {
    _classCallCheck(this, Resizable);

    _get(Object.getPrototypeOf(Resizable.prototype), 'constructor', this).apply(this, arguments);
  }

  _inherits(Resizable, _Ability);

  _createClass(Resizable, [{
    key: 'didSelect',

    /**
     * @method didSelect
     * @return {void}
     */
    value: function didSelect() {

      var element = this.shape()[_helpersSymbols2['default'].ELEMENT];
      var layer = this.middleman().layers().markers;

      layer.append('g').attr('class', 'resize-handles');

      //
      //element.on('')
    }
  }, {
    key: 'didDeselect',

    /**
     * @method didDeselect
     * @return {void}
     */
    value: function didDeselect() {}
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

            this.bBox = layer.append('g').classed('bounding-box', true).append('rect').datum(model).classed('drag-box', true).attr('x', function (d) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1Jlc2l6YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0F0dHJpYnV0ZXMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Cb3VuZGluZ0JveC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0ludm9jYXRvci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0tleUJpbmRpbmdzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2dDQ0EyQixxQkFBcUI7Ozs7OEJBQ3JCLG1CQUFtQjs7OztrQ0FDbkIsdUJBQXVCOzs7O2dDQUN2QixxQkFBcUI7O2dDQUNyQixxQkFBcUI7Ozs7NkJBQ3JCLGtCQUFrQjs7Ozs7Ozs7OztJQU92QyxLQUFLOzs7Ozs7Ozs7QUFRSSxhQVJULEtBQUssQ0FRSyxPQUFPLEVBQWdCOzs7WUFBZCxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixLQUFLOztBQVVILFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBUyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sc0JBcEIzQyxZQUFZLENBb0IrQyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RixZQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQU0sa0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLDRCQUFRLFlBQVksQ0FBQyxHQUFHLG9DQUFnQixTQUFTLENBQUMsQ0FBQzs7O0FBR3hELFlBQU0sS0FBSyxHQUFJLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDbkQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUNwRCxZQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsNEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxHLFlBQU0s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LEdBQUcsQ0FBQztBQUN0QixpQkFBQyxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQ3pCLENBQUM7U0FFTDs7Ozs7Ozs7ZUFNZ0IsNkJBQUc7QUFDaEIsbUJBQU8sRUFBRSxDQUFDO1NBQ2I7OztXQS9IZ0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4nO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBCb3VuZGluZ0JveCAgICBmcm9tICcuL2hlbHBlcnMvQm91bmRpbmdCb3gnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IG1hcHBlciAgICAgICAgIGZyb20gJy4vaGVscGVycy9NYXBwZXInO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLlNIQVBFU10gICAgICAgPSBbXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk9QVElPTlNdICAgICAgPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbWlkZGxlbWFuICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSAgICA9IG5ldyBNaWRkbGVtYW4odGhpcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdID0gbmV3IEJvdW5kaW5nQm94KG1pZGRsZW1hbik7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBTVkcgY29tcG9uZW50IHVzaW5nIHRoZSBkZWZpbmVkIG9wdGlvbnMuXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHN2ZyAgICA9IHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5MQVlFUlNdICA9IHtcbiAgICAgICAgICAgIHNoYXBlczogc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3NoYXBlcycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbiksXG4gICAgICAgICAgICBtYXJrZXJzOiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VycycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIHdoZW4gdGhlIGNhbnZhcyBpcyBjbGlja2VkLlxuICAgICAgICBzdmcub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIW1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgLy8gYXMgYSBzdHJpbmcuXG4gICAgICAgIHNoYXBlID0gKHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycpID8gbWFwcGVyKHNoYXBlKSA6IHNoYXBlO1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBzaGFwZXMucHVzaChzaGFwZSk7XG5cbiAgICAgICAgLy8gUHV0IHRoZSBpbnRlcmZhY2UgZm9yIGludGVyYWN0aW5nIHdpdGggRHJhZnQgaW50byB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICBzaGFwZVtTeW1ib2xzLk1JRERMRU1BTl0gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHNoYXBlcy5pbmRleE9mKHNoYXBlKTtcblxuICAgICAgICBzaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGVzKTtcbiAgICAgICAgc2hhcGVzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10ubWFya2Vycyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnZGVzZWxlY3QnLCBzaGFwZXMpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQk9VTkRJTkdfQk9YXS5kcmF3Qm91bmRpbmdCb3godGhpcy5zZWxlY3RlZCgpLCB0aGlzW1N5bWJvbHMuTEFZRVJTXS5tYXJrZXJzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIG9wdGlvbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5PUFRJT05TXSB8fCB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKCgkd2luZG93KSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICgkd2luZG93KSB7XG5cbiAgICAgICAgLy8gRXhwb3J0IGRyYWZ0IGlmIHRoZSBgd2luZG93YCBvYmplY3QgaXMgYXZhaWxhYmxlLlxuICAgICAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbiAgICB9XG5cbn0pKHdpbmRvdyk7XG5cbi8vIEV4cG9ydCBmb3IgdXNlIGluIEVTNiBhcHBsaWNhdGlvbnMuXG5leHBvcnQgZGVmYXVsdCBEcmFmdDsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNoYXBlXG4gICAgICogQHJldHVybiB7QWJpbGl0eX1cbiAgICAgKi9cbiAgICBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgbWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVzaXphYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkU2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRTZWxlY3QoKSB7XG5cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuc2hhcGUoKVtTeW1ib2xzLkVMRU1FTlRdO1xuICAgICAgICBjb25zdCBsYXllciAgID0gdGhpcy5taWRkbGVtYW4oKS5sYXllcnMoKS5tYXJrZXJzO1xuXG4gICAgICAgIGxheWVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3Jlc2l6ZS1oYW5kbGVzJyk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy9lbGVtZW50Lm9uKCcnKVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7fVxuXG59IiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5JztcbmltcG9ydCBTeW1ib2xzIGZyb20gJy4vLi4vaGVscGVycy9TeW1ib2xzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkQWRkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRBZGQoKSB7XG5cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuc2hhcGUoKVtTeW1ib2xzLkVMRU1FTlRdO1xuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIGVsZW1lbnQuY2FsbChkMy5iZWhhdmlvci5kcmFnKCkub24oJ2RyYWcnLCAoKSA9PiB0aGlzLmhhbmRsZURyYWcoKSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVEcmFnXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGhhbmRsZURyYWcoKSB7XG5cbiAgICAgICAgdGhpcy5oYW5kbGVDbGljaygpO1xuXG4gICAgICAgIGNvbnN0IG1pZGRsZW1hbiA9IHRoaXMuc2hhcGUoKVtTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QodHJ1ZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgZmFrZSBldmVudCB0byBkcmFnIHRoZSBzaGFwZSB3aXRoIGFuIG92ZXJyaWRlIFggYW5kIFkgdmFsdWUuXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlZG93bicsIHsgYnViYmxlczogdHJ1ZSwgY2FuY2VsYWJsZTogZmFsc2UgfSk7XG4gICAgICAgIGV2ZW50Lm92ZXJyaWRlWCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYO1xuICAgICAgICBldmVudC5vdmVycmlkZVkgPSBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWTtcblxuICAgICAgICBjb25zdCBiQm94ID0gbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuYkJveC5ub2RlKCk7XG4gICAgICAgIGJCb3guZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIHJldHVybiBldmVudDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGFuZGxlQ2xpY2tcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGhhbmRsZUNsaWNrKCkge1xuXG4gICAgICAgIGNvbnN0IGtleU1hcCA9IHRoaXMubWlkZGxlbWFuKClbU3ltYm9scy5LRVlfTUFQXTtcblxuICAgICAgICBpZiAodGhpcy5zaGFwZSgpLmlzU2VsZWN0ZWQoKSkge1xuXG4gICAgICAgICAgICBpZiAoIWtleU1hcC5tdWx0aVNlbGVjdCkge1xuXG4gICAgICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWxsIG90aGVycyBhbmQgc2VsZWN0IG9ubHkgdGhlIGN1cnJlbnQgc2hhcGUuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGV4Y2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCB0aGUgc2hhcGUgaWYgaXQncyBjdXJyZW50bHkgc2VsZWN0ZWQuXG4gICAgICAgICAgICByZXR1cm4gdm9pZCB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgaW5jbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWtleU1hcC5tdWx0aVNlbGVjdCkge1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIGV4Y2VwdCBmb3IgdGhlIGN1cnJlbnQuXG4gICAgICAgICAgICB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgZXhjbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1pZGRsZW1hbigpLnNlbGVjdCh7IGluY2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBBdHRyaWJ1dGVzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5cbi8qXG4gKiBAbWV0aG9kIHNldEF0dHJpYnV0ZVxuICogQHBhcmFtIHtBcnJheX0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCBuYW1lLCB2YWx1ZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBzd2l0Y2ggKG5hbWUpIHtcblxuICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlbGVtZW50LmRhdHVtKCkueSB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7dmFsdWV9LCAke3l9KWApO1xuXG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgY29uc3QgeCA9IGVsZW1lbnQuZGF0dW0oKS54IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt2YWx1ZX0pYCk7XG5cbiAgICB9XG5cbiAgICBlbGVtZW50LmF0dHIobmFtZSwgdmFsdWUpO1xuXG59OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBCb3VuZGluZ0JveFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm91bmRpbmdCb3gge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge0JvdW5kaW5nQm94fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1pZGRsZW1hbikge1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZUNsaWNrXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBoYW5kbGVDbGljaygpIHtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgaWYgKG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb3VzZVggPSBkMy5ldmVudC5wYWdlWDtcbiAgICAgICAgY29uc3QgbW91c2VZID0gZDMuZXZlbnQucGFnZVk7XG5cbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICB0aGlzLmJCb3guYXR0cigncG9pbnRlci1ldmVudHMnLCAnYWxsJyk7XG5cbiAgICAgICAgaWYgKG1pZGRsZW1hbi5mcm9tRWxlbWVudChlbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCgnY2xpY2snLCB7IGJ1YmJsZXM6IHRydWUsIGNhbmNlbGFibGU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhd0JvdW5kaW5nQm94XG4gICAgICogQHBhcmFtIHtBcnJheX0gc2VsZWN0ZWRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbGF5ZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYXdCb3VuZGluZ0JveChzZWxlY3RlZCwgbGF5ZXIpIHtcblxuICAgICAgICBpZiAodGhpcy5iQm94KSB7XG4gICAgICAgICAgICB0aGlzLmJCb3gucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb2RlbCA9IHsgbWluWDogTnVtYmVyLk1BWF9WQUxVRSwgbWluWTogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFg6IE51bWJlci5NSU5fVkFMVUUsIG1heFk6IE51bWJlci5NSU5fVkFMVUUgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzcG9uc2libGUgZm9yIGNvbXB1dGluZyB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3gsIGJhc2VkIG9uIGFsbCBvZiB0aGUgYm91bmRpbmcgYm94ZXNcbiAgICAgICAgICogZnJvbSB0aGUgY3VycmVudCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29tcHV0ZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBiQm94ZXNcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGNvbXB1dGUgPSAoYkJveGVzKSA9PiB7XG4gICAgICAgICAgICBtb2RlbC5taW5YID0gTWF0aC5taW4oLi4uYkJveGVzLm1hcCgoZCkgPT4gZC54KSk7XG4gICAgICAgICAgICBtb2RlbC5taW5ZID0gTWF0aC5taW4oLi4uYkJveGVzLm1hcCgoZCkgPT4gZC55KSk7XG4gICAgICAgICAgICBtb2RlbC5tYXhYID0gTWF0aC5tYXgoLi4uYkJveGVzLm1hcCgoZCkgPT4gZC54ICsgZC53aWR0aCkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WSA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSArIGQuaGVpZ2h0KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3guXG4gICAgICAgIGNvbXB1dGUoc2VsZWN0ZWQubWFwKChzaGFwZSkgPT4gc2hhcGUuYm91bmRpbmdCb3goKSkpO1xuXG4gICAgICAgIHRoaXMuYkJveCA9IGxheWVyLmFwcGVuZCgnZycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoJ2JvdW5kaW5nLWJveCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmRhdHVtKG1vZGVsKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdkcmFnLWJveCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCAgICAgICgoZCkgPT4gZC5taW5YKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneScsICAgICAgKChkKSA9PiBkLm1pblkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsICAoKGQpID0+IGQubWF4WCAtIGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsICgoZCkgPT4gZC5tYXhZIC0gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb25zdCBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldO1xuICAgICAgICBjb25zdCBkcmFnICAgICAgPSBbJ2RyYWcnLCAgICAgICgpID0+IHRoaXMuZHJhZygpXTtcbiAgICAgICAgY29uc3QgZHJhZ0VuZCAgID0gWydkcmFnZW5kJywgICAoKSA9PiB0aGlzLmRyYWdFbmQoKV07XG5cbiAgICAgICAgdGhpcy5iQm94LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKC4uLmRyYWdTdGFydCkub24oLi4uZHJhZykub24oLi4uZHJhZ0VuZCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnU3RhcnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdTdGFydCh4ID0gbnVsbCwgeSA9IG51bGwpIHtcblxuICAgICAgICBjb25zdCBzWCA9IE51bWJlcih0aGlzLmJCb3guYXR0cigneCcpKTtcbiAgICAgICAgY29uc3Qgc1kgPSBOdW1iZXIodGhpcy5iQm94LmF0dHIoJ3knKSk7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IHtcbiAgICAgICAgICAgIHg6ICh4ICE9PSBudWxsKSA/IHggOiAoZDMuZXZlbnQuc291cmNlRXZlbnQub3ZlcnJpZGVYIHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYKSAtIHNYLFxuICAgICAgICAgICAgeTogKHkgIT09IG51bGwpID8geSA6IChkMy5ldmVudC5zb3VyY2VFdmVudC5vdmVycmlkZVkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkpIC0gc1lcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm1vdmUgPSB7XG4gICAgICAgICAgICBzdGFydDogeyB4OiBzWCwgeTogc1kgfSxcbiAgICAgICAgICAgIGVuZDogICB7IH1cbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbXVsdGlwbGVPZj10aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCkuZ3JpZFNpemVdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnKHggPSBudWxsLCB5ID0gbnVsbCwgbXVsdGlwbGVPZiA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLm9wdGlvbnMoKS5ncmlkU2l6ZSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICB4ID0gKHggIT09IG51bGwpID8geCA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VYO1xuICAgICAgICB5ID0gKHkgIT09IG51bGwpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGNvbnN0IG1YID0gKHggLSB0aGlzLnN0YXJ0LngpLFxuICAgICAgICAgICAgICBtWSA9ICh5IC0gdGhpcy5zdGFydC55KSxcbiAgICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICAgIGVZID0gTWF0aC5jZWlsKG1ZIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mO1xuXG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnggPSBlWDtcbiAgICAgICAgdGhpcy5iQm94LmRhdHVtKCkueSA9IGVZO1xuXG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCd4JywgZVgpO1xuICAgICAgICB0aGlzLmJCb3guYXR0cigneScsIGVZKTtcblxuICAgICAgICB0aGlzLm1vdmUuZW5kID0geyB4OiBlWCwgeTogZVkgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ0VuZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ0VuZCgpIHtcblxuICAgICAgICBjb25zdCBlWCA9IHRoaXMubW92ZS5lbmQueCAtIHRoaXMubW92ZS5zdGFydC54O1xuICAgICAgICBjb25zdCBlWSA9IHRoaXMubW92ZS5lbmQueSAtIHRoaXMubW92ZS5zdGFydC55O1xuXG4gICAgICAgIGlmIChpc05hTihlWCkgfHwgaXNOYU4oZVkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3ZlIGVhY2ggc2hhcGUgYnkgdGhlIGRlbHRhIGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmQgcG9pbnRzLlxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3RlZCgpLmZvckVhY2goKHNoYXBlKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gc2hhcGUuYXR0cigneCcpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFkgPSBzaGFwZS5hdHRyKCd5Jyk7XG4gICAgICAgICAgICBjb25zdCBtb3ZlWCAgICA9IGN1cnJlbnRYICsgZVg7XG4gICAgICAgICAgICBjb25zdCBtb3ZlWSAgICA9IGN1cnJlbnRZICsgZVk7XG5cbiAgICAgICAgICAgIHNoYXBlLmF0dHIoJ3gnLCBtb3ZlWCkuYXR0cigneScsIG1vdmVZKTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1ldGhvZCB0cnlJbnZva2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge1N0cmluZ30gZnVuY3Rpb25OYW1lXG4gKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCB0cnlJbnZva2UgPSAoY29udGV4dCwgZnVuY3Rpb25OYW1lLCAuLi5vcHRpb25zKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dFtmdW5jdGlvbk5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRleHRbZnVuY3Rpb25OYW1lXSguLi5vcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuXG59O1xuXG4vKipcbiAqIEBtZXRob2QgY2FwaXRhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgY2FwaXRhbGl6ZSA9IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcblxufTtcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEludm9jYXRvclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCgpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaWRcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTaGFwZX0gc2hhcGVzXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBkaWQodHlwZSwgc2hhcGVzKSB7XG5cbiAgICAgICAgICAgIHNoYXBlcyA9IEFycmF5LmlzQXJyYXkoc2hhcGVzKSA/IHNoYXBlcyA6IFtzaGFwZXNdO1xuXG4gICAgICAgICAgICByZXR1cm4gc2hhcGVzLmV2ZXJ5KChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnlJbnZva2Uoc2hhcGUsIGBkaWQke2NhcGl0YWxpemUodHlwZSl9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluY2x1ZGVFeGNsdWRlXG4gICAgICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGluY2x1ZGVFeGNsdWRlKGRyYWZ0LCBmbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluY2x1ZGUgICA9IG9wdGlvbnMuaW5jbHVkZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBleGNsdWRlICAgPSBvcHRpb25zLmV4Y2x1ZGUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gZHJhZnRbU3ltYm9scy5NSURETEVNQU5dO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgYWxsRXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBleGNsdWRpbmdcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBhbGxFeGNsdWRpbmcgPSAoZXhjbHVkaW5nKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBleGNsdWRpbmcgPSBBcnJheS5pc0FycmF5KGV4Y2x1ZGluZykgPyBleGNsdWRpbmcgOiBbZXhjbHVkaW5nXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtaWRkbGVtYW4uYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIX5leGNsdWRpbmcuaW5kZXhPZihzaGFwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgZm4uYXBwbHkoZHJhZnQsIFtpbmNsdWRlXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZXhjbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KGRyYWZ0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm4uYXBwbHkoZHJhZnQsIFthbGxFeGNsdWRpbmcoZXhjbHVkZSldKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBLZXlCaW5kaW5nc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5QmluZGluZ3Mge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge0tleUJpbmRpbmdzfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1pZGRsZW1hbikge1xuXG4gICAgICAgIGNvbnN0IGtleU1hcCAgICAgICAgICAgID0gbWlkZGxlbWFuW1N5bWJvbHMuS0VZX01BUF07XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbWlkZGxlbWFuO1xuXG4gICAgICAgIC8vIERlZmF1bHQga2VwIG1hcHBpbmdzXG4gICAgICAgIGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlO1xuICAgICAgICBrZXlNYXAuYXNwZWN0UmF0aW8gPSBmYWxzZTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGtleSBtYXAuXG4gICAgICAgIHRoaXMuYXR0YWNoQmluZGluZ3Moa2V5TWFwKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoQmluZGluZ3NcbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5TWFwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhdHRhY2hCaW5kaW5ncyhrZXlNYXApIHtcblxuICAgICAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBhdmFpbGFibGUgc2hhcGVzLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3QoKSk7XG5cbiAgICAgICAgLy8gTXVsdGktc2VsZWN0aW5nIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIC8vIE1haW50YWluIGFzcGVjdCByYXRpb3Mgd2hlbiByZXNpemluZy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFRocm93ICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93JztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vc2hhcGVzL1JlY3RhbmdsZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNYXBwZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgcmVjdGFuZ2xlOiBSZWN0YW5nbGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHR5cGVvZiBtYXBbbmFtZV0gIT09ICd1bmRlZmluZWQnID8gbmV3IG1hcFtuYW1lXSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IFRocm93KGBDYW5ub3QgbWFwIFwiJHtuYW1lfVwiIHRvIGEgc2hhcGUgb2JqZWN0YCk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgICAgIGZyb20gJy4vU3ltYm9scyc7XG5pbXBvcnQgS2V5QmluZGluZ3MgZnJvbSAnLi9LZXlCaW5kaW5ncyc7XG5pbXBvcnQgaW52b2NhdG9yICAgZnJvbSAnLi9JbnZvY2F0b3InO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWlkZGxlbWFuXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWRkbGVtYW4ge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtEcmFmdH0gZHJhZnRcbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZHJhZnQpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuRFJBRlRdICAgICAgICA9IGRyYWZ0O1xuICAgICAgICB0aGlzW1N5bWJvbHMuS0VZX01BUF0gICAgICA9IHt9O1xuICAgICAgICB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXSA9IGZhbHNlO1xuXG4gICAgICAgIG5ldyBLZXlCaW5kaW5ncyh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZDNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZDMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuU1ZHXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxheWVyc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBsYXllcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuTEFZRVJTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0ub3B0aW9ucygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qga2V5TWFwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGtleU1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5LRVlfTUFQXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3Qob3B0aW9ucykge1xuICAgICAgICBpbnZvY2F0b3IuaW5jbHVkZUV4Y2x1ZGUodGhpc1tTeW1ib2xzLkRSQUZUXSwgdGhpc1tTeW1ib2xzLkRSQUZUXS5zZWxlY3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3Qob3B0aW9ucykge1xuICAgICAgICBpbnZvY2F0b3IuaW5jbHVkZUV4Y2x1ZGUodGhpc1tTeW1ib2xzLkRSQUZUXSwgdGhpc1tTeW1ib2xzLkRSQUZUXS5kZXNlbGVjdCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLmFsbCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0ZWQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGZyb21FbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGZyb21FbGVtZW50KGVsZW1lbnQpIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKS5maWx0ZXIoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudCA9PT0gc2hhcGVbU3ltYm9scy5FTEVNRU5UXS5ub2RlKCk7XG4gICAgICAgIH0pWzBdO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBwcmV2ZW50RGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICovXG4gICAgcHJldmVudERlc2VsZWN0KHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdID0gdmFsdWU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7Qm91bmRpbmdCb3h9XG4gICAgICovXG4gICAgYm91bmRpbmdCb3goKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuQk9VTkRJTkdfQk9YXTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUG9seWZpbGxzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0QXNzaWduKHRhcmdldCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdCcpO1xuICAgIH1cblxuICAgIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGlmIChuZXh0U291cmNlID09PSB1bmRlZmluZWQgfHwgbmV4dFNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFNvdXJjZSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgICAgICB2YXIga2V5c0FycmF5ID0gT2JqZWN0LmtleXMoT2JqZWN0KG5leHRTb3VyY2UpKTtcblxuICAgICAgICBmb3IgKHZhciBuZXh0SW5kZXggPSAwLCBsZW4gPSBrZXlzQXJyYXkubGVuZ3RoOyBuZXh0SW5kZXggPCBsZW47IG5leHRJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IGtleXNBcnJheVtuZXh0SW5kZXhdO1xuICAgICAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5leHRTb3VyY2UsIG5leHRLZXkpO1xuICAgICAgICAgICAgaWYgKGRlc2MgIT09IHVuZGVmaW5lZCAmJiBkZXNjLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG87XG5cbn1cbiIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTeW1ib2xzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgRFJBRlQ6ICAgICAgICBTeW1ib2woJ2RyYWZ0JyksXG4gICAgU1ZHOiAgICAgICAgICBTeW1ib2woJ3N2ZycpLFxuICAgIEVMRU1FTlQ6ICAgICAgU3ltYm9sKCdlbGVtZW50JyksXG4gICAgSVNfU0VMRUNURUQ6ICBTeW1ib2woJ2lzU2VsZWN0ZWQnKSxcbiAgICBBVFRSSUJVVEVTOiAgIFN5bWJvbCgnYXR0cmlidXRlcycpLFxuICAgIE1JRERMRU1BTjogICAgU3ltYm9sKCdtaWRkbGVtYW4nKSxcbiAgICBTSEFQRTogICAgICAgIFN5bWJvbCgnc2hhcGUnKSxcbiAgICBTSEFQRVM6ICAgICAgIFN5bWJvbCgnc2hhcGVzJyksXG4gICAgTEFZRVJTOiAgICAgICBTeW1ib2woJ2xheWVycycpLFxuICAgIEdST1VQOiAgICAgICAgU3ltYm9sKCdncm91cCcpLFxuICAgIEJPVU5ESU5HX0JPWDogU3ltYm9sKCdib3VuZGluZ0JveCcpLFxuICAgIE9QVElPTlM6ICAgICAgU3ltYm9sKCdvcHRpb25zJyksXG4gICAgQUJJTElUSUVTOiAgICBTeW1ib2woJ2FiaWxpdGllcycpLFxuICAgIEtFWV9NQVA6ICAgICAgU3ltYm9sKCdrZXlNYXAnKSxcbiAgICBDQU5fREVTRUxFQ1Q6IFN5bWJvbCgnY2FuRGVzZWxlY3QnKVxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBUaHJvd1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhyb3cge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJuIHtUaHJvd31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRHJhZnQuanM6ICR7bWVzc2FnZX0uYCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiAnYmx1ZScsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scyc7XG5pbXBvcnQgVGhyb3cgICAgICAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZSAgIGZyb20gJy4uL2hlbHBlcnMvQXR0cmlidXRlcyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IFNlbGVjdGFibGUgICAgIGZyb20gJy4uL2FiaWxpdGllcy9TZWxlY3RhYmxlJztcbmltcG9ydCBSZXNpemFibGUgICAgICBmcm9tICcuLi9hYmlsaXRpZXMvUmVzaXphYmxlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSA9IGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHRocm93cyB7RXJyb3J9IFdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSBgdGFnTmFtZWAgbWV0aG9kIGhhc24ndCBiZWVuIGRlZmluZWQgb24gdGhlIGNoaWxkIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIG5ldyBUaHJvdygnVGFnIG5hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhIHNoYXBlIHVzaW5nIHRoZSBgdGFnTmFtZWAgbWV0aG9kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZXwqfVxuICAgICAqL1xuICAgIGF0dHIobmFtZSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgc2V0QXR0cmlidXRlKHRoaXNbU3ltYm9scy5FTEVNRU5UXSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBsYXllciAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5sYXllcnMoKS5zaGFwZXM7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgICAgICA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRBdHRyaWJ1dGVzKCksIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5HUk9VUF0gICA9IGxheWVyLmFwcGVuZCgnZycpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0gPSB0aGlzW1N5bWJvbHMuR1JPVVBdLmFwcGVuZCh0aGlzLnRhZ05hbWUoKSkuZGF0dW0oe30pO1xuXG4gICAgICAgIC8vIEFzc2lnbiBlYWNoIGF0dHJpYnV0ZSBmcm9tIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGUgc2hhcGUsIGFzIHdlbGwgYXMgdGhvc2UgZGVmaW5lZFxuICAgICAgICAvLyBieSB0aGUgdXNlciB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIHNoYXBlLlxuICAgICAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHRoaXMuYXR0cihrZXksIGF0dHJpYnV0ZXNba2V5XSkpO1xuXG4gICAgICAgIGNvbnN0IGFiaWxpdGllcyAgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSgpLFxuICAgICAgICAgICAgcmVzaXphYmxlOiAgbmV3IFJlc2l6YWJsZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMoYWJpbGl0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzaGFwZSBvYmplY3QgaW50byBlYWNoIGFiaWxpdHkgaW5zdGFuY2UsIGFuZCBpbnZva2UgdGhlIGBkaWRBZGRgIG1ldGhvZC5cbiAgICAgICAgICAgIGNvbnN0IGFiaWxpdHkgPSBhYmlsaXRpZXNba2V5XTtcbiAgICAgICAgICAgIGFiaWxpdHlbU3ltYm9scy5TSEFQRV0gPSB0aGlzO1xuICAgICAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgYWJpbGl0eSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10gPSBhYmlsaXRpZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkUmVtb3ZlKCkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gdHJ1ZTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLmRpZFNlbGVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkRGVzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZERlc2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gZmFsc2U7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdLnJlc2l6YWJsZS5kaWREZXNlbGVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYm91bmRpbmdCb3hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYm91bmRpbmdCb3goKSB7XG5cbiAgICAgICAgY29uc3QgaGFzQkJveCA9IHR5cGVvZiB0aGlzW1N5bWJvbHMuR1JPVVBdLm5vZGUoKS5nZXRCQm94ID09PSAnZnVuY3Rpb24nO1xuXG4gICAgICAgIHJldHVybiBoYXNCQm94ID8gdGhpc1tTeW1ib2xzLkdST1VQXS5ub2RlKCkuZ2V0QkJveCgpIDoge1xuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmF0dHIoJ2hlaWdodCcpLFxuICAgICAgICAgICAgd2lkdGg6ICB0aGlzLmF0dHIoJ3dpZHRoJyksXG4gICAgICAgICAgICB4OiAgICAgIHRoaXMuYXR0cigneCcpLFxuICAgICAgICAgICAgeTogICAgICB0aGlzLmF0dHIoJ3knKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0QXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxufSJdfQ==
