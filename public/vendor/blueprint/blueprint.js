(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var Events = _interopRequire(require("./helpers/Events.js"));

var Registry = _interopRequire(require("./helpers/Registry.js"));

var utility = _interopRequire(require("./helpers/Utility.js"));

// Shapes.

var Rectangle = _interopRequire(require("./shapes/types/Rectangle.js"));

/**
 * @constant DATA_ATTRIBUTE
 * @type {String}
 */
var DATA_ATTRIBUTE = "data-id";

/**
 * @module Blueprint
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Blueprint = (function () {

    /**
     * @method constructor
     * @param {SVGElement} element
     * @param {Object} [options={}]
     * @return {void}
     */

    function Blueprint(element) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.element = d3.select(element).attr("width", "100%").attr("height", "100%");
        this.shapes = [];
        this.options = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
        this.registry = new Registry();
        this.groups = new Groups(this.element);
        this.label = _.uniqueId("BP");
        this.map = {};

        // Set the essential registry items.
        this.registry.set("z-index", 0);

        // Register our custom shapes.
        this.registerComponent("rect", Rectangle);

        // Apply our event listeners.
        this.dispatcher.listen(Events.REORDER, function () {
            var groups = d3.selectAll("g[" + DATA_ATTRIBUTE + "]");
            groups.sort(function (a, b) {
                return a.z - b.z;
            });
        });
    }

    _prototypeProperties(Blueprint, null, {
        add: {

            /**
             * @method add
             * @param {String} name
             * @return {Interface}
             */

            value: function add(name) {

                var shape = this["new"](name);
                //this.registry.set('z-index', );

                // Insert the shape into D3 and apply the attributes.
                var group = this.groups.shapes,
                    element = group.append("g").attr(DATA_ATTRIBUTE, shape.label).append(shape.getTag()),
                    zIndex = { z: this.registry.increment("z-index") };

                // Set all the items required for the shape object.
                shape.setOptions(this.options);
                shape.setDispatcher(this.dispatcher);
                shape.setElement(element);
                shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

                shape.addElements(element);

                this.shapes.push({ shape: shape, "interface": shape.getInterface() });
                return shape.getInterface();
            },
            writable: true,
            configurable: true
        },
        remove: {

            /**
             * @method remove
             * @param {Shape} shape
             * @return {void}
             */

            value: function remove(shape) {
                shape.remove();
                var index = this.shapes.indexOf(shape);
                this.shapes.splice(index, 1);
            },
            writable: true,
            configurable: true
        },
        all: {

            /**
             * @method all
             * @return {Shape[]}
             */

            value: function all() {
                return this.shapes.map(function (shape) {
                    return shape["interface"];
                });
            },
            writable: true,
            configurable: true
        },
        clear: {

            /**
             * @method clear
             * @return {void}
             */

            value: function clear() {
                var _this = this;

                _.forEach(this.shapes, function (shape) {
                    return _this.remove(shape);
                });
            },
            writable: true,
            configurable: true
        },
        "new": {

            /**
             * @method new
             * @param {String} name
             * @return {Shape}
             */

            value: function _new(name) {
                return new (this.map[name.toLowerCase()])(this.label);
            },
            writable: true,
            configurable: true
        },
        registerComponent: {

            /**
             * @method registerComponent
             * @param {String} name
             * @param {Shape} shape
             * @return {void}
             */

            value: function registerComponent(name, shape) {
                this.map[name] = shape;
            },
            writable: true,
            configurable: true
        },
        defaultOptions: {

            /**
             * @method defaultOptions
             * @return {Object}
             */

            value: function defaultOptions() {
                return {};
            },
            writable: true,
            configurable: true
        }
    });

    return Blueprint;
})();

(function main($window) {

    "use strict";

    $window.Blueprint = Blueprint;
})(window);

},{"./helpers/Dispatcher.js":2,"./helpers/Events.js":3,"./helpers/Groups.js":4,"./helpers/Registry.js":6,"./helpers/Utility.js":7,"./shapes/types/Rectangle.js":9}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Dispatcher
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Dispatcher = (function () {

    /**
     * @method constructor
     * @constructor
     */

    function Dispatcher() {
        _classCallCheck(this, Dispatcher);

        this.events = [];
    }

    _prototypeProperties(Dispatcher, null, {
        send: {

            /**
             * @method send
             * @param {String} name
             * @param {Object} [properties={}]
             * @return {void}
             */

            value: function send(name) {
                var properties = arguments[1] === undefined ? {} : arguments[1];

                _.forEach(this.events[name], function (callbackFn) {
                    return callbackFn(properties);
                });
            },
            writable: true,
            configurable: true
        },
        listen: {

            /**
             * @method listen
             * @param {String} name
             * @param {Function} [fn=function noop() {}]
             * @return {void}
             */

            value: function listen(name, fn) {

                if (!this.events[name]) {
                    this.events[name] = [];
                }

                this.events[name].push(fn);
            },
            writable: true,
            configurable: true
        }
    });

    return Dispatcher;
})();

