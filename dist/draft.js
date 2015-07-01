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

var _helpersInvocatorJs = require('./helpers/Invocator.js');

var _helpersInvocatorJs2 = _interopRequireDefault(_helpersInvocatorJs);

var _helpersMapperJs = require('./helpers/Mapper.js');

var _helpersMapperJs2 = _interopRequireDefault(_helpersMapperJs);

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

        this[_helpersSymbolsJs2['default'].SHAPES] = [];
        this[_helpersSymbolsJs2['default'].OPTIONS] = (Object.assign || _helpersPolyfillsJs.objectAssign)(this.options(), options);
        this[_helpersSymbolsJs2['default'].MIDDLEMAN] = new _helpersMiddlemanJs2['default'](this);

        // Render the SVG component using the defined options.
        var width = this[_helpersSymbolsJs2['default'].OPTIONS].documentWidth;
        var height = this[_helpersSymbolsJs2['default'].OPTIONS].documentHeight;
        var svg = this[_helpersSymbolsJs2['default'].SVG] = d3.select(element).attr('width', width).attr('height', height);

        var stopPropagation = function stopPropagation() {
            return d3.event.stopPropagation();
        };
        this[_helpersSymbolsJs2['default'].GROUPS] = {
            shapes: svg.append('g').attr('class', 'shapes').on('click', stopPropagation),
            markers: svg.append('g').attr('class', 'markers').on('click', stopPropagation)
        };

        // Deselect all shapes when the canvas is clicked.
        svg.on('click', function () {
            return _this.deselect();
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
            shape = typeof shape === 'string' ? (0, _helpersMapperJs2['default'])(shape) : shape;

            var shapes = this[_helpersSymbolsJs2['default'].SHAPES];
            shapes.push(shape);

            // Put the interface for interacting with Draft into the shape object.
            shape[_helpersSymbolsJs2['default'].MIDDLEMAN] = this[_helpersSymbolsJs2['default'].MIDDLEMAN];
            _helpersInvocatorJs2['default'].did('add', shape);

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

            var shapes = this[_helpersSymbolsJs2['default'].SHAPES];
            var index = shapes.indexOf(shape);

            shapes.splice(index, 1);
            _helpersInvocatorJs2['default'].did('remove', shape);

            return shapes.length;
        }
    }, {
        key: 'clear',

        /**
         * @method clear
         * @return {Number}
         */
        value: function clear() {

            var shapes = this[_helpersSymbolsJs2['default'].SHAPES];
            _helpersInvocatorJs2['default'].did('remove', shapes);
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
            return this[_helpersSymbolsJs2['default'].SHAPES];
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

            _helpersInvocatorJs2['default'].did('select', shapes);
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

            _helpersInvocatorJs2['default'].did('deselect', shapes);
        }
    }, {
        key: 'options',

        /**
         * @method options
         * @return {Object}
         */
        value: function options() {

            return this[_helpersSymbolsJs2['default'].OPTIONS] || {
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

},{"./helpers/Invocator.js":5,"./helpers/Mapper.js":7,"./helpers/Middleman.js":8,"./helpers/Polyfills.js":9,"./helpers/Symbols.js":10}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbolsJs = require('../helpers/Symbols.js');

var _helpersSymbolsJs2 = _interopRequireDefault(_helpersSymbolsJs);

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
      return this[_helpersSymbolsJs2['default'].SHAPE];
    }
  }, {
    key: 'middleman',

    /**
     * @method middleman
     * @return {Middleman}
     */
    value: function middleman() {
      return this.shape()[_helpersSymbolsJs2['default'].MIDDLEMAN];
    }
  }]);

  return Ability;
})();

exports['default'] = Ability;
module.exports = exports['default'];

},{"../helpers/Symbols.js":10}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _AbilityJs = require('./Ability.js');

var _AbilityJs2 = _interopRequireDefault(_AbilityJs);

var _helpersSymbolsJs = require('./../helpers/Symbols.js');

