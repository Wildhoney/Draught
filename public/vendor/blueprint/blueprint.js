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
        this.registry.set("z-index-max", 0);

        // Apply our event listeners.
        this.dispatcher.listen(Events.REORDER, function () {

            var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");

            var _layers$reorder = _this.layers.reorder(groups);

            var min = _layers$reorder.min;
            var max = _layers$reorder.max;

            _this.registry.set("z-index-min", min);
            _this.registry.set("z-index-max", max);
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
                    element = group.append("g").attr(this.options.dataAttribute, shape.label).append(shape.getTag()),
                    zIndex = { z: this.registry.increment("z-index-max") };

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
        register: {

            /**
             * @method register
             * @param {String} name
             * @param {Shape} shape
             * @return {void}
             */

            value: function register(name, shape) {
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
                return { dataAttribute: "data-id" };
            },
            writable: true,
            configurable: true
        }
    });

    return Blueprint;
})();

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
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

                var min = 1,
                    max = 1;

                groups.sort(function (a, b) {

                    if (a.z > max) {
                        max = a.z;
                    }
                    if (b.z > max) {
                        max = b.z;
                    }
                    if (a.z < min) {
                        min = a.z;
                    }
                    if (b.z < min) {
                        min = b.z;
                    }

                    return a.z - b.z;
                });

                return { min: min, max: max };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0V2ZW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0xheWVycy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLHlCQUF5Qjs7SUFDekMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsUUFBUSwyQkFBUSx1QkFBdUI7Ozs7SUFHdkMsU0FBUywyQkFBTyw2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QUFTO0FBTTFCLGNBQU07Ozs7Ozs7bUJBQUEsa0JBQUc7QUFDTCx1QkFBTyxNQUFNLENBQUM7YUFDakI7Ozs7QUFNRCxxQkFBYTs7Ozs7OzttQkFBQSx5QkFBRztBQUNaLHVCQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDbEU7Ozs7QUFNRCxrQkFBVTs7Ozs7OzttQkFBQSxzQkFBRzs7O0FBRVQsdUJBQU87QUFDSCx3QkFBSSxFQUFFLFVBQUMsS0FBSzsrQkFBSyxNQUFLLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztxQkFBQTtpQkFDdkQsQ0FBQTthQUVKOzs7Ozs7V0E1QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IExheWVycyAgICAgZnJvbSAnLi9oZWxwZXJzL0xheWVycy5qcyc7XG5pbXBvcnQgUmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QoZWxlbWVudCkuYXR0cignd2lkdGgnLCAnMTAwJScpLmF0dHIoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ICAgPSBuZXcgUmVnaXN0cnkoKTtcbiAgICAgICAgdGhpcy5sYXllcnMgICAgID0gbmV3IExheWVycygpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIHRoaXMubGFiZWwgICAgICA9IF8udW5pcXVlSWQoJ0JQJyk7XG5cbiAgICAgICAgLy8gUmVnaXN0ZXIgb3VyIGRlZmF1bHQgY29tcG9uZW50cy5cbiAgICAgICAgdGhpcy5tYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZXQgdGhlIGVzc2VudGlhbCByZWdpc3RyeSBpdGVtcy5cbiAgICAgICAgdGhpcy5yZWdpc3RyeS5zZXQoJ3otaW5kZXgtbWF4JywgMCk7XG5cbiAgICAgICAgLy8gQXBwbHkgb3VyIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgZ3JvdXBzICAgICAgID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHZhciB7IG1pbiwgbWF4IH0gPSB0aGlzLmxheWVycy5yZW9yZGVyKGdyb3Vwcyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuc2V0KCd6LWluZGV4LW1pbicsIG1pbik7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdHJ5LnNldCgnei1pbmRleC1tYXgnLCBtYXgpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIHZhciBzaGFwZSAgID0gdGhpcy5uZXcobmFtZSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLFxuICAgICAgICAgICAgZWxlbWVudCA9IGdyb3VwLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKS5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5yZWdpc3RyeS5pbmNyZW1lbnQoJ3otaW5kZXgtbWF4JykgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cC5cbiAgICAgICAgc2hhcGUuYWRkRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKHNoYXBlKSB7XG4gICAgICAgIHNoYXBlLnJlbW92ZSgpO1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnNoYXBlcy5pbmRleE9mKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge1NoYXBlW119XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZXMubWFwKChzaGFwZSkgPT4gc2hhcGUuaW50ZXJmYWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBuZXdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIG5ldyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSh0aGlzLmxhYmVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlZ2lzdGVyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXIobmFtZSwgc2hhcGUpIHtcbiAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSBzaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4geyBkYXRhQXR0cmlidXRlOiAnZGF0YS1pZCcgfTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiBjYWxsYmFja0ZuKHByb3BlcnRpZXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuPWZ1bmN0aW9uIG5vb3AoKSB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgUkVPUkRFUjogJ3Jlb3JkZXInXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSlcbiAgICB9XG5cbn0iLCJpbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKHsgeDogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cih7IHk6IHZhbHVlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyB6OiB2YWx1ZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyB3aWR0aDogdmFsdWUgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoeyBoZWlnaHQ6IHZhbHVlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0clxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHIoYXR0cmlidXRlcyA9IHt9KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh1dGlsaXR5LmtlYmFiaWZ5S2V5cyhhdHRyaWJ1dGVzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2U6ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2VdYDtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgTGF5ZXJzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXJzIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3Vwcykge1xuXG4gICAgICAgIHZhciBtaW4gPSAxLCBtYXggPSAxO1xuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhLnogPiBtYXgpIHsgbWF4ID0gYS56IH1cbiAgICAgICAgICAgIGlmIChiLnogPiBtYXgpIHsgbWF4ID0gYi56IH1cbiAgICAgICAgICAgIGlmIChhLnogPCBtaW4pIHsgbWluID0gYS56IH1cbiAgICAgICAgICAgIGlmIChiLnogPCBtaW4pIHsgbWluID0gYi56IH1cblxuICAgICAgICAgICAgcmV0dXJuIGEueiAtIGIuejtcblxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyBtaW46IG1pbiwgbWF4OiBtYXggfTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgUmVnaXN0cnlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L29iamVjdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVnaXN0cnl9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllcyA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0KHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbmNyZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgaW5jcmVtZW50KHByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMuc2V0KHByb3BlcnR5LCBwYXJzZUludCh0aGlzLmdldChwcm9wZXJ0eSkpICsgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVjcmVtZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGRlY3JlbWVudChwcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLnNldChwcm9wZXJ0eSwgcGFyc2VJbnQodGhpcy5nZXQocHJvcGVydHkpKSAtIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgZ2V0KHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgVXRpbGl0eVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbnZhciB1dGlsaXR5ID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRocm93RXhjZXB0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aHJvd0V4Y2VwdGlvbjogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIHRocm93IGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uYDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0cmFuc2Zvcm1BdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRyYW5zZm9ybUF0dHJpYnV0ZXM6IChhdHRyaWJ1dGVzKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnRyYW5zZm9ybSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gYXR0cmlidXRlcy50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKS9pKSxcbiAgICAgICAgICAgICAgICAgICAgeCAgICAgPSBwYXJzZUludChtYXRjaFsxXSksXG4gICAgICAgICAgICAgICAgICAgIHkgICAgID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgeSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybSh4LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgdXNpbmcgdGhlIGB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh4LCB5KWAgZm9ybWF0IGluc3RlYWQuXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCByZXRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpIHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnkgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMudHJhbnNmb3JtO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LmNhbWVsaWZ5S2V5cyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHBvaW50c1RvVHJhbnNmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHBvaW50c1RvVHJhbnNmb3JtKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCAke3l9KWAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBrZWJhYmlmeUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGtlYmFiaWZ5S2V5cyhtb2RlbCkge1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRNb2RlbCA9IHt9O1xuXG4gICAgICAgICAgICBfLmZvckluKG1vZGVsLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTW9kZWxbXy5rZWJhYkNhc2Uoa2V5KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGNhbWVsaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgY2FtZWxpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmNhbWVsQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBFdmVudHMgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsICAgICA9IGxhYmVsO1xuICAgICAgICB0aGlzLmludGVyZmFjZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0T3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlICAgID0gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICAgICAgICAgIHZhciBzZXRBdHRyaWJ1dGVzID0gdGhpcy5zZXRBdHRyaWJ1dGVzLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgZWxlbWVudCAgICAgICA9IHRoaXMuZWxlbWVudDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIHNldFxuICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2Uuc2V0ID0gZnVuY3Rpb24gc2V0KGF0dHJpYnV0ZXMgPSB7fSkge1xuICAgICAgICAgICAgICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZ2V0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLmdldCA9IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgekluZGV4ID0geyB6OiBkMy5zZWxlY3QoZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSkuZGF0dW0oKS56IH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsICA9IF8uYXNzaWduKGVsZW1lbnQuZGF0dW0oKSwgekluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5yZXRyYW5zZm9ybUF0dHJpYnV0ZXMobW9kZWwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZE1ldGhvZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSB8fCB7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB1dGlsaXR5LnRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueikpIHtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZGV2ZWxvcGVyIHNwZWNpZmllcyB0aGUgYHpgIGF0dHJpYnV0ZSwgaXQgYWN0dWFsbHkgcGVydGFpbnMgdG8gdGhlIGdyb3VwXG4gICAgICAgICAgICAvLyBlbGVtZW50IHRoYXQgdGhlIHNoYXBlIGlzIGEgY2hpbGQgb2YuIFdlJ2xsIHRoZXJlZm9yZSBuZWVkIHRvIHJlbW92ZSB0aGUgYHpgIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBgYXR0cmlidXRlc2Agb2JqZWN0LCBhbmQgaW5zdGVhZCBhcHBseSBpdCB0byB0aGUgc2hhcGUncyBncm91cCBlbGVtZW50LlxuICAgICAgICAgICAgLy8gQWZ0ZXJ3YXJkcyB3ZSdsbCBuZWVkIHRvIGJyb2FkY2FzdCBhbiBldmVudCB0byByZW9yZGVyIHRoZSBlbGVtZW50cyB1c2luZyBEMydzIG1hZ2ljYWxcbiAgICAgICAgICAgIC8vIGBzb3J0YCBtZXRob2QuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIGdyb3VwLmRhdHVtKHsgejogYXR0cmlidXRlcy56IH0pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuejtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU9SREVSKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdHVtKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXR0cih0aGlzLmVsZW1lbnQuZGF0dW0oKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdGhpcy5hZGRBdHRyaWJ1dGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzID0ge31cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpc3BhdGNoQXR0cmlidXRlRXZlbnQocHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIHByb3BlcnRpZXMuZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogKHZhbHVlKSA9PiB0aGlzLnNldEF0dHJpYnV0ZXMoeyBmaWxsOiB2YWx1ZSB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