module.exports = Dispatcher;

},{}],3:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Events
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
module.exports = {
  ATTRIBUTE: "attribute",
  REORDER: "reorder"
};

},{}],4:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Groups
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Groups =

/**
 * @method constructor
 * @param {SVGElement} element
 * @constructor
 */
function Groups(element) {
  _classCallCheck(this, Groups);

  this.shapes = element.append("g").classed("shapes", true);
  this.handles = element.append("g").classed("handles", true);
};

module.exports = Groups;

},{}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var utility = _interopRequire(require("./../helpers/Utility.js"));

/**
 * @module object
 * @submodule Interface
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */

var Interface = (function () {

    /**
     * @method constructor
     * @param {String} [label='']
     * @return {Interface}
     */

    function Interface() {
        var label = arguments[0] === undefined ? "" : arguments[0];

        _classCallCheck(this, Interface);

        this.label = label;
    }

    _prototypeProperties(Interface, null, {
        x: {

            /**
             * @method x
             * @param {Number} value
             * @return {Interface}
             */

            value: function x(value) {
                return this.attr({ x: value });
            },
            writable: true,
            configurable: true
        },
        y: {

            /**
             * @method y
             * @param {Number} value
             * @return {Interface}
             */

            value: function y(value) {
                return this.attr({ y: value });
            },
            writable: true,
            configurable: true
        },
        z: {

            /**
             * @method z
             * @param {Number} value
             * @return {Interface}
             */

            value: function z(value) {
                return this.attr({ z: value });
            },
            writable: true,
            configurable: true
        },
        width: {

            /**
             * @method width
             * @param {Number} value
             * @return {Interface}
             */

            value: function width(value) {
                return this.attr({ width: value });
            },
            writable: true,
            configurable: true
        },
        height: {

            /**
             * @method height
             * @param {Number} value
             * @return {Interface}
             */

            value: function height(value) {
                return this.attr({ height: value });
            },
            writable: true,
            configurable: true
        },
        attr: {

            /**
             * @method attr
             * @param {Object} attributes
             * @return {Interface}
             */

            value: function attr() {
                var attributes = arguments[0] === undefined ? {} : arguments[0];

                return this.applyAttributes(utility.camelifyKeys(attributes));
            },
            writable: true,
            configurable: true
        },
        toString: {

            /**
             * @method toString
             * @return {String}
             */

            value: function toString() {

                if (this.label) {
                    return "[object Interface: " + this.label + "]";
                }

                return "[object Interface]";
            },
            writable: true,
            configurable: true
        }
    });

    return Interface;
})();

module.exports = Interface;

},{"./../helpers/Utility.js":7}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module object
 * @submodule Registry
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */

var Registry = (function () {

  /**
   * @method constructor
   * @return {Registry}
   * @constructor
   */

  function Registry() {
    _classCallCheck(this, Registry);

    this.properties = {};
  }

  _prototypeProperties(Registry, null, {
    set: {

      /**
       * @method set
       * @param {String} property
       * @param {*} value
       * @return {void}
       */

      value: function set(property, value) {
        this.properties[property] = value;
      },
      writable: true,
      configurable: true
    },
    increment: {

      /**
       * @method increment
       * @param {String} property
       * @return {Number}
       */

      value: function increment(property) {
        this.set(property, parseInt(this.get(property)) + 1);
        return this.properties[property];
      },
      writable: true,
      configurable: true
    },
    decrement: {

      /**
       * @method decrement
       * @param {String} property
       * @return {Number}
       */

      value: function decrement(property) {
        this.set(property, parseInt(this.get(property)) - 1);
        return this.properties[property];
      },
      writable: true,
      configurable: true
    },
    get: {

      /**
       * @method get
       * @param {String} property
       * @return {*}
       */

      value: function get(property) {
        return this.properties[property];
      },
      writable: true,
      configurable: true
    }
  });

  return Registry;
})();

