(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var Events = _interopRequire(require("./helpers/Events.js"));

var Layers = _interopRequire(require("./helpers/Layers.js"));

var Registry = _interopRequire(require("./helpers/Registry.js"));

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
        var _this = this;

        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.element = d3.select(element).attr("width", "100%").attr("height", "100%");
        this.shapes = [];
        this.options = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
        this.registry = new Registry();
        this.layers = new Layers();
        this.groups = new Groups(this.element);
        this.label = _.uniqueId("BP");

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Set the essential registry items.
        this.registry.set("z-index", 0);

        // Apply our event listeners.
        this.dispatcher.listen(Events.REORDER, function () {
            var groups = _this.element.selectAll("g[" + DATA_ATTRIBUTE + "]");
            _this.registry.set("z-index", _this.layers.reorder(groups));
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

                var shape = this["new"](name),
                    group = this.groups.shapes,
                    element = group.append("g").attr(DATA_ATTRIBUTE, shape.label).append(shape.getTag()),
                    zIndex = { z: this.registry.increment("z-index") };

                // Set all of the essential objects that the shape requires.
                shape.setOptions(this.options);
                shape.setDispatcher(this.dispatcher);
                shape.setElement(element);
                shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

                // Last chance to define any further elements for the group.
                shape.addElements(element);

                // Create a mapping from the actual shape object, to the interface object that the developer
                // interacts with.
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

},{"./helpers/Dispatcher.js":2,"./helpers/Events.js":3,"./helpers/Groups.js":4,"./helpers/Layers.js":6,"./helpers/Registry.js":7,"./shapes/types/Rectangle.js":10}],2:[function(require,module,exports){
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
                return this.setAttr({ x: value });
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
                return this.setAttr({ y: value });
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
                return this.setAttr({ z: value });
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
                return this.setAttr({ width: value });
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
                return this.setAttr({ height: value });
            },
            writable: true,
            configurable: true
        },
        setAttr: {

            /**
             * @method setAttr
             * @param {Object} attributes
             * @return {Interface}
             */

            value: function setAttr() {
                var attributes = arguments[0] === undefined ? {} : arguments[0];

                return this.set(utility.kebabifyKeys(attributes));
            },
            writable: true,
            configurable: true
        },
        getAttr: {

            /**
             * @method getAttr
             * @return {Object}
             */

            value: function getAttr() {
                return this.get();
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

},{"./../helpers/Utility.js":8}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Layers
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Layers = (function () {
    function Layers() {
        _classCallCheck(this, Layers);
    }

    _prototypeProperties(Layers, null, {
        reorder: {

            /**
             * @method reorder
             * @param {Array} groups
             * @return {Object}
             */

            value: function reorder(groups) {

                var max = 1;

                groups.sort(function (a, b) {

                    if (a.z > max) {
                        max = a.z;
                    }
                    if (b.z > max) {
                        max = b.z;
                    }

                    return a.z - b.z;
                });

                return max;
            },
            writable: true,
            configurable: true
        }
    });

    return Layers;
})();

module.exports = Layers;

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
         * @method retransformAttributes
         * @param {Object} attributes
         * @return {Object}
         */
        retransformAttributes: function retransformAttributes(attributes) {

            if (attributes.transform) {

                var match = attributes.transform.match(/(\d+)\s*,\s*(\d+)/i);
                attributes.x = parseInt(match[1]);
                attributes.y = parseInt(match[2]);
                delete attributes.transform;
            }

            return utility.camelifyKeys(attributes);
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
         * @method kebabifyKeys
         * @param {Object} model
         * @return {Object}
         */
        kebabifyKeys: function kebabifyKeys(model) {

            var transformedModel = {};

            _.forIn(model, function (value, key) {
                transformedModel[_.kebabCase(key)] = value;
            });

            return transformedModel;
        },

        /**
         * @method camelifyKeys
         * @param {Object} model
         * @return {Object}
         */
        camelifyKeys: function camelifyKeys(model) {

            var transformedModel = {};

            _.forIn(model, function (value, key) {
                transformedModel[_.camelCase(key)] = value;
            });

            return transformedModel;
        }

    };
})();

