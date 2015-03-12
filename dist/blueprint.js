(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var Events = _interopRequire(require("./helpers/Events.js"));

var ZIndex = _interopRequire(require("./helpers/ZIndex.js"));

var registry = _interopRequire(require("./helpers/Registry.js"));

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
     * @param {SVGElement|String} element
     * @param {Object} [options={}]
     * @return {void}
     */

    function Blueprint(element) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.options = _.assign(this.defaultOptions(), options);
        this.element = d3.select(utility.elementReference(element)).attr("width", this.options.documentWidth).attr("height", this.options.documentHeight);
        this.shapes = [];
        this.index = 1;

        // Helpers required by Blueprint and the rest of the system.
        this.dispatcher = new Dispatcher();
        this.zIndex = new ZIndex();
        this.groups = new Groups().addTo(this.element);

        // Register our default components.
        this.map = {
            rect: Rectangle
        };

        // Add the event listeners, and setup Mousetrap to listen for keyboard events.
        this.addEventListeners();
        this.setupMousetrap();
    }

    _prototypeProperties(Blueprint, null, {
        add: {

            /**
             * @method add
             * @param {String|HTMLElement} name
             * @return {Interface}
             */

            value: function add(name) {

                var shape = this.instantiate(utility.elementName(name)),
                    group = this.groups.shapes.append("g").attr(this.options.dataAttribute, shape.label),
                    element = group.append(shape.getTag()),
                    zIndex = { z: this.index - 1 };

                // Set all of the essential objects that the shape requires.
                shape.setOptions(this.options);
                shape.setDispatcher(this.dispatcher);
                shape.setElement(element);
                shape.setGroup(group);
                shape.setAttributes(_.assign(zIndex, shape.getAttributes()));

                // Last chance to define any further elements for the group, and the application of the
                // features which a shape should have, such as being draggable, selectable, resizeable, etc...
                shape.addElements();
                shape.addFeatures();

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
        instantiate: {

            /**
             * @method instantiate
             * @param {String} name
             * @return {Shape}
             */

            value: function instantiate(name) {
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

                this.dispatcher.listen(Events.REMOVE, function (event) {
                    return _this.remove(event["interface"]);
                });
                this.dispatcher.listen(Events.REORDER, function (event) {
                    var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");
                    _this.zIndex.reorder(groups, event.group);
                });

                // When the user clicks on the SVG layer that isn't a part of the shape group, then we'll emit
                // the `Events.DESELECT` event to deselect all selected shapes.
                this.element.on("click", function () {
                    return _this.dispatcher.send(Events.DESELECT_ALL);
                });
            },
            writable: true,
            configurable: true
        },
        setupMousetrap: {

            /**
             * @method setupMousetrap
             * @return {void}
             */

            value: function setupMousetrap() {
                var _this = this;

                var SMALL_MOVE = 1,
                    LARGE_MOVE = 10;

                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = true;
                }, "keydown");
                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = false;
                }, "keyup");

                Mousetrap.bind("shift", function () {
                    return registry.keys.aspectRatio = true;
                }, "keydown");
                Mousetrap.bind("shift", function () {
                    return registry.keys.aspectRatio = false;
                }, "keyup");

                Mousetrap.bind("mod+a", function () {
                    return _this.dispatcher.send(Events.SELECT_ALL);
                });

                /**
                 * @method move
                 * @param {String} name
                 * @param {Number} value
                 * @return {Boolean}
                 */
                var move = function (name, value) {
                    _this.dispatcher.send(name, { by: value });
                    return false;
                };

                Mousetrap.bind("left", function () {
                    return move(Events.MOVE_LEFT, SMALL_MOVE);
                });
                Mousetrap.bind("right", function () {
                    return move(Events.MOVE_RIGHT, SMALL_MOVE);
                });
                Mousetrap.bind("up", function () {
                    return move(Events.MOVE_UP, SMALL_MOVE);
                });
                Mousetrap.bind("down", function () {
                    return move(Events.MOVE_DOWN, SMALL_MOVE);
                });

                Mousetrap.bind("shift+left", function () {
                    return move(Events.MOVE_LEFT, LARGE_MOVE);
                });
                Mousetrap.bind("shift+right", function () {
                    return move(Events.MOVE_RIGHT, LARGE_MOVE);
                });
                Mousetrap.bind("shift+up", function () {
                    return move(Events.MOVE_UP, LARGE_MOVE);
                });
                Mousetrap.bind("shift+down", function () {
                    return move(Events.MOVE_DOWN, LARGE_MOVE);
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

},{"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Registry.js":6,"./helpers/Utility.js":7,"./helpers/ZIndex.js":8,"./shapes/Shape.js":11,"./shapes/types/Rectangle.js":15}],2:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Constants
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
module.exports = {

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
             * @param {Function} fn
             * @return {Boolean}
             */

            value: function listen(name, fn) {

                if (!_.isFunction(fn)) {
                    return false;
                }

                if (!this.events[name]) {
                    this.events[name] = [];
                }

                this.events[name].push(fn);
                return true;
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
    REMOVE: "remove",
    MOVE_UP: "move-up",
    MOVE_DOWN: "move-down",
    MOVE_LEFT: "move-left",
    MOVE_RIGHT: "move-right",
    SELECT: "select",
    SELECT_ALL: "select-all",
    DESELECT_ALL: "deselect-all",
    DESELECT: "deselect",
    SELECTABLE: {
        SELECT: "selectable-select",
        DESELECT: "selectable-deselect"
    }
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

        // Prevent clicks on the elements from leaking through to the SVG layer.
        this.shapes.on("click", function () {
          return d3.event.stopPropagation();
        });
        this.handles.on("click", function () {
          return d3.event.stopPropagation();
        });

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

/**
 * @module Blueprint
 * @submodule Registry
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
module.exports = {

  /**
   * Responsible for determining when certain keys are pressed down, which will determine the
   * strategy at runtime for certain functions.
   *
   * @property keys
   * @type {Object}
   */
  keys: {
    multiSelect: false,
    aspectRatio: false
  },

  /**
   * @property snapGrid
   * @type {Number}
   */
  snapGrid: 10

};

},{}],7:[function(require,module,exports){
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
                throw new Error("Blueprint.js: " + message + ". See: " + link);
            }

            throw new Error("Blueprint.js: " + message + ".");
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
        },

        /**
         * @method elementName
         * @param {String|HTMLElement} model
         * @return {String}
         */
        elementName: function elementName(model) {

            if (model.nodeName) {
                return model.nodeName.toLowerCase();
            }

            return model.toLowerCase();
        },

        /**
         * @method elementReference
         * @param {String|HTMLElement} model
         * @return {HTMLElement}
         */
        elementReference: function elementReference(model) {

            if (model.nodeName) {
                return model;
            }

            return document.querySelector(model);
        }

    };
})();