module.exports = Registry;

},{}],7:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
var utility = (function () {

    "use strict";

    return {

        /**
         * @method throwException
         * @param {String} message
         * @throws Exception
         * @return {void}
         */
        throwException: function (message) {
            throw "Blueprint.js: " + message + ".";
        },

        /**
         * @method transformAttributes
         * @param {Object} attributes
         * @return {Object}
         */
        transformAttributes: function (attributes) {

            if (attributes.transform) {

                var match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i),
                    x = parseInt(match[1]),
                    y = parseInt(match[2]);

                if (!_.isUndefined(attributes.x) && _.isUndefined(attributes.y)) {
                    attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, y));
                    delete attributes.x;
                }

                if (_.isUndefined(attributes.x) && !_.isUndefined(attributes.y)) {
                    attributes = _.assign(attributes, utility.pointsToTransform(x, attributes.y));
                    delete attributes.y;
                }
            }

            if (!_.isUndefined(attributes.x) && !_.isUndefined(attributes.y)) {

                // We're using the `transform: translate(x, y)` format instead.
                attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, attributes.y));
                delete attributes.x;
                delete attributes.y;
            }

            return attributes;
        },

        /**
         * @method pointsToTransform
         * @param {Number} x
         * @param {Number} y
         * @return {String}
         */
        pointsToTransform: function pointsToTransform(x, y) {
            return { transform: "translate(" + x + ", " + y + ")" };
        },

        /**
         * @method camelifyKeys
         * @param {Object} model
         * @return {Object}
         */
        camelifyKeys: function camelifyKeys(model) {

            var transformedModel = {};

            _.forIn(model, function (value, key) {
                transformedModel[_.kebabCase(key)] = value;
            });

            return transformedModel;
        }

    };
})();

module.exports = utility;

},{}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../helpers/Interface.js"));

var Events = _interopRequire(require("./../helpers/Events.js"));

var utility = _interopRequire(require("./../helpers/Utility.js"));

/**
 * @module Blueprint
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Shape = (function () {

    /**
     * @method constructor
     * @param {String} [label='']
     * @constructor
     */

    function Shape() {
        var label = arguments[0] === undefined ? "" : arguments[0];

        _classCallCheck(this, Shape);

        this.element = null;
        this.label = label;
        this["interface"] = null;
    }

    _prototypeProperties(Shape, null, {
        setElement: {

            /**
             * @method setElement
             * @param {Object} element
             */

            value: function setElement(element) {
                this.element = element;
            },
            writable: true,
            configurable: true
        },
        setDispatcher: {

            /**
             * @method setDispatcher
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function setDispatcher(dispatcher) {
                this.dispatcher = dispatcher;
            },
            writable: true,
            configurable: true
        },
        setOptions: {

            /**
             * @method setOptions
             * @param {Object} options
             * @return {void}
             */

            value: function setOptions(options) {
                this.options = options;
            },
            writable: true,
            configurable: true
        },
        getInterface: {

            /**
             * @method getInterface
             * @return {Interface}
             */

            value: function getInterface() {

                if (this["interface"] === null) {

                    this["interface"] = new Interface(this.label);
                    var setAttributes = this.setAttributes.bind(this);

                    /**
                     * @method applyAttributes
                     * @param {Object} attributes
                     */
                    this["interface"].applyAttributes = function applyAttributes() {
                        var attributes = arguments[0] === undefined ? {} : arguments[0];

                        setAttributes(attributes);
                        return this;
                    };

                    if (_.isFunction(this.addMethods)) {
                        this["interface"] = _.assign(this["interface"], this.addMethods());
                    }
                }

                return this["interface"];
            },
            writable: true,
            configurable: true
        },
        setAttributes: {

            /**
             * @method setAttributes
             * @param {Object} attributes
             * @return {Interface}
             */

            value: function setAttributes() {
                var attributes = arguments[0] === undefined ? {} : arguments[0];

                attributes = _.assign(this.element.datum() || {}, attributes);
                attributes = utility.transformAttributes(attributes);

                if (!_.isUndefined(attributes.z)) {

                    // When the developer specifies the `z` attribute, it actually pertains to the group
                    // element that the shape is a child of. We'll therefore need to remove the `z` property
                    // from the `attributes` object, and instead apply it to the shape's group element.
                    // Afterwards we'll need to broadcast an event to reorder the elements using D3's magical
                    // `sort` method.
                    var group = d3.select(this.element.node().parentNode);
                    group.datum({ z: attributes.z });
                    delete attributes.z;
                    this.dispatcher.send(Events.REORDER);
                }

                this.element.datum(attributes);
                this.element.attr(this.element.datum());
                return this["interface"];
            },
            writable: true,
            configurable: true
        },
        getAttributes: {

            /**
             * @method getAttributes
             * @return {Object}
             */

            value: function getAttributes() {

                var attributes = { x: 0, y: 0 };

                if (_.isFunction(this.addAttributes)) {
                    attributes = _.assign(attributes, this.addAttributes());
                }

                return attributes;
            },
            writable: true,
            configurable: true
        },
        addElements: {

            /**
             * @method addElements
             * @param {Object} element
             * @return {Object}
             */

            value: function addElements(element) {
                return element;
            },
            writable: true,
            configurable: true
        },
        getTag: {

            /**
             * @method getTag
             * @throws Exception
             * @return {void}
             */

            value: function getTag() {
                utility.throwException("Shape<" + this.label + "> must define a `getTag` method");
            },
            writable: true,
            configurable: true
        },
        dispatchAttributeEvent: {

            /**
             * @method dispatchAttributeEvent
             * @param {Object} properties = {}
             * @return {void}
             */

            value: function dispatchAttributeEvent() {
                var properties = arguments[0] === undefined ? {} : arguments[0];

                properties.element = this;
                this.dispatcher.send(Events.ATTRIBUTE, properties);
            },
            writable: true,
            configurable: true
        },
        toString: {

            /**
             * @method toString
             * @return {String}
             */

            value: function toString() {

                var tag = this.getTag().charAt(0).toUpperCase() + this.getTag().slice(1);

                if (this.label) {
                    return "[object " + tag + ": " + this.label + "]";
                }

                return "[object " + tag + "]";
            },
            writable: true,
            configurable: true
        }
    });

    return Shape;
})();

