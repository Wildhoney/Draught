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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _shapesRectangleJs = require("../shapes/Rectangle.js");

var _shapesRectangleJs2 = _interopRequireDefault(_shapesRectangleJs);

/**
 * @module Draft
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports["default"] = function (name) {

    "use strict";

    var map = {
        rectangle: _shapesRectangleJs2["default"]
    };

    return new map[name]();
};

module.exports = exports["default"];

},{"../shapes/Rectangle.js":11}],7:[function(require,module,exports){
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
                opacity: 1
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
    key: 'attribute',

    /**
     * @method attribute
     * @param {String} name
     * @param {String} [value=undefined]
     * @return {Shape|*}
     */
    value: function attribute(name, value) {

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
        return _this2.attribute(key, attributes[key]);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL0FiaWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvYWJpbGl0aWVzL01vdmFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9BdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWFwcGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvTWlkZGxlbWFuLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUG9seWZpbGxzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvU3ltYm9scy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL1Rocm93LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O2tDQ0EyQix3QkFBd0I7Ozs7Z0NBQ3hCLHNCQUFzQjs7OztrQ0FDdEIsd0JBQXdCOztrQ0FDeEIsd0JBQXdCOzs7OytCQUN4QixxQkFB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LHFCQUFHLEVBQUc7Ozs7Ozs7O1dBTU4scUJBQUcsRUFBRzs7Ozs7Ozs7V0FNSix1QkFBRyxFQUFHOzs7Ozs7OztXQU1BLDZCQUFHO0FBQ2hCLGFBQU8sRUFBRSxDQUFDO0tBQ2I7OztTQTlGZ0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4uanMnO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzLmpzJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuL2hlbHBlcnMvUG9seWZpbGxzLmpzJztcbmltcG9ydCBpbnZvY2F0b3IgICAgICBmcm9tICcuL2hlbHBlcnMvSW52b2NhdG9yLmpzJztcbmltcG9ydCBtYXBwZXIgICAgICAgICBmcm9tICcuL2hlbHBlcnMvTWFwcGVyLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5jbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge0RyYWZ0fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5TSEFQRVNdICAgID0gW107XG4gICAgICAgIHRoaXNbU3ltYm9scy5PUFRJT05TXSAgID0gKE9iamVjdC5hc3NpZ24gfHwgb2JqZWN0QXNzaWduKSh0aGlzLm9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5NSURETEVNQU5dID0gbmV3IE1pZGRsZW1hbih0aGlzKTtcblxuICAgICAgICAvLyBSZW5kZXIgdGhlIFNWRyBjb21wb25lbnQgdXNpbmcgdGhlIGRlZmluZWQgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2lkdGggICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRXaWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ICAgICAgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U2hhcGV8U3RyaW5nfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChzaGFwZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2hhcGUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIHNoYXBlIG5hbWUgdG8gdGhlIHNoYXBlIG9iamVjdCwgaWYgdGhlIHVzZXIgaGFzIHBhc3NlZCB0aGUgc2hhcGVcbiAgICAgICAgICAgIC8vIGFzIGEgc3RyaW5nLlxuICAgICAgICAgICAgc2hhcGUgPSBtYXBwZXIoc2hhcGUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgc2hhcGVzLnB1c2goc2hhcGUpO1xuXG4gICAgICAgIC8vIFB1dCB0aGUgaW50ZXJmYWNlIGZvciBpbnRlcmFjdGluZyB3aXRoIERyYWZ0IGludG8gdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgc2hhcGVbU3ltYm9scy5NSURETEVNQU5dID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHJlbW92ZShzaGFwZSkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBjb25zdCBpbmRleCAgPSBzaGFwZXMuaW5kZXhPZihzaGFwZSk7XG5cbiAgICAgICAgc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlcyk7XG4gICAgICAgIHNoYXBlcy5sZW5ndGggPSAwO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFNoYXBlc1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdFNoYXBlcyhzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3NlbGVjdCcsIHNoYXBlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFNoYXBlc1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0U2hhcGVzKHNoYXBlcyA9IHRoaXMuYWxsKCkpIHtcbiAgICAgICAgaW52b2NhdG9yLmRpZCgnZGVzZWxlY3QnLCBzaGFwZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBvcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuT1BUSU9OU10gfHwge1xuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGdyaWRTaXplOiAxMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59XG5cbigoJHdpbmRvdykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoJHdpbmRvdykge1xuXG4gICAgICAgIC8vIEV4cG9ydCBkcmFmdCBpZiB0aGUgYHdpbmRvd2Agb2JqZWN0IGlzIGF2YWlsYWJsZS5cbiAgICAgICAgJHdpbmRvdy5EcmFmdCA9IERyYWZ0O1xuXG4gICAgfVxuXG59KSh3aW5kb3cpO1xuXG4vLyBFeHBvcnQgZm9yIHVzZSBpbiBFUzYgYXBwbGljYXRpb25zLlxuZXhwb3J0IGRlZmF1bHQgRHJhZnQ7IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1vdmFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLlNIQVBFXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE1pZGRsZW1hblxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBnZXRNaWRkbGVtYW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFNoYXBlKClbU3ltYm9scy5NSURETEVNQU5dO1xuICAgIH1cblxufSIsImltcG9ydCBBYmlsaXR5IGZyb20gJy4vQWJpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNb3ZhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZhYmxlIGV4dGVuZHMgQWJpbGl0eSB7XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQXR0cmlidXRlc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuXG4vKlxuICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVcbiAqIEBwYXJhbSB7QXJyYXl9IGVsZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgbmFtZSwgdmFsdWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgc3dpdGNoIChuYW1lKSB7XG5cbiAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICBjb25zdCB5ID0gZWxlbWVudC5kYXR1bSgpLnkgfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3ZhbHVlfSwgJHt5fSlgKTtcblxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIGNvbnN0IHggPSBlbGVtZW50LmRhdHVtKCkueCB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgZWxlbWVudC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7dmFsdWV9KWApO1xuXG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyKG5hbWUsIHZhbHVlKTtcblxufTsiLCIvKipcbiAqIEBtZXRob2QgdHJ5SW52b2tlXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICogQHBhcmFtIHtTdHJpbmd9IGZ1bmN0aW9uTmFtZVxuICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgdHJ5SW52b2tlID0gKGNvbnRleHQsIGZ1bmN0aW9uTmFtZSwgLi4ub3B0aW9ucykgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHRbZnVuY3Rpb25OYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb250ZXh0W2Z1bmN0aW9uTmFtZV0oLi4ub3B0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcblxufTtcblxuLyoqXG4gKiBAbWV0aG9kIGNhcGl0YWxpemVcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGNhcGl0YWxpemUgPSAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG5cbn07XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBJbnZvY2F0b3JcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgoKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZGlkXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl8U2hhcGV9IHNoYXBlc1xuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgZGlkKHR5cGUsIHNoYXBlcykge1xuXG4gICAgICAgICAgICBzaGFwZXMgPSBBcnJheS5pc0FycmF5KHNoYXBlcykgPyBzaGFwZXMgOiBbc2hhcGVzXTtcblxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlcy5ldmVyeSgoc2hhcGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ5SW52b2tlKHNoYXBlLCBgZGlkJHtjYXBpdGFsaXplKHR5cGUpfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTsiLCJpbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL3NoYXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgTWFwcGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCAobmFtZSkgPT4ge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgIHJlY3RhbmdsZTogUmVjdGFuZ2xlXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgbWFwW25hbWVdKCk7XG5cbn07IiwiaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi9TeW1ib2xzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1pZGRsZW1hblxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWlkZGxlbWFuIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRyYWZ0KSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0gPSBkcmFmdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEQzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEQzKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXVtTeW1ib2xzLlNWR107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuRFJBRlRdLmFsbCgpO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgICBTeW1ib2woJ2RyYWZ0JyksXG4gICAgU1ZHOiAgICAgICAgU3ltYm9sKCdzdmcnKSxcbiAgICBFTEVNRU5UOiAgICBTeW1ib2woJ2VsZW1lbnQnKSxcbiAgICBBVFRSSUJVVEVTOiBTeW1ib2woJ2F0dHJpYnV0ZXMnKSxcbiAgICBNSURETEVNQU46ICBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFOiAgICAgIFN5bWJvbCgnc2hhcGUnKSxcbiAgICBTSEFQRVM6ICAgICBTeW1ib2woJ3NoYXBlcycpLFxuICAgIE9QVElPTlM6ICAgIFN5bWJvbCgnb3B0aW9ucycpLFxuICAgIEFCSUxJVElFUzogIFN5bWJvbCgnYWJpbGl0aWVzJylcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVGhyb3dcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRocm93IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS5gKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGw6ICdibHVlJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMuanMnO1xuaW1wb3J0IE1vdmFibGUgICAgICAgIGZyb20gJy4uL2FiaWxpdGllcy9Nb3ZhYmxlLmpzJztcbmltcG9ydCBUaHJvdyAgICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93LmpzJztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuLi9oZWxwZXJzL1BvbHlmaWxscy5qcyc7XG5pbXBvcnQgc2V0QXR0cmlidXRlICAgZnJvbSAnLi4vaGVscGVycy9BdHRyaWJ1dGVzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2F0dHJpYnV0ZXM9e31dXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgY29uc3QgYWJpbGl0aWVzICA9IHtcbiAgICAgICAgICAgIG1vdmFibGU6IG5ldyBNb3ZhYmxlKClcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhYmlsaXRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNoYXBlIG9iamVjdCBpbnRvIGVhY2ggYWJpbGl0eSBpbnN0YW5jZS5cbiAgICAgICAgICAgIGFiaWxpdGllc1trZXldW1N5bWJvbHMuU0hBUEVdID0gdGhpcztcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10gPSBhdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXSAgPSBhYmlsaXRpZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gV2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIGB0YWdOYW1lYCBtZXRob2QgaGFzbid0IGJlZW4gZGVmaW5lZCBvbiB0aGUgY2hpbGQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgbmV3IFRocm93KCdUYWcgbmFtZSBtdXN0IGJlIGRlZmluZWQgZm9yIGEgc2hhcGUgdXNpbmcgdGhlIGB0YWdOYW1lYCBtZXRob2QnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7U2hhcGV8Kn1cbiAgICAgKi9cbiAgICBhdHRyaWJ1dGUobmFtZSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5FTEVNRU5UXS5kYXR1bSgpW25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgc2V0QXR0cmlidXRlKHRoaXNbU3ltYm9scy5FTEVNRU5UXSwgbmFtZSwgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBzdmcgICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5nZXREMygpO1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVzICAgICAgPSBvYmplY3RBc3NpZ24odGhpcy5kZWZhdWx0QXR0cmlidXRlcygpLCB0aGlzW1N5bWJvbHMuQVRUUklCVVRFU10pO1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXSA9IHN2Zy5hcHBlbmQodGhpcy50YWdOYW1lKCkpLmRhdHVtKHt9KTtcblxuICAgICAgICAvLyBBc3NpZ24gZWFjaCBhdHRyaWJ1dGUgZnJvbSB0aGUgZGVmYXVsdCBhdHRyaWJ1dGVzIGRlZmluZWQgb24gdGhlIHNoYXBlLCBhcyB3ZWxsIGFzIHRob3NlIGRlZmluZWRcbiAgICAgICAgLy8gYnkgdGhlIHVzZXIgd2hlbiBpbnN0YW50aWF0aW5nIHRoZSBzaGFwZS5cbiAgICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaCgoa2V5KSA9PiB0aGlzLmF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRSZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFJlbW92ZSgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRTZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZFNlbGVjdCgpIHsgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7IH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn0iXX0=