var _helpersSymbolsJs2 = _interopRequireDefault(_helpersSymbolsJs);

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

            var element = this.shape()[_helpersSymbolsJs2['default'].ELEMENT];
            element.on('click', this.handleClick.bind(this));
        }
    }, {
        key: 'handleClick',

        /**
         * @method handleClick
         * @return {void}
         */
        value: function handleClick() {

            var keyMap = this.middleman()[_helpersSymbolsJs2['default'].KEY_MAP];

            if (this.shape().isSelected()) {

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
})(_AbilityJs2['default']);

exports['default'] = Selectable;
module.exports = exports['default'];

},{"./../helpers/Symbols.js":10,"./Ability.js":2}],4:[function(require,module,exports){
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
/**
 * @method tryInvoke
 * @param {Object} context
 * @param {String} functionName
 * @param {Array} options
 * @return {Boolean}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var tryInvoke = function tryInvoke(context, functionName) {

    "use strict";

    for (var _len = arguments.length, options = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        options[_key - 2] = arguments[_key];
    }

    if (typeof context[functionName] === "function") {
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

    "use strict";

    return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * @module Draft
 * @submodule Invocator
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports["default"] = (function () {

    "use strict";

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
                return tryInvoke(shape, "did" + capitalize(type));
            });
        },

        /**
         * @method includeExclude
         * @param {Middleman} middleman
         * @param {Function} fn
         * @param {Object} [options={}]
         * @return {void}
         */
        includeExclude: function includeExclude(middleman, fn) {
            var options = arguments[2] === undefined ? {} : arguments[2];

            var include = options.include || undefined;
            var exclude = options.exclude || undefined;

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
                return void fn.apply(middleman, [include]);
            }

            if (!exclude) {
                return void fn.apply(middleman);
            }

            fn.apply(middleman, [allExcluding(exclude)]);
        }

    };
})();

module.exports = exports["default"];

},{}],6:[function(require,module,exports){
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

        var keyMap = middleman[_SymbolsJs2['default'].KEY_MAP];
        this[_SymbolsJs2['default'].MIDDLEMAN] = middleman;

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
                return _this[_SymbolsJs2['default'].MIDDLEMAN].select();
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

},{"./Symbols.js":10}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersThrowJs = require('../helpers/Throw.js');

var _helpersThrowJs2 = _interopRequireDefault(_helpersThrowJs);

var _shapesRectangleJs = require('../shapes/Rectangle.js');

var _shapesRectangleJs2 = _interopRequireDefault(_shapesRectangleJs);

/**
 * @module Draft
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports['default'] = function (name) {

    'use strict';

    var map = {
        rectangle: _shapesRectangleJs2['default']
    };

    return typeof map[name] !== 'undefined' ? new map[name]() : new _helpersThrowJs2['default']('Cannot map "' + name + '" to a shape object');
};

module.exports = exports['default'];

},{"../helpers/Throw.js":11,"../shapes/Rectangle.js":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SymbolsJs = require('./Symbols.js');

var _SymbolsJs2 = _interopRequireDefault(_SymbolsJs);

var _KeyBindingsJs = require('./KeyBindings.js');

var _KeyBindingsJs2 = _interopRequireDefault(_KeyBindingsJs);

var _InvocatorJs = require('./Invocator.js');

var _InvocatorJs2 = _interopRequireDefault(_InvocatorJs);

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

    this[_SymbolsJs2['default'].DRAFT] = draft;
    this[_SymbolsJs2['default'].KEY_MAP] = {};

    new _KeyBindingsJs2['default'](this);
  }

  _createClass(Middleman, [{
    key: 'd3',

    /**
     * @method d3
     * @return {Object}
     */
    value: function d3() {
      return this[_SymbolsJs2['default'].DRAFT][_SymbolsJs2['default'].SVG];
    }
  }, {
    key: 'groups',

    /**
     * @method groups
     * @return {Object}
     */
    value: function groups() {
      return this[_SymbolsJs2['default'].DRAFT][_SymbolsJs2['default'].GROUPS];
    }
  }, {
    key: 'keyMap',

    /**
     * @method keyMap
     * @return {Object}
     */
    value: function keyMap() {
      return this[_SymbolsJs2['default'].KEY_MAP];
    }
  }, {
    key: 'select',

    /**
     * @method select
     * @param {Object} options
     * @return {void}
     */
    value: function select(options) {
      _InvocatorJs2['default'].includeExclude(this, this[_SymbolsJs2['default'].DRAFT].select, options);
    }
  }, {
    key: 'deselect',

    /**
     * @method deselect
     * @param {Object} options
     * @return {void}
     */
    value: function deselect(options) {
      _InvocatorJs2['default'].includeExclude(this, this[_SymbolsJs2['default'].DRAFT].deselect, options);
    }
  }, {
    key: 'all',

    /**
     * @method all
     * @return {Array}
     */
    value: function all() {
      return this[_SymbolsJs2['default'].DRAFT].all();
    }
  }]);

  return Middleman;
})();

