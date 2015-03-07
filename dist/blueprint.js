(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var Events = _interopRequire(require("./helpers/Events.js"));

var ZIndex = _interopRequire(require("./helpers/ZIndex.js"));

var Registry = _interopRequire(require("./helpers/Registry.js"));

var Constants = _interopRequire(require("./helpers/Constants.js"));

var utility = _interopRequire(require("./helpers/Utility.js"));

// Shapes.

var Shape = _interopRequire(require("./shapes/Shape.js"));

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
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.options = _.assign(this.defaultOptions(), options);
        this.element = d3.select(element).attr("width", this.options.documentWidth).attr("height", this.options.documentHeight);
        this.shapes = [];
        this.index = 1;

        // Helpers required by Blueprint and the rest of the system.
        this.dispatcher = new Dispatcher();
        this.registry = new Registry();
        this.zIndex = new ZIndex();
        this.groups = new Groups().addTo(this.element);

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Set the essential registry items.
        this.registry.set(Constants.REGISTRY.ZINDEX_MAX, 0);
        this.addEventListeners();
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
                    zIndex = { z: this.registry.incr(Constants.REGISTRY.ZINDEX_MAX) };

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
             * @param {Interface} model
             * @return {Array}
             */

            value: function remove(model) {

                var index = 0,
                    item = _.find(this.shapes, function (shape, i) {

                    if (shape["interface"] === model) {
                        index = i;
                        return model;
                    }
                });

                item.shape.element.remove();
                this.shapes.splice(index, 1);
                return this.all();
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
                return this.shapes.map(function (model) {
                    return model["interface"];
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
        ident: {

            /**
             * @method ident
             * @return {String}
             */

            value: function ident() {
                return ["BP", this.index++].join("");
            },
            writable: true,
            configurable: true
        },
        register: {

            /**
             * @method register
             * @param {String} name
             * @param {Shape} shape
             * @param {Boolean} [overwrite=false]
             * @return {void}
             */

            value: function register(name, shape) {
                var overwrite = arguments[2] === undefined ? false : arguments[2];

                // Ensure the shape is a valid instance.
                utility.assert(Object.getPrototypeOf(shape) === Shape, "Custom shape must be an instance of `Shape`", "Instance of Shape");

                if (!overwrite && this.map.hasOwnProperty(name)) {

                    // Existing shapes cannot be overwritten.
                    utility.throwException("Refusing to overwrite existing " + name + " shape without explicit overwrite", "Overwriting Existing Shapes");
                }

                this.map[name] = shape;
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
                return new (this.map[name.toLowerCase()])(this.ident());
            },
            writable: true,
            configurable: true
        },
        addEventListeners: {

            /**
             * @method addEventListeners
             * @return {void}
             */

            value: function addEventListeners() {
                var _this = this;

                // Apply our event listeners.
                this.dispatcher.listen(Events.REORDER, function () {

                    var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");

                    var _zIndex$reorder = _this.zIndex.reorder(groups);

                    var min = _zIndex$reorder.min;
                    var max = _zIndex$reorder.max;

                    _this.registry.set(Constants.REGISTRY.ZINDEX_MIN, min);
                    _this.registry.set(Constants.REGISTRY.ZINDEX_MAX, max);
                });

                this.dispatcher.listen(Events.REMOVE, function (model) {
                    _this.remove(model["interface"]);
                });
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

                return {
                    dataAttribute: "data-id",
                    documentHeight: "100%",
                    documentWidth: "100%"
                };
            },
            writable: true,
            configurable: true
        },
        getShapePrototype: {

            /**
             * @method getShapePrototype
             * @return {Shape}
             */

            value: function getShapePrototype() {
                return Shape;
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

},{"./helpers/Constants.js":2,"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Registry.js":7,"./helpers/Utility.js":8,"./helpers/ZIndex.js":9,"./shapes/Shape.js":10,"./shapes/types/Rectangle.js":11}],2:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Constants
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
module.exports = {

  /**
   * @constant REGISTRY
   * @type {Object}
   */
  REGISTRY: {
    ZINDEX_MIN: "z-index-min",
    ZINDEX_MAX: "z-index-max"
  },

  /**
   * Direct link to elucidating common exception messages.
   *
   * @constant EXCEPTIONS_URL
   * @type {String}
   */
  EXCEPTIONS_URL: "https://github.com/Wildhoney/Blueprint/blob/master/EXCEPTIONS.md#{title}"

};

},{}],3:[function(require,module,exports){
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
             * @param {Function} [fn=() => {}]
             * @return {void}
             */

            value: function send(name) {
                var properties = arguments[1] === undefined ? {} : arguments[1];
                var fn = arguments[2] === undefined ? null : arguments[2];

                _.forEach(this.events[name], function (callbackFn) {

                    var result = callbackFn(properties);

                    if (_.isFunction(fn)) {

                        // Event dispatcher's two-way communication via events.
                        fn(result);
                    }
                });
            },
            writable: true,
            configurable: true
        },
        listen: {

            /**
             * @method listen
             * @param {String} name
             * @param {Function} [fn=() => {}]
             * @return {void}
             */

            value: function listen(name) {
                var fn = arguments[1] === undefined ? function () {} : arguments[1];

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

},{}],4:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Events
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
module.exports = {
  ATTRIBUTE: "attribute",
  ATTRIBUTE_GET_ALL: "attribute-get-all",
  ATTRIBUTE_SET: "attribute-set",
  REORDER: "reorder",
  REMOVE: "remove"
};

},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Groups
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Groups = (function () {
  function Groups() {
    _classCallCheck(this, Groups);
  }

  _prototypeProperties(Groups, null, {
    addTo: {

      /**
       * @method addTo
       * @param {SVGElement} element
       * @return {Groups}
       */

      value: function addTo(element) {
        this.shapes = element.append("g").classed("shapes", true);
        this.handles = element.append("g").classed("handles", true);
        return this;
      },
      writable: true,
      configurable: true
    }
  });

  return Groups;
})();

module.exports = Groups;

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Events = _interopRequire(require("./../helpers/Events.js"));

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
        remove: {

            /**
             * @method remove
             * @return {void}
             */

            value: function remove() {

                this.dispatcher.send(Events.REMOVE, {
                    "interface": this
                });
            },
            writable: true,
            configurable: true
        },
        x: {

            /**
             * @method x
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function x(value) {
                return this.attr("x", value);
            },
            writable: true,
            configurable: true
        },
        y: {

            /**
             * @method y
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function y(value) {
                return this.attr("y", value);
            },
            writable: true,
            configurable: true
        },
        z: {

            /**
             * @method z
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function z(value) {
                return this.attr("z", value);
            },
            writable: true,
            configurable: true
        },
        width: {

            /**
             * @method width
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function width(value) {
                return this.attr("width", value);
            },
            writable: true,
            configurable: true
        },
        height: {

            /**
             * @method height
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function height(value) {
                return this.attr("height", value);
            },
            writable: true,
            configurable: true
        },
        attr: {

            /**
             * @property attr
             * @param {String} property
             * @param {*} value
             * @return {*|void}
             */

            value: function attr(property, value) {

                if (_.isUndefined(value)) {
                    return this.getAttr()[property];
                }

                var model = {};
                model[property] = value;
                return this.setAttr(model);
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

                this.dispatcher.send(Events.ATTRIBUTE_SET, {
                    attributes: utility.kebabifyKeys(attributes)
                });

                return this;
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

                var result = {};

                this.dispatcher.send(Events.ATTRIBUTE_GET_ALL, {}, function (response) {
                    result = response;
                });

                return result;
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

},{"./../helpers/Events.js":4,"./../helpers/Utility.js":8}],7:[function(require,module,exports){
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
    incr: {

      /**
       * @method incr
       * @param {String} property
       * @return {Number}
       */

      value: function incr(property) {
        this.set(property, parseInt(this.get(property)) + 1);
        return this.properties[property];
      },
      writable: true,
      configurable: true
    },
    decr: {

      /**
       * @method decr
       * @param {String} property
       * @return {Number}
       */

      value: function decr(property) {
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

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Constants = _interopRequire(require("./Constants.js"));

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
         * @param {String} [exceptionsTitle='']
         * @throws Exception
         * @return {void}
         */
        throwException: function (message) {
            var exceptionsTitle = arguments[1] === undefined ? "" : arguments[1];

            if (exceptionsTitle) {
                var link = Constants.EXCEPTIONS_URL.replace(/{(.+?)}/i, function () {
                    return _.kebabCase(exceptionsTitle);
                });
                throw "Blueprint.js: " + message + ". See: " + link;
            }

            throw "Blueprint.js: " + message + ".";
        },

        /**
         * @method assert
         * @param {Boolean} assertion
         * @param {String} message
         * @param {String} exceptionsTitle
         * @return {void}
         */
        assert: function assert(assertion, message, exceptionsTitle) {

            if (!assertion) {
                utility.throwException(message, exceptionsTitle);
            }
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

},{"./Constants.js":2}],9:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule ZIndex
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var ZIndex = (function () {
    function ZIndex() {
        _classCallCheck(this, ZIndex);
    }

    _prototypeProperties(ZIndex, null, {
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

    return ZIndex;
})();

module.exports = ZIndex;

},{}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../helpers/Interface.js"));

var Dispatcher = _interopRequire(require("./../helpers/Dispatcher.js"));

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
                var _this = this;

                if (this["interface"] === null) {

                    this["interface"] = new Interface(this.label);
                    var dispatcher = new Dispatcher();
                    this["interface"].setDispatcher(dispatcher);

                    /**
                     * @method getAttributes
                     * @return {Object}
                     */
                    var getAttributes = function () {

                        var zIndex = { z: d3.select(_this.element.node().parentNode).datum().z },
                            model = _.assign(_this.element.datum(), zIndex);
                        return utility.retransformAttributes(model);
                    };

                    // Listeners that hook up the interface and the shape object.
                    dispatcher.listen(Events.REMOVE, function (model) {
                        return _this.dispatcher.send(Events.REMOVE, model);
                    });
                    dispatcher.listen(Events.ATTRIBUTE_GET_ALL, getAttributes);
                    dispatcher.listen(Events.ATTRIBUTE_SET, function (model) {
                        _this.setAttributes(model.attributes);
                    });

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
             * @return {Object}
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

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Interface.js":6,"./../helpers/Utility.js":8}],11:[function(require,module,exports){
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

},{"./../Shape.js":10}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0ludGVyZmFjZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1pJbmRleC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FPLFVBQVUsMkJBQU0seUJBQXlCOztJQUN6QyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JD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Ozs7Ozs7O0lDWG5CLEtBQUssMkJBQU0sZUFBZTs7Ozs7Ozs7O0lBUVosU0FBUyxjQUFTLEtBQUs7YUFBdkIsU0FBUzs4QkFBVCxTQUFTOztZQUFTLEtBQUs7QUFBTCxpQkFBSzs7OztjQUF2QixTQUFTLEVBQVMsS0FBSzs7eUJBQXZCLFNBQVM7QUFNMUIsY0FBTTs7Ozs7OzttQkFBQSxrQkFBRztBQUNMLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNsRTs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHOzs7QUFFVCx1QkFBTztBQUNILHdCQUFJLEVBQUUsVUFBQyxLQUFLOytCQUFLLE1BQUssYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUFBO2lCQUN2RCxDQUFBO2FBRUo7Ozs7OztXQTVCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCBSZWdpc3RyeSAgIGZyb20gJy4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5pbXBvcnQgQ29uc3RhbnRzICBmcm9tICcuL2hlbHBlcnMvQ29uc3RhbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gU2hhcGVzLlxuaW1wb3J0IFNoYXBlICAgICAgZnJvbSAnLi9zaGFwZXMvU2hhcGUuanMnO1xuaW1wb3J0IFJlY3RhbmdsZSAgZnJvbSAnLi9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmNsYXNzIEJsdWVwcmludCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gXy5hc3NpZ24odGhpcy5kZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgID0gZDMuc2VsZWN0KGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy5vcHRpb25zLmRvY3VtZW50V2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudEhlaWdodCk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ICAgICAgPSAxO1xuXG4gICAgICAgIC8vIEhlbHBlcnMgcmVxdWlyZWQgYnkgQmx1ZXByaW50IGFuZCB0aGUgcmVzdCBvZiB0aGUgc3lzdGVtLlxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5ICAgPSBuZXcgUmVnaXN0cnkoKTtcbiAgICAgICAgdGhpcy56SW5kZXggICAgID0gbmV3IFpJbmRleCgpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKCkuYWRkVG8odGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgZXNzZW50aWFsIHJlZ2lzdHJ5IGl0ZW1zLlxuICAgICAgICB0aGlzLnJlZ2lzdHJ5LnNldChDb25zdGFudHMuUkVHSVNUUlkuWklOREVYX01BWCwgMCk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICB2YXIgc2hhcGUgICA9IHRoaXMubmV3KG5hbWUpLFxuICAgICAgICAgICAgZ3JvdXAgICA9IHRoaXMuZ3JvdXBzLnNoYXBlcyxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoJ2cnKS5hdHRyKHRoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlLCBzaGFwZS5sYWJlbCkuYXBwZW5kKHNoYXBlLmdldFRhZygpKSxcbiAgICAgICAgICAgIHpJbmRleCAgPSB7IHo6IHRoaXMucmVnaXN0cnkuaW5jcihDb25zdGFudHMuUkVHSVNUUlkuWklOREVYX01BWCkgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cC5cbiAgICAgICAgc2hhcGUuYWRkRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge0ludGVyZmFjZX0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICByZW1vdmUobW9kZWwpIHtcblxuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgaXRlbSAgPSBfLmZpbmQodGhpcy5zaGFwZXMsIChzaGFwZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc2hhcGUuaW50ZXJmYWNlID09PSBtb2RlbCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge1NoYXBlW119XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZXMubWFwKChtb2RlbCkgPT4gbW9kZWwuaW50ZXJmYWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpZGVudFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBpZGVudCgpIHtcbiAgICAgICAgcmV0dXJuIFsnQlAnLCB0aGlzLmluZGV4KytdLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3ZlcndyaXRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXIobmFtZSwgc2hhcGUsIG92ZXJ3cml0ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBzaGFwZSBpcyBhIHZhbGlkIGluc3RhbmNlLlxuICAgICAgICB1dGlsaXR5LmFzc2VydChPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc2hhcGUpID09PSBTaGFwZSwgJ0N1c3RvbSBzaGFwZSBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBTaGFwZWAnLCAnSW5zdGFuY2Ugb2YgU2hhcGUnKTtcblxuICAgICAgICBpZiAoIW92ZXJ3cml0ZSAmJiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuXG4gICAgICAgICAgICAvLyBFeGlzdGluZyBzaGFwZXMgY2Fubm90IGJlIG92ZXJ3cml0dGVuLlxuICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgUmVmdXNpbmcgdG8gb3ZlcndyaXRlIGV4aXN0aW5nICR7bmFtZX0gc2hhcGUgd2l0aG91dCBleHBsaWNpdCBvdmVyd3JpdGVgLCAnT3ZlcndyaXRpbmcgRXhpc3RpbmcgU2hhcGVzJyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG5ld1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgbmV3KG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKHRoaXMuaWRlbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG5cbiAgICAgICAgLy8gQXBwbHkgb3VyIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgZ3JvdXBzICAgICAgID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHZhciB7IG1pbiwgbWF4IH0gPSB0aGlzLnpJbmRleC5yZW9yZGVyKGdyb3Vwcyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuc2V0KENvbnN0YW50cy5SRUdJU1RSWS5aSU5ERVhfTUlOLCBtaW4pO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RyeS5zZXQoQ29uc3RhbnRzLlJFR0lTVFJZLlpJTkRFWF9NQVgsIG1heCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVNT1ZFLCAobW9kZWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKG1vZGVsLmludGVyZmFjZSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YUF0dHJpYnV0ZTogJ2RhdGEtaWQnLFxuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJ1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0YW50IFJFR0lTVFJZXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBSRUdJU1RSWToge1xuICAgICAgICBaSU5ERVhfTUlOOiAnei1pbmRleC1taW4nLFxuICAgICAgICBaSU5ERVhfTUFYOiAnei1pbmRleC1tYXgnXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpcmVjdCBsaW5rIHRvIGVsdWNpZGF0aW5nIGNvbW1vbiBleGNlcHRpb24gbWVzc2FnZXMuXG4gICAgICpcbiAgICAgKiBAY29uc3RhbnQgRVhDRVBUSU9OU19VUkxcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIEVYQ0VQVElPTlNfVVJMOiAnaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnQvYmxvYi9tYXN0ZXIvRVhDRVBUSU9OUy5tZCN7dGl0bGV9J1xuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuPSgpID0+IHt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VuZChuYW1lLCBwcm9wZXJ0aWVzID0ge30sIGZuID0gbnVsbCkge1xuXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmV2ZW50c1tuYW1lXSwgKGNhbGxiYWNrRm4pID0+IHtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrRm4ocHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZm4pKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBFdmVudCBkaXNwYXRjaGVyJ3MgdHdvLXdheSBjb21tdW5pY2F0aW9uIHZpYSBldmVudHMuXG4gICAgICAgICAgICAgICAgZm4ocmVzdWx0KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBsaXN0ZW5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbj0oKSA9PiB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbiA9ICgpID0+IHt9KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgQVRUUklCVVRFOiAnYXR0cmlidXRlJyxcbiAgICBBVFRSSUJVVEVfR0VUX0FMTDogJ2F0dHJpYnV0ZS1nZXQtYWxsJyxcbiAgICBBVFRSSUJVVEVfU0VUOiAnYXR0cmlidXRlLXNldCcsXG4gICAgUkVPUkRFUjogJ3Jlb3JkZXInLFxuICAgIFJFTU9WRTogJ3JlbW92ZSdcbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFRvXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7R3JvdXBzfVxuICAgICAqL1xuICAgIGFkZFRvKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxufSIsImltcG9ydCBFdmVudHMgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgb2JqZWN0XG4gKiBAc3VibW9kdWxlIEludGVyZmFjZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCB7XG4gICAgICAgICAgICAnaW50ZXJmYWNlJzogdGhpc1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneScsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgd2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignd2lkdGgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hlaWdodCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHsqfHZvaWR9XG4gICAgICovXG4gICAgYXR0cihwcm9wZXJ0eSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbW9kZWwgICAgICAgPSB7fTtcbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIobW9kZWwpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgc2V0QXR0cihhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX1NFVCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdXRpbGl0eS5rZWJhYmlmeUtleXMoYXR0cmlidXRlcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cigpIHtcblxuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCB7fSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZV1gO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIG9iamVjdFxuICogQHN1Ym1vZHVsZSBSZWdpc3RyeVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZ2lzdHJ5IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtSZWdpc3RyeX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXQocHJvcGVydHksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGluY3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgaW5jcihwcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLnNldChwcm9wZXJ0eSwgcGFyc2VJbnQodGhpcy5nZXQocHJvcGVydHkpKSArIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlY3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZGVjcihwcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLnNldChwcm9wZXJ0eSwgcGFyc2VJbnQodGhpcy5nZXQocHJvcGVydHkpKSAtIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgZ2V0KHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxufSIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFV0aWxpdHlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG52YXIgdXRpbGl0eSA9IChmdW5jdGlvbigpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0aHJvd0V4Y2VwdGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2V4Y2VwdGlvbnNUaXRsZT0nJ11cbiAgICAgICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKGV4Y2VwdGlvbnNUaXRsZSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rID0gQ29uc3RhbnRzLkVYQ0VQVElPTlNfVVJMLnJlcGxhY2UoL3soLis/KX0vaSwgKCkgPT4gXy5rZWJhYkNhc2UoZXhjZXB0aW9uc1RpdGxlKSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYXNzZXJ0XG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNzZXJ0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBleGNlcHRpb25zVGl0bGVcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGFzc2VydChhc3NlcnRpb24sIG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSkge1xuXG4gICAgICAgICAgICBpZiAoIWFzc2VydGlvbikge1xuICAgICAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24obWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFpJbmRleFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpJbmRleCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlb3JkZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBncm91cHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVvcmRlcihncm91cHMpIHtcblxuICAgICAgICB2YXIgbWluID0gMSwgbWF4ID0gMTtcblxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4ge1xuXG4gICAgICAgICAgICBpZiAoYS56ID4gbWF4KSB7IG1heCA9IGEueiB9XG4gICAgICAgICAgICBpZiAoYi56ID4gbWF4KSB7IG1heCA9IGIueiB9XG4gICAgICAgICAgICBpZiAoYS56IDwgbWluKSB7IG1pbiA9IGEueiB9XG4gICAgICAgICAgICBpZiAoYi56IDwgbWluKSB7IG1pbiA9IGIueiB9XG5cbiAgICAgICAgICAgIHJldHVybiBhLnogLSBiLno7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgbWluOiBtaW4sIG1heDogbWF4IH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgSW50ZXJmYWNlICBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vLi4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgICA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgICAgID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGdldEludGVyZmFjZSgpIHtcblxuICAgICAgICBpZiAodGhpcy5pbnRlcmZhY2UgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBuZXcgSW50ZXJmYWNlKHRoaXMubGFiZWwpO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2Uuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGdldEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGdldEF0dHJpYnV0ZXMgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB2YXIgekluZGV4ID0geyB6OiBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKS5kYXR1bSgpLnogfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgID0gXy5hc3NpZ24odGhpcy5lbGVtZW50LmRhdHVtKCksIHpJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkucmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKG1vZGVsKTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuZXJzIHRoYXQgaG9vayB1cCB0aGUgaW50ZXJmYWNlIGFuZCB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCBtb2RlbCkpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCBnZXRBdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfU0VULCAobW9kZWwpID0+IHsgdGhpcy5zZXRBdHRyaWJ1dGVzKG1vZGVsLmF0dHJpYnV0ZXMpOyB9KTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZE1ldGhvZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSB8fCB7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB1dGlsaXR5LnRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueikpIHtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZGV2ZWxvcGVyIHNwZWNpZmllcyB0aGUgYHpgIGF0dHJpYnV0ZSwgaXQgYWN0dWFsbHkgcGVydGFpbnMgdG8gdGhlIGdyb3VwXG4gICAgICAgICAgICAvLyBlbGVtZW50IHRoYXQgdGhlIHNoYXBlIGlzIGEgY2hpbGQgb2YuIFdlJ2xsIHRoZXJlZm9yZSBuZWVkIHRvIHJlbW92ZSB0aGUgYHpgIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBgYXR0cmlidXRlc2Agb2JqZWN0LCBhbmQgaW5zdGVhZCBhcHBseSBpdCB0byB0aGUgc2hhcGUncyBncm91cCBlbGVtZW50LlxuICAgICAgICAgICAgLy8gQWZ0ZXJ3YXJkcyB3ZSdsbCBuZWVkIHRvIGJyb2FkY2FzdCBhbiBldmVudCB0byByZW9yZGVyIHRoZSBlbGVtZW50cyB1c2luZyBEMydzIG1hZ2ljYWxcbiAgICAgICAgICAgIC8vIGBzb3J0YCBtZXRob2QuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIGdyb3VwLmRhdHVtKHsgejogYXR0cmlidXRlcy56IH0pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuejtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU9SREVSKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdHVtKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXR0cih0aGlzLmVsZW1lbnQuZGF0dW0oKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdGhpcy5hZGRBdHRyaWJ1dGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzID0ge31cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpc3BhdGNoQXR0cmlidXRlRXZlbnQocHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIHByb3BlcnRpZXMuZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogKHZhbHVlKSA9PiB0aGlzLnNldEF0dHJpYnV0ZXMoeyBmaWxsOiB2YWx1ZSB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
