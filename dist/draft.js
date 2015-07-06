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

},{"./helpers/BoundingBox":5,"./helpers/Invocator":6,"./helpers/Mapper":8,"./helpers/Middleman":9,"./helpers/Polyfills":10,"./helpers/Symbols":11}],2:[function(require,module,exports){
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

},{"../helpers/Symbols":11}],3:[function(require,module,exports){
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
         * @return {void}
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

},{"./../helpers/Symbols":11,"./Ability":2}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
            });
        }
    }]);

    return BoundingBox;
})();

exports['default'] = BoundingBox;
module.exports = exports['default'];

},{"./Symbols":11}],6:[function(require,module,exports){
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

},{"./Symbols":11}],7:[function(require,module,exports){
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

},{"./Symbols":11}],8:[function(require,module,exports){
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

},{"../helpers/Throw":12,"../shapes/Rectangle":13}],9:[function(require,module,exports){
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

},{"./Invocator":6,"./KeyBindings":7,"./Symbols":11}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./Shape":14}],14:[function(require,module,exports){
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
                selectable: new _abilitiesSelectable2['default']()
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
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this[_helpersSymbols2['default'].IS_SELECTED] = false;
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

},{"../abilities/Selectable":3,"../helpers/Attributes":4,"../helpers/Invocator":6,"../helpers/Polyfills":10,"../helpers/Symbols":11,"../helpers/Throw":12}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvQm91bmRpbmdCb3guanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9JbnZvY2F0b3IuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9LZXlCaW5kaW5ncy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL01hcHBlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL01pZGRsZW1hbi5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1BvbHlmaWxscy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1N5bWJvbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9UaHJvdy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvUmVjdGFuZ2xlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9T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QUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRztBQUNwRCxzQkFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCLHFCQUFLLEVBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDMUIsaUJBQUMsRUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN0QixpQkFBQyxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQ3pCLENBQUM7U0FFTDs7Ozs7Ozs7ZUFNZ0IsNkJBQUc7QUFDaEIsbUJBQU8sRUFBRSxDQUFDO1NBQ2I7OztXQTVIZ0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4nO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBCb3VuZGluZ0JveCAgICBmcm9tICcuL2hlbHBlcnMvQm91bmRpbmdCb3gnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IG1hcHBlciAgICAgICAgIGZyb20gJy4vaGVscGVycy9NYXBwZXInO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLlNIQVBFU10gICAgICAgPSBbXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk9QVElPTlNdICAgICAgPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbWlkZGxlbWFuICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSAgICA9IG5ldyBNaWRkbGVtYW4odGhpcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdID0gbmV3IEJvdW5kaW5nQm94KG1pZGRsZW1hbik7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBTVkcgY29tcG9uZW50IHVzaW5nIHRoZSBkZWZpbmVkIG9wdGlvbnMuXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHN2ZyAgICA9IHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5MQVlFUlNdICA9IHtcbiAgICAgICAgICAgIHNoYXBlczogc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3NoYXBlcycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbiksXG4gICAgICAgICAgICBtYXJrZXJzOiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VycycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIHdoZW4gdGhlIGNhbnZhcyBpcyBjbGlja2VkLlxuICAgICAgICBzdmcub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIW1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdChmYWxzZSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgLy8gYXMgYSBzdHJpbmcuXG4gICAgICAgIHNoYXBlID0gKHR5cGVvZiBzaGFwZSA9PT0gJ3N0cmluZycpID8gbWFwcGVyKHNoYXBlKSA6IHNoYXBlO1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBzaGFwZXMucHVzaChzaGFwZSk7XG5cbiAgICAgICAgLy8gUHV0IHRoZSBpbnRlcmZhY2UgZm9yIGludGVyYWN0aW5nIHdpdGggRHJhZnQgaW50byB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICBzaGFwZVtTeW1ib2xzLk1JRERMRU1BTl0gPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGNvbnN0IGluZGV4ICA9IHNoYXBlcy5pbmRleE9mKHNoYXBlKTtcblxuICAgICAgICBzaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGUpO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgncmVtb3ZlJywgc2hhcGVzKTtcbiAgICAgICAgc2hhcGVzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnc2VsZWN0Jywgc2hhcGVzKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkJPVU5ESU5HX0JPWF0uZHJhd0JvdW5kaW5nQm94KHRoaXMuc2VsZWN0ZWQoKSwgdGhpc1tTeW1ib2xzLkxBWUVSU10ubWFya2Vycyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnZGVzZWxlY3QnLCBzaGFwZXMpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQk9VTkRJTkdfQk9YXS5kcmF3Qm91bmRpbmdCb3godGhpcy5zZWxlY3RlZCgpLCB0aGlzW1N5bWJvbHMuTEFZRVJTXS5tYXJrZXJzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIG9wdGlvbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5PUFRJT05TXSB8fCB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKCgkd2luZG93KSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICgkd2luZG93KSB7XG5cbiAgICAgICAgLy8gRXhwb3J0IGRyYWZ0IGlmIHRoZSBgd2luZG93YCBvYmplY3QgaXMgYXZhaWxhYmxlLlxuICAgICAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbiAgICB9XG5cbn0pKHdpbmRvdyk7XG5cbi8vIEV4cG9ydCBmb3IgdXNlIGluIEVTNiBhcHBsaWNhdGlvbnMuXG5leHBvcnQgZGVmYXVsdCBEcmFmdDsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNoYXBlXG4gICAgICogQHJldHVybiB7QWJpbGl0eX1cbiAgICAgKi9cbiAgICBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgbWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSBleHRlbmRzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuRUxFTUVOVF07XG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcblxuICAgICAgICBlbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKCdkcmFnJywgKCkgPT4gdGhpcy5oYW5kbGVEcmFnKCkpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGFuZGxlRHJhZ1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlRHJhZygpIHtcblxuICAgICAgICB0aGlzLmhhbmRsZUNsaWNrKCk7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBmYWtlIGV2ZW50IHRvIGRyYWcgdGhlIHNoYXBlIHdpdGggYW4gb3ZlcnJpZGUgWCBhbmQgWSB2YWx1ZS5cbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCgnbW91c2Vkb3duJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgZXZlbnQub3ZlcnJpZGVYID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVg7XG4gICAgICAgIGV2ZW50Lm92ZXJyaWRlWSA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGNvbnN0IGJCb3ggID0gbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuYkJveC5ub2RlKCk7XG4gICAgICAgIGJCb3guZGlzcGF0Y2hFdmVudChldmVudCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZUNsaWNrXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBoYW5kbGVDbGljaygpIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgPSB0aGlzLm1pZGRsZW1hbigpW1N5bWJvbHMuS0VZX01BUF07XG5cbiAgICAgICAgaWYgKHRoaXMuc2hhcGUoKS5pc1NlbGVjdGVkKCkpIHtcblxuICAgICAgICAgICAgaWYgKCFrZXlNYXAubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBvdGhlcnMgYW5kIHNlbGVjdCBvbmx5IHRoZSBjdXJyZW50IHNoYXBlLlxuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBleGNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgdGhlIHNoYXBlIGlmIGl0J3MgY3VycmVudGx5IHNlbGVjdGVkLlxuICAgICAgICAgICAgcmV0dXJuIHZvaWQgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGluY2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZXlNYXAubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWxsIHNoYXBlcyBleGNlcHQgZm9yIHRoZSBjdXJyZW50LlxuICAgICAgICAgICAgdGhpcy5taWRkbGVtYW4oKS5kZXNlbGVjdCh7IGV4Y2x1ZGU6IHRoaXMuc2hhcGUoKSB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5taWRkbGVtYW4oKS5zZWxlY3QoeyBpbmNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQXR0cmlidXRlc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuXG4vKlxuICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVcbiAqIEBwYXJhbSB7QXJyYXl9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgbmFtZSwgdmFsdWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgc3dpdGNoIChuYW1lKSB7XG5cbiAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICBjb25zdCB5ID0gZWxlbWVudC5kYXR1bSgpLnkgfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3ZhbHVlfSwgJHt5fSlgKTtcblxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIGNvbnN0IHggPSBlbGVtZW50LmRhdHVtKCkueCB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7dmFsdWV9KWApO1xuXG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyKG5hbWUsIHZhbHVlKTtcblxufTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQm91bmRpbmdCb3hcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvdW5kaW5nQm94IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtCb3VuZGluZ0JveH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBtaWRkbGVtYW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KCkpIHtcbiAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW91c2VYID0gZDMuZXZlbnQucGFnZVg7XG4gICAgICAgIGNvbnN0IG1vdXNlWSA9IGQzLmV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4uZnJvbUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYXdCb3VuZGluZ0JveFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNlbGVjdGVkXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGxheWVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmF3Qm91bmRpbmdCb3goc2VsZWN0ZWQsIGxheWVyKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYkJveCkge1xuICAgICAgICAgICAgdGhpcy5iQm94LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kZWwgPSB7IG1pblg6IE51bWJlci5NQVhfVkFMVUUsIG1pblk6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhYOiBOdW1iZXIuTUlOX1ZBTFVFLCBtYXhZOiBOdW1iZXIuTUlOX1ZBTFVFIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3BvbnNpYmxlIGZvciBjb21wdXRpbmcgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LCBiYXNlZCBvbiBhbGwgb2YgdGhlIGJvdW5kaW5nIGJveGVzXG4gICAgICAgICAqIGZyb20gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgc2hhcGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGNvbXB1dGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYkJveGVzXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjb21wdXRlID0gKGJCb3hlcykgPT4ge1xuICAgICAgICAgICAgbW9kZWwubWluWCA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCkpO1xuICAgICAgICAgICAgbW9kZWwubWluWSA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WCA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCArIGQud2lkdGgpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFkgPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkgKyBkLmhlaWdodCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LlxuICAgICAgICBjb21wdXRlKHNlbGVjdGVkLm1hcCgoc2hhcGUpID0+IHNoYXBlLmJvdW5kaW5nQm94KCkpKTtcblxuICAgICAgICB0aGlzLmJCb3ggPSBsYXllci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZHJhZy1ib3gnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgICAgICAoKGQpID0+IGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAgICAgICgoZCkgPT4gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAgKChkKSA9PiBkLm1heFggLSBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAoKGQpID0+IGQubWF4WSAtIGQubWluWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG5cbiAgICAgICAgY29uc3QgZHJhZ1N0YXJ0ID0gWydkcmFnc3RhcnQnLCAoKSA9PiB0aGlzLmRyYWdTdGFydCgpXTtcbiAgICAgICAgY29uc3QgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV07XG4gICAgICAgIGNvbnN0IGRyYWdFbmQgICA9IFsnZHJhZ2VuZCcsICAgKCkgPT4gdGhpcy5kcmFnRW5kKCldO1xuXG4gICAgICAgIHRoaXMuYkJveC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbiguLi5kcmFnU3RhcnQpLm9uKC4uLmRyYWcpLm9uKC4uLmRyYWdFbmQpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1N0YXJ0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnU3RhcnQoeCA9IG51bGwsIHkgPSBudWxsKSB7XG5cbiAgICAgICAgY29uc3Qgc1ggPSBOdW1iZXIodGhpcy5iQm94LmF0dHIoJ3gnKSk7XG4gICAgICAgIGNvbnN0IHNZID0gTnVtYmVyKHRoaXMuYkJveC5hdHRyKCd5JykpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAoeCAhPT0gbnVsbCkgPyB4IDogKGQzLmV2ZW50LnNvdXJjZUV2ZW50Lm92ZXJyaWRlWCB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWCkgLSBzWCxcbiAgICAgICAgICAgIHk6ICh5ICE9PSBudWxsKSA/IHkgOiAoZDMuZXZlbnQuc291cmNlRXZlbnQub3ZlcnJpZGVZIHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZKSAtIHNZXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb3ZlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHsgeDogc1gsIHk6IHNZIH0sXG4gICAgICAgICAgICBlbmQ6ICAgeyB9XG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW211bHRpcGxlT2Y9dGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ub3B0aW9ucygpLmdyaWRTaXplXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCkuZ3JpZFNpemUpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5wcmV2ZW50RGVzZWxlY3QodHJ1ZSk7XG5cbiAgICAgICAgeCA9ICh4ICE9PSBudWxsKSA/IHggOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWDtcbiAgICAgICAgeSA9ICh5ICE9PSBudWxsKSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWTtcblxuICAgICAgICBjb25zdCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgICAgbVkgPSAoeSAtIHRoaXMuc3RhcnQueSksXG4gICAgICAgICAgICAgIGVYID0gTWF0aC5jZWlsKG1YIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mLFxuICAgICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLmJCb3guZGF0dW0oKS54ID0gZVg7XG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnkgPSBlWTtcblxuICAgICAgICB0aGlzLmJCb3guYXR0cigneCcsIGVYKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3knLCBlWSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlLmVuZCA9IHsgeDogZVgsIHk6IGVZIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdFbmRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdFbmQoKSB7XG5cbiAgICAgICAgY29uc3QgZVggPSB0aGlzLm1vdmUuZW5kLnggLSB0aGlzLm1vdmUuc3RhcnQueDtcbiAgICAgICAgY29uc3QgZVkgPSB0aGlzLm1vdmUuZW5kLnkgLSB0aGlzLm1vdmUuc3RhcnQueTtcblxuICAgICAgICBpZiAoaXNOYU4oZVgpIHx8IGlzTmFOKGVZKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW92ZSBlYWNoIHNoYXBlIGJ5IHRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cy5cbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0ZWQoKS5mb3JFYWNoKChzaGFwZSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50WCA9IHNoYXBlLmF0dHIoJ3gnKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRZID0gc2hhcGUuYXR0cigneScpO1xuICAgICAgICAgICAgY29uc3QgbW92ZVggICAgPSBjdXJyZW50WCArIGVYO1xuICAgICAgICAgICAgY29uc3QgbW92ZVkgICAgPSBjdXJyZW50WSArIGVZO1xuXG4gICAgICAgICAgICBzaGFwZS5hdHRyKCd4JywgbW92ZVgpLmF0dHIoJ3knLCBtb3ZlWSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtZXRob2QgdHJ5SW52b2tlXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHtTdHJpbmd9IGZ1bmN0aW9uTmFtZVxuICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgdHJ5SW52b2tlID0gKGNvbnRleHQsIGZ1bmN0aW9uTmFtZSwgLi4ub3B0aW9ucykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHRbZnVuY3Rpb25OYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb250ZXh0W2Z1bmN0aW9uTmFtZV0oLi4ub3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcblxufTtcblxuLyoqXG4gKiBAbWV0aG9kIGNhcGl0YWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGNhcGl0YWxpemUgPSAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG5cbn07XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBJbnZvY2F0b3JcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgoKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGlkXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl8U2hhcGV9IHNoYXBlc1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgZGlkKHR5cGUsIHNoYXBlcykge1xuXG4gICAgICAgICAgICBzaGFwZXMgPSBBcnJheS5pc0FycmF5KHNoYXBlcykgPyBzaGFwZXMgOiBbc2hhcGVzXTtcblxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlcy5ldmVyeSgoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ5SW52b2tlKHNoYXBlLCBgZGlkJHtjYXBpdGFsaXplKHR5cGUpfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBpbmNsdWRlRXhjbHVkZVxuICAgICAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBpbmNsdWRlRXhjbHVkZShkcmFmdCwgZm4sIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgICAgICBjb25zdCBpbmNsdWRlICAgPSBvcHRpb25zLmluY2x1ZGUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgZXhjbHVkZSAgID0gb3B0aW9ucy5leGNsdWRlIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IG1pZGRsZW1hbiA9IGRyYWZ0W1N5bWJvbHMuTUlERExFTUFOXTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGFsbEV4Y2x1ZGluZ1xuICAgICAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgYWxsRXhjbHVkaW5nID0gKGV4Y2x1ZGluZykgPT4ge1xuXG4gICAgICAgICAgICAgICAgZXhjbHVkaW5nID0gQXJyYXkuaXNBcnJheShleGNsdWRpbmcpID8gZXhjbHVkaW5nIDogW2V4Y2x1ZGluZ107XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWlkZGxlbWFuLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF+ZXhjbHVkaW5nLmluZGV4T2Yoc2hhcGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KGRyYWZ0LCBbaW5jbHVkZV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWV4Y2x1ZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCBmbi5hcHBseShkcmFmdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZuLmFwcGx5KGRyYWZ0LCBbYWxsRXhjbHVkaW5nKGV4Y2x1ZGUpXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgS2V5QmluZGluZ3NcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUJpbmRpbmdzIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtLZXlCaW5kaW5nc31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgICAgICAgICAgICA9IG1pZGRsZW1hbltTeW1ib2xzLktFWV9NQVBdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcblxuICAgICAgICAvLyBEZWZhdWx0IGtlcCBtYXBwaW5nc1xuICAgICAgICBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZTtcbiAgICAgICAga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2U7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBrZXkgbWFwLlxuICAgICAgICB0aGlzLmF0dGFjaEJpbmRpbmdzKGtleU1hcCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dGFjaEJpbmRpbmdzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleU1hcFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoQmluZGluZ3Moa2V5TWFwKSB7XG5cbiAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0KCkpO1xuXG4gICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAvLyBNYWludGFpbiBhc3BlY3QgcmF0aW9zIHdoZW4gcmVzaXppbmcuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgIH1cblxufSIsImltcG9ydCBUaHJvdyAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdyc7XG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL3NoYXBlcy9SZWN0YW5nbGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWFwcGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgIHJlY3RhbmdsZTogUmVjdGFuZ2xlXG4gICAgfTtcblxuICAgIHJldHVybiB0eXBlb2YgbWFwW25hbWVdICE9PSAndW5kZWZpbmVkJyA/IG5ldyBtYXBbbmFtZV0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBUaHJvdyhgQ2Fubm90IG1hcCBcIiR7bmFtZX1cIiB0byBhIHNoYXBlIG9iamVjdGApO1xuXG59OyIsImltcG9ydCBTeW1ib2xzICAgICBmcm9tICcuL1N5bWJvbHMnO1xuaW1wb3J0IEtleUJpbmRpbmdzIGZyb20gJy4vS2V5QmluZGluZ3MnO1xuaW1wb3J0IGludm9jYXRvciAgIGZyb20gJy4vSW52b2NhdG9yJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1pZGRsZW1hblxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlkZGxlbWFuIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICogQHJldHVybiB7TWlkZGxlbWFufVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRyYWZ0KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkRSQUZUXSAgICAgICAgPSBkcmFmdDtcbiAgICAgICAgdGhpc1tTeW1ib2xzLktFWV9NQVBdICAgICAgPSB7fTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF0gPSBmYWxzZTtcblxuICAgICAgICBuZXcgS2V5QmluZGluZ3ModGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGQzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGQzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLlNWR107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBsYXllcnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgbGF5ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLkxBWUVSU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLm9wdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGtleU1hcFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBrZXlNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuS0VZX01BUF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXNbU3ltYm9scy5EUkFGVF0sIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXNbU3ltYm9scy5EUkFGVF0sIHRoaXNbU3ltYm9scy5EUkFGVF0uZGVzZWxlY3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5hbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLnNlbGVjdGVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmcm9tRWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBmcm9tRWxlbWVudChlbGVtZW50KSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQgPT09IHNoYXBlW1N5bWJvbHMuRUxFTUVOVF0ubm9kZSgpO1xuICAgICAgICB9KVswXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcHJldmVudERlc2VsZWN0XG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqL1xuICAgIHByZXZlbnREZXNlbGVjdCh2YWx1ZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1N5bWJvbHMuQ0FOX0RFU0VMRUNUXSA9IHZhbHVlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBib3VuZGluZ0JveFxuICAgICAqIEByZXR1cm4ge0JvdW5kaW5nQm94fVxuICAgICAqL1xuICAgIGJvdW5kaW5nQm94KCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLkJPVU5ESU5HX0JPWF07XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFBvbHlmaWxsc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEFzc2lnbih0YXJnZXQpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBmaXJzdCBhcmd1bWVudCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuZXh0U291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBpZiAobmV4dFNvdXJjZSA9PT0gdW5kZWZpbmVkIHx8IG5leHRTb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG5leHRTb3VyY2UgPSBPYmplY3QobmV4dFNvdXJjZSk7XG5cbiAgICAgICAgdmFyIGtleXNBcnJheSA9IE9iamVjdC5rZXlzKE9iamVjdChuZXh0U291cmNlKSk7XG5cbiAgICAgICAgZm9yICh2YXIgbmV4dEluZGV4ID0gMCwgbGVuID0ga2V5c0FycmF5Lmxlbmd0aDsgbmV4dEluZGV4IDwgbGVuOyBuZXh0SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBrZXlzQXJyYXlbbmV4dEluZGV4XTtcbiAgICAgICAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuZXh0U291cmNlLCBuZXh0S2V5KTtcbiAgICAgICAgICAgIGlmIChkZXNjICE9PSB1bmRlZmluZWQgJiYgZGVzYy5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvO1xuXG59XG4iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU3ltYm9sc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIERSQUZUOiAgICAgICAgU3ltYm9sKCdkcmFmdCcpLFxuICAgIFNWRzogICAgICAgICAgU3ltYm9sKCdzdmcnKSxcbiAgICBFTEVNRU5UOiAgICAgIFN5bWJvbCgnZWxlbWVudCcpLFxuICAgIElTX1NFTEVDVEVEOiAgU3ltYm9sKCdpc1NlbGVjdGVkJyksXG4gICAgQVRUUklCVVRFUzogICBTeW1ib2woJ2F0dHJpYnV0ZXMnKSxcbiAgICBNSURETEVNQU46ICAgIFN5bWJvbCgnbWlkZGxlbWFuJyksXG4gICAgU0hBUEU6ICAgICAgICBTeW1ib2woJ3NoYXBlJyksXG4gICAgU0hBUEVTOiAgICAgICBTeW1ib2woJ3NoYXBlcycpLFxuICAgIExBWUVSUzogICAgICAgU3ltYm9sKCdsYXllcnMnKSxcbiAgICBHUk9VUDogICAgICAgIFN5bWJvbCgnZ3JvdXAnKSxcbiAgICBCT1VORElOR19CT1g6IFN5bWJvbCgnYm91bmRpbmdCb3gnKSxcbiAgICBPUFRJT05TOiAgICAgIFN5bWJvbCgnb3B0aW9ucycpLFxuICAgIEFCSUxJVElFUzogICAgU3ltYm9sKCdhYmlsaXRpZXMnKSxcbiAgICBLRVlfTUFQOiAgICAgIFN5bWJvbCgna2V5TWFwJyksXG4gICAgQ0FOX0RFU0VMRUNUOiBTeW1ib2woJ2NhbkRlc2VsZWN0Jylcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVGhyb3dcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocm93IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICogQHJldHVybiB7VGhyb3d9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERyYWZ0LmpzOiAke21lc3NhZ2V9LmApO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuL1NoYXBlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0QXR0cmlidXRlcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogJ2JsdWUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuaW1wb3J0IFRocm93ICAgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvVGhyb3cnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4uL2hlbHBlcnMvUG9seWZpbGxzJztcbmltcG9ydCBzZXRBdHRyaWJ1dGUgICBmcm9tICcuLi9oZWxwZXJzL0F0dHJpYnV0ZXMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4uL2hlbHBlcnMvSW52b2NhdG9yJztcbmltcG9ydCBTZWxlY3RhYmxlICAgICBmcm9tICcuLi9hYmlsaXRpZXMvU2VsZWN0YWJsZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFthdHRyaWJ1dGVzPXt9XVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10gPSBhdHRyaWJ1dGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiB0aGUgYHRhZ05hbWVgIG1ldGhvZCBoYXNuJ3QgYmVlbiBkZWZpbmVkIG9uIHRoZSBjaGlsZCBvYmplY3QuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICBuZXcgVGhyb3coJ1RhZyBuYW1lIG11c3QgYmUgZGVmaW5lZCBmb3IgYSBzaGFwZSB1c2luZyB0aGUgYHRhZ05hbWVgIG1ldGhvZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaXNTZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7U2hhcGV8Kn1cbiAgICAgKi9cbiAgICBhdHRyKG5hbWUsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHNldEF0dHJpYnV0ZSh0aGlzW1N5bWJvbHMuRUxFTUVOVF0sIG5hbWUsIHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkQWRkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRBZGQoKSB7XG5cbiAgICAgICAgY29uc3QgbGF5ZXIgICAgICAgICAgID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ubGF5ZXJzKCkuc2hhcGVzO1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzICAgICAgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0QXR0cmlidXRlcygpLCB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10pO1xuICAgICAgICB0aGlzW1N5bWJvbHMuR1JPVVBdICAgPSBsYXllci5hcHBlbmQoJ2cnKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdID0gdGhpc1tTeW1ib2xzLkdST1VQXS5hcHBlbmQodGhpcy50YWdOYW1lKCkpLmRhdHVtKHt9KTtcblxuICAgICAgICAvLyBBc3NpZ24gZWFjaCBhdHRyaWJ1dGUgZnJvbSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGVzIGRlZmluZWQgb24gdGhlIHNoYXBlLCBhcyB3ZWxsIGFzIHRob3NlIGRlZmluZWRcbiAgICAgICAgLy8gYnkgdGhlIHVzZXIgd2hlbiBpbnN0YW50aWF0aW5nIHRoZSBzaGFwZS5cbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB0aGlzLmF0dHIoa2V5LCBhdHRyaWJ1dGVzW2tleV0pKTtcblxuICAgICAgICBjb25zdCBhYmlsaXRpZXMgID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGFiaWxpdGllcykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2hhcGUgb2JqZWN0IGludG8gZWFjaCBhYmlsaXR5IGluc3RhbmNlLCBhbmQgaW52b2tlIHRoZSBgZGlkQWRkYCBtZXRob2QuXG4gICAgICAgICAgICBjb25zdCBhYmlsaXR5ID0gYWJpbGl0aWVzW2tleV07XG4gICAgICAgICAgICBhYmlsaXR5W1N5bWJvbHMuU0hBUEVdID0gdGhpcztcbiAgICAgICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIGFiaWxpdHkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdID0gYWJpbGl0aWVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRSZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFJlbW92ZSgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRTZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGJvdW5kaW5nQm94KCkge1xuXG4gICAgICAgIGNvbnN0IGhhc0JCb3ggPSB0eXBlb2YgdGhpc1tTeW1ib2xzLkdST1VQXS5ub2RlKCkuZ2V0QkJveCA9PT0gJ2Z1bmN0aW9uJztcblxuICAgICAgICByZXR1cm4gaGFzQkJveCA/IHRoaXNbU3ltYm9scy5HUk9VUF0ubm9kZSgpLmdldEJCb3goKSA6IHtcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5hdHRyKCdoZWlnaHQnKSxcbiAgICAgICAgICAgIHdpZHRoOiAgdGhpcy5hdHRyKCd3aWR0aCcpLFxuICAgICAgICAgICAgeDogICAgICB0aGlzLmF0dHIoJ3gnKSxcbiAgICAgICAgICAgIHk6ICAgICAgdGhpcy5hdHRyKCd5JylcbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
