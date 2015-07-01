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
        this[_helpersSymbolsJs2['default'].SVG] = d3.select(element).attr('width', width).attr('height', height);
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _AbilityJs = require('./Ability.js');

var _AbilityJs2 = _interopRequireDefault(_AbilityJs);

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

  return Selectable;
})(_AbilityJs2['default']);

exports['default'] = Selectable;
module.exports = exports['default'];

},{"./Ability.js":2}],4:[function(require,module,exports){
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

            // Add the shape object into each ability instance.
            abilities[key][_helpersSymbolsJs2['default'].SHAPE] = _this;
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

            var svg = this[_helpersSymbolsJs2['default'].MIDDLEMAN].d3();
            var attributes = (0, _helpersPolyfillsJs.objectAssign)(this.defaultAttributes(), this[_helpersSymbolsJs2['default'].ATTRIBUTES]);

            this[_helpersSymbolsJs2['default'].ELEMENT] = svg.append(this.tagName()).datum({});

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

},{"../abilities/Selectable.js":3,"../helpers/Attributes.js":4,"../helpers/Polyfills.js":9,"../helpers/Symbols.js":10,"../helpers/Throw.js":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvS2V5QmluZGluZ3MuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NYXBwZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NaWRkbGVtYW4uanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Qb2x5ZmlsbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9TeW1ib2xzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvVGhyb3cuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1JlY3RhbmdsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7a0NDQTJCLHdCQUF3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QUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4uanMnO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzLmpzJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuL2hlbHBlcnMvUG9seWZpbGxzLmpzJztcbmltcG9ydCBpbnZvY2F0b3IgICAgICBmcm9tICcuL2hlbHBlcnMvSW52b2NhdG9yLmpzJztcbmltcG9ydCBtYXBwZXIgICAgICAgICBmcm9tICcuL2hlbHBlcnMvTWFwcGVyLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5jbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge0RyYWZ0fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5TSEFQRVNdICAgID0gW107XG4gICAgICAgIHRoaXNbU3ltYm9scy5PUFRJT05TXSAgID0gKE9iamVjdC5hc3NpZ24gfHwgb2JqZWN0QXNzaWduKSh0aGlzLm9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbmV3IE1pZGRsZW1hbih0aGlzKTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIFNWRyBjb21wb25lbnQgdXNpbmcgdGhlIGRlZmluZWQgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2lkdGggICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRXaWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2hhcGUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgICAgIC8vIGFzIGEgc3RyaW5nLlxuICAgICAgICAgICAgc2hhcGUgPSBtYXBwZXIoc2hhcGUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgc2hhcGVzLnB1c2goc2hhcGUpO1xuXG4gICAgICAgIC8vIFB1dCB0aGUgaW50ZXJmYWNlIGZvciBpbnRlcmFjdGluZyB3aXRoIERyYWZ0IGludG8gdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgc2hhcGVbU3ltYm9scy5NSURETEVNQU5dID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHJlbW92ZShzaGFwZSkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBjb25zdCBpbmRleCAgPSBzaGFwZXMuaW5kZXhPZihzaGFwZSk7XG5cbiAgICAgICAgc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlcyk7XG4gICAgICAgIHNoYXBlcy5sZW5ndGggPSAwO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFNoYXBlc1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdFNoYXBlcyhzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3NlbGVjdCcsIHNoYXBlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFNoYXBlc1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0U2hhcGVzKHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnZGVzZWxlY3QnLCBzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBvcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuT1BUSU9OU10gfHwge1xuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGdyaWRTaXplOiAxMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59XG5cbigoJHdpbmRvdykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoJHdpbmRvdykge1xuXG4gICAgICAgIC8vIEV4cG9ydCBkcmFmdCBpZiB0aGUgYHdpbmRvd2Agb2JqZWN0IGlzIGF2YWlsYWJsZS5cbiAgICAgICAgJHdpbmRvdy5EcmFmdCA9IERyYWZ0O1xuXG4gICAgfVxuXG59KSh3aW5kb3cpO1xuXG4vLyBFeHBvcnQgZm9yIHVzZSBpbiBFUzYgYXBwbGljYXRpb25zLlxuZXhwb3J0IGRlZmF1bHQgRHJhZnQ7IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVxuICAgICAqIEByZXR1cm4ge0FiaWxpdHl9XG4gICAgICovXG4gICAgZ2V0U2hhcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuU0hBUEVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0TWlkZGxlbWFuXG4gICAgICogQHJldHVybiB7TWlkZGxlbWFufVxuICAgICAqL1xuICAgIGdldE1pZGRsZW1hbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hhcGUoKVtTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgfVxuXG59IiwiaW1wb3J0IEFiaWxpdHkgZnJvbSAnLi9BYmlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBBdHRyaWJ1dGVzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5cbi8qXG4gKiBAbWV0aG9kIHNldEF0dHJpYnV0ZVxuICogQHBhcmFtIHtBcnJheX0gZWxlbWVudFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCBuYW1lLCB2YWx1ZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBzd2l0Y2ggKG5hbWUpIHtcblxuICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlbGVtZW50LmRhdHVtKCkueSB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7dmFsdWV9LCAke3l9KWApO1xuXG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgY29uc3QgeCA9IGVsZW1lbnQuZGF0dW0oKS54IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt2YWx1ZX0pYCk7XG5cbiAgICB9XG5cbiAgICBlbGVtZW50LmF0dHIobmFtZSwgdmFsdWUpO1xuXG59OyIsIi8qKlxuICogQG1ldGhvZCB0cnlJbnZva2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge1N0cmluZ30gZnVuY3Rpb25OYW1lXG4gKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCB0cnlJbnZva2UgPSAoY29udGV4dCwgZnVuY3Rpb25OYW1lLCAuLi5vcHRpb25zKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dFtmdW5jdGlvbk5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRleHRbZnVuY3Rpb25OYW1lXSguLi5vcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuXG59O1xuXG4vKipcbiAqIEBtZXRob2QgY2FwaXRhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgY2FwaXRhbGl6ZSA9IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcblxufTtcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEludm9jYXRvclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCgpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaWRcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTaGFwZX0gc2hhcGVzXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBkaWQodHlwZSwgc2hhcGVzKSB7XG5cbiAgICAgICAgICAgIHNoYXBlcyA9IEFycmF5LmlzQXJyYXkoc2hhcGVzKSA/IHNoYXBlcyA6IFtzaGFwZXNdO1xuXG4gICAgICAgICAgICByZXR1cm4gc2hhcGVzLmV2ZXJ5KChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnlJbnZva2Uoc2hhcGUsIGBkaWQke2NhcGl0YWxpemUodHlwZSl9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBLZXlCaW5kaW5nc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5QmluZGluZ3Mge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtNaWRkbGVtYW59IG1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge0tleUJpbmRpbmdzfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1pZGRsZW1hbikge1xuXG4gICAgICAgIGNvbnN0IGtleU1hcCAgICAgICAgICAgID0gbWlkZGxlbWFuW1N5bWJvbHMuS0VZX01BUF07XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbWlkZGxlbWFuO1xuXG4gICAgICAgIC8vIERlZmF1bHQga2VwIG1hcHBpbmdzXG4gICAgICAgIGtleU1hcC5tdWx0aVNlbGVjdCA9IGZhbHNlO1xuICAgICAgICBrZXlNYXAuYXNwZWN0UmF0aW8gPSBmYWxzZTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGtleSBtYXAuXG4gICAgICAgIHRoaXMuYXR0YWNoQmluZGluZ3Moa2V5TWFwKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoQmluZGluZ3NcbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5TWFwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhdHRhY2hCaW5kaW5ncyhrZXlNYXApIHtcblxuICAgICAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBhdmFpbGFibGUgc2hhcGVzLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3QoKSk7XG5cbiAgICAgICAgLy8gTXVsdGktc2VsZWN0aW5nIHNoYXBlcy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4ga2V5TWFwLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIC8vIE1haW50YWluIGFzcGVjdCByYXRpb3Mgd2hlbiByZXNpemluZy5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4ga2V5TWFwLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IFRocm93ICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93LmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vc2hhcGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNYXBwZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgcmVjdGFuZ2xlOiBSZWN0YW5nbGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHR5cGVvZiBtYXBbbmFtZV0gIT09ICd1bmRlZmluZWQnID8gbmV3IG1hcFtuYW1lXSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IFRocm93KGBDYW5ub3QgbWFwIFwiJHtuYW1lfVwiIHRvIGEgc2hhcGUgb2JqZWN0YCk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgICAgIGZyb20gJy4vU3ltYm9scy5qcyc7XG5pbXBvcnQgS2V5QmluZGluZ3MgZnJvbSAnLi9LZXlCaW5kaW5ncy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNaWRkbGVtYW5cbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZGRsZW1hbiB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkcmFmdCkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0gICA9IGRyYWZ0O1xuICAgICAgICB0aGlzW1N5bWJvbHMuS0VZX01BUF0gPSB7fTtcblxuICAgICAgICBuZXcgS2V5QmluZGluZ3ModGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEQzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEQzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLlNWR107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBrZXlNYXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5TWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLktFWV9NQVBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlc11cbiAgICAgKi9cbiAgICBzZWxlY3Qoc2hhcGVzKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0uc2VsZWN0U2hhcGVzKHNoYXBlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXNdXG4gICAgICovXG4gICAgZGVzZWxlY3Qoc2hhcGVzKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0uZGVzZWxlY3RTaGFwZXMoc2hhcGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0uYWxsKCk7XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFBvbHlmaWxsc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdEFzc2lnbih0YXJnZXQpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBmaXJzdCBhcmd1bWVudCB0byBvYmplY3QnKTtcbiAgICB9XG5cbiAgICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBuZXh0U291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBpZiAobmV4dFNvdXJjZSA9PT0gdW5kZWZpbmVkIHx8IG5leHRTb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG5leHRTb3VyY2UgPSBPYmplY3QobmV4dFNvdXJjZSk7XG5cbiAgICAgICAgdmFyIGtleXNBcnJheSA9IE9iamVjdC5rZXlzKE9iamVjdChuZXh0U291cmNlKSk7XG5cbiAgICAgICAgZm9yICh2YXIgbmV4dEluZGV4ID0gMCwgbGVuID0ga2V5c0FycmF5Lmxlbmd0aDsgbmV4dEluZGV4IDwgbGVuOyBuZXh0SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBrZXlzQXJyYXlbbmV4dEluZGV4XTtcbiAgICAgICAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuZXh0U291cmNlLCBuZXh0S2V5KTtcbiAgICAgICAgICAgIGlmIChkZXNjICE9PSB1bmRlZmluZWQgJiYgZGVzYy5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvO1xuXG59XG4iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU3ltYm9sc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIERSQUZUOiAgICAgICBTeW1ib2woJ2RyYWZ0JyksXG4gICAgU1ZHOiAgICAgICAgIFN5bWJvbCgnc3ZnJyksXG4gICAgRUxFTUVOVDogICAgIFN5bWJvbCgnZWxlbWVudCcpLFxuICAgIElTX1NFTEVDVEVEOiBTeW1ib2woJ2lzU2VsZWN0ZWQnKSxcbiAgICBBVFRSSUJVVEVTOiAgU3ltYm9sKCdhdHRyaWJ1dGVzJyksXG4gICAgTUlERExFTUFOOiAgIFN5bWJvbCgnbWlkZGxlbWFuJyksXG4gICAgU0hBUEU6ICAgICAgIFN5bWJvbCgnc2hhcGUnKSxcbiAgICBTSEFQRVM6ICAgICAgU3ltYm9sKCdzaGFwZXMnKSxcbiAgICBPUFRJT05TOiAgICAgU3ltYm9sKCdvcHRpb25zJyksXG4gICAgQUJJTElUSUVTOiAgIFN5bWJvbCgnYWJpbGl0aWVzJyksXG4gICAgS0VZX01BUDogICAgIFN5bWJvbCgna2V5TWFwJylcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVGhyb3dcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocm93IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICogQHJldHVybiB7VGhyb3d9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERyYWZ0LmpzOiAke21lc3NhZ2V9LmApO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuL1NoYXBlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0QXR0cmlidXRlcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogJ2JsdWUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMuanMnO1xuaW1wb3J0IFNlbGVjdGFibGUgICAgIGZyb20gJy4uL2FiaWxpdGllcy9TZWxlY3RhYmxlLmpzJztcbmltcG9ydCBUaHJvdyAgICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93LmpzJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuLi9oZWxwZXJzL1BvbHlmaWxscy5qcyc7XG5pbXBvcnQgc2V0QXR0cmlidXRlICAgZnJvbSAnLi4vaGVscGVycy9BdHRyaWJ1dGVzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgY29uc3QgYWJpbGl0aWVzICA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKClcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhYmlsaXRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNoYXBlIG9iamVjdCBpbnRvIGVhY2ggYWJpbGl0eSBpbnN0YW5jZS5cbiAgICAgICAgICAgIGFiaWxpdGllc1trZXldW1N5bWJvbHMuU0hBUEVdID0gdGhpcztcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10gPSBhdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXSAgPSBhYmlsaXRpZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gV2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIGB0YWdOYW1lYCBtZXRob2QgaGFzbid0IGJlZW4gZGVmaW5lZCBvbiB0aGUgY2hpbGQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgbmV3IFRocm93KCdUYWcgbmFtZSBtdXN0IGJlIGRlZmluZWQgZm9yIGEgc2hhcGUgdXNpbmcgdGhlIGB0YWdOYW1lYCBtZXRob2QnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge1NoYXBlfCp9XG4gICAgICovXG4gICAgYXR0cihuYW1lLCB2YWx1ZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICBzZXRBdHRyaWJ1dGUodGhpc1tTeW1ib2xzLkVMRU1FTlRdLCBuYW1lLCB2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnN0IHN2ZyAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5nZXREMygpO1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gb2JqZWN0QXNzaWduKHRoaXMuZGVmYXVsdEF0dHJpYnV0ZXMoKSwgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdKTtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0gPSBzdmcuYXBwZW5kKHRoaXMudGFnTmFtZSgpKS5kYXR1bSh7fSk7XG5cbiAgICAgICAgLy8gQXNzaWduIGVhY2ggYXR0cmlidXRlIGZyb20gdGhlIGRlZmF1bHQgYXR0cmlidXRlcyBkZWZpbmVkIG9uIHRoZSBzaGFwZSwgYXMgd2VsbCBhcyB0aG9zZSBkZWZpbmVkXG4gICAgICAgIC8vIGJ5IHRoZSB1c2VyIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgc2hhcGUuXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4gdGhpcy5hdHRyKGtleSwgYXR0cmlidXRlc1trZXldKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkUmVtb3ZlKCkgeyB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLklTX1NFTEVDVEVEXSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
