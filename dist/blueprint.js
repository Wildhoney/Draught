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
        selected: {

            /**
             * @method selected
             * @return {Array}
             */

            value: function selected() {
                return this.all().filter(function (shapeInterface) {
                    return shapeInterface.isSelected();
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
                this.dispatcher.listen(Events.SELECTED_GET, function () {
                    return _this.dispatcher.send(Events.SELECTED_LIST, _this.selected());
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
    SELECTED_GET: "selected-get",
    SELECTED_LIST: "selected-list",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1JlZ2lzdHJ5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9aSW5kZXguanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvRmVhdHVyZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvZmVhdHVyZXMvTW92YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ludGVyZmFjZXMvUmVjdGFuZ2xlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU8sVUFBVSwyQkFBTSx5QkFBeUI7O0lBQ3pDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLFFBQVEsMkJBQVEsdUJBQXVCOztJQUN2QyxPQUFPLDJCQUFTLHNCQUFzQjs7OztJQUd0QyxLQUFLLDJCQUFXLG1CQUFtQjs7SUFDbkMsU0FBUywyQkFBTyw2QkFBNkI7Ozs7Ozs7O0lBTzlDLFNBQVM7Ozs7Ozs7OztBQVFBLGFBUlQsU0FBUyxDQVFDLE9BQU87WUFBRSxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixTQUFTOztBQVVQLFlBQUksQ0FBQyxPQUFPLEdBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLE9BQU8sR0FBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQ3pDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNqRSxZQUFJLENBQUMsTUFBTSxHQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsS0FBSyxHQUFRLENBQUMsQ0FBQzs7O0FBR3BCLFlBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNuQyxZ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RUFBUyxTQUFTOzt1QkFBM0IsU0FBUztBQU8xQixRQUFJOzs7Ozs7OzthQUFBLGNBQUMsS0FBSyxFQUFFO0FBQ1IsZUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNuQzs7Ozs7O1NBVGdCLFNBQVM7R0FBUyxTQUFTOztpQkFBM0IsU0FBUzs7Ozs7Ozs7Ozs7OztJQ1J2QixLQUFLLDJCQUFVLGVBQWU7O0lBQzlCLFNBQVMsMkJBQU0sOEJBQThCOzs7Ozs7Ozs7SUFRL0IsU0FBUyxjQUFTLEtBQUs7V0FBdkIsU0FBUzswQkFBVCxTQUFTOztRQUFTLEtBQUs7QUFBTCxXQUFLOzs7O1lBQXZCLFNBQVMsRUFBUyxLQUFLOzt1QkFBdkIsU0FBUztBQU0xQixVQUFNOzs7Ozs7O2FBQUEsa0JBQUc7QUFDTCxlQUFPLE1BQU0sQ0FBQztPQUNqQjs7OztBQU1ELGdCQUFZOzs7Ozs7O2FBQUEsd0JBQUc7QUFDWCxlQUFPLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNwQzs7OztBQU1ELGlCQUFhOzs7Ozs7O2FBQUEseUJBQUc7QUFDWixlQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7T0FDbEU7Ozs7OztTQXhCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCByZWdpc3RyeSAgIGZyb20gJy4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgICBmcm9tICcuL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8vIFNoYXBlcy5cbmltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vc2hhcGVzL1NoYXBlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudHxTdHJpbmd9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QodXRpbGl0eS5lbGVtZW50UmVmZXJlbmNlKGVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRIZWlnaHQpO1xuICAgICAgICB0aGlzLnNoYXBlcyAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5pbmRleCAgICAgID0gMTtcblxuICAgICAgICAvLyBIZWxwZXJzIHJlcXVpcmVkIGJ5IEJsdWVwcmludCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgdGhpcy56SW5kZXggICAgID0gbmV3IFpJbmRleCgpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKCkuYWRkVG8odGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBhbmQgc2V0dXAgTW91c2V0cmFwIHRvIGxpc3RlbiBmb3Iga2V5Ym9hcmQgZXZlbnRzLlxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBNb3VzZXRyYXAoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICBsZXQgc2hhcGUgICA9IHRoaXMuaW5zdGFudGlhdGUodXRpbGl0eS5lbGVtZW50TmFtZShuYW1lKSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKSxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5pbmRleCAtIDEgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgc2hhcGUuc2V0QXR0cmlidXRlcyhfLmFzc2lnbih6SW5kZXgsIHNoYXBlLmdldEF0dHJpYnV0ZXMoKSkpO1xuXG4gICAgICAgIC8vIExhc3QgY2hhbmNlIHRvIGRlZmluZSBhbnkgZnVydGhlciBlbGVtZW50cyBmb3IgdGhlIGdyb3VwLCBhbmQgdGhlIGFwcGxpY2F0aW9uIG9mIHRoZVxuICAgICAgICAvLyBmZWF0dXJlcyB3aGljaCBhIHNoYXBlIHNob3VsZCBoYXZlLCBzdWNoIGFzIGJlaW5nIGRyYWdnYWJsZSwgc2VsZWN0YWJsZSwgcmVzaXplYWJsZSwgZXRjLi4uXG4gICAgICAgIHNoYXBlLmFkZEVsZW1lbnRzKCk7XG4gICAgICAgIHNoYXBlLmFkZEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge0ludGVyZmFjZX0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICByZW1vdmUobW9kZWwpIHtcblxuICAgICAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICAgICAgaXRlbSAgPSBfLmZpbmQodGhpcy5zaGFwZXMsIChzaGFwZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlLmludGVyZmFjZSA9PT0gbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpdGVtLnNoYXBlLmVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtTaGFwZVtdfVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLm1hcCgobW9kZWwpID0+IG1vZGVsLmludGVyZmFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIHNlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKS5maWx0ZXIoKHNoYXBlSW50ZXJmYWNlKSA9PiBzaGFwZUludGVyZmFjZS5pc1NlbGVjdGVkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5zaGFwZXMsIChzaGFwZSkgPT4gdGhpcy5yZW1vdmUoc2hhcGUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlkZW50XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGlkZW50KCkge1xuICAgICAgICByZXR1cm4gWydCUCcsIHRoaXMuaW5kZXgrK10uam9pbignJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWdpc3RlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvdmVyd3JpdGU9ZmFsc2VdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWdpc3RlcihuYW1lLCBzaGFwZSwgb3ZlcndyaXRlID0gZmFsc2UpIHtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIHNoYXBlIGlzIGEgdmFsaWQgaW5zdGFuY2UuXG4gICAgICAgIHV0aWxpdHkuYXNzZXJ0KE9iamVjdC5nZXRQcm90b3R5cGVPZihzaGFwZSkgPT09IFNoYXBlLCAnQ3VzdG9tIHNoYXBlIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFNoYXBlYCcsICdJbnN0YW5jZSBvZiBTaGFwZScpO1xuXG4gICAgICAgIGlmICghb3ZlcndyaXRlICYmIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cbiAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNoYXBlcyBjYW5ub3QgYmUgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKGBSZWZ1c2luZyB0byBvdmVyd3JpdGUgZXhpc3RpbmcgJHtuYW1lfSBzaGFwZSB3aXRob3V0IGV4cGxpY2l0IG92ZXJ3cml0ZWAsICdPdmVyd3JpdGluZyBFeGlzdGluZyBTaGFwZXMnKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zdGFudGlhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGluc3RhbnRpYXRlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKHRoaXMuaWRlbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVNT1ZFLCAoZXZlbnQpICA9PiB0aGlzLnJlbW92ZShldmVudC5pbnRlcmZhY2UpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNURURfR0VULCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNURURfTElTVCwgdGhpcy5zZWxlY3RlZCgpKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFT1JERVIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGdyb3VwcyA9IHRoaXMuZWxlbWVudC5zZWxlY3RBbGwoYGdbJHt0aGlzLm9wdGlvbnMuZGF0YUF0dHJpYnV0ZX1dYCk7XG4gICAgICAgICAgICB0aGlzLnpJbmRleC5yZW9yZGVyKGdyb3VwcywgZXZlbnQuZ3JvdXApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGUgU1ZHIGxheWVyIHRoYXQgaXNuJ3QgYSBwYXJ0IG9mIHRoZSBzaGFwZSBncm91cCwgdGhlbiB3ZSdsbCBlbWl0XG4gICAgICAgIC8vIHRoZSBgRXZlbnRzLkRFU0VMRUNUYCBldmVudCB0byBkZXNlbGVjdCBhbGwgc2VsZWN0ZWQgc2hhcGVzLlxuICAgICAgICB0aGlzLmVsZW1lbnQub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUX0FMTCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXR1cE1vdXNldHJhcFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0dXBNb3VzZXRyYXAoKSB7XG5cbiAgICAgICAgbGV0IFNNQUxMX01PVkUgPSAxLFxuICAgICAgICAgICAgTEFSR0VfTU9WRSA9IDEwO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHJlZ2lzdHJ5LmtleXMubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHJlZ2lzdHJ5LmtleXMuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiByZWdpc3RyeS5rZXlzLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgbW92ZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGxldCBtb3ZlID0gKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChuYW1lLCB7IGJ5OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbGVmdCcsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0xFRlQsIFNNQUxMX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3JpZ2h0JywgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9SSUdIVCwgU01BTExfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgndXAnLCAgICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1VQLCBTTUFMTF9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdkb3duJywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfRE9XTiwgU01BTExfTU9WRSkpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCtsZWZ0JywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfTEVGVCwgTEFSR0VfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrcmlnaHQnLCAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1JJR0hULCBMQVJHRV9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCt1cCcsICAgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfVVAsIExBUkdFX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0K2Rvd24nLCAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9ET1dOLCBMQVJHRV9NT1ZFKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhQXR0cmlidXRlOiAnZGF0YS1pZCcsXG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlUHJvdG90eXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGVQcm90b3R5cGUoKSB7XG4gICAgICAgIHJldHVybiBTaGFwZTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBDb25zdGFudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBEaXJlY3QgbGluayB0byBlbHVjaWRhdGluZyBjb21tb24gZXhjZXB0aW9uIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQGNvbnN0YW50IEVYQ0VQVElPTlNfVVJMXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBFWENFUFRJT05TX1VSTDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50L2Jsb2IvbWFzdGVyL0VYQ0VQVElPTlMubWQje3RpdGxlfSdcblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRGlzcGF0Y2hlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbj0oKSA9PiB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbmQobmFtZSwgcHJvcGVydGllcyA9IHt9LCBmbiA9IG51bGwpIHtcblxuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBjYWxsYmFja0ZuKHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZuKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gRXZlbnQgZGlzcGF0Y2hlcidzIHR3by13YXkgY29tbXVuaWNhdGlvbiB2aWEgZXZlbnRzLlxuICAgICAgICAgICAgICAgIGZuKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGlzdGVuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgbGlzdGVuKG5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0ucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgQVRUUklCVVRFOiAnYXR0cmlidXRlJyxcbiAgICBBVFRSSUJVVEVfR0VUX0FMTDogJ2F0dHJpYnV0ZS1nZXQtYWxsJyxcbiAgICBBVFRSSUJVVEVfU0VUOiAnYXR0cmlidXRlLXNldCcsXG4gICAgUkVPUkRFUjogJ3Jlb3JkZXInLFxuICAgIFJFTU9WRTogJ3JlbW92ZScsXG4gICAgTU9WRV9VUDogJ21vdmUtdXAnLFxuICAgIE1PVkVfRE9XTjogJ21vdmUtZG93bicsXG4gICAgTU9WRV9MRUZUOiAnbW92ZS1sZWZ0JyxcbiAgICBNT1ZFX1JJR0hUOiAnbW92ZS1yaWdodCcsXG4gICAgU0VMRUNUOiAnc2VsZWN0JyxcbiAgICBTRUxFQ1RfQUxMOiAnc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1RfQUxMOiAnZGVzZWxlY3QtYWxsJyxcbiAgICBERVNFTEVDVDogJ2Rlc2VsZWN0JyxcbiAgICBTRUxFQ1RFRF9HRVQ6ICdzZWxlY3RlZC1nZXQnLFxuICAgIFNFTEVDVEVEX0xJU1Q6ICdzZWxlY3RlZC1saXN0JyxcbiAgICBTRUxFQ1RBQkxFOiB7XG4gICAgICAgIFNFTEVDVDogJ3NlbGVjdGFibGUtc2VsZWN0JyxcbiAgICAgICAgREVTRUxFQ1Q6ICdzZWxlY3RhYmxlLWRlc2VsZWN0J1xuICAgIH1cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFRvXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7R3JvdXBzfVxuICAgICAqL1xuICAgIGFkZFRvKGVsZW1lbnQpIHtcblxuICAgICAgICB0aGlzLnNoYXBlcyAgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ3NoYXBlcycsIHRydWUpO1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ2hhbmRsZXMnLCB0cnVlKTtcblxuICAgICAgICAvLyBQcmV2ZW50IGNsaWNrcyBvbiB0aGUgZWxlbWVudHMgZnJvbSBsZWFraW5nIHRocm91Z2ggdG8gdGhlIFNWRyBsYXllci5cbiAgICAgICAgdGhpcy5zaGFwZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICB0aGlzLmhhbmRsZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWdpc3RyeVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIC8qKlxuICAgICAqIFJlc3BvbnNpYmxlIGZvciBkZXRlcm1pbmluZyB3aGVuIGNlcnRhaW4ga2V5cyBhcmUgcHJlc3NlZCBkb3duLCB3aGljaCB3aWxsIGRldGVybWluZSB0aGVcbiAgICAgKiBzdHJhdGVneSBhdCBydW50aW1lIGZvciBjZXJ0YWluIGZ1bmN0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBrZXlzXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBrZXlzOiB7XG4gICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgYXNwZWN0UmF0aW86IGZhbHNlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBzbmFwR3JpZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgc25hcEdyaWQ6IDEwXG5cbn0iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBVdGlsaXR5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtleGNlcHRpb25zVGl0bGU9JyddXG4gICAgICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aHJvd0V4Y2VwdGlvbjogKG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChleGNlcHRpb25zVGl0bGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGluayA9IENvbnN0YW50cy5FWENFUFRJT05TX1VSTC5yZXBsYWNlKC97KC4rPyl9L2ksICgpID0+IF8ua2ViYWJDYXNlKGV4Y2VwdGlvbnNUaXRsZSkpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmx1ZXByaW50LmpzOiAke21lc3NhZ2V9LiBTZWU6ICR7bGlua31gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uYCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBhc3NlcnRcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBhc3NlcnRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV4Y2VwdGlvbnNUaXRsZVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgYXNzZXJ0KGFzc2VydGlvbiwgbWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKSB7XG5cbiAgICAgICAgICAgIGlmICghYXNzZXJ0aW9uKSB7XG4gICAgICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0cmFuc2Zvcm1BdHRyaWJ1dGVzOiAoYXR0cmlidXRlcykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSksXG4gICAgICAgICAgICAgICAgICAgIHggICAgID0gcGFyc2VJbnQobWF0Y2hbMV0pLFxuICAgICAgICAgICAgICAgICAgICB5ICAgICA9IHBhcnNlSW50KG1hdGNoWzJdKTtcblxuICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmIF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIHkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oeCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHVzaW5nIHRoZSBgdHJhbnNmb3JtOiB0cmFuc2xhdGUoeCwgeSlgIGZvcm1hdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmV0cmFuc2Zvcm1BdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnRyYW5zZm9ybSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gYXR0cmlidXRlcy50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKS9pKTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnggPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy55ID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnRyYW5zZm9ybTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5jYW1lbGlmeUtleXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBwb2ludHNUb1RyYW5zZm9ybVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBwb2ludHNUb1RyYW5zZm9ybSh4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qga2ViYWJpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBrZWJhYmlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18ua2ViYWJDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBjYW1lbGlmeUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGNhbWVsaWZ5S2V5cyhtb2RlbCkge1xuXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRNb2RlbCA9IHt9O1xuXG4gICAgICAgICAgICBfLmZvckluKG1vZGVsLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTW9kZWxbXy5jYW1lbENhc2Uoa2V5KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGVsZW1lbnROYW1lXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50TmFtZShtb2RlbCkge1xuXG4gICAgICAgICAgICBpZiAobW9kZWwubm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50UmVmZXJlbmNlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIGVsZW1lbnRSZWZlcmVuY2UobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihtb2RlbCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFpJbmRleFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpJbmRleCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlb3JkZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBncm91cHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVvcmRlcihncm91cHMsIGdyb3VwKSB7XG5cbiAgICAgICAgbGV0IHpNYXggPSBncm91cHMuc2l6ZSgpO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgbWF4aW11bSBaIGlzIGFib3ZlIHplcm8gYW5kIGJlbG93IHRoZSBtYXhpbXVtLlxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56IDwgMSkgICAgeyBncm91cC5kYXR1bSgpLnogPSAxOyAgICB9XG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPiB6TWF4KSB7IGdyb3VwLmRhdHVtKCkueiA9IHpNYXg7IH1cblxuICAgICAgICB2YXIgelRhcmdldCA9IGdyb3VwLmRhdHVtKCkueiwgekN1cnJlbnQgPSAxO1xuXG4gICAgICAgIC8vIEluaXRpYWwgc29ydCBpbnRvIHotaW5kZXggb3JkZXIuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgICAgIF8uZm9yRWFjaChncm91cHNbMF0sIChtb2RlbCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBDdXJyZW50IGdyb3VwIGlzIGltbXV0YWJsZSBpbiB0aGlzIGl0ZXJhdGlvbi5cbiAgICAgICAgICAgIGlmIChtb2RlbCA9PT0gZ3JvdXAubm9kZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTa2lwIHRoZSB0YXJnZXQgWiBpbmRleC5cbiAgICAgICAgICAgIGlmICh6Q3VycmVudCA9PT0gelRhcmdldCkge1xuICAgICAgICAgICAgICAgIHpDdXJyZW50Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzaGFwZSA9IGQzLnNlbGVjdChtb2RlbCksXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBzaGFwZS5kYXR1bSgpO1xuICAgICAgICAgICAgZGF0dW0ueiA9IHpDdXJyZW50Kys7XG4gICAgICAgICAgICBzaGFwZS5kYXR1bShkYXR1bSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRmluYWwgc29ydCBwYXNzLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRmVhdHVyZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZlYXR1cmUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtGZWF0dXJlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge0ZlYXR1cmV9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkRXZlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRFdmVudHMoZGlzcGF0Y2hlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbn0iLCJpbXBvcnQgRXZlbnRzICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBJbnRlcmZhY2VcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L29iamVjdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcmZhY2Uge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5sYWJlbCAgICA9IGxhYmVsO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCB7XG4gICAgICAgICAgICAnaW50ZXJmYWNlJzogdGhpc1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneScsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oeCA9IG51bGwsIHkgPSBudWxsKSB7XG5cbiAgICAgICAgaWYgKCFfLmlzTnVsbCh4KSkge1xuICAgICAgICAgICAgdGhpcy54KHgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfLmlzTnVsbCh5KSkge1xuICAgICAgICAgICAgdGhpcy55KHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9wYWNpdHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIG9wYWNpdHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignb3BhY2l0eScsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHN0cm9rZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxTdHJpbmd9XG4gICAgICovXG4gICAgc3Ryb2tlKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZScsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHN0cm9rZVdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzdHJva2VXaWR0aCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2Utd2lkdGgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzdHJva2VEYXNoQXJyYXlcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc3Ryb2tlRGFzaEFycmF5KHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgdXRpbGl0eS5hc3NlcnQoXy5pc0FycmF5KHZhbHVlKSwgJ01ldGhvZCBgc3Ryb2tlRGFzaEFycmF5YCBleHBlY3RzIGFuIGFycmF5IHZhbHVlJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UtZGFzaGFycmF5JywgdmFsdWUuam9pbignLCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGJyaW5nVG9Gcm9udCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIEluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRUb0JhY2tcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAtSW5maW5pdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZEJhY2t3YXJkc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56IC0gMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdGb3J3YXJkc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56ICsgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3dpZHRoJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBoZWlnaHQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignaGVpZ2h0JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfHZvaWR9XG4gICAgICovXG4gICAgYXR0cihwcm9wZXJ0eSwgdmFsdWUgPSBudWxsKSB7XG5cbiAgICAgICAgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cigpW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtb2RlbCAgICAgICA9IHt9O1xuICAgICAgICBtb2RlbFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cihtb2RlbCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZXRBdHRyKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfU0VULCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB1dGlsaXR5LmtlYmFiaWZ5S2V5cyhhdHRyaWJ1dGVzKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0clxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyKCkge1xuXG4gICAgICAgIGxldCByZXN1bHQgPSB7fTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsIHt9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlOiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlXWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuLy4uL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gRmVhdHVyZXMuXG5pbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL2ZlYXR1cmVzL1NlbGVjdGFibGUuanMnO1xuaW1wb3J0IE1vdmFibGUgICAgZnJvbSAnLi9mZWF0dXJlcy9Nb3ZhYmxlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ncm91cCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0R3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEdyb3VwKGdyb3VwKSB7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUX0FMTCwgICAoKSAgICAgID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnc2VsZWN0JykpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5ERVNFTEVDVF9BTEwsICgpICAgICAgPT4gdGhpcy50cnlJbnZva2VPbkVhY2hGZWF0dXJlKCdkZXNlbGVjdCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuTU9WRV9MRUZULCAgICAobW9kZWwpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnbW92ZUxlZnQnLCBtb2RlbCwgJ2lzU2VsZWN0ZWQnKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfUklHSFQsICAgKG1vZGVsKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ21vdmVSaWdodCcsIG1vZGVsLCAnaXNTZWxlY3RlZCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuTU9WRV9VUCwgICAgICAobW9kZWwpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnbW92ZVVwJywgbW9kZWwsICdpc1NlbGVjdGVkJykpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5NT1ZFX0RPV04sICAgIChtb2RlbCkgPT4gdGhpcy50cnlJbnZva2VPbkVhY2hGZWF0dXJlKCdtb3ZlRG93bicsIG1vZGVsLCAnaXNTZWxlY3RlZCcpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdHJ5SW52b2tlT25FYWNoRmVhdHVyZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2ROYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbY29uZGl0aW9uYWxGbj1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgdHJ5SW52b2tlT25FYWNoRmVhdHVyZShtZXRob2ROYW1lLCBwcm9wZXJ0aWVzID0ge30sIGNvbmRpdGlvbmFsRm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JJbih0aGlzLmZlYXR1cmVzLCAoZmVhdHVyZSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZlYXR1cmVbbWV0aG9kTmFtZV0pKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhjb25kaXRpb25hbEZuKSAmJiAhdGhpcy5nZXRJbnRlcmZhY2UoKVtjb25kaXRpb25hbEZuXSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmZWF0dXJlW21ldGhvZE5hbWVdKHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldE9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGJlIG92ZXJ3cml0dGVuIGZvciBzaGFwZSB0eXBlcyB0aGF0IGhhdmUgYSBkaWZmZXJlbnQgbmFtZSB0byB0aGVpciBTVkcgdGFnIG5hbWUsIHN1Y2ggYXMgYSBgZm9yZWlnbk9iamVjdGBcbiAgICAgKiBlbGVtZW50IHVzaW5nIHRoZSBgcmVjdGAgc2hhcGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0TmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYWcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gdGhpcy5hZGRJbnRlcmZhY2UoKTtcbiAgICAgICAgICAgIGxldCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBnZXRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHpJbmRleCA9IHsgejogZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSkuZGF0dW0oKS56IH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsICA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpLCB6SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LnJldHJhbnNmb3JtQXR0cmlidXRlcyhtb2RlbCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyB0aGF0IGhvb2sgdXAgdGhlIGludGVyZmFjZSBhbmQgdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwgICAgICAgIGdldEF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSAgICAgICAgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwgbW9kZWwpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfU0VULCAobW9kZWwpID0+IHsgdGhpcy5zZXRBdHRyaWJ1dGVzKG1vZGVsLmF0dHJpYnV0ZXMpOyB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24odGhpcy5lbGVtZW50LmRhdHVtKCkgfHwge30sIGF0dHJpYnV0ZXMpO1xuICAgICAgICBhdHRyaWJ1dGVzID0gdXRpbGl0eS50cmFuc2Zvcm1BdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnopKSB7XG5cbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIGRldmVsb3BlciBzcGVjaWZpZXMgdGhlIGB6YCBhdHRyaWJ1dGUsIGl0IGFjdHVhbGx5IHBlcnRhaW5zIHRvIHRoZSBncm91cFxuICAgICAgICAgICAgLy8gZWxlbWVudCB0aGF0IHRoZSBzaGFwZSBpcyBhIGNoaWxkIG9mLiBXZSdsbCB0aGVyZWZvcmUgbmVlZCB0byByZW1vdmUgdGhlIGB6YCBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZnJvbSB0aGUgYGF0dHJpYnV0ZXNgIG9iamVjdCwgYW5kIGluc3RlYWQgYXBwbHkgaXQgdG8gdGhlIHNoYXBlJ3MgZ3JvdXAgZWxlbWVudC5cbiAgICAgICAgICAgIC8vIEFmdGVyd2FyZHMgd2UnbGwgbmVlZCB0byBicm9hZGNhc3QgYW4gZXZlbnQgdG8gcmVvcmRlciB0aGUgZWxlbWVudHMgdXNpbmcgRDMncyBtYWdpY2FsXG4gICAgICAgICAgICAvLyBgc29ydGAgbWV0aG9kLlxuICAgICAgICAgICAgbGV0IGdyb3VwID0gZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSk7XG4gICAgICAgICAgICBncm91cC5kYXR1bSh7IHo6IGF0dHJpYnV0ZXMueiB9KTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLno7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVPUkRFUiwge1xuICAgICAgICAgICAgICAgIGdyb3VwOiBncm91cFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXR1bShhdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmF0dHIodGhpcy5lbGVtZW50LmRhdHVtKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cmlidXRlcygpIHtcblxuICAgICAgICBsZXQgYXR0cmlidXRlcyA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5hZGRBdHRyaWJ1dGVzKSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHRoaXMuYWRkQXR0cmlidXRlcygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFbGVtZW50c1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRmVhdHVyZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEZlYXR1cmVzKCkge1xuXG4gICAgICAgIGxldCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUodGhpcykuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSxcbiAgICAgICAgICAgIG1vdmFibGU6ICAgIG5ldyBNb3ZhYmxlKHRoaXMpLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcilcbiAgICAgICAgfTtcblxuICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUQUJMRS5ERVNFTEVDVCwgKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMLCBtb2RlbCk7XG4gICAgICAgICAgICB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ2Rlc2VsZWN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1RBQkxFLlNFTEVDVCwgKG1vZGVsKSAgID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1QsIG1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnc2VsZWN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICBsZXQgdGFnID0gdGhpcy5nZXRUYWcoKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuZ2V0VGFnKCkuc2xpY2UoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ306ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ31dYDtcblxuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuLy9pbXBvcnQgdXRpbGl0eSAgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgTW92YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TW92YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHN0YXJ0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnN0YXJ0ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgbGV0IGRyYWdTdGFydCA9IFsnZHJhZ3N0YXJ0JywgKCkgPT4gdGhpcy5kcmFnU3RhcnQoKV0sXG4gICAgICAgICAgICBkcmFnICAgICAgPSBbJ2RyYWcnLCAgICAgICgpID0+IHRoaXMuZHJhZygpXSxcbiAgICAgICAgICAgIGRyYWdFbmQgICA9IFsnZHJhZ2VuZCcsICAgKCkgPT4gdGhpcy5kcmFnRW5kKCldO1xuXG4gICAgICAgIHNoYXBlLmVsZW1lbnQuY2FsbChkMy5iZWhhdmlvci5kcmFnKCkub24oLi4uZHJhZ1N0YXJ0KS5vbiguLi5kcmFnKS5vbiguLi5kcmFnRW5kKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1vdmVMZWZ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlTGVmdChtb2RlbCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngodGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KCkgLSBtb2RlbC5ieSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlUmlnaHRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVSaWdodChtb2RlbCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngodGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KCkgKyBtb2RlbC5ieSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlVXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVVcChtb2RlbCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkodGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KCkgLSBtb2RlbC5ieSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlRG93blxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbW92ZURvd24obW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSgpICsgbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1N0YXJ0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnU3RhcnQoeCA9IG51bGwsIHkgPSBudWxsKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IHtcbiAgICAgICAgICAgIHg6ICFfLmlzTnVsbCh4KSA/IHggOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRYIC0gdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KCksXG4gICAgICAgICAgICB5OiAhXy5pc051bGwoeSkgPyB5IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WSAtIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSgpXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdkcmFnZ2luZycsIHRydWUpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFttdWx0aXBsZU9mPXJlZ2lzdHJ5LnNuYXBHcmlkXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSByZWdpc3RyeS5zbmFwR3JpZCkge1xuXG4gICAgICAgIHggPSAhXy5pc051bGwoeCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WDtcbiAgICAgICAgeSA9ICFfLmlzTnVsbCh5KSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZO1xuXG4gICAgICAgIGxldCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgIG1ZID0gKHkgLSB0aGlzLnN0YXJ0LnkpLFxuICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoZVgpO1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoZVkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnRW5kXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnRW5kKCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ2RyYWdnaW5nJywgZmFsc2UpO1xuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuaW1wb3J0IEV2ZW50cyAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2VsZWN0YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHNoYXBlLmVsZW1lbnQub24oJ21vdXNlZG93bicsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFyZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb2YgdGhlIHNoYXBlcyBpbmNsdWRpbmcgdGhlIGN1cnJlbnQgb25lLCBhcyB0aGlzIGtlZXBzIHRoZSBsb2dpYyBzaW1wbGVyLiBXZSB3aWxsXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdGhlIGN1cnJlbnQgc2hhcGUgdG8gYmUgc2VsZWN0ZWQgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5ERVNFTEVDVCwge1xuICAgICAgICAgICAgICAgICAgICBzaGFwZTogc2hhcGUuZ2V0SW50ZXJmYWNlKClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5TRUxFQ1QsIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcGU6IHNoYXBlLmdldEludGVyZmFjZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdzZWxlY3RlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuc3Ryb2tlKCdibGFjaycpLnN0cm9rZVdpZHRoKDEpLnN0cm9rZURhc2hBcnJheShbMywgM10pO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ3NlbGVjdGVkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5kZXNlbGVjdCgpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5zdHJva2UoJ25vbmUnKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59IiwiaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL0ludGVyZmFjZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBmaWxsKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCB2YWx1ZSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBJbnRlcmZhY2UgZnJvbSAnLi8uLi9pbnRlcmZhY2VzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkSW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZEludGVyZmFjZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcmZhY2UodGhpcy5sYWJlbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxufSJdfQ==