exports['default'] = Middleman;
module.exports = exports['default'];

},{"./Invocator.js":5,"./KeyBindings.js":6,"./Symbols.js":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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
    GROUPS: Symbol('groups'),
    OPTIONS: Symbol('options'),
    ABILITIES: Symbol('abilities'),
    KEY_MAP: Symbol('keyMap')
};
module.exports = exports['default'];

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ShapeJs = require('./Shape.js');

var _ShapeJs2 = _interopRequireDefault(_ShapeJs);

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
})(_ShapeJs2['default']);

exports['default'] = Rectangle;
module.exports = exports['default'];

},{"./Shape.js":13}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbolsJs = require('../helpers/Symbols.js');

var _helpersSymbolsJs2 = _interopRequireDefault(_helpersSymbolsJs);

var _abilitiesSelectableJs = require('../abilities/Selectable.js');

var _abilitiesSelectableJs2 = _interopRequireDefault(_abilitiesSelectableJs);

var _helpersThrowJs = require('../helpers/Throw.js');

var _helpersThrowJs2 = _interopRequireDefault(_helpersThrowJs);

var _helpersPolyfillsJs = require('../helpers/Polyfills.js');

var _helpersAttributesJs = require('../helpers/Attributes.js');

var _helpersAttributesJs2 = _interopRequireDefault(_helpersAttributesJs);

var _helpersInvocatorJs = require('../helpers/Invocator.js');

