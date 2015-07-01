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
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Draft);

        this[_helpersSymbolsJs2['default'].SHAPES] = [];
        this[_helpersSymbolsJs2['default'].OPTIONS] = (Object.assign || _helpersPolyfillsJs.objectAssign)(this.options(), options);
        this[_helpersSymbolsJs2['default'].MIDDLEMAN] = new _helpersMiddlemanJs2['default'](this);

        // Render the SVG component using the defined options.
        var width = this[_helpersSymbolsJs2['default'].OPTIONS].documentWidth;
        var height = this[_helpersSymbolsJs2['default'].OPTIONS].documentHeight;
        var svg = this[_helpersSymbolsJs2['default'].SVG] = d3.select(element).attr('width', width).attr('height', height);
        this[_helpersSymbolsJs2['default'].GROUPS] = {
            shapes: svg.append('g').attr('class', 'shapes'),
            markers: svg.append('g').attr('class', 'markers')
        };
    }

    _createClass(Draft, [{
        key: 'add',

        /**
         * @method add
         * @param {Shape|String} shape
         * @return {Shape}
         */
        value: function add(shape) {

            if (typeof shape === 'string') {

                // Resolve the shape name to the shape object, if the user has passed the shape
                // as a string.
                shape = (0, _helpersMapperJs2['default'])(shape);
            }

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
        key: 'selectShapes',

        /**
         * @method selectShapes
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function selectShapes() {
            var shapes = arguments[0] === undefined ? this.all() : arguments[0];

            _helpersInvocatorJs2['default'].did('select', shapes);
        }
    }, {
        key: 'deselectShapes',

        /**
         * @method deselectShapes
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function deselectShapes() {
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
    key: 'getShape',

    /**
     * @method getShape
     * @return {Ability}
     */
    value: function getShape() {
      return this[_helpersSymbolsJs2['default'].SHAPE];
    }
  }, {
    key: 'getMiddleman',

    /**
     * @method getMiddleman
     * @return {Middleman}
     */
    value: function getMiddleman() {
      return this.getShape()[_helpersSymbolsJs2['default'].MIDDLEMAN];
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

      console.log(this[_helpersSymbolsJs2['default'].SHAPE]);
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
     * @param {Array} [shapes]
     */
    value: function select(shapes) {
      this[_SymbolsJs2['default'].DRAFT].selectShapes(shapes);
    }
  }, {
    key: 'deselect',

    /**
     * @method deselect
     * @param {Array} [shapes]
     */
    value: function deselect(shapes) {
      this[_SymbolsJs2['default'].DRAFT].deselectShapes(shapes);
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

},{"./KeyBindings.js":6,"./Symbols.js":10}],9:[function(require,module,exports){
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
        var _this = this;

        var attributes = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Shape);

        var abilities = {
            selectable: new _abilitiesSelectableJs2['default']()
        };

        Object.keys(abilities).forEach(function (key) {

            // Add the shape object into each ability instance, and invoke the `didAdd` method.
            var ability = abilities[key];
            ability[_helpersSymbolsJs2['default'].SHAPE] = _this;
            _helpersInvocatorJs2['default'].did('add', ability);
        });

        this[_helpersSymbolsJs2['default'].ATTRIBUTES] = attributes;
        this[_helpersSymbolsJs2['default'].ABILITIES] = abilities;
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
            var _this2 = this;

            var group = this[_helpersSymbolsJs2['default'].MIDDLEMAN].groups().shapes;
            var attributes = (0, _helpersPolyfillsJs.objectAssign)(this.defaultAttributes(), this[_helpersSymbolsJs2['default'].ATTRIBUTES]);

            this[_helpersSymbolsJs2['default'].ELEMENT] = group.append('g').append(this.tagName()).datum({});

            // Assign each attribute from the default attributes defined on the shape, as well as those defined
            // by the user when instantiating the shape.
            Object.keys(attributes).forEach(function (key) {
                return _this2.attr(key, attributes[key]);
            });
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvS2V5QmluZGluZ3MuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NYXBwZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NaWRkbGVtYW4uanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Qb2x5ZmlsbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9TeW1ib2xzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvVGhyb3cuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1JlY3RhbmdsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7a0NDQTJCLHdCQUF3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aEZuQixZQUFZLEVBZ0ZvQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLENBQUMsOEJBQVEsVUFBVSxDQUFDLENBQUMsQ0FBQzs7QUFFcEYsZ0JBQUksQ0FBQyw4QkFBUSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7Ozs7QUFJM0Usa0JBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRzt1QkFBSyxPQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBRTdFOzs7Ozs7OztlQU1RLHFCQUFHLEVBQUc7Ozs7Ozs7O2VBTU4scUJBQUc7QUFDUixnQkFBSSxDQUFDLDhCQUFRLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNwQzs7Ozs7Ozs7ZUFNVSx1QkFBRztBQUNWLGdCQUFJLENBQUMsOEJBQVEsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3JDOzs7Ozs7OztlQU1nQiw2QkFBRztBQUNoQixtQkFBTyxFQUFFLENBQUM7U0FDYjs7O1dBNUdnQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgTWlkZGxlbWFuICAgICAgZnJvbSAnLi9oZWxwZXJzL01pZGRsZW1hbi5qcyc7XG5pbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1N5bWJvbHMuanMnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vaGVscGVycy9Qb2x5ZmlsbHMuanMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4vaGVscGVycy9JbnZvY2F0b3IuanMnO1xuaW1wb3J0IG1hcHBlciAgICAgICAgIGZyb20gJy4vaGVscGVycy9NYXBwZXIuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLlNIQVBFU10gICAgPSBbXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk9QVElPTlNdICAgPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBuZXcgTWlkZGxlbWFuKHRoaXMpO1xuXG4gICAgICAgIC8vIFJlbmRlciB0aGUgU1ZHIGNvbXBvbmVudCB1c2luZyB0aGUgZGVmaW5lZCBvcHRpb25zLlxuICAgICAgICBjb25zdCB3aWR0aCAgICAgICAgICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgICAgICAgICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudEhlaWdodDtcbiAgICAgICAgY29uc3Qgc3ZnICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuU1ZHXSA9IGQzLnNlbGVjdChlbGVtZW50KS5hdHRyKCd3aWR0aCcsIHdpZHRoKS5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuR1JPVVBTXSA9IHtcbiAgICAgICAgICAgIHNoYXBlczogIHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzaGFwZXMnKSxcbiAgICAgICAgICAgIG1hcmtlcnM6IHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdtYXJrZXJzJylcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfFN0cmluZ30gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBhZGQoc2hhcGUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBzaGFwZSBuYW1lIHRvIHRoZSBzaGFwZSBvYmplY3QsIGlmIHRoZSB1c2VyIGhhcyBwYXNzZWQgdGhlIHNoYXBlXG4gICAgICAgICAgICAvLyBhcyBhIHN0cmluZy5cbiAgICAgICAgICAgIHNoYXBlID0gbWFwcGVyKHNoYXBlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIHNoYXBlcy5wdXNoKHNoYXBlKTtcblxuICAgICAgICAvLyBQdXQgdGhlIGludGVyZmFjZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBEcmFmdCBpbnRvIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlW1N5bWJvbHMuTUlERExFTUFOXSA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgY29uc3QgaW5kZXggID0gc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuXG4gICAgICAgIHNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZXMpO1xuICAgICAgICBzaGFwZXMubGVuZ3RoID0gMDtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RTaGFwZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3RTaGFwZXMoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdzZWxlY3QnLCBzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RTaGFwZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdFNoYXBlcyhzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2Rlc2VsZWN0Jywgc2hhcGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oKCR3aW5kb3cpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCR3aW5kb3cpIHtcblxuICAgICAgICAvLyBFeHBvcnQgZHJhZnQgaWYgdGhlIGB3aW5kb3dgIG9iamVjdCBpcyBhdmFpbGFibGUuXG4gICAgICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxuICAgIH1cblxufSkod2luZG93KTtcblxuLy8gRXhwb3J0IGZvciB1c2UgaW4gRVM2IGFwcGxpY2F0aW9ucy5cbmV4cG9ydCBkZWZhdWx0IERyYWZ0OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0U2hhcGVcbiAgICAgKiBAcmV0dXJuIHtBYmlsaXR5fVxuICAgICAqL1xuICAgIGdldFNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBnZXRNaWRkbGVtYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFNoYXBlKClbU3ltYm9scy5NSURETEVNQU5dO1xuICAgIH1cblxufSIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eS5qcyc7XG5pbXBvcnQgU3ltYm9scyBmcm9tICcuLy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXNbU3ltYm9scy5TSEFQRV0pXG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQXR0cmlidXRlc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuXG4vKlxuICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVcbiAqIEBwYXJhbSB7QXJyYXl9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgbmFtZSwgdmFsdWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgc3dpdGNoIChuYW1lKSB7XG5cbiAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICBjb25zdCB5ID0gZWxlbWVudC5kYXR1bSgpLnkgfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3ZhbHVlfSwgJHt5fSlgKTtcblxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIGNvbnN0IHggPSBlbGVtZW50LmRhdHVtKCkueCB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7dmFsdWV9KWApO1xuXG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyKG5hbWUsIHZhbHVlKTtcblxufTsiLCIvKipcbiAqIEBtZXRob2QgdHJ5SW52b2tlXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHtTdHJpbmd9IGZ1bmN0aW9uTmFtZVxuICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgdHJ5SW52b2tlID0gKGNvbnRleHQsIGZ1bmN0aW9uTmFtZSwgLi4ub3B0aW9ucykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHRbZnVuY3Rpb25OYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb250ZXh0W2Z1bmN0aW9uTmFtZV0oLi4ub3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcblxufTtcblxuLyoqXG4gKiBAbWV0aG9kIGNhcGl0YWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGNhcGl0YWxpemUgPSAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG5cbn07XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBJbnZvY2F0b3JcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgoKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGlkXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl8U2hhcGV9IHNoYXBlc1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgZGlkKHR5cGUsIHNoYXBlcykge1xuXG4gICAgICAgICAgICBzaGFwZXMgPSBBcnJheS5pc0FycmF5KHNoYXBlcykgPyBzaGFwZXMgOiBbc2hhcGVzXTtcblxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlcy5ldmVyeSgoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ5SW52b2tlKHNoYXBlLCBgZGlkJHtjYXBpdGFsaXplKHR5cGUpfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuL1N5bWJvbHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgS2V5QmluZGluZ3NcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUJpbmRpbmdzIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtLZXlCaW5kaW5nc31cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcblxuICAgICAgICBjb25zdCBrZXlNYXAgICAgICAgICAgICA9IG1pZGRsZW1hbltTeW1ib2xzLktFWV9NQVBdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcblxuICAgICAgICAvLyBEZWZhdWx0IGtlcCBtYXBwaW5nc1xuICAgICAgICBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZTtcbiAgICAgICAga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2U7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBjaGFuZ2VzIHRvIHRoZSBrZXkgbWFwLlxuICAgICAgICB0aGlzLmF0dGFjaEJpbmRpbmdzKGtleU1hcCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dGFjaEJpbmRpbmdzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleU1hcFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoQmluZGluZ3Moa2V5TWFwKSB7XG5cbiAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uc2VsZWN0KCkpO1xuXG4gICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAvLyBNYWludGFpbiBhc3BlY3QgcmF0aW9zIHdoZW4gcmVzaXppbmcuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgIH1cblxufSIsImltcG9ydCBUaHJvdyAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdy5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL3NoYXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWFwcGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgIHJlY3RhbmdsZTogUmVjdGFuZ2xlXG4gICAgfTtcblxuICAgIHJldHVybiB0eXBlb2YgbWFwW25hbWVdICE9PSAndW5kZWZpbmVkJyA/IG5ldyBtYXBbbmFtZV0oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBUaHJvdyhgQ2Fubm90IG1hcCBcIiR7bmFtZX1cIiB0byBhIHNoYXBlIG9iamVjdGApO1xuXG59OyIsImltcG9ydCBTeW1ib2xzICAgICBmcm9tICcuL1N5bWJvbHMuanMnO1xuaW1wb3J0IEtleUJpbmRpbmdzIGZyb20gJy4vS2V5QmluZGluZ3MuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWlkZGxlbWFuXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWRkbGVtYW4ge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtEcmFmdH0gZHJhZnRcbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZHJhZnQpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuRFJBRlRdICAgPSBkcmFmdDtcbiAgICAgICAgdGhpc1tTeW1ib2xzLktFWV9NQVBdID0ge307XG5cbiAgICAgICAgbmV3IEtleUJpbmRpbmdzKHRoaXMpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkM1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkMygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5TVkddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ3JvdXBzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdyb3VwcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5HUk9VUFNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qga2V5TWFwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGtleU1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5LRVlfTUFQXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXNdXG4gICAgICovXG4gICAgc2VsZWN0KHNoYXBlcykge1xuICAgICAgICB0aGlzW1N5bWJvbHMuRFJBRlRdLnNlbGVjdFNoYXBlcyhzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzXVxuICAgICAqL1xuICAgIGRlc2VsZWN0KHNoYXBlcykge1xuICAgICAgICB0aGlzW1N5bWJvbHMuRFJBRlRdLmRlc2VsZWN0U2hhcGVzKHNoYXBlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLmFsbCgpO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgICAgU3ltYm9sKCdkcmFmdCcpLFxuICAgIFNWRzogICAgICAgICBTeW1ib2woJ3N2ZycpLFxuICAgIEVMRU1FTlQ6ICAgICBTeW1ib2woJ2VsZW1lbnQnKSxcbiAgICBJU19TRUxFQ1RFRDogU3ltYm9sKCdpc1NlbGVjdGVkJyksXG4gICAgQVRUUklCVVRFUzogIFN5bWJvbCgnYXR0cmlidXRlcycpLFxuICAgIE1JRERMRU1BTjogICBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFOiAgICAgICBTeW1ib2woJ3NoYXBlJyksXG4gICAgU0hBUEVTOiAgICAgIFN5bWJvbCgnc2hhcGVzJyksXG4gICAgR1JPVVBTOiAgICAgIFN5bWJvbCgnZ3JvdXBzJyksXG4gICAgT1BUSU9OUzogICAgIFN5bWJvbCgnb3B0aW9ucycpLFxuICAgIEFCSUxJVElFUzogICBTeW1ib2woJ2FiaWxpdGllcycpLFxuICAgIEtFWV9NQVA6ICAgICBTeW1ib2woJ2tleU1hcCcpXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFRocm93XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaHJvdyB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAqIEByZXR1cm4ge1Rocm93fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS5gKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGw6ICdibHVlJyxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzLmpzJztcbmltcG9ydCBTZWxlY3RhYmxlICAgICBmcm9tICcuLi9hYmlsaXRpZXMvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgVGhyb3cgICAgICAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdy5qcyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi4vaGVscGVycy9Qb2x5ZmlsbHMuanMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZSAgIGZyb20gJy4uL2hlbHBlcnMvQXR0cmlidXRlcy5qcyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi4vaGVscGVycy9JbnZvY2F0b3IuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXR0cmlidXRlcz17fV1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICBjb25zdCBhYmlsaXRpZXMgID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUoKVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGFiaWxpdGllcykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgc2hhcGUgb2JqZWN0IGludG8gZWFjaCBhYmlsaXR5IGluc3RhbmNlLCBhbmQgaW52b2tlIHRoZSBgZGlkQWRkYCBtZXRob2QuXG4gICAgICAgICAgICBjb25zdCBhYmlsaXR5ID0gYWJpbGl0aWVzW2tleV07XG4gICAgICAgICAgICBhYmlsaXR5W1N5bWJvbHMuU0hBUEVdID0gdGhpcztcbiAgICAgICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIGFiaWxpdHkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSA9IGF0dHJpYnV0ZXM7XG4gICAgICAgIHRoaXNbU3ltYm9scy5BQklMSVRJRVNdICA9IGFiaWxpdGllcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiB0aGUgYHRhZ05hbWVgIG1ldGhvZCBoYXNuJ3QgYmVlbiBkZWZpbmVkIG9uIHRoZSBjaGlsZCBvYmplY3QuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICBuZXcgVGhyb3coJ1RhZyBuYW1lIG11c3QgYmUgZGVmaW5lZCBmb3IgYSBzaGFwZSB1c2luZyB0aGUgYHRhZ05hbWVgIG1ldGhvZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaXNTZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7U2hhcGV8Kn1cbiAgICAgKi9cbiAgICBhdHRyKG5hbWUsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHNldEF0dHJpYnV0ZSh0aGlzW1N5bWJvbHMuRUxFTUVOVF0sIG5hbWUsIHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkQWRkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRBZGQoKSB7XG5cbiAgICAgICAgY29uc3QgZ3JvdXAgICAgICA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLmdyb3VwcygpLnNoYXBlcztcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRBdHRyaWJ1dGVzKCksIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdID0gZ3JvdXAuYXBwZW5kKCdnJykuYXBwZW5kKHRoaXMudGFnTmFtZSgpKS5kYXR1bSh7fSk7XG5cbiAgICAgICAgLy8gQXNzaWduIGVhY2ggYXR0cmlidXRlIGZyb20gdGhlIGRlZmF1bHQgYXR0cmlidXRlcyBkZWZpbmVkIG9uIHRoZSBzaGFwZSwgYXMgd2VsbCBhcyB0aG9zZSBkZWZpbmVkXG4gICAgICAgIC8vIGJ5IHRoZSB1c2VyIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgc2hhcGUuXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4gdGhpcy5hdHRyKGtleSwgYXR0cmlidXRlc1trZXldKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkUmVtb3ZlKCkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
