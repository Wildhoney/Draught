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
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.element = d3.select(element).attr("width", "100%").attr("height", "100%");
        this.shapes = [];
        this.index = 1;
        this.options = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
        this.registry = new Registry();
        this.zIndex = new ZIndex();
        this.groups = new Groups(this.element);

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Set the essential registry items.
        this.registry.set("z-index-max", 0);

        // Listen for events.
        this.setupListeners();
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
                    zIndex = { z: this.registry.incr("z-index-max") };

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
                return new (this.map[name.toLowerCase()])(this.ident());
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
             * @return {void}
             */

            value: function register(name, shape) {
                this.map[name] = shape;
            },
            writable: true,
            configurable: true
        },
        setupListeners: {

            /**
             * @method setupListeners
             * @return {void}
             */

            value: function setupListeners() {
                var _this = this;

                // Apply our event listeners.
                this.dispatcher.listen(Events.REORDER, function () {

                    var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");

                    var _zIndex$reorder = _this.zIndex.reorder(groups);

                    var min = _zIndex$reorder.min;
                    var max = _zIndex$reorder.max;

                    _this.registry.set("z-index-min", min);
                    _this.registry.set("z-index-max", max);
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

},{"./helpers/Dispatcher.js":2,"./helpers/Events.js":3,"./helpers/Groups.js":4,"./helpers/Registry.js":6,"./helpers/ZIndex.js":8,"./shapes/types/Rectangle.js":10}],2:[function(require,module,exports){
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
  ATTRIBUTE_GET_ALL: "attribute-get-all",
  ATTRIBUTE_SET: "attribute-set",
  REORDER: "reorder",
  REMOVE: "remove"
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

},{"./../helpers/Events.js":3,"./../helpers/Utility.js":7}],6:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./../helpers/Dispatcher.js":2,"./../helpers/Events.js":3,"./../helpers/Interface.js":5,"./../helpers/Utility.js":7}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0V2ZW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1JlZ2lzdHJ5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9aSW5kZXguanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLHlCQUF5Qjs7SUFDekMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsUUFBUSwyQkFBUSx1QkFBdUI7Ozs7SUFHdkMsU0FBUywyQkFBTyw2QkFBNkI7Ozs7Ozs7O0lBTzlDLFNBQVM7Ozs7Ozs7OztBQVFBLGFBUlQsU0FBUyxDQVFDLE9BQU87WUFBRSxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixTQUFTOztBQVVQLFlBQUksQ0FBQyxPQUFPLEdBQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEYsWUFBSSxDQUFDLE1BQU0sR0FBTyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLEtBQUssR0FBUSxDQUFDLENBQUM7QUFDcEIsWUFBSSxDQUFDLE9BQU8sR0FBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzRCxZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDbkMsWUFBSSxDQUFDLFFBQVEsR0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxNQUFNLEdBQU8sSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUMvQixZQUFJLENBQUMsTUFBTSxHQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0FBRzNDLFlBQUksQ0FBQyxHQUFHLEdBQUc7QUFDUCxnQkFBSSxFQUFFLFNBQVM7U0FDbEIsQ0FBQzs7O0FBR0YsWUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHcEMsWUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBRXpCOzt5QkE5QkMsU0FBUztBQXFDWCxXQUFHOzs7Ozs7OzttQkFBQSxhQUFDLElBQUksRUFBRTs7QUFFTixvQkFBSSxLQUFLLEdBQUssSUFBSSxPQUFJLENBQUMsSUFBSSxDQUFDO29CQUN4QixLQUFLLEdBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO29CQUM1QixPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2hHLE1BQU0sR0FBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDOzs7QUFHdkQscUJBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLHFCQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxxQkFBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixxQkFBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFHN0QscUJBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Ozs7QUFJM0Isb0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxhQUFXLEtBQUssQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUM7QUFDbkUsdUJBQU8sS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO2FBRS9COzs7O0FBT0QsY0FBTTs7Ozs7Ozs7bUJBQUEsZ0JBQUMsS0FBSyxFQUFFOztBQUVWLG9CQUFJLEtBQUssR0FBRyxDQUFDO29CQUNULElBQUksR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFLOztBQUUxQyx3QkFBSSxLQUFLLGFBQVUsS0FBSyxLQUFLLEVBQUU7QUFDM0IsNkJBQUssR0FBRyxDQUFDLENBQUM7QUFDViwrQkFBTyxLQUFLLENBQUM7cUJBQ2hCO2lCQUVKLENBQUMsQ0FBQzs7QUFFSCxvQkFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUIsb0JBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3Qix1QkFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDckI7Ozs7QUFNRCxXQUFHOzs7Ozs7O21CQUFBLGVBQUc7QUFDRix1QkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUs7MkJBQUssS0FBSyxhQUFVO2lCQUFBLENBQUMsQ0FBQzthQUN0RDs7OztBQU1ELGFBQUs7Ozs7Ozs7bUJBQUEsaUJBQUc7OztBQUNKLGlCQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLOzJCQUFLLE1BQUssTUFBTSxDQUFDLEtBQUssQ0FBQztpQkFBQSxDQUFDLENBQUM7YUFDekQ7Ozs7Ozs7Ozs7OzttQkFPRSxjQUFDLElBQUksRUFBRTtBQUNOLHVCQUFPLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUN6RDs7OztBQU1ELGFBQUs7Ozs7Ozs7bUJBQUEsaUJBQUc7QUFDSix1QkFBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDeEM7Ozs7QUFRRCxnQkFBUTs7Ozs7Ozs7O21CQUFBLGtCQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDbEIsb0JBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQzFCOzs7O0FBTUQsc0JBQWM7Ozs7Ozs7bUJBQUEsMEJBQUc7Ozs7QUFHYixvQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxZQUFNOztBQUV6Qyx3QkFBSSxNQUFNLEdBQVMsTUFBSyxPQUFPLENBQUMsU0FBUyxRQUFNLE1BQUssT0FBTyxDQUFDLGFBQWEsT0FBSSxDQUFDOzswQ0FDM0QsTUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7d0JBQXhDLEdBQUcsbUJBQUgsR0FBRzt3QkFBRSxHQUFHLG1CQUFILEdBQUc7O0FBRWQsMEJBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsMEJBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBRXpDLENBQUMsQ0FBQzs7QUFFSCxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQUssRUFBSztBQUM3QywwQkFBSyxNQUFNLENBQUMsS0FBSyxhQUFVLENBQUMsQ0FBQztpQkFDaEMsQ0FBQyxDQUFDO2FBRU47Ozs7QUFNRCxzQkFBYzs7Ozs7OzttQkFBQSwwQkFBRztBQUNiLHVCQUFPLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ3ZDOzs7Ozs7V0ExSkMsU0FBUzs7O0FBOEpmLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUVwQixnQkFBWSxDQUFDOzs7O0FBSWIsV0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FFakMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lDOUtVLFVBQVU7Ozs7Ozs7QUFNaEIsYUFOTSxVQUFVOzhCQUFWLFVBQVU7O0FBT3ZCLFlBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0tBQ3BCOzt5QkFSZ0IsVUFBVTtBQWlCM0IsWUFBSTs7Ozs7Ozs7OzttQkFBQSxjQUFDLElBQUksRUFBOEI7b0JBQTVCLFVBQVUsZ0NBQUcsRUFBRTtvQkFBRSxFQUFFLGdDQUFHLElBQUk7O0FBRWpDLGlCQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBQyxVQUFVLEVBQUs7O0FBRXpDLHdCQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXBDLHdCQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7OztBQUdsQiwwQkFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUVkO2lCQUVKLENBQUMsQ0FBQzthQUVOOzs7O0FBUUQsY0FBTTs7Ozs7Ozs7O21CQUFBLGdCQUFDLElBQUksRUFBaUI7b0JBQWYsRUFBRSxnQ0FBRyxZQUFNLEVBQUU7O0FBRXRCLG9CQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNwQix3QkFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQzFCOztBQUVELG9CQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUU5Qjs7Ozs7O1dBaERnQixVQUFVOzs7aUJBQVYsVUFBVTs7Ozs7Ozs7Ozs7aUJDQWhCO0FBQ1gsV0FBUyxFQUFFLFdBQVc7QUFDdEIsbUJBQWlCLEVBQUUsbUJBQW1CO0FBQ3RDLGVBQWEsRUFBRSxlQUFlO0FBQzlCLFNBQU8sRUFBRSxTQUFTO0FBQ2xCLFFBQU0sRUFBRSxRQUFRO0NBQ25COzs7Ozs7Ozs7Ozs7OztJQ05vQixNQUFNOzs7Ozs7O0FBT1osU0FQTSxNQUFNLENBT1gsT0FBTzt3QkFQRixNQUFNOztBQVFuQixNQUFJLENBQUMsTUFBTSxHQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRCxNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtDQUM5RDs7aUJBVmdCLE1BQU07Ozs7Ozs7Ozs7O0lDTnBCLE1BQU0sMkJBQU8sd0JBQXdCOztJQUNyQyxPQUFPLDJCQUFNLHlCQUF5Qjs7Ozs7Ozs7O0lBUXhCLFNBQVM7Ozs7Ozs7O0FBT2YsYUFQTSxTQUFTO1lBT2QsS0FBSyxnQ0FBRyxFQUFFOzs4QkFQTCxTQUFTOztBQVF0QixZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUN0Qjs7eUJBVGdCLFNBQVM7QUFlMUIsY0FBTTs7Ozs7OzttQkFBQSxrQkFBRzs7QUFFTCxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNoQywrQkFBVyxFQUFFLElBQUk7aUJBQ3BCLENBQUMsQ0FBQzthQUVOOzs7O0FBT0QsU0FBQzs7Ozs7Ozs7bUJBQUEsV0FBQyxLQUFLLEVBQUU7QUFDTCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoQzs7OztBQU9ELFNBQUM7Ozs7Ozs7O21CQUFBLFdBQUMsS0FBSyxFQUFFO0FBQ0wsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDaEM7Ozs7QUFPRCxTQUFDOzs7Ozs7OzttQkFBQSxXQUFDLEtBQUssRUFBRTtBQUNMLHVCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hDOzs7O0FBT0QsYUFBSzs7Ozs7Ozs7bUJBQUEsZUFBQyxLQUFLLEVBQUU7QUFDVCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNwQzs7OztBQU9ELGNBQU07Ozs7Ozs7O21CQUFBLGdCQUFDLEtBQUssRUFBRTtBQUNWLHVCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3JDOzs7O0FBUUQsWUFBSTs7Ozs7Ozs7O21CQUFBLGNBQUMsUUFBUSxFQUFFLEtBQUssRUFBRTs7QUFFbEIsb0JBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0QiwyQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ25DOztBQUVELG9CQUFJLEtBQUssR0FBUyxFQUFFLENBQUM7QUFDckIscUJBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDeEIsdUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUU5Qjs7OztBQU9ELGVBQU87Ozs7Ozs7O21CQUFBLG1CQUFrQjtvQkFBakIsVUFBVSxnQ0FBRyxFQUFFOztBQUVuQixvQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtBQUN2Qyw4QkFBVSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO2lCQUMvQyxDQUFDLENBQUM7O0FBRUgsdUJBQU8sSUFBSSxDQUFDO2FBRWY7Ozs7QUFNRCxlQUFPOzs7Ozs7O21CQUFBLG1CQUFHOztBQUVOLG9CQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLG9CQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQzdELDBCQUFNLEdBQUcsUUFBUSxDQUFDO2lCQUNyQixDQUFDLENBQUM7O0FBRUgsdUJBQU8sTUFBTSxDQUFDO2FBRWpCOzs7O0FBT0QscUJBQWE7Ozs7Ozs7O21CQUFBLHVCQUFDLFVBQVUsRUFBRTtBQUN0QixvQkFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7YUFDaEM7Ozs7QUFNRCxnQkFBUTs7Ozs7OzttQkFBQSxvQkFBRzs7QUFFUCxvQkFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1osbURBQTZCLElBQUksQ0FBQyxLQUFLLE9BQUk7aUJBQzlDOztBQUVELDRDQUE0QjthQUUvQjs7Ozs7O1dBMUlnQixTQUFTOzs7aUJBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7OztJQ0hULFFBQVE7Ozs7Ozs7O0FBT2QsV0FQTSxRQUFROzBCQUFSLFFBQVE7O0FBUXJCLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0dBQ3hCOzt1QkFUZ0IsUUFBUTtBQWlCekIsT0FBRzs7Ozs7Ozs7O2FBQUEsYUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO09BQ3JDOzs7O0FBT0QsUUFBSTs7Ozs7Ozs7YUFBQSxjQUFDLFFBQVEsRUFBRTtBQUNYLFlBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckQsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3BDOzs7O0FBT0QsUUFBSTs7Ozs7Ozs7YUFBQSxjQUFDLFFBQVEsRUFBRTtBQUNYLFlBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckQsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3BDOzs7O0FBT0QsT0FBRzs7Ozs7Ozs7YUFBQSxhQUFDLFFBQVEsRUFBRTtBQUNWLGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNwQzs7Ozs7O1NBaERnQixRQUFROzs7aUJBQVIsUUFBUTs7Ozs7Ozs7Ozs7QUNBN0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxZQUFXOztBQUV0QixnQkFBWSxDQUFDOztBQUViLFdBQU87Ozs7Ozs7O0FBUUgsc0JBQWMsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUN6QixxQ0FBdUIsT0FBTyxPQUFJO1NBQ3JDOzs7Ozs7O0FBT0QsMkJBQW1CLEVBQUUsVUFBQyxVQUFVLEVBQUs7O0FBRWpDLGdCQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUU7O0FBRXRCLG9CQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztvQkFDeEQsQ0FBQyxHQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLENBQUMsR0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRS9CLG9CQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDN0QsOEJBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLDJCQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZCOztBQUVELG9CQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDN0QsOEJBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLDJCQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZCO2FBRUo7O0FBRUQsZ0JBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7QUFHOUQsMEJBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6Rix1QkFBTyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLHVCQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFFdkI7O0FBRUQsbUJBQU8sVUFBVSxDQUFDO1NBRXJCOzs7Ozs7O0FBT0QsNkJBQXFCLEVBQUEsK0JBQUMsVUFBVSxFQUFFOztBQUU5QixnQkFBSSxVQUFVLENBQUMsU0FBUyxFQUFFOztBQUV0QixvQkFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM3RCwwQkFBVSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsMEJBQVUsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLHVCQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUM7YUFFL0I7O0FBRUQsbUJBQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUUzQzs7Ozs7Ozs7QUFRRCx5QkFBaUIsRUFBQSwyQkFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BCLG1CQUFPLEVBQUUsU0FBUyxpQkFBZSxDQUFDLFVBQUssQ0FBQyxNQUFHLEVBQUUsQ0FBQztTQUNqRDs7Ozs7OztBQU9ELG9CQUFZLEVBQUEsc0JBQUMsS0FBSyxFQUFFOztBQUVoQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0FBRTFCLGFBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBSztBQUMzQixnQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQzlDLENBQUMsQ0FBQzs7QUFFSCxtQkFBTyxnQkFBZ0IsQ0FBQztTQUUzQjs7Ozs7OztBQU9ELG9CQUFZLEVBQUEsc0JBQUMsS0FBSyxFQUFFOztBQUVoQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0FBRTFCLGFBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBSztBQUMzQixnQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBQzlDLENBQUMsQ0FBQzs7QUFFSCxtQkFBTyxnQkFBZ0IsQ0FBQztTQUUzQjs7S0FFSixDQUFDO0NBRUwsQ0FBQSxFQUFHLENBQUM7O2lCQUVVLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7SUMxSEQsTUFBTTthQUFOLE1BQU07OEJBQU4sTUFBTTs7O3lCQUFOLE1BQU07QUFPdkIsZUFBTzs7Ozs7Ozs7bUJBQUEsaUJBQUMsTUFBTSxFQUFFOztBQUVaLG9CQUFJLEdBQUcsR0FBRyxDQUFDO29CQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXJCLHNCQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSzs7QUFFbEIsd0JBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBRSwyQkFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQUU7QUFDNUIsd0JBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBRSwyQkFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQUU7QUFDNUIsd0JBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBRSwyQkFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQUU7QUFDNUIsd0JBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBRSwyQkFBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQUU7O0FBRTVCLDJCQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFFcEIsQ0FBQyxDQUFDOztBQUVILHVCQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7YUFFakM7Ozs7OztXQXhCZ0IsTUFBTTs7O2lCQUFOLE1BQU07Ozs7Ozs7Ozs7O0lDTnBCLFNBQVMsMkJBQU8sMkJBQTJCOztJQUMzQyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLE9BQU8sMkJBQVMseUJBQXlCOzs7Ozs7Ozs7SUFRM0IsS0FBSzs7Ozs7Ozs7QUFPWCxhQVBNLEtBQUs7WUFPVixLQUFLLGdDQUFHLEVBQUU7OzhCQVBMLEtBQUs7O0FBUWxCLFlBQUksQ0FBQyxPQUFPLEdBQUssSUFBSSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLEdBQU8sS0FBSyxDQUFDO0FBQ3ZCLFlBQUksYUFBVSxHQUFHLElBQUksQ0FBQztLQUN6Qjs7eUJBWGdCLEtBQUs7QUFpQnRCLGtCQUFVOzs7Ozs7O21CQUFBLG9CQUFDLE9BQU8sRUFBRTtBQUNoQixvQkFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7YUFDMUI7Ozs7QUFPRCxxQkFBYTs7Ozs7Ozs7bUJBQUEsdUJBQUMsVUFBVSxFQUFFO0FBQ3RCLG9CQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzthQUNoQzs7OztBQU9ELGtCQUFVOzs7Ozs7OzttQkFBQSxvQkFBQyxPQUFPLEVBQUU7QUFDaEIsb0JBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2FBQzFCOzs7O0FBTUQsb0JBQVk7Ozs7Ozs7bUJBQUEsd0JBQUc7OztBQUVYLG9CQUFJLElBQUksYUFBVSxLQUFLLElBQUksRUFBRTs7QUFFekIsd0JBQUksYUFBVSxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyx3QkFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNsQyx3QkFBSSxhQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7Ozs7QUFNekMsd0JBQUksYUFBYSxHQUFHLFlBQU07O0FBRXRCLDRCQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRTs0QkFDbkUsS0FBSyxHQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBSyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEQsK0JBQU8sT0FBTyxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUUvQyxDQUFDOzs7QUFHRiw4QkFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSzsrQkFBSyxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7cUJBQUEsQ0FBQyxDQUFDO0FBQ3hGLDhCQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMzRCw4QkFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQUUsOEJBQUssYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFBRSxDQUFDLENBQUM7O0FBRTlGLHdCQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQy9CLDRCQUFJLGFBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksYUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3FCQUNoRTtpQkFFSjs7QUFFRCx1QkFBTyxJQUFJLGFBQVUsQ0FBQzthQUV6Qjs7OztBQU9ELHFCQUFhOzs7Ozs7OzttQkFBQSx5QkFBa0I7b0JBQWpCLFVBQVUsZ0NBQUcsRUFBRTs7QUFFekIsMEJBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzlELDBCQUFVLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVyRCxvQkFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7O0FBTzlCLHdCQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdEQseUJBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsMkJBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNwQix3QkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUV4Qzs7QUFFRCxvQkFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0Isb0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN4Qyx1QkFBTyxJQUFJLGFBQVUsQ0FBQzthQUV6Qjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHOztBQUVaLG9CQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUVoQyxvQkFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUNsQyw4QkFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRDs7QUFFRCx1QkFBTyxVQUFVLENBQUM7YUFFckI7Ozs7QUFPRCxtQkFBVzs7Ozs7Ozs7bUJBQUEscUJBQUMsT0FBTyxFQUFFO0FBQ2pCLHVCQUFPLE9BQU8sQ0FBQzthQUNsQjs7OztBQU9ELGNBQU07Ozs7Ozs7O21CQUFBLGtCQUFHO0FBQ0wsdUJBQU8sQ0FBQyxjQUFjLFlBQVUsSUFBSSxDQUFDLEtBQUsscUNBQW9DLENBQUM7YUFDbEY7Ozs7QUFPRCw4QkFBc0I7Ozs7Ozs7O21CQUFBLGtDQUFrQjtvQkFBakIsVUFBVSxnQ0FBRyxFQUFFOztBQUNsQywwQkFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDMUIsb0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDdEQ7Ozs7QUFNRCxnQkFBUTs7Ozs7OzttQkFBQSxvQkFBRzs7QUFFUCxvQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV6RSxvQkFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1osd0NBQWtCLEdBQUcsVUFBSyxJQUFJLENBQUMsS0FBSyxPQUFJO2lCQUMzQzs7QUFFRCxvQ0FBa0IsR0FBRyxPQUFJO2FBRTVCOzs7Ozs7V0F0S2dCLEtBQUs7OztpQkFBTCxLQUFLOzs7Ozs7Ozs7Ozs7O0lDWG5CLEtBQUssMkJBQU0sZUFBZTs7Ozs7Ozs7O0lBUVosU0FBUyxjQUFTLEtBQUs7YUFBdkIsU0FBUzs4QkFBVCxTQUFTOztZQUFTLEtBQUs7QUFBTCxpQkFBSzs7OztjQUF2QixTQUFTLEVBQVMsS0FBSzs7eUJBQXZCLFNBQVM7QUFNMUIsY0FBTTs7Ozs7OzttQkFBQSxrQkFBRztBQUNMLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNsRTs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHOzs7QUFFVCx1QkFBTztBQUNILHdCQUFJLEVBQUUsVUFBQyxLQUFLOytCQUFLLE1BQUssYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUFBO2lCQUN2RCxDQUFBO2FBRUo7Ozs7OztXQTVCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCBSZWdpc3RyeSAgIGZyb20gJy4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8vIFNoYXBlcy5cbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZWxlbWVudCAgICA9IGQzLnNlbGVjdChlbGVtZW50KS5hdHRyKCd3aWR0aCcsICcxMDAlJykuYXR0cignaGVpZ2h0JywgJzEwMCUnKTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9IF8uYXNzaWduKHRoaXMuZGVmYXVsdE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMucmVnaXN0cnkgICA9IG5ldyBSZWdpc3RyeSgpO1xuICAgICAgICB0aGlzLnpJbmRleCAgICAgPSBuZXcgWkluZGV4KCk7XG4gICAgICAgIHRoaXMuZ3JvdXBzICAgICA9IG5ldyBHcm91cHModGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgZXNzZW50aWFsIHJlZ2lzdHJ5IGl0ZW1zLlxuICAgICAgICB0aGlzLnJlZ2lzdHJ5LnNldCgnei1pbmRleC1tYXgnLCAwKTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGV2ZW50cy5cbiAgICAgICAgdGhpcy5zZXR1cExpc3RlbmVycygpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIHZhciBzaGFwZSAgID0gdGhpcy5uZXcobmFtZSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLFxuICAgICAgICAgICAgZWxlbWVudCA9IGdyb3VwLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKS5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5yZWdpc3RyeS5pbmNyKCd6LWluZGV4LW1heCcpIH07XG5cbiAgICAgICAgLy8gU2V0IGFsbCBvZiB0aGUgZXNzZW50aWFsIG9iamVjdHMgdGhhdCB0aGUgc2hhcGUgcmVxdWlyZXMuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRBdHRyaWJ1dGVzKF8uYXNzaWduKHpJbmRleCwgc2hhcGUuZ2V0QXR0cmlidXRlcygpKSk7XG5cbiAgICAgICAgLy8gTGFzdCBjaGFuY2UgdG8gZGVmaW5lIGFueSBmdXJ0aGVyIGVsZW1lbnRzIGZvciB0aGUgZ3JvdXAuXG4gICAgICAgIHNoYXBlLmFkZEVsZW1lbnRzKGVsZW1lbnQpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgYWN0dWFsIHNoYXBlIG9iamVjdCwgdG8gdGhlIGludGVyZmFjZSBvYmplY3QgdGhhdCB0aGUgZGV2ZWxvcGVyXG4gICAgICAgIC8vIGludGVyYWN0cyB3aXRoLlxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKHsgc2hhcGU6IHNoYXBlLCBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpfSk7XG4gICAgICAgIHJldHVybiBzaGFwZS5nZXRJbnRlcmZhY2UoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtJbnRlcmZhY2V9IG1vZGVsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGl0ZW0gID0gXy5maW5kKHRoaXMuc2hhcGVzLCAoc2hhcGUsIGkpID0+IHtcblxuICAgICAgICAgICAgaWYgKHNoYXBlLmludGVyZmFjZSA9PT0gbW9kZWwpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0ZW0uc2hhcGUuZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5zaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtTaGFwZVtdfVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLm1hcCgoc2hhcGUpID0+IHNoYXBlLmludGVyZmFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnNoYXBlcywgKHNoYXBlKSA9PiB0aGlzLnJlbW92ZShzaGFwZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbmV3XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBuZXcobmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV0odGhpcy5pZGVudCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlkZW50XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGlkZW50KCkge1xuICAgICAgICByZXR1cm4gWydCUCcsIHRoaXMuaW5kZXgrK10uam9pbignJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWdpc3RlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlZ2lzdGVyKG5hbWUsIHNoYXBlKSB7XG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXR1cExpc3RlbmVyc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0dXBMaXN0ZW5lcnMoKSB7XG5cbiAgICAgICAgLy8gQXBwbHkgb3VyIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKCkgPT4ge1xuXG4gICAgICAgICAgICB2YXIgZ3JvdXBzICAgICAgID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHZhciB7IG1pbiwgbWF4IH0gPSB0aGlzLnpJbmRleC5yZW9yZGVyKGdyb3Vwcyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVnaXN0cnkuc2V0KCd6LWluZGV4LW1pbicsIG1pbik7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdHJ5LnNldCgnei1pbmRleC1tYXgnLCBtYXgpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZShtb2RlbC5pbnRlcmZhY2UpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdE9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdE9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB7IGRhdGFBdHRyaWJ1dGU6ICdkYXRhLWlkJyB9O1xuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gbWFpbigkd2luZG93KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIEthbGlua2EsIGthbGlua2EsIGthbGlua2EgbW95YSFcbiAgICAvLyBWIHNhZHUgeWFnb2RhIG1hbGlua2EsIG1hbGlua2EgbW95YSFcbiAgICAkd2luZG93LkJsdWVwcmludCA9IEJsdWVwcmludDtcblxufSkod2luZG93KTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuPSgpID0+IHt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbGlzdGVuKG5hbWUsIGZuID0gKCkgPT4ge30pIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0ucHVzaChmbik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEV2ZW50c1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBBVFRSSUJVVEU6ICdhdHRyaWJ1dGUnLFxuICAgIEFUVFJJQlVURV9HRVRfQUxMOiAnYXR0cmlidXRlLWdldC1hbGwnLFxuICAgIEFUVFJJQlVURV9TRVQ6ICdhdHRyaWJ1dGUtc2V0JyxcbiAgICBSRU9SREVSOiAncmVvcmRlcicsXG4gICAgUkVNT1ZFOiAncmVtb3ZlJ1xufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgR3JvdXBzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JvdXBzIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc2hhcGVzICA9IGVsZW1lbnQuYXBwZW5kKCdnJykuY2xhc3NlZCgnc2hhcGVzJywgdHJ1ZSk7XG4gICAgICAgIHRoaXMuaGFuZGxlcyA9IGVsZW1lbnQuYXBwZW5kKCdnJykuY2xhc3NlZCgnaGFuZGxlcycsIHRydWUpXG4gICAgfVxuXG59IiwiaW1wb3J0IEV2ZW50cyAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIHtcbiAgICAgICAgICAgICdpbnRlcmZhY2UnOiB0aGlzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB3aWR0aCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd3aWR0aCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBoZWlnaHQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignaGVpZ2h0JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgICAqIEByZXR1cm4geyp8dm9pZH1cbiAgICAgKi9cbiAgICBhdHRyKHByb3BlcnR5LCB2YWx1ZSkge1xuXG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cigpW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtb2RlbCAgICAgICA9IHt9O1xuICAgICAgICBtb2RlbFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cihtb2RlbCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZXRBdHRyKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfU0VULCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB1dGlsaXR5LmtlYmFiaWZ5S2V5cyhhdHRyaWJ1dGVzKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0clxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyKCkge1xuXG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsIHt9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlOiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlXWA7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgb2JqZWN0XG4gKiBAc3VibW9kdWxlIFJlZ2lzdHJ5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cnkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1JlZ2lzdHJ5fVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5jclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBpbmNyKHByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMuc2V0KHByb3BlcnR5LCBwYXJzZUludCh0aGlzLmdldChwcm9wZXJ0eSkpICsgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVjclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBkZWNyKHByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMuc2V0KHByb3BlcnR5LCBwYXJzZUludCh0aGlzLmdldChwcm9wZXJ0eSkpIC0gMSk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBnZXQocHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBVdGlsaXR5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFpJbmRleFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpJbmRleCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlb3JkZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBncm91cHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVvcmRlcihncm91cHMpIHtcblxuICAgICAgICB2YXIgbWluID0gMSwgbWF4ID0gMTtcblxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4ge1xuXG4gICAgICAgICAgICBpZiAoYS56ID4gbWF4KSB7IG1heCA9IGEueiB9XG4gICAgICAgICAgICBpZiAoYi56ID4gbWF4KSB7IG1heCA9IGIueiB9XG4gICAgICAgICAgICBpZiAoYS56IDwgbWluKSB7IG1pbiA9IGEueiB9XG4gICAgICAgICAgICBpZiAoYi56IDwgbWluKSB7IG1pbiA9IGIueiB9XG5cbiAgICAgICAgICAgIHJldHVybiBhLnogLSBiLno7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgbWluOiBtaW4sIG1heDogbWF4IH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgSW50ZXJmYWNlICBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vLi4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgICA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgICAgID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGdldEludGVyZmFjZSgpIHtcblxuICAgICAgICBpZiAodGhpcy5pbnRlcmZhY2UgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBuZXcgSW50ZXJmYWNlKHRoaXMubGFiZWwpO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2Uuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGdldEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGdldEF0dHJpYnV0ZXMgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB2YXIgekluZGV4ID0geyB6OiBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKS5kYXR1bSgpLnogfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgID0gXy5hc3NpZ24odGhpcy5lbGVtZW50LmRhdHVtKCksIHpJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkucmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKG1vZGVsKTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuZXJzIHRoYXQgaG9vayB1cCB0aGUgaW50ZXJmYWNlIGFuZCB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCBtb2RlbCkpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCBnZXRBdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfU0VULCAobW9kZWwpID0+IHsgdGhpcy5zZXRBdHRyaWJ1dGVzKG1vZGVsLmF0dHJpYnV0ZXMpOyB9KTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZE1ldGhvZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSB8fCB7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB1dGlsaXR5LnRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueikpIHtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZGV2ZWxvcGVyIHNwZWNpZmllcyB0aGUgYHpgIGF0dHJpYnV0ZSwgaXQgYWN0dWFsbHkgcGVydGFpbnMgdG8gdGhlIGdyb3VwXG4gICAgICAgICAgICAvLyBlbGVtZW50IHRoYXQgdGhlIHNoYXBlIGlzIGEgY2hpbGQgb2YuIFdlJ2xsIHRoZXJlZm9yZSBuZWVkIHRvIHJlbW92ZSB0aGUgYHpgIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBgYXR0cmlidXRlc2Agb2JqZWN0LCBhbmQgaW5zdGVhZCBhcHBseSBpdCB0byB0aGUgc2hhcGUncyBncm91cCBlbGVtZW50LlxuICAgICAgICAgICAgLy8gQWZ0ZXJ3YXJkcyB3ZSdsbCBuZWVkIHRvIGJyb2FkY2FzdCBhbiBldmVudCB0byByZW9yZGVyIHRoZSBlbGVtZW50cyB1c2luZyBEMydzIG1hZ2ljYWxcbiAgICAgICAgICAgIC8vIGBzb3J0YCBtZXRob2QuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIGdyb3VwLmRhdHVtKHsgejogYXR0cmlidXRlcy56IH0pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuejtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU9SREVSKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdHVtKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXR0cih0aGlzLmVsZW1lbnQuZGF0dW0oKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdGhpcy5hZGRBdHRyaWJ1dGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzID0ge31cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpc3BhdGNoQXR0cmlidXRlRXZlbnQocHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIHByb3BlcnRpZXMuZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogKHZhbHVlKSA9PiB0aGlzLnNldEF0dHJpYnV0ZXMoeyBmaWxsOiB2YWx1ZSB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