var _helpersInvocatorJs2 = _interopRequireDefault(_helpersInvocatorJs);

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

        this[_helpersSymbolsJs2['default'].ATTRIBUTES] = attributes;
    }

    _createClass(Shape, [{
        key: 'tagName',

        /**
         * @method tagName
         * @throws {Error} Will throw an exception if the `tagName` method hasn't been defined on the child object.
         * @return {void}
         */
        value: function tagName() {
            new _helpersThrowJs2['default']('Tag name must be defined for a shape using the `tagName` method');
        }
    }, {
        key: 'isSelected',

        /**
         * @method isSelected
         * @return {Boolean}
         */
        value: function isSelected() {
            return this[_helpersSymbolsJs2['default'].IS_SELECTED];
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
                return this[_helpersSymbolsJs2['default'].ELEMENT].datum()[name];
            }

            this[_helpersSymbolsJs2['default'].ELEMENT].datum()[name] = value;
            (0, _helpersAttributesJs2['default'])(this[_helpersSymbolsJs2['default'].ELEMENT], name, value);

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

            var group = this[_helpersSymbolsJs2['default'].MIDDLEMAN].groups().shapes;
            var attributes = (0, _helpersPolyfillsJs.objectAssign)(this.defaultAttributes(), this[_helpersSymbolsJs2['default'].ATTRIBUTES]);
            this[_helpersSymbolsJs2['default'].ELEMENT] = group.append('g').append(this.tagName()).datum({});

            // Assign each attribute from the default attributes defined on the shape, as well as those defined
            // by the user when instantiating the shape.
            Object.keys(attributes).forEach(function (key) {
                return _this.attr(key, attributes[key]);
            });

            var abilities = {
                selectable: new _abilitiesSelectableJs2['default']()
            };

            Object.keys(abilities).forEach(function (key) {

                // Add the shape object into each ability instance, and invoke the `didAdd` method.
                var ability = abilities[key];
                ability[_helpersSymbolsJs2['default'].SHAPE] = _this;
                _helpersInvocatorJs2['default'].did('add', ability);
            });

            this[_helpersSymbolsJs2['default'].ABILITIES] = abilities;
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
            this[_helpersSymbolsJs2['default'].IS_SELECTED] = true;
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this[_helpersSymbolsJs2['default'].IS_SELECTED] = false;
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

},{"../abilities/Selectable.js":3,"../helpers/Attributes.js":4,"../helpers/Invocator.js":5,"../helpers/Polyfills.js":9,"../helpers/Symbols.js":10,"../helpers/Throw.js":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvS2V5QmluZGluZ3MuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NYXBwZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NaWRkbGVtYW4uanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Qb2x5ZmlsbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9TeW1ib2xzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvVGhyb3cuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1JlY3RhbmdsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7a0NDQTJCLHdCQUF3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QUMvQix1QkFBTyxDQUFDLDhCQUFRLEtBQUssQ0FBQyxRQUFPLENBQUM7QUFDOUIsZ0RBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUVqQyxDQUFDLENBQUM7O0FBRUgsZ0JBQUksQ0FBQyw4QkFBUSxTQUFTLENBQUMsR0FBSSxTQUFTLENBQUM7U0FFeEM7Ozs7Ozs7O2VBTVEscUJBQUcsRUFBRzs7Ozs7Ozs7ZUFNTixxQkFBRztBQUNSLGdCQUFJLENBQUMsOEJBQVEsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ3BDOzs7Ozs7OztlQU1VLHVCQUFHO0FBQ1YsZ0JBQUksQ0FBQyw4QkFBUSxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDckM7Ozs7Ozs7O2VBTWdCLDZCQUFHO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBQztTQUNiOzs7V0ExR2dCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNaWRkbGVtYW4gICAgICBmcm9tICcuL2hlbHBlcnMvTWlkZGxlbWFuLmpzJztcbmltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi9oZWxwZXJzL1BvbHlmaWxscy5qcyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi9oZWxwZXJzL0ludm9jYXRvci5qcyc7XG5pbXBvcnQgbWFwcGVyICAgICAgICAgZnJvbSAnLi9oZWxwZXJzL01hcHBlci5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuU0hBUEVTXSA9IFtdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuT1BUSU9OU10gPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBuZXcgTWlkZGxlbWFuKHRoaXMpO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aGUgU1ZHIGNvbXBvbmVudCB1c2luZyB0aGUgZGVmaW5lZCBvcHRpb25zLlxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHN2ZyA9IHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5HUk9VUFNdICA9IHtcbiAgICAgICAgICAgIHNoYXBlczogc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3NoYXBlcycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbiksXG4gICAgICAgICAgICBtYXJrZXJzOiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnbWFya2VycycpLm9uKCdjbGljaycsIHN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBEZXNlbGVjdCBhbGwgc2hhcGVzIHdoZW4gdGhlIGNhbnZhcyBpcyBjbGlja2VkLlxuICAgICAgICBzdmcub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5kZXNlbGVjdCgpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTaGFwZXxTdHJpbmd9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgYWRkKHNoYXBlKSB7XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgc2hhcGUgbmFtZSB0byB0aGUgc2hhcGUgb2JqZWN0LCBpZiB0aGUgdXNlciBoYXMgcGFzc2VkIHRoZSBzaGFwZVxuICAgICAgICAvLyBhcyBhIHN0cmluZy5cbiAgICAgICAgc2hhcGUgPSAodHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJykgPyBtYXBwZXIoc2hhcGUpIDogc2hhcGU7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIHNoYXBlcy5wdXNoKHNoYXBlKTtcblxuICAgICAgICAvLyBQdXQgdGhlIGludGVyZmFjZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBEcmFmdCBpbnRvIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlW1N5bWJvbHMuTUlERExFTUFOXSA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgY29uc3QgaW5kZXggID0gc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuXG4gICAgICAgIHNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZXMpO1xuICAgICAgICBzaGFwZXMubGVuZ3RoID0gMDtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3Qoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdzZWxlY3QnLCBzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdChzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2Rlc2VsZWN0Jywgc2hhcGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oKCR3aW5kb3cpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCR3aW5kb3cpIHtcblxuICAgICAgICAvLyBFeHBvcnQgZHJhZnQgaWYgdGhlIGB3aW5kb3dgIG9iamVjdCBpcyBhdmFpbGFibGUuXG4gICAgICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxuICAgIH1cblxufSkod2luZG93KTtcblxuLy8gRXhwb3J0IGZvciB1c2UgaW4gRVM2IGFwcGxpY2F0aW9ucy5cbmV4cG9ydCBkZWZhdWx0IERyYWZ0OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtBYmlsaXR5fVxuICAgICAqL1xuICAgIHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBtaWRkbGVtYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlKClbU3ltYm9scy5NSURETEVNQU5dO1xuICAgIH1cblxufSIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eS5qcyc7XG5pbXBvcnQgU3ltYm9scyBmcm9tICcuLy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLnNoYXBlKClbU3ltYm9scy5FTEVNRU5UXTtcbiAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3Qga2V5TWFwID0gdGhpcy5taWRkbGVtYW4oKVtTeW1ib2xzLktFWV9NQVBdO1xuXG4gICAgICAgIGlmICh0aGlzLnNoYXBlKCkuaXNTZWxlY3RlZCgpKSB7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IHRoZSBzaGFwZSBpZiBpdCdzIGN1cnJlbnRseSBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiB2b2lkIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBpbmNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5TWFwLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBzaGFwZXMgZXhjZXB0IGZvciB0aGUgY3VycmVudC5cbiAgICAgICAgICAgIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBleGNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWlkZGxlbWFuKCkuc2VsZWN0KHsgaW5jbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEF0dHJpYnV0ZXNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cblxuLypcbiAqIEBtZXRob2Qgc2V0QXR0cmlidXRlXG4gKiBAcGFyYW0ge0FycmF5fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgY29uc3QgeSA9IGVsZW1lbnQuZGF0dW0oKS55IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt2YWx1ZX0sICR7eX0pYCk7XG5cbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICBjb25zdCB4ID0gZWxlbWVudC5kYXR1bSgpLnggfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3ZhbHVlfSlgKTtcblxuICAgIH1cblxuICAgIGVsZW1lbnQuYXR0cihuYW1lLCB2YWx1ZSk7XG5cbn07IiwiLyoqXG4gKiBAbWV0aG9kIHRyeUludm9rZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7U3RyaW5nfSBmdW5jdGlvbk5hbWVcbiAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IHRyeUludm9rZSA9IChjb250ZXh0LCBmdW5jdGlvbk5hbWUsIC4uLm9wdGlvbnMpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0W2Z1bmN0aW9uTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29udGV4dFtmdW5jdGlvbk5hbWVdKC4uLm9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG5cbn07XG5cbi8qKlxuICogQG1ldGhvZCBjYXBpdGFsaXplXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBjYXBpdGFsaXplID0gKG5hbWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgSW52b2NhdG9yXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAoKCkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRpZFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fFNoYXBlfSBzaGFwZXNcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGRpZCh0eXBlLCBzaGFwZXMpIHtcblxuICAgICAgICAgICAgc2hhcGVzID0gQXJyYXkuaXNBcnJheShzaGFwZXMpID8gc2hhcGVzIDogW3NoYXBlc107XG5cbiAgICAgICAgICAgIHJldHVybiBzaGFwZXMuZXZlcnkoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyeUludm9rZShzaGFwZSwgYGRpZCR7Y2FwaXRhbGl6ZSh0eXBlKX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW5jbHVkZUV4Y2x1ZGVcbiAgICAgICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBpbmNsdWRlRXhjbHVkZShtaWRkbGVtYW4sIGZuLCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICAgICAgY29uc3QgaW5jbHVkZSA9IG9wdGlvbnMuaW5jbHVkZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBleGNsdWRlID0gb3B0aW9ucy5leGNsdWRlIHx8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGFsbEV4Y2x1ZGluZ1xuICAgICAgICAgICAgICogQHBhcmFtIHtBcnJheX0gZXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY29uc3QgYWxsRXhjbHVkaW5nID0gKGV4Y2x1ZGluZykgPT4ge1xuXG4gICAgICAgICAgICAgICAgZXhjbHVkaW5nID0gQXJyYXkuaXNBcnJheShleGNsdWRpbmcpID8gZXhjbHVkaW5nIDogW2V4Y2x1ZGluZ107XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWlkZGxlbWFuLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF+ZXhjbHVkaW5nLmluZGV4T2Yoc2hhcGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoaW5jbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KG1pZGRsZW1hbiwgW2luY2x1ZGVdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFleGNsdWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgZm4uYXBwbHkobWlkZGxlbWFuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm4uYXBwbHkobWlkZGxlbWFuLCBbYWxsRXhjbHVkaW5nKGV4Y2x1ZGUpXSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgS2V5QmluZGluZ3NcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUJpbmRpbmdzIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtLZXlCaW5kaW5nc31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgICAgICAgICAgICA9IG1pZGRsZW1hbltTeW1ib2xzLktFWV9NQVBdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcblxuICAgICAgICAvLyBEZWZhdWx0IGtlcCBtYXBwaW5nc1xuICAgICAgICBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZTtcbiAgICAgICAga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2U7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBrZXkgbWFwLlxuICAgICAgICB0aGlzLmF0dGFjaEJpbmRpbmdzKGtleU1hcCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dGFjaEJpbmRpbmdzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleU1hcFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoQmluZGluZ3Moa2V5TWFwKSB7XG5cbiAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0KCkpO1xuXG4gICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAvLyBNYWludGFpbiBhc3BlY3QgcmF0aW9zIHdoZW4gcmVzaXppbmcuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgIH1cblxufSIsImltcG9ydCBUaHJvdyAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdy5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL3NoYXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWFwcGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgIHJlY3RhbmdsZTogUmVjdGFuZ2xlXG4gICAgfTtcblxuICAgIHJldHVybiB0eXBlb2YgbWFwW25hbWVdICE9PSAndW5kZWZpbmVkJyA/IG5ldyBtYXBbbmFtZV0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBUaHJvdyhgQ2Fubm90IG1hcCBcIiR7bmFtZX1cIiB0byBhIHNoYXBlIG9iamVjdGApO1xuXG59OyIsImltcG9ydCBTeW1ib2xzICAgICBmcm9tICcuL1N5bWJvbHMuanMnO1xuaW1wb3J0IEtleUJpbmRpbmdzIGZyb20gJy4vS2V5QmluZGluZ3MuanMnO1xuaW1wb3J0IGludm9jYXRvciAgIGZyb20gJy4vSW52b2NhdG9yLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1pZGRsZW1hblxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlkZGxlbWFuIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICogQHJldHVybiB7TWlkZGxlbWFufVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRyYWZ0KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkRSQUZUXSAgID0gZHJhZnQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5LRVlfTUFQXSA9IHt9O1xuXG4gICAgICAgIG5ldyBLZXlCaW5kaW5ncyh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZDNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZDMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuU1ZHXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdyb3Vwc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBncm91cHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdW1N5bWJvbHMuR1JPVVBTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGtleU1hcFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBrZXlNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuS0VZX01BUF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXMsIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgaW52b2NhdG9yLmluY2x1ZGVFeGNsdWRlKHRoaXMsIHRoaXNbU3ltYm9scy5EUkFGVF0uZGVzZWxlY3QsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5hbGwoKTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUG9seWZpbGxzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0QXNzaWduKHRhcmdldCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdCcpO1xuICAgIH1cblxuICAgIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGlmIChuZXh0U291cmNlID09PSB1bmRlZmluZWQgfHwgbmV4dFNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFNvdXJjZSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgICAgICB2YXIga2V5c0FycmF5ID0gT2JqZWN0LmtleXMoT2JqZWN0KG5leHRTb3VyY2UpKTtcblxuICAgICAgICBmb3IgKHZhciBuZXh0SW5kZXggPSAwLCBsZW4gPSBrZXlzQXJyYXkubGVuZ3RoOyBuZXh0SW5kZXggPCBsZW47IG5leHRJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IGtleXNBcnJheVtuZXh0SW5kZXhdO1xuICAgICAgICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5leHRTb3VyY2UsIG5leHRLZXkpO1xuICAgICAgICAgICAgaWYgKGRlc2MgIT09IHVuZGVmaW5lZCAmJiBkZXNjLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG87XG5cbn1cbiIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTeW1ib2xzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgRFJBRlQ6ICAgICAgIFN5bWJvbCgnZHJhZnQnKSxcbiAgICBTVkc6ICAgICAgICAgU3ltYm9sKCdzdmcnKSxcbiAgICBFTEVNRU5UOiAgICAgU3ltYm9sKCdlbGVtZW50JyksXG4gICAgSVNfU0VMRUNURUQ6IFN5bWJvbCgnaXNTZWxlY3RlZCcpLFxuICAgIEFUVFJJQlVURVM6ICBTeW1ib2woJ2F0dHJpYnV0ZXMnKSxcbiAgICBNSURETEVNQU46ICAgU3ltYm9sKCdtaWRkbGVtYW4nKSxcbiAgICBTSEFQRTogICAgICAgU3ltYm9sKCdzaGFwZScpLFxuICAgIFNIQVBFUzogICAgICBTeW1ib2woJ3NoYXBlcycpLFxuICAgIEdST1VQUzogICAgICBTeW1ib2woJ2dyb3VwcycpLFxuICAgIE9QVElPTlM6ICAgICBTeW1ib2woJ29wdGlvbnMnKSxcbiAgICBBQklMSVRJRVM6ICAgU3ltYm9sKCdhYmlsaXRpZXMnKSxcbiAgICBLRVlfTUFQOiAgICAgU3ltYm9sKCdrZXlNYXAnKVxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBUaHJvd1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhyb3cge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJuIHtUaHJvd31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRHJhZnQuanM6ICR7bWVzc2FnZX0uYCk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiAnYmx1ZScsXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5pbXBvcnQgU2VsZWN0YWJsZSAgICAgZnJvbSAnLi4vYWJpbGl0aWVzL1NlbGVjdGFibGUuanMnO1xuaW1wb3J0IFRocm93ICAgICAgICAgIGZyb20gJy4uL2hlbHBlcnMvVGhyb3cuanMnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4uL2hlbHBlcnMvUG9seWZpbGxzLmpzJztcbmltcG9ydCBzZXRBdHRyaWJ1dGUgICBmcm9tICcuLi9oZWxwZXJzL0F0dHJpYnV0ZXMuanMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4uL2hlbHBlcnMvSW52b2NhdG9yLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSA9IGF0dHJpYnV0ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHRocm93cyB7RXJyb3J9IFdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSBgdGFnTmFtZWAgbWV0aG9kIGhhc24ndCBiZWVuIGRlZmluZWQgb24gdGhlIGNoaWxkIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIG5ldyBUaHJvdygnVGFnIG5hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhIHNoYXBlIHVzaW5nIHRoZSBgdGFnTmFtZWAgbWV0aG9kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZXwqfVxuICAgICAqL1xuICAgIGF0dHIobmFtZSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgc2V0QXR0cmlidXRlKHRoaXNbU3ltYm9scy5FTEVNRU5UXSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBncm91cCAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5ncm91cHMoKS5zaGFwZXM7XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgICAgICA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRBdHRyaWJ1dGVzKCksIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXSA9IGdyb3VwLmFwcGVuZCgnZycpLmFwcGVuZCh0aGlzLnRhZ05hbWUoKSkuZGF0dW0oe30pO1xuXG4gICAgICAgIC8vIEFzc2lnbiBlYWNoIGF0dHJpYnV0ZSBmcm9tIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGUgc2hhcGUsIGFzIHdlbGwgYXMgdGhvc2UgZGVmaW5lZFxuICAgICAgICAvLyBieSB0aGUgdXNlciB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIHNoYXBlLlxuICAgICAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHRoaXMuYXR0cihrZXksIGF0dHJpYnV0ZXNba2V5XSkpO1xuXG4gICAgICAgIGNvbnN0IGFiaWxpdGllcyAgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMoYWJpbGl0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzaGFwZSBvYmplY3QgaW50byBlYWNoIGFiaWxpdHkgaW5zdGFuY2UsIGFuZCBpbnZva2UgdGhlIGBkaWRBZGRgIG1ldGhvZC5cbiAgICAgICAgICAgIGNvbnN0IGFiaWxpdHkgPSBhYmlsaXRpZXNba2V5XTtcbiAgICAgICAgICAgIGFiaWxpdHlbU3ltYm9scy5TSEFQRV0gPSB0aGlzO1xuICAgICAgICAgICAgaW52b2NhdG9yLmRpZCgnYWRkJywgYWJpbGl0eSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10gID0gYWJpbGl0aWVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRSZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFJlbW92ZSgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRTZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG59Il19