module.exports = utility;

},{"./Constants.js":2}],8:[function(require,module,exports){
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
             * @param {Object} group
             * @return {Object}
             */

            value: function reorder(groups, group) {

                var zMax = groups.size();

                // Ensure the maximum Z is above zero and below the maximum.
                if (group.datum().z < 1) {
                    group.datum().z = 1;
                }
                if (group.datum().z > zMax) {
                    group.datum().z = zMax;
                }

                var zTarget = group.datum().z,
                    zCurrent = 1;

                // Initial sort into z-index order.
                groups.sort(function (a, b) {
                    return a.z - b.z;
                });

                _.forEach(groups[0], function (model) {

                    // Current group is immutable in this iteration.
                    if (model === group.node()) {
                        return;
                    }

                    // Skip the target Z index.
                    if (zCurrent === zTarget) {
                        zCurrent++;
                    }

                    var shape = d3.select(model),
                        datum = shape.datum();
                    datum.z = zCurrent++;
                    shape.datum(datum);
                });

                // Final sort pass.
                groups.sort(function (a, b) {
                    return a.z - b.z;
                });
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

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Feature
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Feature = (function () {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Feature}
     */

    function Feature(shape) {
        _classCallCheck(this, Feature);

        this.shape = shape;
    }

    _prototypeProperties(Feature, null, {
        setDispatcher: {

            /**
             * @method setDispatcher
             * @param {Object} dispatcher
             * @return {Feature}
             */

            value: function setDispatcher(dispatcher) {

                this.dispatcher = dispatcher;

                if (_.isFunction(this.addEvents)) {
                    this.addEvents(dispatcher);
                }

                return this;
            },
            writable: true,
            configurable: true
        }
    });

    return Feature;
})();

module.exports = Feature;

},{}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Events = _interopRequire(require("./../helpers/Events.js"));

var utility = _interopRequire(require("./../helpers/Utility.js"));

/**
 * @module Blueprint
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
        this.selected = false;
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
        select: {

            /**
             * @method select
             * @return {Interface}
             */

            value: function select() {
                this.selected = true;
                return this;
            },
            writable: true,
            configurable: true
        },
        deselect: {

            /**
             * @method deselect
             * @return {Interface}
             */

            value: function deselect() {
                this.selected = false;
                return this;
            },
            writable: true,
            configurable: true
        },
        isSelected: {

            /**
             * @method isSelected
             * @return {Boolean}
             */

            value: function isSelected() {
                return this.selected;
            },
            writable: true,
            configurable: true
        },
        x: {

            /**
             * @method x
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
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
             * @return {Interface|Number}
             */

            value: function y(value) {
                return this.attr("y", value);
            },
            writable: true,
            configurable: true
        },
        transform: {

            /**
             * @method transform
             * @param {Number} [x=null]
             * @param {Number} [y=null]
             * @return {Interface}
             */

            value: function transform() {
                var x = arguments[0] === undefined ? null : arguments[0];
                var y = arguments[1] === undefined ? null : arguments[1];

                if (!_.isNull(x)) {
                    this.x(x);
                }

                if (!_.isNull(y)) {
                    this.y(y);
                }

                return this;
            },
            writable: true,
            configurable: true
        },
        opacity: {

            /**
             * @method opacity
             * @param {Number} value
             * @return {Interface|Number}
             */

            value: function opacity(value) {
                return this.attr("opacity", value);
            },
            writable: true,
            configurable: true
        },
        stroke: {

            /**
             * @method stroke
             * @param {String} value
             * @return {Interface|String}
             */

            value: function stroke(value) {
                return this.attr("stroke", value);
            },
            writable: true,
            configurable: true
        },
        strokeWidth: {

            /**
             * @method strokeWidth
             * @param {Number} value
             * @return {Interface|Number}
             */

            value: function strokeWidth(value) {
                return this.attr("stroke-width", value);
            },
            writable: true,
            configurable: true
        },
        strokeDashArray: {

            /**
             * @method strokeDashArray
             * @param {Array} value
             * @return {Interface|Number}
             */

            value: function strokeDashArray(value) {

                if (!_.isUndefined(value)) {
                    utility.assert(_.isArray(value), "Method `strokeDashArray` expects an array value");
                    return this.attr("stroke-dasharray", value.join(","));
                }

                return this.attr("stroke-dasharray");
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
        bringToFront: {

            /**
             * @method bringToFront
             * @return {Interface|Number}
             */

            value: function bringToFront() {
                return this.attr("z", Infinity);
            },
            writable: true,
            configurable: true
        },
        sendToBack: {

            /**
             * @method sendToBack
             * @return {Interface|Number}
             */

            value: function sendToBack() {
                return this.attr("z", -Infinity);
            },
            writable: true,
            configurable: true
        },
        sendBackwards: {

            /**
             * @method sendBackwards
             * @return {Interface|Number}
             */

            value: function sendBackwards() {
                return this.attr("z", this.getAttr().z - 1);
            },
            writable: true,
            configurable: true
        },
        bringForwards: {

            /**
             * @method bringForwards
             * @return {Interface|Number}
             */

            value: function bringForwards() {
                return this.attr("z", this.getAttr().z + 1);
            },
            writable: true,
            configurable: true
        },
        width: {

            /**
             * @method width
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
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
             * @return {Interface|Number}
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
             * @param {*} [value=null]
             * @return {*|void}
             */

            value: function attr(property) {
                var value = arguments[1] === undefined ? null : arguments[1];

                if (_.isNull(value)) {
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

},{"./../helpers/Events.js":4,"./../helpers/Utility.js":7}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./../helpers/Dispatcher.js"));

var Events = _interopRequire(require("./../helpers/Events.js"));

var utility = _interopRequire(require("./../helpers/Utility.js"));

// Features.

var Selectable = _interopRequire(require("./features/Selectable.js"));

var Movable = _interopRequire(require("./features/Movable.js"));

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
        this.group = null;
        this.label = label;
        this["interface"] = null;
        this.features = {};
    }

    _prototypeProperties(Shape, null, {
        setElement: {

            /**
             * @method setElement
             * @param {Object} element
             * @return {void}
             */

            value: function setElement(element) {
                this.element = element;
            },
            writable: true,
            configurable: true
        },
        setGroup: {

            /**
             * @method setGroup
             * @param {Object} group
             * @return {void}
             */

            value: function setGroup(group) {
                this.group = group;
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
                var _this = this;

                this.dispatcher = dispatcher;

                this.dispatcher.listen(Events.SELECT_ALL, function () {
                    return _this.tryInvokeOnEachFeature("select");
                });
                this.dispatcher.listen(Events.DESELECT_ALL, function () {
                    return _this.tryInvokeOnEachFeature("deselect");
                });
                this.dispatcher.listen(Events.MOVE_LEFT, function (model) {
                    return _this.tryInvokeOnEachFeature("moveLeft", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_RIGHT, function (model) {
                    return _this.tryInvokeOnEachFeature("moveRight", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_UP, function (model) {
                    return _this.tryInvokeOnEachFeature("moveUp", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_DOWN, function (model) {
                    return _this.tryInvokeOnEachFeature("moveDown", model, "isSelected");
                });
            },
            writable: true,
            configurable: true
        },
        tryInvokeOnEachFeature: {

            /**
             * @method tryInvokeOnEachFeature
             * @param {String} methodName
             * @param {Object} [properties={}]
             * @param {String} [conditionalFn=null]
             * @return {void}
             */

            value: function tryInvokeOnEachFeature(methodName) {
                var _this = this;

                var properties = arguments[1] === undefined ? {} : arguments[1];
                var conditionalFn = arguments[2] === undefined ? null : arguments[2];

                _.forIn(this.features, function (feature) {

                    if (_.isFunction(feature[methodName])) {

                        if (_.isString(conditionalFn) && !_this.getInterface()[conditionalFn]()) {
                            return;
                        }

                        feature[methodName](properties);
                    }
                });
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
        getName: {

            /**
             * Should be overwritten for shape types that have a different name to their SVG tag name, such as a `foreignObject`
             * element using the `rect` shape name.
             *
             * @method getName
             * @return {String}
             */

            value: function getName() {
                return this.getTag();
            },
            writable: true,
            configurable: true
        },
        getTag: {

            /**
             * @method getTag
             * @throws Exception
             * @return {String}
             */

            value: function getTag() {
                utility.throwException("Shape<" + this.label + "> must define a `getTag` method");
                return "";
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

                    this["interface"] = this.addInterface();
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
                    dispatcher.listen(Events.ATTRIBUTE_GET_ALL, getAttributes);
                    dispatcher.listen(Events.REMOVE, function (model) {
                        return _this.dispatcher.send(Events.REMOVE, model);
                    });
                    dispatcher.listen(Events.ATTRIBUTE_SET, function (model) {
                        _this.setAttributes(model.attributes);
                    });
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
                    this.dispatcher.send(Events.REORDER, {
                        group: group
                    });
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
             * @return {Object}
             */

            value: function addElements() {
                return {};
            },
            writable: true,
            configurable: true
        },
        addFeatures: {

            /**
             * @method addFeatures
             * @return {void}
             */

            value: function addFeatures() {
                var _this = this;

                var dispatcher = new Dispatcher();

                this.features = {
                    selectable: new Selectable(this).setDispatcher(dispatcher),
                    movable: new Movable(this).setDispatcher(dispatcher)
                };

                dispatcher.listen(Events.SELECTABLE.DESELECT, function (model) {
                    _this.dispatcher.send(Events.DESELECT_ALL, model);
                    _this.tryInvokeOnEachFeature("deselect");
                });

                dispatcher.listen(Events.SELECTABLE.SELECT, function (model) {
                    _this.dispatcher.send(Events.SELECT, model);
                    _this.tryInvokeOnEachFeature("select");
                });
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

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Utility.js":7,"./features/Movable.js":12,"./features/Selectable.js":13}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

//import utility  from './../../helpers/Utility.js';

var registry = _interopRequire(require("./../../helpers/Registry.js"));

/**
 * @module Blueprint
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Movable = (function (Feature) {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Movable}
     * @constructor
     */

    function Movable(shape) {
        var _this = this;

        var _d3$behavior$drag$on$on, _d3$behavior$drag$on, _d3$behavior$drag;

        _classCallCheck(this, Movable);

        _get(Object.getPrototypeOf(Movable.prototype), "constructor", this).call(this, shape);

        /**
         * @property start
         * @type {Object}
         */
        this.start = { x: 0, y: 0 };

        var dragStart = ["dragstart", function () {
            return _this.dragStart();
        }],
            drag = ["drag", function () {
            return _this.drag();
        }],
            dragEnd = ["dragend", function () {
            return _this.dragEnd();
        }];

        shape.element.call((_d3$behavior$drag$on$on = (_d3$behavior$drag$on = (_d3$behavior$drag = d3.behavior.drag()).on.apply(_d3$behavior$drag, dragStart)).on.apply(_d3$behavior$drag$on, drag)).on.apply(_d3$behavior$drag$on$on, dragEnd));
    }

    _inherits(Movable, Feature);

    _prototypeProperties(Movable, null, {
        moveLeft: {

            /**
             * @method moveLeft
             * @param {Object} model
             * @return {void}
             */

            value: function moveLeft(model) {
                this.shape.getInterface().x(this.shape.getInterface().x() - model.by);
            },
            writable: true,
            configurable: true
        },
        moveRight: {

            /**
             * @method moveRight
             * @param {Object} model
             * @return {void}
             */

            value: function moveRight(model) {
                this.shape.getInterface().x(this.shape.getInterface().x() + model.by);
            },
            writable: true,
            configurable: true
        },
        moveUp: {

            /**
             * @method moveUp
             * @param {Object} model
             * @return {void}
             */

            value: function moveUp(model) {
                this.shape.getInterface().y(this.shape.getInterface().y() - model.by);
            },
            writable: true,
            configurable: true
        },
        moveDown: {

            /**
             * @method moveDown
             * @param {Object} model
             * @return {void}
             */

            value: function moveDown(model) {
                this.shape.getInterface().y(this.shape.getInterface().y() + model.by);
            },
            writable: true,
            configurable: true
        },
        dragStart: {

            /**
             * @method dragStart
             * @param {Number} [x=null]
             * @param {Number} [y=null]
             * @return {void}
             */

            value: function dragStart() {
                var x = arguments[0] === undefined ? null : arguments[0];
                var y = arguments[1] === undefined ? null : arguments[1];

                this.start = {
                    x: !_.isNull(x) ? x : d3.event.sourceEvent.clientX - this.shape.getInterface().x(),
                    y: !_.isNull(y) ? y : d3.event.sourceEvent.clientY - this.shape.getInterface().y()
                };

                this.shape.group.classed("dragging", true);
            },
            writable: true,
            configurable: true
        },
        drag: {

            /**
             * @method drag
             * @param {Number} [x=null]
             * @param {Number} [y=null]
             * @param {Number} [multipleOf=registry.snapGrid]
             * @return {void}
             */

            value: function drag() {
                var x = arguments[0] === undefined ? null : arguments[0];
                var y = arguments[1] === undefined ? null : arguments[1];
                var multipleOf = arguments[2] === undefined ? registry.snapGrid : arguments[2];

                x = !_.isNull(x) ? x : d3.event.sourceEvent.clientX;
                y = !_.isNull(y) ? y : d3.event.sourceEvent.clientY;

                var mX = x - this.start.x,
                    mY = y - this.start.y,
                    eX = Math.ceil(mX / multipleOf) * multipleOf,
                    eY = Math.ceil(mY / multipleOf) * multipleOf;

                this.shape.getInterface().x(eX);
                this.shape.getInterface().y(eY);
            },
            writable: true,
            configurable: true
        },
        dragEnd: {

            /**
             * @method dragEnd
             * @return {void}
             */

            value: function dragEnd() {
                this.shape.group.classed("dragging", false);
            },
            writable: true,
            configurable: true
        }
    });

    return Movable;
})(Feature);

module.exports = Movable;

},{"./../../helpers/Registry.js":6,"./../Feature.js":9}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

var Events = _interopRequire(require("./../../helpers/Events.js"));

var registry = _interopRequire(require("./../../helpers/Registry.js"));

/**
 * @module Blueprint
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Selectable = (function (Feature) {

    /**
     * @method element
     * @param {Shape} shape
     * @return {Selectable}
     * @constructor
     */

    function Selectable(shape) {
        var _this = this;

        _classCallCheck(this, Selectable);

        _get(Object.getPrototypeOf(Selectable.prototype), "constructor", this).call(this, shape);
        this.selected = false;

        shape.element.on("mousedown", function () {

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                _this.dispatcher.send(Events.SELECTABLE.DESELECT, {
                    shape: shape.getInterface()
                });
            }

            if (!_this.selected) {
                _this.dispatcher.send(Events.SELECTABLE.SELECT, {
                    shape: shape.getInterface()
                });
            }
        });
    }

    _inherits(Selectable, Feature);

    _prototypeProperties(Selectable, null, {
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {

                if (!this.selected) {
                    this.shape.group.classed("selected", true);
                    this.shape.getInterface().select();
                    this.shape.getInterface().stroke("black").strokeWidth(1).strokeDashArray([3, 3]);
                    this.selected = true;
                }
            },
            writable: true,
            configurable: true
        },
        deselect: {

            /**
             * @method deselect
             * @return {void}
             */

            value: function deselect() {

                if (this.selected) {
                    this.shape.group.classed("selected", false);
                    this.shape.getInterface().deselect();
                    this.shape.getInterface().stroke("none");
                    this.selected = false;
                }
            },
            writable: true,
            configurable: true
        }
    });

    return Selectable;
})(Feature);

module.exports = Selectable;

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":6,"./../Feature.js":9}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../Interface.js"));

/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */

var Rectangle = (function (Interface) {
  function Rectangle() {
    _classCallCheck(this, Rectangle);

    if (Interface != null) {
      Interface.apply(this, arguments);
    }
  }

  _inherits(Rectangle, Interface);

  _prototypeProperties(Rectangle, null, {
    fill: {

      /**
       * @method fill
       * @param {String} [value=undefined]
       * @return {Interface}
       */

      value: function fill(value) {
        return this.attr("fill", value);
      },
      writable: true,
      configurable: true
    }
  });

  return Rectangle;
})(Interface);

module.exports = Rectangle;

},{"./../Interface.js":10}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Shape = _interopRequire(require("./../Shape.js"));

var Interface = _interopRequire(require("./../interfaces/Rectangle.js"));

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
    addInterface: {

      /**
       * @method addInterface
       * @return {Interface}
       */

      value: function addInterface() {
        return new Interface(this.label);
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
    }
  });

  return Rectangle;
})(Shape);

module.exports = Rectangle;

},{"./../Shape.js":11,"./../interfaces/Rectangle.js":14}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1JlZ2lzdHJ5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9aSW5kZXguanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvRmVhdHVyZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvZmVhdHVyZXMvTW92YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ludGVyZmFjZXMvUmVjdGFuZ2xlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU8sVUFBVSwyQkFBTSx5QkFBeUI7O0lBQ3pDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLFFBQVEsMkJBQVEsdUJBQXVCOztJQUN2QyxPQUFPLDJCQUFTLHNCQUFzQjs7OztJQUd0QyxLQUFLLDJCQUFXLG1CQUFtQjs7SUFDbkMsU0FBUywyQkFBTyw2QkFBNkI7Ozs7Ozs7O0lBTzlDLFNBQVM7Ozs7Ozs7OztBQVFBLGFBUlQsU0FBUyxDQVFDLE9BQU87WUFBRSxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixTQUFTOztBQVVQLFlBQUksQ0FBQyxPQUFPLEdBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLE9BQU8sR0FBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQ3pDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNqRSxZQUFJLENBQUMsTUFBTSxHQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsS0FBSyxHQUFRLENBQUMsQ0FBQzs7O0FBR3BCLFlBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNuQyxZ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U0FBUztBQU0xQixVQUFNOzs7Ozs7O2FBQUEsa0JBQUc7QUFDTCxlQUFPLE1BQU0sQ0FBQztPQUNqQjs7OztBQU1ELGdCQUFZOzs7Ozs7O2FBQUEsd0JBQUc7QUFDWCxlQUFPLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNwQzs7OztBQU1ELGlCQUFhOzs7Ozs7O2FBQUEseUJBQUc7QUFDWixlQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7T0FDbEU7Ozs7OztTQXhCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCByZWdpc3RyeSAgIGZyb20gJy4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgICBmcm9tICcuL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8vIFNoYXBlcy5cbmltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vc2hhcGVzL1NoYXBlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudHxTdHJpbmd9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QodXRpbGl0eS5lbGVtZW50UmVmZXJlbmNlKGVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRIZWlnaHQpO1xuICAgICAgICB0aGlzLnNoYXBlcyAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5pbmRleCAgICAgID0gMTtcblxuICAgICAgICAvLyBIZWxwZXJzIHJlcXVpcmVkIGJ5IEJsdWVwcmludCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgdGhpcy56SW5kZXggICAgID0gbmV3IFpJbmRleCgpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKCkuYWRkVG8odGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBhbmQgc2V0dXAgTW91c2V0cmFwIHRvIGxpc3RlbiBmb3Iga2V5Ym9hcmQgZXZlbnRzLlxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBNb3VzZXRyYXAoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICBsZXQgc2hhcGUgICA9IHRoaXMuaW5zdGFudGlhdGUodXRpbGl0eS5lbGVtZW50TmFtZShuYW1lKSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKSxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5pbmRleCAtIDEgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgc2hhcGUuc2V0QXR0cmlidXRlcyhfLmFzc2lnbih6SW5kZXgsIHNoYXBlLmdldEF0dHJpYnV0ZXMoKSkpO1xuXG4gICAgICAgIC8vIExhc3QgY2hhbmNlIHRvIGRlZmluZSBhbnkgZnVydGhlciBlbGVtZW50cyBmb3IgdGhlIGdyb3VwLCBhbmQgdGhlIGFwcGxpY2F0aW9uIG9mIHRoZVxuICAgICAgICAvLyBmZWF0dXJlcyB3aGljaCBhIHNoYXBlIHNob3VsZCBoYXZlLCBzdWNoIGFzIGJlaW5nIGRyYWdnYWJsZSwgc2VsZWN0YWJsZSwgcmVzaXplYWJsZSwgZXRjLi4uXG4gICAgICAgIHNoYXBlLmFkZEVsZW1lbnRzKCk7XG4gICAgICAgIHNoYXBlLmFkZEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge0ludGVyZmFjZX0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICByZW1vdmUobW9kZWwpIHtcblxuICAgICAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICAgICAgaXRlbSAgPSBfLmZpbmQodGhpcy5zaGFwZXMsIChzaGFwZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlLmludGVyZmFjZSA9PT0gbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpdGVtLnNoYXBlLmVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtTaGFwZVtdfVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLm1hcCgobW9kZWwpID0+IG1vZGVsLmludGVyZmFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnNoYXBlcywgKHNoYXBlKSA9PiB0aGlzLnJlbW92ZShzaGFwZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaWRlbnRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgaWRlbnQoKSB7XG4gICAgICAgIHJldHVybiBbJ0JQJywgdGhpcy5pbmRleCsrXS5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlZ2lzdGVyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW292ZXJ3cml0ZT1mYWxzZV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlZ2lzdGVyKG5hbWUsIHNoYXBlLCBvdmVyd3JpdGUgPSBmYWxzZSkge1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgc2hhcGUgaXMgYSB2YWxpZCBpbnN0YW5jZS5cbiAgICAgICAgdXRpbGl0eS5hc3NlcnQoT2JqZWN0LmdldFByb3RvdHlwZU9mKHNoYXBlKSA9PT0gU2hhcGUsICdDdXN0b20gc2hhcGUgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBgU2hhcGVgJywgJ0luc3RhbmNlIG9mIFNoYXBlJyk7XG5cbiAgICAgICAgaWYgKCFvdmVyd3JpdGUgJiYgdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblxuICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc2hhcGVzIGNhbm5vdCBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFJlZnVzaW5nIHRvIG92ZXJ3cml0ZSBleGlzdGluZyAke25hbWV9IHNoYXBlIHdpdGhvdXQgZXhwbGljaXQgb3ZlcndyaXRlYCwgJ092ZXJ3cml0aW5nIEV4aXN0aW5nIFNoYXBlcycpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcFtuYW1lXSA9IHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnN0YW50aWF0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgaW5zdGFudGlhdGUobmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV0odGhpcy5pZGVudCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEV2ZW50TGlzdGVuZXJzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRFdmVudExpc3RlbmVycygpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChldmVudCkgID0+IHRoaXMucmVtb3ZlKGV2ZW50LmludGVyZmFjZSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU9SREVSLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBncm91cHMgPSB0aGlzLmVsZW1lbnQuc2VsZWN0QWxsKGBnWyR7dGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGV9XWApO1xuICAgICAgICAgICAgdGhpcy56SW5kZXgucmVvcmRlcihncm91cHMsIGV2ZW50Lmdyb3VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIFNWRyBsYXllciB0aGF0IGlzbid0IGEgcGFydCBvZiB0aGUgc2hhcGUgZ3JvdXAsIHRoZW4gd2UnbGwgZW1pdFxuICAgICAgICAvLyB0aGUgYEV2ZW50cy5ERVNFTEVDVGAgZXZlbnQgdG8gZGVzZWxlY3QgYWxsIHNlbGVjdGVkIHNoYXBlcy5cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0dXBNb3VzZXRyYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldHVwTW91c2V0cmFwKCkge1xuXG4gICAgICAgIGxldCBTTUFMTF9NT1ZFID0gMSxcbiAgICAgICAgICAgIExBUkdFX01PVkUgPSAxMDtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gcmVnaXN0cnkua2V5cy5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiByZWdpc3RyeS5rZXlzLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gcmVnaXN0cnkua2V5cy5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIG1vdmVcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBsZXQgbW92ZSA9IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQobmFtZSwgeyBieTogdmFsdWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ2xlZnQnLCAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9MRUZULCBTTUFMTF9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdyaWdodCcsICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfUklHSFQsIFNNQUxMX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3VwJywgICAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9VUCwgU01BTExfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnZG93bicsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0RPV04sIFNNQUxMX01PVkUpKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrbGVmdCcsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0xFRlQsIExBUkdFX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0K3JpZ2h0JywgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9SSUdIVCwgTEFSR0VfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrdXAnLCAgICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1VQLCBMQVJHRV9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCtkb3duJywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfRE9XTiwgTEFSR0VfTU9WRSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YUF0dHJpYnV0ZTogJ2RhdGEtaWQnLFxuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJ1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogRGlyZWN0IGxpbmsgdG8gZWx1Y2lkYXRpbmcgY29tbW9uIGV4Y2VwdGlvbiBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEBjb25zdGFudCBFWENFUFRJT05TX1VSTFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgRVhDRVBUSU9OU19VUkw6ICdodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludC9ibG9iL21hc3Rlci9FWENFUFRJT05TLm1kI3t0aXRsZX0nXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIE1PVkVfVVA6ICdtb3ZlLXVwJyxcbiAgICBNT1ZFX0RPV046ICdtb3ZlLWRvd24nLFxuICAgIE1PVkVfTEVGVDogJ21vdmUtbGVmdCcsXG4gICAgTU9WRV9SSUdIVDogJ21vdmUtcmlnaHQnLFxuICAgIFNFTEVDVDogJ3NlbGVjdCcsXG4gICAgU0VMRUNUX0FMTDogJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1Q6ICdkZXNlbGVjdCcsXG4gICAgU0VMRUNUQUJMRToge1xuICAgICAgICBTRUxFQ1Q6ICdzZWxlY3RhYmxlLXNlbGVjdCcsXG4gICAgICAgIERFU0VMRUNUOiAnc2VsZWN0YWJsZS1kZXNlbGVjdCdcbiAgICB9XG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRUb1xuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0dyb3Vwc31cbiAgICAgKi9cbiAgICBhZGRUbyhlbGVtZW50KSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGVsZW1lbnRzIGZyb20gbGVha2luZyB0aHJvdWdoIHRvIHRoZSBTVkcgbGF5ZXIuXG4gICAgICAgIHRoaXMuc2hhcGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVnaXN0cnlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgd2hlbiBjZXJ0YWluIGtleXMgYXJlIHByZXNzZWQgZG93biwgd2hpY2ggd2lsbCBkZXRlcm1pbmUgdGhlXG4gICAgICogc3RyYXRlZ3kgYXQgcnVudGltZSBmb3IgY2VydGFpbiBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkga2V5c1xuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5czoge1xuICAgICAgICBtdWx0aVNlbGVjdDogZmFsc2UsXG4gICAgICAgIGFzcGVjdFJhdGlvOiBmYWxzZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgc25hcEdyaWRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHNuYXBHcmlkOiAxMFxuXG59IiwiaW1wb3J0IENvbnN0YW50cyBmcm9tICcuL0NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgVXRpbGl0eVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbnZhciB1dGlsaXR5ID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRocm93RXhjZXB0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbZXhjZXB0aW9uc1RpdGxlPScnXVxuICAgICAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhyb3dFeGNlcHRpb246IChtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUgPSAnJykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoZXhjZXB0aW9uc1RpdGxlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBDb25zdGFudHMuRVhDRVBUSU9OU19VUkwucmVwbGFjZSgveyguKz8pfS9pLCAoKSA9PiBfLmtlYmFiQ2FzZShleGNlcHRpb25zVGl0bGUpKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJsdWVwcmludC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmx1ZXByaW50LmpzOiAke21lc3NhZ2V9LmApO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYXNzZXJ0XG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNzZXJ0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBleGNlcHRpb25zVGl0bGVcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGFzc2VydChhc3NlcnRpb24sIG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSkge1xuXG4gICAgICAgICAgICBpZiAoIWFzc2VydGlvbikge1xuICAgICAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24obWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50TmFtZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudE5hbWUobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudFJlZmVyZW5jZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50UmVmZXJlbmNlKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kZWwpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBaSW5kZXhcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaSW5kZXgge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIGxldCB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG5cbiAgICAgICAgdmFyIHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBfLmZvckVhY2goZ3JvdXBzWzBdLCAobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEZlYXR1cmVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHtGZWF0dXJlfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEV2ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRzKGRpc3BhdGNoZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG59IiwiaW1wb3J0IEV2ZW50cyAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgICAgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwge1xuICAgICAgICAgICAgJ2ludGVyZmFjZSc6IHRoaXNcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaXNTZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3knLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cmFuc2Zvcm1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgdHJhbnNmb3JtKHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIGlmICghXy5pc051bGwoeCkpIHtcbiAgICAgICAgICAgIHRoaXMueCh4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc051bGwoeSkpIHtcbiAgICAgICAgICAgIHRoaXMueSh5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBvcGFjaXR5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ29wYWNpdHknLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzdHJva2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8U3RyaW5nfVxuICAgICAqL1xuICAgIHN0cm9rZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzdHJva2VXaWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc3Ryb2tlV2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLXdpZHRoJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc3Ryb2tlRGFzaEFycmF5XG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHN0cm9rZURhc2hBcnJheSh2YWx1ZSkge1xuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHV0aWxpdHkuYXNzZXJ0KF8uaXNBcnJheSh2YWx1ZSksICdNZXRob2QgYHN0cm9rZURhc2hBcnJheWAgZXhwZWN0cyBhbiBhcnJheSB2YWx1ZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsIHZhbHVlLmpvaW4oJywnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UtZGFzaGFycmF5Jyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdUb0Zyb250XG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBicmluZ1RvRnJvbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCBJbmZpbml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzZW5kVG9CYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgLUluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHNlbmRCYWNrd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiAtIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGJyaW5nRm9yd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiArIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB3aWR0aCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd3aWR0aCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hlaWdodCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPW51bGxdXG4gICAgICogQHJldHVybiB7Knx2b2lkfVxuICAgICAqL1xuICAgIGF0dHIocHJvcGVydHksIHZhbHVlID0gbnVsbCkge1xuXG4gICAgICAgIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbW9kZWwgICAgICAgPSB7fTtcbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIobW9kZWwpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgc2V0QXR0cihhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX1NFVCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdXRpbGl0eS5rZWJhYmlmeUtleXMoYXR0cmlidXRlcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cigpIHtcblxuICAgICAgICBsZXQgcmVzdWx0ID0ge307XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCB7fSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZV1gO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi8uLi9oZWxwZXJzL0Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgICBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8vIEZlYXR1cmVzLlxuaW1wb3J0IFNlbGVjdGFibGUgZnJvbSAnLi9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzJztcbmltcG9ydCBNb3ZhYmxlICAgIGZyb20gJy4vZmVhdHVyZXMvTW92YWJsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEdyb3VwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRHcm91cChncm91cCkge1xuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVF9BTEwsICAgKCkgICAgICA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ3NlbGVjdCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuREVTRUxFQ1RfQUxMLCAoKSAgICAgID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnZGVzZWxlY3QnKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfTEVGVCwgICAgKG1vZGVsKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ21vdmVMZWZ0JywgbW9kZWwsICdpc1NlbGVjdGVkJykpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5NT1ZFX1JJR0hULCAgIChtb2RlbCkgPT4gdGhpcy50cnlJbnZva2VPbkVhY2hGZWF0dXJlKCdtb3ZlUmlnaHQnLCBtb2RlbCwgJ2lzU2VsZWN0ZWQnKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfVVAsICAgICAgKG1vZGVsKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ21vdmVVcCcsIG1vZGVsLCAnaXNTZWxlY3RlZCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuTU9WRV9ET1dOLCAgICAobW9kZWwpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnbW92ZURvd24nLCBtb2RlbCwgJ2lzU2VsZWN0ZWQnKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyeUludm9rZU9uRWFjaEZlYXR1cmVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kTmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2NvbmRpdGlvbmFsRm49bnVsbF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHRyeUludm9rZU9uRWFjaEZlYXR1cmUobWV0aG9kTmFtZSwgcHJvcGVydGllcyA9IHt9LCBjb25kaXRpb25hbEZuID0gbnVsbCkge1xuXG4gICAgICAgIF8uZm9ySW4odGhpcy5mZWF0dXJlcywgKGZlYXR1cmUpID0+IHtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmZWF0dXJlW21ldGhvZE5hbWVdKSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNTdHJpbmcoY29uZGl0aW9uYWxGbikgJiYgIXRoaXMuZ2V0SW50ZXJmYWNlKClbY29uZGl0aW9uYWxGbl0oKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmVhdHVyZVttZXRob2ROYW1lXShwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3VsZCBiZSBvdmVyd3JpdHRlbiBmb3Igc2hhcGUgdHlwZXMgdGhhdCBoYXZlIGEgZGlmZmVyZW50IG5hbWUgdG8gdGhlaXIgU1ZHIHRhZyBuYW1lLCBzdWNoIGFzIGEgYGZvcmVpZ25PYmplY3RgXG4gICAgICogZWxlbWVudCB1c2luZyB0aGUgYHJlY3RgIHNoYXBlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFnKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnRlcmZhY2VcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZ2V0SW50ZXJmYWNlKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmludGVyZmFjZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IHRoaXMuYWRkSW50ZXJmYWNlKCk7XG4gICAgICAgICAgICBsZXQgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgZ2V0QXR0cmlidXRlcyA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCB6SW5kZXggPSB7IHo6IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpLmRhdHVtKCkueiB9LFxuICAgICAgICAgICAgICAgICAgICBtb2RlbCAgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSwgekluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5yZXRyYW5zZm9ybUF0dHJpYnV0ZXMobW9kZWwpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW5lcnMgdGhhdCBob29rIHVwIHRoZSBpbnRlcmZhY2UgYW5kIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsICAgICAgICBnZXRBdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChtb2RlbCkgICAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIG1vZGVsKSk7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX1NFVCwgKG1vZGVsKSA9PiB7IHRoaXMuc2V0QXR0cmlidXRlcyhtb2RlbC5hdHRyaWJ1dGVzKTsgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIGxldCBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIsIHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEZlYXR1cmVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRGZWF0dXJlcygpIHtcblxuICAgICAgICBsZXQgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKHRoaXMpLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlciksXG4gICAgICAgICAgICBtb3ZhYmxlOiAgICBuZXcgTW92YWJsZSh0aGlzKS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEFCTEUuREVTRUxFQ1QsIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUX0FMTCwgbW9kZWwpO1xuICAgICAgICAgICAgdGhpcy50cnlJbnZva2VPbkVhY2hGZWF0dXJlKCdkZXNlbGVjdCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUQUJMRS5TRUxFQ1QsIChtb2RlbCkgICA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNULCBtb2RlbCk7XG4gICAgICAgICAgICB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ3NlbGVjdCcpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgbGV0IHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRmVhdHVyZSAgZnJvbSAnLi8uLi9GZWF0dXJlLmpzJztcbi8vaW1wb3J0IHV0aWxpdHkgIGZyb20gJy4vLi4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcbmltcG9ydCByZWdpc3RyeSBmcm9tICcuLy4uLy4uL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIE1vdmFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZhYmxlIGV4dGVuZHMgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge01vdmFibGV9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICBzdXBlcihzaGFwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzdGFydFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdGFydCA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgICAgIGxldCBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldLFxuICAgICAgICAgICAgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV0sXG4gICAgICAgICAgICBkcmFnRW5kICAgPSBbJ2RyYWdlbmQnLCAgICgpID0+IHRoaXMuZHJhZ0VuZCgpXTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKC4uLmRyYWdTdGFydCkub24oLi4uZHJhZykub24oLi4uZHJhZ0VuZCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlTGVmdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbW92ZUxlZnQobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpIC0gbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZVJpZ2h0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlUmlnaHQobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpICsgbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZVVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlVXAobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSgpIC0gbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZURvd25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVEb3duKG1vZGVsKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSh0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoKSArIG1vZGVsLmJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdTdGFydFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ1N0YXJ0KHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAhXy5pc051bGwoeCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WCAtIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpLFxuICAgICAgICAgICAgeTogIV8uaXNOdWxsKHkpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFkgLSB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hhcGUuZ3JvdXAuY2xhc3NlZCgnZHJhZ2dpbmcnLCB0cnVlKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbbXVsdGlwbGVPZj1yZWdpc3RyeS5zbmFwR3JpZF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWcoeCA9IG51bGwsIHkgPSBudWxsLCBtdWx0aXBsZU9mID0gcmVnaXN0cnkuc25hcEdyaWQpIHtcblxuICAgICAgICB4ID0gIV8uaXNOdWxsKHgpID8geCA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFg7XG4gICAgICAgIHkgPSAhXy5pc051bGwoeSkgPyB5IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WTtcblxuICAgICAgICBsZXQgbVggPSAoeCAtIHRoaXMuc3RhcnQueCksXG4gICAgICAgICAgICBtWSA9ICh5IC0gdGhpcy5zdGFydC55KSxcbiAgICAgICAgICAgIGVYID0gTWF0aC5jZWlsKG1YIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mLFxuICAgICAgICAgICAgZVkgPSBNYXRoLmNlaWwobVkgLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2Y7XG5cbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KGVYKTtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KGVZKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ0VuZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ0VuZCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdkcmFnZ2luZycsIGZhbHNlKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgRmVhdHVyZSAgZnJvbSAnLi8uLi9GZWF0dXJlLmpzJztcbmltcG9ydCBFdmVudHMgICBmcm9tICcuLy4uLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCByZWdpc3RyeSBmcm9tICcuLy4uLy4uL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NlbGVjdGFibGV9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICBzdXBlcihzaGFwZSk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghcmVnaXN0cnkua2V5cy5tdWx0aVNlbGVjdCkge1xuXG4gICAgICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWxsIG9mIHRoZSBzaGFwZXMgaW5jbHVkaW5nIHRoZSBjdXJyZW50IG9uZSwgYXMgdGhpcyBrZWVwcyB0aGUgbG9naWMgc2ltcGxlci4gV2Ugd2lsbFxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRoZSBjdXJyZW50IHNoYXBlIHRvIGJlIHNlbGVjdGVkIGluIHRoZSBuZXh0IHN0ZXAuXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVEFCTEUuREVTRUxFQ1QsIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcGU6IHNoYXBlLmdldEludGVyZmFjZSgpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVEFCTEUuU0VMRUNULCB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXBlOiBzaGFwZS5nZXRJbnRlcmZhY2UoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdCgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ3JvdXAuY2xhc3NlZCgnc2VsZWN0ZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuc2VsZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnN0cm9rZSgnYmxhY2snKS5zdHJva2VXaWR0aCgxKS5zdHJva2VEYXNoQXJyYXkoWzMsIDNdKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcblxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdzZWxlY3RlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuc3Ryb2tlKCdub25lJyk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH1cblxufSIsImltcG9ydCBJbnRlcmZhY2UgZnJvbSAnLi8uLi9JbnRlcmZhY2UuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGZpbGxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZmlsbCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgdmFsdWUpO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSAgICAgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5pbXBvcnQgSW50ZXJmYWNlIGZyb20gJy4vLi4vaW50ZXJmYWNlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBhZGRJbnRlcmZhY2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJmYWNlKHRoaXMubGFiZWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbn0iXX0=