module.exports = Shape;

},{"./../helpers/Events.js":3,"./../helpers/Interface.js":5,"./../helpers/Utility.js":7}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Shape = _interopRequire(require("./../Shape.js"));

/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Rectangle = (function (Shape) {
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        if (Shape != null) {
            Shape.apply(this, arguments);
        }
    }

    _inherits(Rectangle, Shape);

    _prototypeProperties(Rectangle, null, {
        getTag: {

            /**
             * @method getTag
             * @return {String}
             */

            value: function getTag() {
                return "rect";
            },
            writable: true,
            configurable: true
        },
        addAttributes: {

            /**
             * @method addAttributes
             * @return {Object}
             */

            value: function addAttributes() {
                return { fill: "red", width: 100, height: 100, x: 100, y: 20, z: 5 };
            },
            writable: true,
            configurable: true
        },
        addMethods: {

            /**
             * @method addMethods
             * @return {Object}
             */

            value: function addMethods() {
                var _this = this;

                return {
                    fill: function (value) {
                        return _this.setAttributes({ fill: value });
                    }
                };
            },
            writable: true,
            configurable: true
        }
    });

    return Rectangle;
})(Shape);

module.exports = Rectangle;

},{"./../Shape.js":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0V2ZW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1JlZ2lzdHJ5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL1NoYXBlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU8sVUFBVSwyQkFBTSx5QkFBeUI7O0lBQ3pDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsUUFBUSwyQkFBUyx1QkFBdUI7O0lBQ3hDLE9BQU8sMkJBQVMsc0JBQXNCOzs7O0lBR3RDLFNBQVMsMkJBQU8sNkJBQTZCOzs7Ozs7QUFNcEQsSUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDOzs7Ozs7OztJQU8zQixTQUFTOzs7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R0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUN4RTs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHOzs7QUFFVCx1QkFBTztBQUNILHdCQUFJLEVBQUUsVUFBQyxLQUFLOytCQUFLLE1BQUssYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUFBO2lCQUN2RCxDQUFBO2FBRUo7Ozs7OztXQTVCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgUmVnaXN0cnkgICAgZnJvbSAnLi9oZWxwZXJzL1JlZ2lzdHJ5LmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gU2hhcGVzLlxuaW1wb3J0IFJlY3RhbmdsZSAgZnJvbSAnLi9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAY29uc3RhbnQgREFUQV9BVFRSSUJVVEVcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbmNvbnN0IERBVEFfQVRUUklCVVRFID0gJ2RhdGEtaWQnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QoZWxlbWVudCkuYXR0cignd2lkdGgnLCAnMTAwJScpLmF0dHIoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ICAgPSBuZXcgUmVnaXN0cnkoKTtcbiAgICAgICAgdGhpcy5ncm91cHMgICAgID0gbmV3IEdyb3Vwcyh0aGlzLmVsZW1lbnQpO1xuICAgICAgICB0aGlzLmxhYmVsICAgICAgPSBfLnVuaXF1ZUlkKCdCUCcpO1xuICAgICAgICB0aGlzLm1hcCAgICAgICAgPSB7fTtcblxuICAgICAgICAvLyBTZXQgdGhlIGVzc2VudGlhbCByZWdpc3RyeSBpdGVtcy5cbiAgICAgICAgdGhpcy5yZWdpc3RyeS5zZXQoJ3otaW5kZXgnLCAwKTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgY3VzdG9tIHNoYXBlcy5cbiAgICAgICAgdGhpcy5yZWdpc3RlckNvbXBvbmVudCgncmVjdCcsIFJlY3RhbmdsZSk7XG5cbiAgICAgICAgLy8gQXBwbHkgb3VyIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IGQzLnNlbGVjdEFsbChgZ1ske0RBVEFfQVRUUklCVVRFfV1gKTtcbiAgICAgICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICB2YXIgc2hhcGUgPSB0aGlzLm5ldyhuYW1lKTtcbiAgICAgICAgLy90aGlzLnJlZ2lzdHJ5LnNldCgnei1pbmRleCcsICk7XG5cbiAgICAgICAgLy8gSW5zZXJ0IHRoZSBzaGFwZSBpbnRvIEQzIGFuZCBhcHBseSB0aGUgYXR0cmlidXRlcy5cbiAgICAgICAgdmFyIGdyb3VwICAgPSB0aGlzLmdyb3Vwcy5zaGFwZXMsXG4gICAgICAgICAgICBlbGVtZW50ID0gZ3JvdXAuYXBwZW5kKCdnJykuYXR0cihEQVRBX0FUVFJJQlVURSwgc2hhcGUubGFiZWwpLmFwcGVuZChzaGFwZS5nZXRUYWcoKSksXG4gICAgICAgICAgICB6SW5kZXggID0geyB6OiB0aGlzLnJlZ2lzdHJ5LmluY3JlbWVudCgnei1pbmRleCcpIH07XG5cbiAgICAgICAgLy8gU2V0IGFsbCB0aGUgaXRlbXMgcmVxdWlyZWQgZm9yIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRBdHRyaWJ1dGVzKF8uYXNzaWduKHpJbmRleCwgc2hhcGUuZ2V0QXR0cmlidXRlcygpKSk7XG5cbiAgICAgICAgc2hhcGUuYWRkRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMucHVzaCh7IHNoYXBlOiBzaGFwZSwgaW50ZXJmYWNlOiBzaGFwZS5nZXRJbnRlcmZhY2UoKX0pO1xuICAgICAgICByZXR1cm4gc2hhcGUuZ2V0SW50ZXJmYWNlKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcbiAgICAgICAgc2hhcGUucmVtb3ZlKCk7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5tYXAoKHNoYXBlKSA9PiBzaGFwZS5pbnRlcmZhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5zaGFwZXMsIChzaGFwZSkgPT4gdGhpcy5yZW1vdmUoc2hhcGUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG5ld1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgbmV3KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKHRoaXMubGFiZWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJDb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWdpc3RlckNvbXBvbmVudChuYW1lLCBzaGFwZSkge1xuICAgICAgICB0aGlzLm1hcFtuYW1lXSA9IHNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdE9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdE9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAkd2luZG93LkJsdWVwcmludCA9IEJsdWVwcmludDtcblxufSkod2luZG93KTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbmQobmFtZSwgcHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmV2ZW50c1tuYW1lXSwgKGNhbGxiYWNrRm4pID0+IGNhbGxiYWNrRm4ocHJvcGVydGllcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGlzdGVuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49ZnVuY3Rpb24gbm9vcCgpIHt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbGlzdGVuKG5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgQVRUUklCVVRFOiAnYXR0cmlidXRlJyxcbiAgICBSRU9SREVSOiAncmVvcmRlcidcbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLnNoYXBlcyAgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ3NoYXBlcycsIHRydWUpO1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ2hhbmRsZXMnLCB0cnVlKVxuICAgIH1cblxufSIsImltcG9ydCB1dGlsaXR5IGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIG9iamVjdFxuICogQHN1Ym1vZHVsZSBJbnRlcmZhY2VcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L29iamVjdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmZhY2Uge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoeyB4OiB2YWx1ZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKHsgeTogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB6XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHoodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHo6IHZhbHVlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgd2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IHdpZHRoOiB2YWx1ZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBoZWlnaHQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cih7IGhlaWdodDogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYXR0cihhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlBdHRyaWJ1dGVzKHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlOiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlXWA7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgb2JqZWN0XG4gKiBAc3VibW9kdWxlIFJlZ2lzdHJ5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cnkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1JlZ2lzdHJ5fVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5jcmVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGluY3JlbWVudChwcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLnNldChwcm9wZXJ0eSwgcGFyc2VJbnQodGhpcy5nZXQocHJvcGVydHkpKSArIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlY3JlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBkZWNyZW1lbnQocHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5zZXQocHJvcGVydHksIHBhcnNlSW50KHRoaXMuZ2V0KHByb3BlcnR5KSkgLSAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGdldChwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFV0aWxpdHlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG52YXIgdXRpbGl0eSA9IChmdW5jdGlvbigpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0aHJvd0V4Y2VwdGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhyb3dFeGNlcHRpb246IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICB0aHJvdyBgQmx1ZXByaW50LmpzOiAke21lc3NhZ2V9LmA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0cmFuc2Zvcm1BdHRyaWJ1dGVzOiAoYXR0cmlidXRlcykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSksXG4gICAgICAgICAgICAgICAgICAgIHggICAgID0gcGFyc2VJbnQobWF0Y2hbMV0pLFxuICAgICAgICAgICAgICAgICAgICB5ICAgICA9IHBhcnNlSW50KG1hdGNoWzJdKTtcblxuICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmIF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIHkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oeCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHVzaW5nIHRoZSBgdHJhbnNmb3JtOiB0cmFuc2xhdGUoeCwgeSlgIGZvcm1hdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGNhbWVsaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgY2FtZWxpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBFdmVudHMgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsICAgICA9IGxhYmVsO1xuICAgICAgICB0aGlzLmludGVyZmFjZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0T3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlICAgID0gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICAgICAgICAgIHZhciBzZXRBdHRyaWJ1dGVzID0gdGhpcy5zZXRBdHRyaWJ1dGVzLmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBhcHBseUF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLmFwcGx5QXR0cmlidXRlcyA9IGZ1bmN0aW9uIGFwcGx5QXR0cmlidXRlcyhhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgICAgICAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZE1ldGhvZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSB8fCB7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB1dGlsaXR5LnRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueikpIHtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZGV2ZWxvcGVyIHNwZWNpZmllcyB0aGUgYHpgIGF0dHJpYnV0ZSwgaXQgYWN0dWFsbHkgcGVydGFpbnMgdG8gdGhlIGdyb3VwXG4gICAgICAgICAgICAvLyBlbGVtZW50IHRoYXQgdGhlIHNoYXBlIGlzIGEgY2hpbGQgb2YuIFdlJ2xsIHRoZXJlZm9yZSBuZWVkIHRvIHJlbW92ZSB0aGUgYHpgIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBgYXR0cmlidXRlc2Agb2JqZWN0LCBhbmQgaW5zdGVhZCBhcHBseSBpdCB0byB0aGUgc2hhcGUncyBncm91cCBlbGVtZW50LlxuICAgICAgICAgICAgLy8gQWZ0ZXJ3YXJkcyB3ZSdsbCBuZWVkIHRvIGJyb2FkY2FzdCBhbiBldmVudCB0byByZW9yZGVyIHRoZSBlbGVtZW50cyB1c2luZyBEMydzIG1hZ2ljYWxcbiAgICAgICAgICAgIC8vIGBzb3J0YCBtZXRob2QuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIGdyb3VwLmRhdHVtKHsgejogYXR0cmlidXRlcy56IH0pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuejtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU9SREVSKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdHVtKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXR0cih0aGlzLmVsZW1lbnQuZGF0dW0oKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdGhpcy5hZGRBdHRyaWJ1dGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzID0ge31cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpc3BhdGNoQXR0cmlidXRlRXZlbnQocHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIHByb3BlcnRpZXMuZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAsIHo6IDUgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogKHZhbHVlKSA9PiB0aGlzLnNldEF0dHJpYnV0ZXMoeyBmaWxsOiB2YWx1ZSB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