module.exports = utility;

},{}],9:[function(require,module,exports){
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
                    var setAttributes = this.setAttributes.bind(this),
                        element = this.element;

                    /**
                     * @method set
                     * @param {Object} attributes
                     * @return {Interface}
                     */
                    this["interface"].set = function set() {
                        var attributes = arguments[0] === undefined ? {} : arguments[0];

                        setAttributes(attributes);
                        return this;
                    };

                    /**
                     * @method get
                     * @return {Object}
                     */
                    this["interface"].get = function get() {
                        var zIndex = { z: d3.select(element.node().parentNode).datum().z },
                            model = _.assign(element.datum(), zIndex);
                        return utility.retransformAttributes(model);
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

},{"./../helpers/Events.js":3,"./../helpers/Interface.js":5,"./../helpers/Utility.js":8}],10:[function(require,module,exports){
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
                return { fill: "red", width: 100, height: 100, x: 100, y: 20 };
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

},{"./../Shape.js":9}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0V2ZW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0xheWVycy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLHlCQUF5Qjs7SUFDekMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsUUFBUSwyQkFBUSx1QkFBdUI7Ozs7SUFHdkMsU0FBUywyQkFBTyw2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V0E1QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IExheWVycyAgICAgZnJvbSAnLi9oZWxwZXJzL0xheWVycy5qcyc7XG5pbXBvcnQgUmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBjb25zdGFudCBEQVRBX0FUVFJJQlVURVxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuY29uc3QgREFUQV9BVFRSSUJVVEUgPSAnZGF0YS1pZCc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCAgICA9IGQzLnNlbGVjdChlbGVtZW50KS5hdHRyKCd3aWR0aCcsICcxMDAlJykuYXR0cignaGVpZ2h0JywgJzEwMCUnKTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9IF8uYXNzaWduKHRoaXMuZGVmYXVsdE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMucmVnaXN0cnkgICA9IG5ldyBSZWdpc3RyeSgpO1xuICAgICAgICB0aGlzLmxheWVycyAgICAgPSBuZXcgTGF5ZXJzKCk7XG4gICAgICAgIHRoaXMuZ3JvdXBzICAgICA9IG5ldyBHcm91cHModGhpcy5lbGVtZW50KTtcbiAgICAgICAgdGhpcy5sYWJlbCAgICAgID0gXy51bmlxdWVJZCgnQlAnKTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgZXNzZW50aWFsIHJlZ2lzdHJ5IGl0ZW1zLlxuICAgICAgICB0aGlzLnJlZ2lzdHJ5LnNldCgnei1pbmRleCcsIDApO1xuXG4gICAgICAgIC8vIEFwcGx5IG91ciBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFT1JERVIsICgpID0+IHtcbiAgICAgICAgICAgIHZhciBncm91cHMgPSB0aGlzLmVsZW1lbnQuc2VsZWN0QWxsKGBnWyR7REFUQV9BVFRSSUJVVEV9XWApO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RyeS5zZXQoJ3otaW5kZXgnLCB0aGlzLmxheWVycy5yZW9yZGVyKGdyb3VwcykpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICB2YXIgc2hhcGUgICA9IHRoaXMubmV3KG5hbWUpLFxuICAgICAgICAgICAgZ3JvdXAgICA9IHRoaXMuZ3JvdXBzLnNoYXBlcyxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoJ2cnKS5hdHRyKERBVEFfQVRUUklCVVRFLCBzaGFwZS5sYWJlbCkuYXBwZW5kKHNoYXBlLmdldFRhZygpKSxcbiAgICAgICAgICAgIHpJbmRleCAgPSB7IHo6IHRoaXMucmVnaXN0cnkuaW5jcmVtZW50KCd6LWluZGV4JykgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cC5cbiAgICAgICAgc2hhcGUuYWRkRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG4gICAgICAgIHNoYXBlLnJlbW92ZSgpO1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnNoYXBlcy5pbmRleE9mKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge1NoYXBlW119XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZXMubWFwKChzaGFwZSkgPT4gc2hhcGUuaW50ZXJmYWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBuZXdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIG5ldyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSh0aGlzLmxhYmVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlZ2lzdGVyQ29tcG9uZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXJDb21wb25lbnQobmFtZSwgc2hhcGUpIHtcbiAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSBzaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiBjYWxsYmFja0ZuKHByb3BlcnRpZXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuPWZ1bmN0aW9uIG5vb3AoKSB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgUkVPUkRFUjogJ3Jlb3JkZXInXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSlcbiAgICB9XG5cbn0iLCJpbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKHsgeDogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cih7IHk6IHZhbHVlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyB6OiB2YWx1ZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyB3aWR0aDogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyBoZWlnaHQ6IHZhbHVlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0clxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHIoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh1dGlsaXR5LmtlYmFiaWZ5S2V5cyhhdHRyaWJ1dGVzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2U6ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2VdYDtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgTGF5ZXJzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXJzIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3Vwcykge1xuXG4gICAgICAgIHZhciBtYXggPSAxO1xuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhLnogPiBtYXgpIHsgbWF4ID0gYS56IH1cbiAgICAgICAgICAgIGlmIChiLnogPiBtYXgpIHsgbWF4ID0gYi56IH1cblxuICAgICAgICAgICAgcmV0dXJuIGEueiAtIGIuejtcblxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWF4O1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIG9iamVjdFxuICogQHN1Ym1vZHVsZSBSZWdpc3RyeVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZ2lzdHJ5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtSZWdpc3RyeX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXQocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGluY3JlbWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBpbmNyZW1lbnQocHJvcGVydHkpIHtcbiAgICAgICAgdGhpcy5zZXQocHJvcGVydHksIHBhcnNlSW50KHRoaXMuZ2V0KHByb3BlcnR5KSkgKyAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWNyZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZGVjcmVtZW50KHByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMuc2V0KHByb3BlcnR5LCBwYXJzZUludCh0aGlzLmdldChwcm9wZXJ0eSkpIC0gMSk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBnZXQocHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBVdGlsaXR5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCJpbXBvcnQgSW50ZXJmYWNlIGZyb20gJy4vLi4vaGVscGVycy9JbnRlcmZhY2UuanMnO1xuaW1wb3J0IEV2ZW50cyAgICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgICA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgICAgID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGdldEludGVyZmFjZSgpIHtcblxuICAgICAgICBpZiAodGhpcy5pbnRlcmZhY2UgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgICAgPSBuZXcgSW50ZXJmYWNlKHRoaXMubGFiZWwpO1xuICAgICAgICAgICAgdmFyIHNldEF0dHJpYnV0ZXMgPSB0aGlzLnNldEF0dHJpYnV0ZXMuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBlbGVtZW50ICAgICAgID0gdGhpcy5lbGVtZW50O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2Qgc2V0XG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZS5zZXQgPSBmdW5jdGlvbiBzZXQoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgICAgICAgICAgc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBnZXRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UuZ2V0ID0gZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgICAgIHZhciB6SW5kZXggPSB7IHo6IGQzLnNlbGVjdChlbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKS5kYXR1bSgpLnogfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgID0gXy5hc3NpZ24oZWxlbWVudC5kYXR1bSgpLCB6SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LnJldHJhbnNmb3JtQXR0cmlidXRlcyhtb2RlbCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkTWV0aG9kcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IF8uYXNzaWduKHRoaXMuaW50ZXJmYWNlLCB0aGlzLmFkZE1ldGhvZHMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50cyhlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaXNwYXRjaEF0dHJpYnV0ZUV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgPSB7fVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudChwcm9wZXJ0aWVzID0ge30pIHtcbiAgICAgICAgcHJvcGVydGllcy5lbGVtZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICB2YXIgdGFnID0gdGhpcy5nZXRUYWcoKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuZ2V0VGFnKCkuc2xpY2UoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ306ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ31dYDtcblxuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuLy4uL1NoYXBlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkTWV0aG9kc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRNZXRob2RzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiAodmFsdWUpID0+IHRoaXMuc2V0QXR0cmlidXRlcyh7IGZpbGw6IHZhbHVlIH0pXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
