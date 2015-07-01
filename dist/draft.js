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

},{"./helpers/Invocator.js":5,"./helpers/Mapper.js":6,"./helpers/Middleman.js":7,"./helpers/Polyfills.js":8,"./helpers/Symbols.js":9}],2:[function(require,module,exports){
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
 * @submodule Movable
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
     * @return {Shape}
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

},{"../helpers/Symbols.js":9}],3:[function(require,module,exports){
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
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Movable = (function (_Ability) {
  function Movable() {
    _classCallCheck(this, Movable);

    _get(Object.getPrototypeOf(Movable.prototype), 'constructor', this).apply(this, arguments);
  }

  _inherits(Movable, _Ability);

  return Movable;
})(_AbilityJs2['default']);

exports['default'] = Movable;
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

},{"../helpers/Throw.js":10,"../shapes/Rectangle.js":11}],7:[function(require,module,exports){
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

    this[_SymbolsJs2['default'].DRAFT] = draft;
  }

  _createClass(Middleman, [{
    key: 'getD3',

    /**
     * @method getD3
     * @return {Object}
     */
    value: function getD3() {
      return this[_SymbolsJs2['default'].DRAFT][_SymbolsJs2['default'].SVG];
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

},{"./Symbols.js":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
    ATTRIBUTES: Symbol('attributes'),
    MIDDLEMAN: Symbol('middleman'),
    SHAPE: Symbol('shape'),
    SHAPES: Symbol('shapes'),
    OPTIONS: Symbol('options'),
    ABILITIES: Symbol('abilities')
};
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
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
 * @return {Facade}
 */
function Throw(message) {
  _classCallCheck(this, Throw);

  throw new Error("Draft.js: " + message + ".");
};

exports["default"] = Throw;
module.exports = exports["default"];

},{}],11:[function(require,module,exports){
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

},{"./Shape.js":12}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbolsJs = require('../helpers/Symbols.js');

var _helpersSymbolsJs2 = _interopRequireDefault(_helpersSymbolsJs);

var _abilitiesMovableJs = require('../abilities/Movable.js');

var _abilitiesMovableJs2 = _interopRequireDefault(_abilitiesMovableJs);

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
      movable: new _abilitiesMovableJs2['default']()
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
    key: 'attr',

    /**
     * @method attr
     * @param {String} name
     * @param {String} [value=undefined]
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

      var svg = this[_helpersSymbolsJs2['default'].MIDDLEMAN].getD3();
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
    value: function didSelect() {}
  }, {
    key: 'didDeselect',

    /**
     * @method didDeselect
     * @return {void}
     */
    value: function didDeselect() {}
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

},{"../abilities/Movable.js":3,"../helpers/Attributes.js":4,"../helpers/Polyfills.js":8,"../helpers/Symbols.js":9,"../helpers/Throw.js":10}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL01vdmFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tDQ0EyQix3QkFBd0I7Ozs7Z0NBQ3hCLHNCQUFzQjs7OztrQ0FDdEIsd0JBQXdCOztrQ0FDeEIsd0JBQXdCOzs7OytCQUN4QixxQkFB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WUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFHO2VBQUssT0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUU3RTs7Ozs7Ozs7V0FNUSxxQkFBRyxFQUFHOzs7Ozs7OztXQU1OLHFCQUFHLEVBQUc7Ozs7Ozs7O1dBTUosdUJBQUcsRUFBRzs7Ozs7Ozs7V0FNQSw2QkFBRztBQUNoQixhQUFPLEVBQUUsQ0FBQztLQUNiOzs7U0E5RmdCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBNaWRkbGVtYW4gICAgICBmcm9tICcuL2hlbHBlcnMvTWlkZGxlbWFuLmpzJztcbmltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi9oZWxwZXJzL1BvbHlmaWxscy5qcyc7XG5pbXBvcnQgaW52b2NhdG9yICAgICAgZnJvbSAnLi9oZWxwZXJzL0ludm9jYXRvci5qcyc7XG5pbXBvcnQgbWFwcGVyICAgICAgICAgZnJvbSAnLi9oZWxwZXJzL01hcHBlci5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuU0hBUEVTXSAgICA9IFtdO1xuICAgICAgICB0aGlzW1N5bWJvbHMuT1BUSU9OU10gICA9IChPYmplY3QuYXNzaWduIHx8IG9iamVjdEFzc2lnbikodGhpcy5vcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG5ldyBNaWRkbGVtYW4odGhpcyk7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBTVkcgY29tcG9uZW50IHVzaW5nIHRoZSBkZWZpbmVkIG9wdGlvbnMuXG4gICAgICAgIGNvbnN0IHdpZHRoICAgICAgID0gdGhpc1tTeW1ib2xzLk9QVElPTlNdLmRvY3VtZW50V2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodCAgICAgID0gdGhpc1tTeW1ib2xzLk9QVElPTlNdLmRvY3VtZW50SGVpZ2h0O1xuICAgICAgICB0aGlzW1N5bWJvbHMuU1ZHXSA9IGQzLnNlbGVjdChlbGVtZW50KS5hdHRyKCd3aWR0aCcsIHdpZHRoKS5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfFN0cmluZ30gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBhZGQoc2hhcGUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHNoYXBlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICAgICAvLyBSZXNvbHZlIHRoZSBzaGFwZSBuYW1lIHRvIHRoZSBzaGFwZSBvYmplY3QsIGlmIHRoZSB1c2VyIGhhcyBwYXNzZWQgdGhlIHNoYXBlXG4gICAgICAgICAgICAvLyBhcyBhIHN0cmluZy5cbiAgICAgICAgICAgIHNoYXBlID0gbWFwcGVyKHNoYXBlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIHNoYXBlcy5wdXNoKHNoYXBlKTtcblxuICAgICAgICAvLyBQdXQgdGhlIGludGVyZmFjZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBEcmFmdCBpbnRvIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlW1N5bWJvbHMuTUlERExFTUFOXSA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgY29uc3QgaW5kZXggID0gc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuXG4gICAgICAgIHNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZSk7XG5cbiAgICAgICAgcmV0dXJuIHNoYXBlcy5sZW5ndGg7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdyZW1vdmUnLCBzaGFwZXMpO1xuICAgICAgICBzaGFwZXMubGVuZ3RoID0gMDtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RTaGFwZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3RTaGFwZXMoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdzZWxlY3QnLCBzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RTaGFwZXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc2hhcGVzPXRoaXMuYWxsKCldXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdFNoYXBlcyhzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2Rlc2VsZWN0Jywgc2hhcGVzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgb3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLk9QVElPTlNdIHx8IHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oKCR3aW5kb3cpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKCR3aW5kb3cpIHtcblxuICAgICAgICAvLyBFeHBvcnQgZHJhZnQgaWYgdGhlIGB3aW5kb3dgIG9iamVjdCBpcyBhdmFpbGFibGUuXG4gICAgICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxuICAgIH1cblxufSkod2luZG93KTtcblxuLy8gRXhwb3J0IGZvciB1c2UgaW4gRVM2IGFwcGxpY2F0aW9ucy5cbmV4cG9ydCBkZWZhdWx0IERyYWZ0OyIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4uL2hlbHBlcnMvU3ltYm9scy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNb3ZhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0U2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBnZXRTaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRNaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgZ2V0TWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTW92YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92YWJsZSBleHRlbmRzIEFiaWxpdHkge1xuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEF0dHJpYnV0ZXNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cblxuLypcbiAqIEBtZXRob2Qgc2V0QXR0cmlidXRlXG4gKiBAcGFyYW0ge0FycmF5fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgY29uc3QgeSA9IGVsZW1lbnQuZGF0dW0oKS55IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt2YWx1ZX0sICR7eX0pYCk7XG5cbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICBjb25zdCB4ID0gZWxlbWVudC5kYXR1bSgpLnggfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3ZhbHVlfSlgKTtcblxuICAgIH1cblxuICAgIGVsZW1lbnQuYXR0cihuYW1lLCB2YWx1ZSk7XG5cbn07IiwiLyoqXG4gKiBAbWV0aG9kIHRyeUludm9rZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEBwYXJhbSB7U3RyaW5nfSBmdW5jdGlvbk5hbWVcbiAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IHRyeUludm9rZSA9IChjb250ZXh0LCBmdW5jdGlvbk5hbWUsIC4uLm9wdGlvbnMpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0W2Z1bmN0aW9uTmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29udGV4dFtmdW5jdGlvbk5hbWVdKC4uLm9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG5cbn07XG5cbi8qKlxuICogQG1ldGhvZCBjYXBpdGFsaXplXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBjYXBpdGFsaXplID0gKG5hbWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgSW52b2NhdG9yXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAoKCkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGRpZFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fFNoYXBlfSBzaGFwZXNcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGRpZCh0eXBlLCBzaGFwZXMpIHtcblxuICAgICAgICAgICAgc2hhcGVzID0gQXJyYXkuaXNBcnJheShzaGFwZXMpID8gc2hhcGVzIDogW3NoYXBlc107XG5cbiAgICAgICAgICAgIHJldHVybiBzaGFwZXMuZXZlcnkoKHNoYXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyeUludm9rZShzaGFwZSwgYGRpZCR7Y2FwaXRhbGl6ZSh0eXBlKX1gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7IiwiaW1wb3J0IFRocm93ICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93LmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vc2hhcGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNYXBwZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgcmVjdGFuZ2xlOiBSZWN0YW5nbGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIHR5cGVvZiBtYXBbbmFtZV0gIT09ICd1bmRlZmluZWQnID8gbmV3IG1hcFtuYW1lXSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IFRocm93KGBDYW5ub3QgbWFwIFwiJHtuYW1lfVwiIHRvIGEgc2hhcGUgb2JqZWN0YCk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi9TeW1ib2xzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1pZGRsZW1hblxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlkZGxlbWFuIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRyYWZ0KSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0gPSBkcmFmdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEQzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEQzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLlNWR107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLmFsbCgpO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgICBTeW1ib2woJ2RyYWZ0JyksXG4gICAgU1ZHOiAgICAgICAgU3ltYm9sKCdzdmcnKSxcbiAgICBFTEVNRU5UOiAgICBTeW1ib2woJ2VsZW1lbnQnKSxcbiAgICBBVFRSSUJVVEVTOiBTeW1ib2woJ2F0dHJpYnV0ZXMnKSxcbiAgICBNSURETEVNQU46ICBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFOiAgICAgIFN5bWJvbCgnc2hhcGUnKSxcbiAgICBTSEFQRVM6ICAgICBTeW1ib2woJ3NoYXBlcycpLFxuICAgIE9QVElPTlM6ICAgIFN5bWJvbCgnb3B0aW9ucycpLFxuICAgIEFCSUxJVElFUzogIFN5bWJvbCgnYWJpbGl0aWVzJylcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVGhyb3dcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocm93IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS5gKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGw6ICdibHVlJyxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzLmpzJztcbmltcG9ydCBNb3ZhYmxlICAgICAgICBmcm9tICcuLi9hYmlsaXRpZXMvTW92YWJsZS5qcyc7XG5pbXBvcnQgVGhyb3cgICAgICAgICAgZnJvbSAnLi4vaGVscGVycy9UaHJvdy5qcyc7XG5pbXBvcnQge29iamVjdEFzc2lnbn0gZnJvbSAnLi4vaGVscGVycy9Qb2x5ZmlsbHMuanMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZSAgIGZyb20gJy4uL2hlbHBlcnMvQXR0cmlidXRlcy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFthdHRyaWJ1dGVzPXt9XVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGNvbnN0IGFiaWxpdGllcyAgPSB7XG4gICAgICAgICAgICBtb3ZhYmxlOiBuZXcgTW92YWJsZSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmtleXMoYWJpbGl0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcblxuICAgICAgICAgICAgLy8gQWRkIHRoZSBzaGFwZSBvYmplY3QgaW50byBlYWNoIGFiaWxpdHkgaW5zdGFuY2UuXG4gICAgICAgICAgICBhYmlsaXRpZXNba2V5XVtTeW1ib2xzLlNIQVBFXSA9IHRoaXM7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdID0gYXR0cmlidXRlcztcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10gID0gYWJpbGl0aWVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0YWdOYW1lXG4gICAgICogQHRocm93cyB7RXJyb3J9IFdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSBgdGFnTmFtZWAgbWV0aG9kIGhhc24ndCBiZWVuIGRlZmluZWQgb24gdGhlIGNoaWxkIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHRhZ05hbWUoKSB7XG4gICAgICAgIG5ldyBUaHJvdygnVGFnIG5hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhIHNoYXBlIHVzaW5nIHRoZSBgdGFnTmFtZWAgbWV0aG9kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZXwqfVxuICAgICAqL1xuICAgIGF0dHIobmFtZSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgc2V0QXR0cmlidXRlKHRoaXNbU3ltYm9scy5FTEVNRU5UXSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBzdmcgICAgICAgID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0uZ2V0RDMoKTtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IG9iamVjdEFzc2lnbih0aGlzLmRlZmF1bHRBdHRyaWJ1dGVzKCksIHRoaXNbU3ltYm9scy5BVFRSSUJVVEVTXSk7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdID0gc3ZnLmFwcGVuZCh0aGlzLnRhZ05hbWUoKSkuZGF0dW0oe30pO1xuXG4gICAgICAgIC8vIEFzc2lnbiBlYWNoIGF0dHJpYnV0ZSBmcm9tIHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGUgc2hhcGUsIGFzIHdlbGwgYXMgdGhvc2UgZGVmaW5lZFxuICAgICAgICAvLyBieSB0aGUgdXNlciB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIHNoYXBlLlxuICAgICAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKChrZXkpID0+IHRoaXMuYXR0cihrZXksIGF0dHJpYnV0ZXNba2V5XSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRSZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFJlbW92ZSgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRTZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFNlbGVjdCgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7IH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
