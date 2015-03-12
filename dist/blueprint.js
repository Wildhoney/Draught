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
                    return _this.invokeEachFeature("select");
                });
                this.dispatcher.listen(Events.DESELECT_ALL, function () {
                    return _this.invokeEachFeature("deselect");
                });
                this.dispatcher.listen(Events.SELECTED_LIST, function (model) {
                    return _this.invokeEachFeature("selected", model);
                });
                this.dispatcher.listen(Events.MOVE_LEFT, function (model) {
                    return _this.invokeEachFeature("moveLeft", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_RIGHT, function (model) {
                    return _this.invokeEachFeature("moveRight", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_UP, function (model) {
                    return _this.invokeEachFeature("moveUp", model, "isSelected");
                });
                this.dispatcher.listen(Events.MOVE_DOWN, function (model) {
                    return _this.invokeEachFeature("moveDown", model, "isSelected");
                });
            },
            writable: true,
            configurable: true
        },
        invokeEachFeature: {

            /**
             * Responsible for attempting to invoke a specified function on each feature, if the function exists.
             *
             * @method invokeEachFeature
             * @param {String} methodName
             * @param {Object} [properties={}]
             * @param {String} [conditionalFn=null]
             * @return {void}
             */

            value: function invokeEachFeature(methodName) {
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
                    _this.invokeEachFeature("deselect");
                });

                dispatcher.listen(Events.SELECTABLE.SELECT, function (model) {
                    _this.dispatcher.send(Events.SELECT, model);
                    _this.invokeEachFeature("select");
                });

                dispatcher.listen(Events.SELECTED_GET, function () {
                    return _this.dispatcher.send(Events.SELECTED_GET);
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

var Events = _interopRequire(require("./../../helpers/Events.js"));

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
        selected: {

            /**
             * @method selected
             * @param {Array} shapes
             * @return {Array|void}
             */

            value: function selected(shapes) {
                return shapes;
            },
            writable: true,
            configurable: true
        },
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

                this.dispatcher.send(Events.SELECTED_GET);
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

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":6,"./../Feature.js":9}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1JlZ2lzdHJ5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9aSW5kZXguanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvRmVhdHVyZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvZmVhdHVyZXMvTW92YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ludGVyZmFjZXMvUmVjdGFuZ2xlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0lDQU8sVUFBVSwyQkFBTSx5QkFBeUI7O0lBQ3pDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLFFBQVEsMkJBQVEsdUJBQXVCOztJQUN2QyxPQUFPLDJCQUFTLHNCQUFzQjs7OztJQUd0QyxLQUFLLDJCQUFXLG1CQUFtQjs7SUFDbkMsU0FBUywyQkFBTyw2QkFBNkI7Ozs7Ozs7O0lBTzlDLFNBQVM7Ozs7Ozs7OztBQVFBLGFBUlQsU0FBUyxDQVFDLE9BQU87WUFBRSxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixTQUFTOztBQVVQLFlBQUksQ0FBQyxPQUFPLEdBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLE9BQU8sR0FBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQ3pDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNqRSxZQUFJLENBQUMsTUFBTSxHQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsS0FBSyxHQUFRLENBQUMsQ0FBQzs7O0FBR3BCLFlBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNuQyxZQUFJLENBQUMsTUFBTSxHQUFPLElBQUksTUFBTSxFQUFFLENBQUM7QUFDL0IsWUFBSSxDQUFDLE1BQU0sR0FBTyxJQUFJLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7OztBQUduRCxZQUFJLENBQUMsR0FBRyxHQUFHO0FBQ1AsZ0JBQUksRUFBRSxTQUFTO1NBQ2xCLENBQUM7OztBQUdGLFlBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUV6Qjs7eUJBL0JDLFNBQVM7QUFzQ1gsV0FBRzs7Ozs7Ozs7bUJBQUEsYUFBQyxJQUFJLEVBQUU7O0FBRU4sb0JBQUksS0FBSyxHQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckQsS0FBSyxHQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQztvQkFDdEYsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN0QyxNQUFNLEdBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQzs7O0FBR3BDLHFCQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixxQkFBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMscUJBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIscUJBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIscUJBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7OztBQUk3RCxxQkFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BCLHFCQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7Ozs7QUFJcEIsb0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxhQUFXLEtBQUssQ0FBQyxZQUFZLEVBQUUsRUFBQyxDQUFDLENBQUM7QUFDbkUsdUJBQU8sS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO2FBRS9COzs7O0FBT0QsY0FBTTs7Ozs7Ozs7bUJBQUEsZ0JBQUMsS0FBSyxFQUFFOztBQUVWLG9CQUFJLEtBQUssR0FBRyxDQUFDO29CQUNULElBQUksR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFLOztBQUV0Qyx3QkFBSSxLQUFLLGFBQVUsS0FBSyxLQUFLLEVBQUU7QUFDM0IsNkJBQUssR0FBRyxDQUFDLENBQUM7QUFDViwrQkFBTyxLQUFLLENBQUM7cUJBQ2hCO2lCQUVKLENBQUMsQ0FBQzs7QUFFUCxvQkFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUIsb0JBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3Qix1QkFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFFckI7Ozs7QUFNRCxXQUFHOzs7Ozs7O21CQUFBLGVBQUc7QUFDRix1QkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUs7MkJBQUssS0FBSyxhQUFVO2lCQUFBLENBQUMsQ0FBQzthQUN0RDs7OztBQU1ELGdCQUFROzs7Ozs7O21CQUFBLG9CQUFHO0FBQ1AsdUJBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFDLGNBQWM7MkJBQUssY0FBYyxDQUFDLFVBQVUsRUFBRTtpQkFBQSxDQUFDLENBQUM7YUFDN0U7Ozs7QUFNRCxhQUFLOzs7Ozs7O21CQUFBLGlCQUFHOzs7QUFDSixpQkFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSzsyQkFBSyxNQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBQ3pEOzs7O0FBTUQsYUFBSzs7Ozs7OzttQkFBQSxpQkFBRztBQUNKLHVCQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN4Qzs7OztBQVNELGdCQUFROzs7Ozs7Ozs7O21CQUFBLGtCQUFDLElBQUksRUFBRSxLQUFLLEVBQXFCO29CQUFuQixTQUFTLGdDQUFHLEtBQUs7OztBQUduQyx1QkFBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssRUFBRSw2Q0FBNkMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDOztBQUUzSCxvQkFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTs7O0FBRzdDLDJCQUFPLENBQUMsY0FBYyxxQ0FBbUMsSUFBSSx3Q0FBcUMsNkJBQTZCLENBQUMsQ0FBQztpQkFFcEk7O0FBRUQsb0JBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO2FBRTFCOzs7O0FBT0QsbUJBQVc7Ozs7Ozs7O21CQUFBLHFCQUFDLElBQUksRUFBRTtBQUNkLHVCQUFPLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUN6RDs7OztBQU1ELHlCQUFpQjs7Ozs7OzttQkFBQSw2QkFBRzs7O0FBRWhCLG9CQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSzsyQkFBTSxNQUFLLE1BQU0sQ0FBQyxLQUFLLGFBQVUsQ0FBQztpQkFBQSxDQUFDLENBQUM7QUFDaEYsb0JBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7MkJBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsTUFBSyxRQUFRLEVBQUUsQ0FBQztpQkFBQSxDQUFDLENBQUM7QUFDL0csb0JBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDOUMsd0JBQUksTUFBTSxHQUFHLE1BQUssT0FBTyxDQUFDLFNBQVMsUUFBTSxNQUFLLE9BQU8sQ0FBQyxhQUFhLE9BQUksQ0FBQztBQUN4RSwwQkFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzVDLENBQUMsQ0FBQzs7OztBQUlILG9CQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7MkJBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBRTdFOzs7O0FBTUQsc0JBQWM7Ozs7Ozs7bUJBQUEsMEJBQUc7OztBQUViLG9CQUFJLFVBQVUsR0FBRyxDQUFDO29CQUNkLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLHlCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBSTsyQkFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJO2lCQUFBLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDM0UseUJBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFJOzJCQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUs7aUJBQUEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFMUUseUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOzJCQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUk7aUJBQUEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMzRSx5QkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7MkJBQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSztpQkFBQSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRSx5QkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7MkJBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDOzs7Ozs7OztBQVF2RSxvQkFBSSxJQUFJLEdBQUcsVUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFLO0FBQ3hCLDBCQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDMUMsMkJBQU8sS0FBSyxDQUFDO2lCQUNoQixDQUFDOztBQUVGLHlCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRzsyQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQ2xFLHlCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTsyQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQ25FLHlCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBSzsyQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQ2hFLHlCQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRzsyQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDOztBQUVsRSx5QkFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUc7MkJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQztBQUN4RSx5QkFBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7MkJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQztBQUN6RSx5QkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUs7MkJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQztBQUN0RSx5QkFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUc7MkJBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQzthQUUzRTs7OztBQU1ELHNCQUFjOzs7Ozs7O21CQUFBLDBCQUFHOztBQUViLHVCQUFPO0FBQ0gsaUNBQWEsRUFBRSxTQUFTO0FBQ3hCLGtDQUFjLEVBQUUsTUFBTTtBQUN0QixpQ0FBYSxFQUFFLE1BQU07aUJBQ3hCLENBQUM7YUFFTDs7OztBQU1ELHlCQUFpQjs7Ozs7OzttQkFBQSw2QkFBRztBQUNoQix1QkFBTyxLQUFLLENBQUM7YUFDaEI7Ozs7OztXQXRPQyxTQUFTOzs7QUEwT2YsQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRXBCLGdCQUFZLENBQUM7Ozs7QUFJYixXQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztDQUVqQyxDQUFBLENBQUUsTUFBTSxDQUFDLENBQUM7Ozs7Ozs7Ozs7O2lCQzVQSTs7Ozs7Ozs7QUFRWCxnQkFBYyxFQUFFLDBFQUEwRTs7Q0FFN0Y7Ozs7Ozs7Ozs7Ozs7Ozs7SUNWb0IsVUFBVTs7Ozs7OztBQU1oQixhQU5NLFVBQVU7OEJBQVYsVUFBVTs7QUFPdkIsWUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7S0FDcEI7O3lCQVJnQixVQUFVO0FBaUIzQixZQUFJOzs7Ozs7Ozs7O21CQUFBLGNBQUMsSUFBSSxFQUE4QjtvQkFBNUIsVUFBVSxnQ0FBRyxFQUFFO29CQUFFLEVBQUUsZ0NBQUcsSUFBSTs7QUFFakMsaUJBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFDLFVBQVUsRUFBSzs7QUFFekMsd0JBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsd0JBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTs7O0FBR2xCLDBCQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBRWQ7aUJBRUosQ0FBQyxDQUFDO2FBRU47Ozs7QUFRRCxjQUFNOzs7Ozs7Ozs7bUJBQUEsZ0JBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRTs7QUFFYixvQkFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbkIsMkJBQU8sS0FBSyxDQUFDO2lCQUNoQjs7QUFFRCxvQkFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDcEIsd0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUMxQjs7QUFFRCxvQkFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0IsdUJBQU8sSUFBSSxDQUFDO2FBRWY7Ozs7OztXQXJEZ0IsVUFBVTs7O2lCQUFWLFVBQVU7Ozs7Ozs7Ozs7O2lCQ0FoQjtBQUNYLGFBQVMsRUFBRSxXQUFXO0FBQ3RCLHFCQUFpQixFQUFFLG1CQUFtQjtBQUN0QyxpQkFBYSxFQUFFLGVBQWU7QUFDOUIsV0FBTyxFQUFFLFNBQVM7QUFDbEIsVUFBTSxFQUFFLFFBQVE7QUFDaEIsV0FBTyxFQUFFLFNBQVM7QUFDbEIsYUFBUyxFQUFFLFdBQVc7QUFDdEIsYUFBUyxFQUFFLFdBQVc7QUFDdEIsY0FBVSxFQUFFLFlBQVk7QUFDeEIsVUFBTSxFQUFFLFFBQVE7QUFDaEIsY0FBVSxFQUFFLFlBQVk7QUFDeEIsZ0JBQVksRUFBRSxjQUFjO0FBQzVCLFlBQVEsRUFBRSxVQUFVO0FBQ3BCLGdCQUFZLEVBQUUsY0FBYztBQUM1QixpQkFBYSxFQUFFLGVBQWU7QUFDOUIsY0FBVSxFQUFFO0FBQ1IsY0FBTSxFQUFFLG1CQUFtQjtBQUMzQixnQkFBUSxFQUFFLHFCQUFxQjtLQUNsQztDQUNKOzs7Ozs7Ozs7Ozs7Ozs7O0lDcEJvQixNQUFNO1dBQU4sTUFBTTswQkFBTixNQUFNOzs7dUJBQU4sTUFBTTtBQU92QixTQUFLOzs7Ozs7OzthQUFBLGVBQUMsT0FBTyxFQUFFOztBQUVYLFlBQUksQ0FBQyxNQUFNLEdBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7QUFHNUQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO2lCQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO1NBQUEsQ0FBQyxDQUFDO0FBQzFELFlBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtpQkFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtTQUFBLENBQUMsQ0FBQzs7QUFFM0QsZUFBTyxJQUFJLENBQUM7T0FFZjs7Ozs7O1NBbEJnQixNQUFNOzs7aUJBQU4sTUFBTTs7Ozs7Ozs7Ozs7aUJDQVo7Ozs7Ozs7OztBQVNYLE1BQUksRUFBRTtBQUNGLGVBQVcsRUFBRSxLQUFLO0FBQ2xCLGVBQVcsRUFBRSxLQUFLO0dBQ3JCOzs7Ozs7QUFNRCxVQUFRLEVBQUUsRUFBRTs7Q0FFZjs7Ozs7OztJQzFCTSxTQUFTLDJCQUFNLGdCQUFnQjs7Ozs7Ozs7QUFRdEMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxZQUFXOztBQUV0QixnQkFBWSxDQUFDOztBQUViLFdBQU87Ozs7Ozs7OztBQVNILHNCQUFjLEVBQUUsVUFBQyxPQUFPLEVBQTJCO2dCQUF6QixlQUFlLGdDQUFHLEVBQUU7O0FBRTFDLGdCQUFJLGVBQWUsRUFBRTtBQUNqQixvQkFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFOzJCQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO2lCQUFBLENBQUMsQ0FBQztBQUM1RixzQkFBTSxJQUFJLEtBQUssb0JBQWtCLE9BQU8sZUFBVSxJQUFJLENBQUcsQ0FBQzthQUM3RDs7QUFFRCxrQkFBTSxJQUFJLEtBQUssb0JBQWtCLE9BQU8sT0FBSSxDQUFDO1NBRWhEOzs7Ozs7Ozs7QUFTRCxjQUFNLEVBQUEsZ0JBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUU7O0FBRXhDLGdCQUFJLENBQUMsU0FBUyxFQUFFO0FBQ1osdUJBQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ3BEO1NBRUo7Ozs7Ozs7QUFPRCwyQkFBbUIsRUFBRSxVQUFDLFVBQVUsRUFBSzs7QUFFakMsZ0JBQUksVUFBVSxDQUFDLFNBQVMsRUFBRTs7QUFFdEIsb0JBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO29CQUN4RCxDQUFDLEdBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUIsQ0FBQyxHQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFL0Isb0JBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM3RCw4QkFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsMkJBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDdkI7O0FBRUQsb0JBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM3RCw4QkFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsMkJBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQztpQkFDdkI7YUFFSjs7QUFFRCxnQkFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7OztBQUc5RCwwQkFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pGLHVCQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDcEIsdUJBQU8sVUFBVSxDQUFDLENBQUMsQ0FBQzthQUV2Qjs7QUFFRCxtQkFBTyxVQUFVLENBQUM7U0FFckI7Ozs7Ozs7QUFPRCw2QkFBcUIsRUFBQSwrQkFBQyxVQUFVLEVBQUU7O0FBRTlCLGdCQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUU7O0FBRXRCLG9CQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQzdELDBCQUFVLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQywwQkFBVSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsdUJBQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQzthQUUvQjs7QUFFRCxtQkFBTyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBRTNDOzs7Ozs7OztBQVFELHlCQUFpQixFQUFBLDJCQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEIsbUJBQU8sRUFBRSxTQUFTLGlCQUFlLENBQUMsVUFBSyxDQUFDLE1BQUcsRUFBRSxDQUFDO1NBQ2pEOzs7Ozs7O0FBT0Qsb0JBQVksRUFBQSxzQkFBQyxLQUFLLEVBQUU7O0FBRWhCLGdCQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7QUFFMUIsYUFBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsVUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFLO0FBQzNCLGdDQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDOUMsQ0FBQyxDQUFDOztBQUVILG1CQUFPLGdCQUFnQixDQUFDO1NBRTNCOzs7Ozs7O0FBT0Qsb0JBQVksRUFBQSxzQkFBQyxLQUFLLEVBQUU7O0FBRWhCLGdCQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7QUFFMUIsYUFBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsVUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFLO0FBQzNCLGdDQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDOUMsQ0FBQyxDQUFDOztBQUVILG1CQUFPLGdCQUFnQixDQUFDO1NBRTNCOzs7Ozs7O0FBT0QsbUJBQVcsRUFBQSxxQkFBQyxLQUFLLEVBQUU7O0FBRWYsZ0JBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNoQix1QkFBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3ZDOztBQUVELG1CQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUU5Qjs7Ozs7OztBQU9ELHdCQUFnQixFQUFBLDBCQUFDLEtBQUssRUFBRTs7QUFFcEIsZ0JBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNoQix1QkFBTyxLQUFLLENBQUM7YUFDaEI7O0FBRUQsbUJBQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUV4Qzs7S0FFSixDQUFDO0NBRUwsQ0FBQSxFQUFHLENBQUM7O2lCQUVVLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7SUNqTEQsTUFBTTthQUFOLE1BQU07OEJBQU4sTUFBTTs7O3lCQUFOLE1BQU07QUFRdkIsZUFBTzs7Ozs7Ozs7O21CQUFBLGlCQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7O0FBRW5CLG9CQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7OztBQUd6QixvQkFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBSztBQUFFLHlCQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFBSztBQUN2RCxvQkFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUFFLHlCQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFBRTs7QUFFdkQsb0JBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7OztBQUc1QyxzQkFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDOzJCQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQUEsQ0FBQyxDQUFDOztBQUVqQyxpQkFBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQyxLQUFLLEVBQUs7OztBQUc1Qix3QkFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFO0FBQ3hCLCtCQUFPO3FCQUNWOzs7QUFHRCx3QkFBSSxRQUFRLEtBQUssT0FBTyxFQUFFO0FBQ3RCLGdDQUFRLEVBQUUsQ0FBQztxQkFDZDs7QUFFRCx3QkFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7d0JBQ3hCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUIseUJBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7QUFDckIseUJBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXRCLENBQUMsQ0FBQzs7O0FBR0gsc0JBQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQzsyQkFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUFBLENBQUMsQ0FBQzthQUVwQzs7Ozs7O1dBM0NnQixNQUFNOzs7aUJBQU4sTUFBTTs7Ozs7Ozs7Ozs7Ozs7OztJQ0FOLE9BQU87Ozs7Ozs7O0FBT2IsYUFQTSxPQUFPLENBT1osS0FBSzs4QkFQQSxPQUFPOztBQVFwQixZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUN0Qjs7eUJBVGdCLE9BQU87QUFnQnhCLHFCQUFhOzs7Ozs7OzttQkFBQSx1QkFBQyxVQUFVLEVBQUU7O0FBRXRCLG9CQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzs7QUFFN0Isb0JBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDOUIsd0JBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzlCOztBQUVELHVCQUFPLElBQUksQ0FBQzthQUNmOzs7Ozs7V0F6QmdCLE9BQU87OztpQkFBUCxPQUFPOzs7Ozs7Ozs7OztJQ05yQixNQUFNLDJCQUFPLHdCQUF3Qjs7SUFDckMsT0FBTywyQkFBTSx5QkFBeUI7Ozs7Ozs7OztJQVF4QixTQUFTOzs7Ozs7OztBQU9mLGFBUE0sU0FBUztZQU9kLEtBQUssZ0NBQUcsRUFBRTs7OEJBUEwsU0FBUzs7QUFRdEIsWUFBSSxDQUFDLEtBQUssR0FBTSxLQUFLLENBQUM7QUFDdEIsWUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7S0FDekI7O3lCQVZnQixTQUFTO0FBZ0IxQixjQUFNOzs7Ozs7O21CQUFBLGtCQUFHOztBQUVMLG9CQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ2hDLCtCQUFXLEVBQUUsSUFBSTtpQkFDcEIsQ0FBQyxDQUFDO2FBRU47Ozs7QUFNRCxjQUFNOzs7Ozs7O21CQUFBLGtCQUFHO0FBQ0wsb0JBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLHVCQUFPLElBQUksQ0FBQzthQUNmOzs7O0FBTUQsZ0JBQVE7Ozs7Ozs7bUJBQUEsb0JBQUc7QUFDUCxvQkFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDdEIsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7Ozs7QUFNRCxrQkFBVTs7Ozs7OzttQkFBQSxzQkFBRztBQUNULHVCQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDeEI7Ozs7QUFPRCxTQUFDOzs7Ozs7OzttQkFBQSxXQUFDLEtBQUssRUFBRTtBQUNMLHVCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hDOzs7O0FBT0QsU0FBQzs7Ozs7Ozs7bUJBQUEsV0FBQyxLQUFLLEVBQUU7QUFDTCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoQzs7OztBQVFELGlCQUFTOzs7Ozs7Ozs7bUJBQUEscUJBQXFCO29CQUFwQixDQUFDLGdDQUFHLElBQUk7b0JBQUUsQ0FBQyxnQ0FBRyxJQUFJOztBQUV4QixvQkFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDZCx3QkFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDYjs7QUFFRCxvQkFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDZCx3QkFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDYjs7QUFFRCx1QkFBTyxJQUFJLENBQUM7YUFFZjs7OztBQU9ELGVBQU87Ozs7Ozs7O21CQUFBLGlCQUFDLEtBQUssRUFBRTtBQUNYLHVCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3RDOzs7O0FBT0QsY0FBTTs7Ozs7Ozs7bUJBQUEsZ0JBQUMsS0FBSyxFQUFFO0FBQ1YsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDckM7Ozs7QUFPRCxtQkFBVzs7Ozs7Ozs7bUJBQUEscUJBQUMsS0FBSyxFQUFFO0FBQ2YsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDM0M7Ozs7QUFPRCx1QkFBZTs7Ozs7Ozs7bUJBQUEseUJBQUMsS0FBSyxFQUFFOztBQUVuQixvQkFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdkIsMkJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO0FBQ3BGLDJCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN6RDs7QUFFRCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFFeEM7Ozs7QUFPRCxTQUFDOzs7Ozs7OzttQkFBQSxXQUFDLEtBQUssRUFBRTtBQUNMLHVCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hDOzs7O0FBTUQsb0JBQVk7Ozs7Ozs7bUJBQUEsd0JBQUc7QUFDWCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNuQzs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHO0FBQ1QsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwQzs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQzthQUNqRDs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQzthQUNqRDs7OztBQU9ELGFBQUs7Ozs7Ozs7O21CQUFBLGVBQUMsS0FBSyxFQUFFO0FBQ1QsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDcEM7Ozs7QUFPRCxjQUFNOzs7Ozs7OzttQkFBQSxnQkFBQyxLQUFLLEVBQUU7QUFDVix1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyQzs7OztBQVFELFlBQUk7Ozs7Ozs7OzttQkFBQSxjQUFDLFFBQVEsRUFBZ0I7b0JBQWQsS0FBSyxnQ0FBRyxJQUFJOztBQUV2QixvQkFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2pCLDJCQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbkM7O0FBRUQsb0JBQUksS0FBSyxHQUFTLEVBQUUsQ0FBQztBQUNyQixxQkFBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUN4Qix1QkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBRTlCOzs7O0FBT0QsZUFBTzs7Ozs7Ozs7bUJBQUEsbUJBQWtCO29CQUFqQixVQUFVLGdDQUFHLEVBQUU7O0FBRW5CLG9CQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFO0FBQ3ZDLDhCQUFVLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7aUJBQy9DLENBQUMsQ0FBQzs7QUFFSCx1QkFBTyxJQUFJLENBQUM7YUFFZjs7OztBQU1ELGVBQU87Ozs7Ozs7bUJBQUEsbUJBQUc7O0FBRU4sb0JBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsb0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDN0QsMEJBQU0sR0FBRyxRQUFRLENBQUM7aUJBQ3JCLENBQUMsQ0FBQzs7QUFFSCx1QkFBTyxNQUFNLENBQUM7YUFFakI7Ozs7QUFPRCxxQkFBYTs7Ozs7Ozs7bUJBQUEsdUJBQUMsVUFBVSxFQUFFO0FBQ3RCLG9CQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzthQUNoQzs7OztBQU1ELGdCQUFROzs7Ozs7O21CQUFBLG9CQUFHOztBQUVQLG9CQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDWixtREFBNkIsSUFBSSxDQUFDLEtBQUssT0FBSTtpQkFDOUM7O0FBRUQsNENBQTRCO2FBRS9COzs7Ozs7V0FwUWdCLFNBQVM7OztpQkFBVCxTQUFTOzs7Ozs7Ozs7OztJQ1R2QixVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLE9BQU8sMkJBQVMseUJBQXlCOzs7O0lBR3pDLFVBQVUsMkJBQU0sMEJBQTBCOztJQUMxQyxPQUFPLDJCQUFTLHVCQUF1Qjs7Ozs7Ozs7O0lBUXpCLEtBQUs7Ozs7Ozs7O0FBT1gsYUFQTSxLQUFLO1lBT1YsS0FBSyxnQ0FBRyxFQUFFOzs4QkFQTCxLQUFLOztBQVFsQixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixZQUFJLGFBQVUsR0FBRyxJQUFJLENBQUM7QUFDdEIsWUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7S0FDdEI7O3lCQWJnQixLQUFLO0FBb0J0QixrQkFBVTs7Ozs7Ozs7bUJBQUEsb0JBQUMsT0FBTyxFQUFFO0FBQ2hCLG9CQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzthQUMxQjs7OztBQU9ELGdCQUFROzs7Ozs7OzttQkFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDWixvQkFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDdEI7Ozs7QUFPRCxxQkFBYTs7Ozs7Ozs7bUJBQUEsdUJBQUMsVUFBVSxFQUFFOzs7QUFFdEIsb0JBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDOztBQUU3QixvQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBSzsyQkFBTSxNQUFLLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztpQkFBQSxDQUFDLENBQUM7QUFDckYsb0JBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUc7MkJBQU0sTUFBSyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQ3ZGLG9CQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSzsyQkFBSyxNQUFLLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQ25HLG9CQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFNLFVBQUMsS0FBSzsyQkFBSyxNQUFLLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDO2lCQUFBLENBQUMsQ0FBQztBQUNqSCxvQkFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBSyxVQUFDLEtBQUs7MkJBQUssTUFBSyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQztpQkFBQSxDQUFDLENBQUM7QUFDbEgsb0JBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQVEsVUFBQyxLQUFLOzJCQUFLLE1BQUssaUJBQWlCLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUM7aUJBQUEsQ0FBQyxDQUFDO0FBQy9HLG9CQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFNLFVBQUMsS0FBSzsyQkFBSyxNQUFLLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDO2lCQUFBLENBQUMsQ0FBQzthQUVwSDs7OztBQVdELHlCQUFpQjs7Ozs7Ozs7Ozs7O21CQUFBLDJCQUFDLFVBQVUsRUFBeUM7OztvQkFBdkMsVUFBVSxnQ0FBRyxFQUFFO29CQUFFLGFBQWEsZ0NBQUcsSUFBSTs7QUFFL0QsaUJBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFDLE9BQU8sRUFBSzs7QUFFaEMsd0JBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRTs7QUFFbkMsNEJBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQUssWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRTtBQUNwRSxtQ0FBTzt5QkFDVjs7QUFFRCwrQkFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUVuQztpQkFFSixDQUFDLENBQUM7YUFFTjs7OztBQU9ELGtCQUFVOzs7Ozs7OzttQkFBQSxvQkFBQyxPQUFPLEVBQUU7QUFDaEIsb0JBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2FBQzFCOzs7O0FBU0QsZUFBTzs7Ozs7Ozs7OzttQkFBQSxtQkFBRztBQUNOLHVCQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN4Qjs7OztBQU9ELGNBQU07Ozs7Ozs7O21CQUFBLGtCQUFHO0FBQ0wsdUJBQU8sQ0FBQyxjQUFjLFlBQVUsSUFBSSxDQUFDLEtBQUsscUNBQW9DLENBQUM7QUFDL0UsdUJBQU8sRUFBRSxDQUFDO2FBQ2I7Ozs7QUFNRCxvQkFBWTs7Ozs7OzttQkFBQSx3QkFBRzs7O0FBRVgsb0JBQUksSUFBSSxhQUFVLEtBQUssSUFBSSxFQUFFOztBQUV6Qix3QkFBSSxhQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3JDLHdCQUFJLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ2xDLHdCQUFJLGFBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7Ozs7OztBQU16Qyx3QkFBSSxhQUFhLEdBQUcsWUFBTTs7QUFFdEIsNEJBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBSyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFOzRCQUNuRSxLQUFLLEdBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwRCwrQkFBTyxPQUFPLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBRS9DLENBQUM7OztBQUdGLDhCQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBUyxhQUFhLENBQUMsQ0FBQztBQUNsRSw4QkFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSzsrQkFBWSxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7cUJBQUEsQ0FBQyxDQUFDO0FBQy9GLDhCQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFBRSw4QkFBSyxhQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUFFLENBQUMsQ0FBQztpQkFFakc7O0FBRUQsdUJBQU8sSUFBSSxhQUFVLENBQUM7YUFFekI7Ozs7QUFPRCxxQkFBYTs7Ozs7Ozs7bUJBQUEseUJBQWtCO29CQUFqQixVQUFVLGdDQUFHLEVBQUU7O0FBRXpCLDBCQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5RCwwQkFBVSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckQsb0JBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7OztBQU85Qix3QkFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3RELHlCQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLDJCQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDcEIsd0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDakMsNkJBQUssRUFBRSxLQUFLO3FCQUNmLENBQUMsQ0FBQztpQkFFTjs7QUFFRCxvQkFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0Isb0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN4Qyx1QkFBTyxJQUFJLGFBQVUsQ0FBQzthQUV6Qjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHOztBQUVaLG9CQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUVoQyxvQkFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUNsQyw4QkFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRDs7QUFFRCx1QkFBTyxVQUFVLENBQUM7YUFFckI7Ozs7QUFNRCxtQkFBVzs7Ozs7OzttQkFBQSx1QkFBRztBQUNWLHVCQUFPLEVBQUUsQ0FBQzthQUNiOzs7O0FBTUQsbUJBQVc7Ozs7Ozs7bUJBQUEsdUJBQUc7OztBQUVWLG9CQUFJLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOztBQUVsQyxvQkFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLDhCQUFVLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztBQUMxRCwyQkFBTyxFQUFLLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUM7aUJBQzFELENBQUM7O0FBRUYsMEJBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDckQsMEJBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pELDBCQUFLLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN0QyxDQUFDLENBQUM7O0FBRUgsMEJBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQU87QUFDckQsMEJBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNDLDBCQUFLLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNwQyxDQUFDLENBQUM7O0FBRUgsMEJBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTsyQkFBTSxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztpQkFBQSxDQUFDLENBQUM7YUFDM0Y7Ozs7QUFNRCxnQkFBUTs7Ozs7OzttQkFBQSxvQkFBRzs7QUFFUCxvQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV6RSxvQkFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1osd0NBQWtCLEdBQUcsVUFBSyxJQUFJLENBQUMsS0FBSyxPQUFJO2lCQUMzQzs7QUFFRCxvQ0FBa0IsR0FBRyxPQUFJO2FBRTVCOzs7Ozs7V0FoUGdCLEtBQUs7OztpQkFBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7SUNkbkIsT0FBTywyQkFBTyxpQkFBaUI7Ozs7SUFFL0IsTUFBTSwyQkFBUSwyQkFBMkI7O0lBQ3pDLFFBQVEsMkJBQU0sNkJBQTZCOzs7Ozs7Ozs7SUFRN0IsT0FBTyxjQUFTLE9BQU87Ozs7Ozs7OztBQVE3QixhQVJNLE9BQU8sQ0FRWixLQUFLOzs7Ozs4QkFSQSxPQUFPOztBQVVwQixtQ0FWYSxPQUFPLDZDQVVkLEtBQUssRUFBRTs7Ozs7O0FBTWIsWUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUU1QixZQUFJLFNBQVMsR0FBRyxDQUFDLFdBQVcsRUFBRTttQkFBTSxNQUFLLFNBQVMsRUFBRTtTQUFBLENBQUM7WUFDakQsSUFBSSxHQUFRLENBQUMsTUFBTSxFQUFPO21CQUFNLE1BQUssSUFBSSxFQUFFO1NBQUEsQ0FBQztZQUM1QyxPQUFPLEdBQUssQ0FBQyxTQUFTLEVBQUk7bUJBQU0sTUFBSyxPQUFPLEVBQUU7U0FBQSxDQUFDLENBQUM7O0FBRXBELGFBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUFBLHdCQUFBLHFCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxNQUFBLG9CQUFJLFNBQVMsQ0FBQyxFQUFDLEVBQUUsTUFBQSx1QkFBSSxJQUFJLENBQUMsRUFBQyxFQUFFLE1BQUEsMEJBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztLQUV0Rjs7Y0F4QmdCLE9BQU8sRUFBUyxPQUFPOzt5QkFBdkIsT0FBTztBQStCeEIsZ0JBQVE7Ozs7Ozs7O21CQUFBLGtCQUFDLE1BQU0sRUFBRTtBQUNiLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7OztBQU9ELGdCQUFROzs7Ozs7OzttQkFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDWixvQkFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekU7Ozs7QUFPRCxpQkFBUzs7Ozs7Ozs7bUJBQUEsbUJBQUMsS0FBSyxFQUFFO0FBQ2Isb0JBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pFOzs7O0FBT0QsY0FBTTs7Ozs7Ozs7bUJBQUEsZ0JBQUMsS0FBSyxFQUFFO0FBQ1Ysb0JBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pFOzs7O0FBT0QsZ0JBQVE7Ozs7Ozs7O21CQUFBLGtCQUFDLEtBQUssRUFBRTtBQUNaLG9CQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6RTs7OztBQVFELGlCQUFTOzs7Ozs7Ozs7bUJBQUEscUJBQXFCO29CQUFwQixDQUFDLGdDQUFHLElBQUk7b0JBQUUsQ0FBQyxnQ0FBRyxJQUFJOztBQUV4QixvQkFBSSxDQUFDLEtBQUssR0FBRztBQUNULHFCQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDbEYscUJBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRTtpQkFDckYsQ0FBQzs7QUFFRixvQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFDLG9CQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBRTlDOzs7O0FBU0QsWUFBSTs7Ozs7Ozs7OzttQkFBQSxnQkFBcUQ7b0JBQXBELENBQUMsZ0NBQUcsSUFBSTtvQkFBRSxDQUFDLGdDQUFHLElBQUk7b0JBQUUsVUFBVSxnQ0FBRyxRQUFRLENBQUMsUUFBUTs7QUFFbkQsaUJBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUNwRCxpQkFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDOztBQUVwRCxvQkFBSSxFQUFFLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFDO29CQUN2QixFQUFFLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFDO29CQUN2QixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVTtvQkFDNUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQzs7QUFFakQsb0JBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLG9CQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUVuQzs7OztBQU1ELGVBQU87Ozs7Ozs7bUJBQUEsbUJBQUc7QUFDTixvQkFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMvQzs7Ozs7O1dBckhnQixPQUFPO0dBQVMsT0FBTzs7aUJBQXZCLE9BQU87Ozs7Ozs7Ozs7Ozs7OztJQ1hyQixPQUFPLDJCQUFPLGlCQUFpQjs7SUFDL0IsTUFBTSwyQkFBUSwyQkFBMkI7O0lBQ3pDLFFBQVEsMkJBQU0sNkJBQTZCOzs7Ozs7Ozs7SUFRN0IsVUFBVSxjQUFTLE9BQU87Ozs7Ozs7OztBQVFoQyxhQVJNLFVBQVUsQ0FRZixLQUFLOzs7OEJBUkEsVUFBVTs7QUFVdkIsbUNBVmEsVUFBVSw2Q0FVakIsS0FBSyxFQUFFO0FBQ2IsWUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLGFBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFNOztBQUVoQyxnQkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFOzs7O0FBSTVCLHNCQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7QUFDN0MseUJBQUssRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFO2lCQUM5QixDQUFDLENBQUM7YUFFTjs7QUFFRCxnQkFBSSxDQUFDLE1BQUssUUFBUSxFQUFFO0FBQ2hCLHNCQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDM0MseUJBQUssRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFO2lCQUM5QixDQUFDLENBQUM7YUFDTjtTQUVKLENBQUMsQ0FBQztLQUVOOztjQWpDZ0IsVUFBVSxFQUFTLE9BQU87O3lCQUExQixVQUFVO0FBdUMzQixjQUFNOzs7Ozs7O21CQUFBLGtCQUFHOztBQUVMLG9CQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNoQix3QkFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyx3QkFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQyx3QkFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLHdCQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztpQkFDeEI7YUFFSjs7OztBQU1ELGdCQUFROzs7Ozs7O21CQUFBLG9CQUFHOztBQUVQLG9CQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDZix3QkFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1Qyx3QkFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQyx3QkFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekMsd0JBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2lCQUN6QjthQUVKOzs7Ozs7V0EvRGdCLFVBQVU7R0FBUyxPQUFPOztpQkFBMUIsVUFBVTs7Ozs7Ozs7Ozs7OztJQ1Z4QixTQUFTLDJCQUFNLG1CQUFtQjs7Ozs7Ozs7O0lBUXBCLFNBQVMsY0FBUyxTQUFTO1dBQTNCLFNBQVM7MEJBQVQsU0FBUzs7UUFBUyxTQUFTO0FBQVQsZUFBUzs7OztZQUEzQixTQUFTLEVBQVMsU0FBUzs7dUJBQTNCLFNBQVM7QUFPMUIsUUFBSTs7Ozs7Ozs7YUFBQSxjQUFDLEtBQUssRUFBRTtBQUNSLGVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDbkM7Ozs7OztTQVRnQixTQUFTO0dBQVMsU0FBUzs7aUJBQTNCLFNBQVM7Ozs7Ozs7Ozs7Ozs7SUNSdkIsS0FBSywyQkFBVSxlQUFlOztJQUM5QixTQUFTLDJCQUFNLDhCQUE4Qjs7Ozs7Ozs7O0lBUS9CLFNBQVMsY0FBUyxLQUFLO1dBQXZCLFNBQVM7MEJBQVQsU0FBUzs7UUFBUyxLQUFLO0FBQUwsV0FBSzs7OztZQUF2QixTQUFTLEVBQVMsS0FBSzs7dUJBQXZCLFNBQVM7QUFNMUIsVUFBTTs7Ozs7OzthQUFBLGtCQUFHO0FBQ0wsZUFBTyxNQUFNLENBQUM7T0FDakI7Ozs7QUFNRCxnQkFBWTs7Ozs7OzthQUFBLHdCQUFHO0FBQ1gsZUFBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDcEM7Ozs7QUFNRCxpQkFBYTs7Ozs7OzthQUFBLHlCQUFHO0FBQ1osZUFBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO09BQ2xFOzs7Ozs7U0F4QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IFpJbmRleCAgICAgZnJvbSAnLi9oZWxwZXJzL1pJbmRleC5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgU2hhcGUgICAgICBmcm9tICcuL3NoYXBlcy9TaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR8U3RyaW5nfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gXy5hc3NpZ24odGhpcy5kZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgID0gZDMuc2VsZWN0KHV0aWxpdHkuZWxlbWVudFJlZmVyZW5jZShlbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG5cbiAgICAgICAgLy8gSGVscGVycyByZXF1aXJlZCBieSBCbHVlcHJpbnQgYW5kIHRoZSByZXN0IG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMuekluZGV4ICAgICA9IG5ldyBaSW5kZXgoKTtcbiAgICAgICAgdGhpcy5ncm91cHMgICAgID0gbmV3IEdyb3VwcygpLmFkZFRvKHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gUmVnaXN0ZXIgb3VyIGRlZmF1bHQgY29tcG9uZW50cy5cbiAgICAgICAgdGhpcy5tYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBZGQgdGhlIGV2ZW50IGxpc3RlbmVycywgYW5kIHNldHVwIE1vdXNldHJhcCB0byBsaXN0ZW4gZm9yIGtleWJvYXJkIGV2ZW50cy5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnNldHVwTW91c2V0cmFwKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBuYW1lXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgbGV0IHNoYXBlICAgPSB0aGlzLmluc3RhbnRpYXRlKHV0aWxpdHkuZWxlbWVudE5hbWUobmFtZSkpLFxuICAgICAgICAgICAgZ3JvdXAgICA9IHRoaXMuZ3JvdXBzLnNoYXBlcy5hcHBlbmQoJ2cnKS5hdHRyKHRoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlLCBzaGFwZS5sYWJlbCksXG4gICAgICAgICAgICBlbGVtZW50ID0gZ3JvdXAuYXBwZW5kKHNoYXBlLmdldFRhZygpKSxcbiAgICAgICAgICAgIHpJbmRleCAgPSB7IHo6IHRoaXMuaW5kZXggLSAxIH07XG5cbiAgICAgICAgLy8gU2V0IGFsbCBvZiB0aGUgZXNzZW50aWFsIG9iamVjdHMgdGhhdCB0aGUgc2hhcGUgcmVxdWlyZXMuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRHcm91cChncm91cCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cCwgYW5kIHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gZmVhdHVyZXMgd2hpY2ggYSBzaGFwZSBzaG91bGQgaGF2ZSwgc3VjaCBhcyBiZWluZyBkcmFnZ2FibGUsIHNlbGVjdGFibGUsIHJlc2l6ZWFibGUsIGV0Yy4uLlxuICAgICAgICBzaGFwZS5hZGRFbGVtZW50cygpO1xuICAgICAgICBzaGFwZS5hZGRGZWF0dXJlcygpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgYWN0dWFsIHNoYXBlIG9iamVjdCwgdG8gdGhlIGludGVyZmFjZSBvYmplY3QgdGhhdCB0aGUgZGV2ZWxvcGVyXG4gICAgICAgIC8vIGludGVyYWN0cyB3aXRoLlxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKHsgc2hhcGU6IHNoYXBlLCBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpfSk7XG4gICAgICAgIHJldHVybiBzaGFwZS5nZXRJbnRlcmZhY2UoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtJbnRlcmZhY2V9IG1vZGVsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG5cbiAgICAgICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgICAgIGl0ZW0gID0gXy5maW5kKHRoaXMuc2hhcGVzLCAoc2hhcGUsIGkpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFwZS5pbnRlcmZhY2UgPT09IG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5tYXAoKG1vZGVsKSA9PiBtb2RlbC5pbnRlcmZhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZUludGVyZmFjZSkgPT4gc2hhcGVJbnRlcmZhY2UuaXNTZWxlY3RlZCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpZGVudFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBpZGVudCgpIHtcbiAgICAgICAgcmV0dXJuIFsnQlAnLCB0aGlzLmluZGV4KytdLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3ZlcndyaXRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXIobmFtZSwgc2hhcGUsIG92ZXJ3cml0ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBzaGFwZSBpcyBhIHZhbGlkIGluc3RhbmNlLlxuICAgICAgICB1dGlsaXR5LmFzc2VydChPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc2hhcGUpID09PSBTaGFwZSwgJ0N1c3RvbSBzaGFwZSBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBTaGFwZWAnLCAnSW5zdGFuY2Ugb2YgU2hhcGUnKTtcblxuICAgICAgICBpZiAoIW92ZXJ3cml0ZSAmJiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuXG4gICAgICAgICAgICAvLyBFeGlzdGluZyBzaGFwZXMgY2Fubm90IGJlIG92ZXJ3cml0dGVuLlxuICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgUmVmdXNpbmcgdG8gb3ZlcndyaXRlIGV4aXN0aW5nICR7bmFtZX0gc2hhcGUgd2l0aG91dCBleHBsaWNpdCBvdmVyd3JpdGVgLCAnT3ZlcndyaXRpbmcgRXhpc3RpbmcgU2hhcGVzJyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGluc3RhbnRpYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBpbnN0YW50aWF0ZShuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSh0aGlzLmlkZW50KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRXZlbnRMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKGV2ZW50KSAgPT4gdGhpcy5yZW1vdmUoZXZlbnQuaW50ZXJmYWNlKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEVEX0dFVCwgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVEVEX0xJU1QsIHRoaXMuc2VsZWN0ZWQoKSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU9SREVSLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBncm91cHMgPSB0aGlzLmVsZW1lbnQuc2VsZWN0QWxsKGBnWyR7dGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGV9XWApO1xuICAgICAgICAgICAgdGhpcy56SW5kZXgucmVvcmRlcihncm91cHMsIGV2ZW50Lmdyb3VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIFNWRyBsYXllciB0aGF0IGlzbid0IGEgcGFydCBvZiB0aGUgc2hhcGUgZ3JvdXAsIHRoZW4gd2UnbGwgZW1pdFxuICAgICAgICAvLyB0aGUgYEV2ZW50cy5ERVNFTEVDVGAgZXZlbnQgdG8gZGVzZWxlY3QgYWxsIHNlbGVjdGVkIHNoYXBlcy5cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0dXBNb3VzZXRyYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldHVwTW91c2V0cmFwKCkge1xuXG4gICAgICAgIGxldCBTTUFMTF9NT1ZFID0gMSxcbiAgICAgICAgICAgIExBUkdFX01PVkUgPSAxMDtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gcmVnaXN0cnkua2V5cy5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiByZWdpc3RyeS5rZXlzLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gcmVnaXN0cnkua2V5cy5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCkpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIG1vdmVcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBsZXQgbW92ZSA9IChuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQobmFtZSwgeyBieTogdmFsdWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ2xlZnQnLCAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9MRUZULCBTTUFMTF9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdyaWdodCcsICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfUklHSFQsIFNNQUxMX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3VwJywgICAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9VUCwgU01BTExfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnZG93bicsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0RPV04sIFNNQUxMX01PVkUpKTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrbGVmdCcsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0xFRlQsIExBUkdFX01PVkUpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0K3JpZ2h0JywgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9SSUdIVCwgTEFSR0VfTU9WRSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrdXAnLCAgICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1VQLCBMQVJHRV9NT1ZFKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCtkb3duJywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfRE9XTiwgTEFSR0VfTU9WRSkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YUF0dHJpYnV0ZTogJ2RhdGEtaWQnLFxuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJ1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogRGlyZWN0IGxpbmsgdG8gZWx1Y2lkYXRpbmcgY29tbW9uIGV4Y2VwdGlvbiBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEBjb25zdGFudCBFWENFUFRJT05TX1VSTFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgRVhDRVBUSU9OU19VUkw6ICdodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludC9ibG9iL21hc3Rlci9FWENFUFRJT05TLm1kI3t0aXRsZX0nXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIE1PVkVfVVA6ICdtb3ZlLXVwJyxcbiAgICBNT1ZFX0RPV046ICdtb3ZlLWRvd24nLFxuICAgIE1PVkVfTEVGVDogJ21vdmUtbGVmdCcsXG4gICAgTU9WRV9SSUdIVDogJ21vdmUtcmlnaHQnLFxuICAgIFNFTEVDVDogJ3NlbGVjdCcsXG4gICAgU0VMRUNUX0FMTDogJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1Q6ICdkZXNlbGVjdCcsXG4gICAgU0VMRUNURURfR0VUOiAnc2VsZWN0ZWQtZ2V0JyxcbiAgICBTRUxFQ1RFRF9MSVNUOiAnc2VsZWN0ZWQtbGlzdCcsXG4gICAgU0VMRUNUQUJMRToge1xuICAgICAgICBTRUxFQ1Q6ICdzZWxlY3RhYmxlLXNlbGVjdCcsXG4gICAgICAgIERFU0VMRUNUOiAnc2VsZWN0YWJsZS1kZXNlbGVjdCdcbiAgICB9XG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRUb1xuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0dyb3Vwc31cbiAgICAgKi9cbiAgICBhZGRUbyhlbGVtZW50KSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGVsZW1lbnRzIGZyb20gbGVha2luZyB0aHJvdWdoIHRvIHRoZSBTVkcgbGF5ZXIuXG4gICAgICAgIHRoaXMuc2hhcGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVnaXN0cnlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgd2hlbiBjZXJ0YWluIGtleXMgYXJlIHByZXNzZWQgZG93biwgd2hpY2ggd2lsbCBkZXRlcm1pbmUgdGhlXG4gICAgICogc3RyYXRlZ3kgYXQgcnVudGltZSBmb3IgY2VydGFpbiBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkga2V5c1xuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5czoge1xuICAgICAgICBtdWx0aVNlbGVjdDogZmFsc2UsXG4gICAgICAgIGFzcGVjdFJhdGlvOiBmYWxzZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgc25hcEdyaWRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHNuYXBHcmlkOiAxMFxuXG59IiwiaW1wb3J0IENvbnN0YW50cyBmcm9tICcuL0NvbnN0YW50cy5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgVXRpbGl0eVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbnZhciB1dGlsaXR5ID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRocm93RXhjZXB0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbZXhjZXB0aW9uc1RpdGxlPScnXVxuICAgICAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhyb3dFeGNlcHRpb246IChtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUgPSAnJykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoZXhjZXB0aW9uc1RpdGxlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBDb25zdGFudHMuRVhDRVBUSU9OU19VUkwucmVwbGFjZSgveyguKz8pfS9pLCAoKSA9PiBfLmtlYmFiQ2FzZShleGNlcHRpb25zVGl0bGUpKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJsdWVwcmludC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmx1ZXByaW50LmpzOiAke21lc3NhZ2V9LmApO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYXNzZXJ0XG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNzZXJ0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBleGNlcHRpb25zVGl0bGVcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGFzc2VydChhc3NlcnRpb24sIG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSkge1xuXG4gICAgICAgICAgICBpZiAoIWFzc2VydGlvbikge1xuICAgICAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24obWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50TmFtZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudE5hbWUobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudFJlZmVyZW5jZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50UmVmZXJlbmNlKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kZWwpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBaSW5kZXhcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaSW5kZXgge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIGxldCB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG5cbiAgICAgICAgdmFyIHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBfLmZvckVhY2goZ3JvdXBzWzBdLCAobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEZlYXR1cmVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHtGZWF0dXJlfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEV2ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRzKGRpc3BhdGNoZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG59IiwiaW1wb3J0IEV2ZW50cyAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgICAgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwge1xuICAgICAgICAgICAgJ2ludGVyZmFjZSc6IHRoaXNcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaXNTZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3knLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cmFuc2Zvcm1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgdHJhbnNmb3JtKHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIGlmICghXy5pc051bGwoeCkpIHtcbiAgICAgICAgICAgIHRoaXMueCh4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc051bGwoeSkpIHtcbiAgICAgICAgICAgIHRoaXMueSh5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBvcGFjaXR5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ29wYWNpdHknLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzdHJva2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8U3RyaW5nfVxuICAgICAqL1xuICAgIHN0cm9rZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzdHJva2VXaWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc3Ryb2tlV2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLXdpZHRoJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc3Ryb2tlRGFzaEFycmF5XG4gICAgICogQHBhcmFtIHtBcnJheX0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHN0cm9rZURhc2hBcnJheSh2YWx1ZSkge1xuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHV0aWxpdHkuYXNzZXJ0KF8uaXNBcnJheSh2YWx1ZSksICdNZXRob2QgYHN0cm9rZURhc2hBcnJheWAgZXhwZWN0cyBhbiBhcnJheSB2YWx1ZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsIHZhbHVlLmpvaW4oJywnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdzdHJva2UtZGFzaGFycmF5Jyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdUb0Zyb250XG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBicmluZ1RvRnJvbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCBJbmZpbml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzZW5kVG9CYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgLUluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHNlbmRCYWNrd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiAtIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGJyaW5nRm9yd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiArIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB3aWR0aCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd3aWR0aCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hlaWdodCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPW51bGxdXG4gICAgICogQHJldHVybiB7Knx2b2lkfVxuICAgICAqL1xuICAgIGF0dHIocHJvcGVydHksIHZhbHVlID0gbnVsbCkge1xuXG4gICAgICAgIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbW9kZWwgICAgICAgPSB7fTtcbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIobW9kZWwpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgc2V0QXR0cihhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX1NFVCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdXRpbGl0eS5rZWJhYmlmeUtleXMoYXR0cmlidXRlcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cigpIHtcblxuICAgICAgICBsZXQgcmVzdWx0ID0ge307XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCB7fSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZV1gO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi8uLi9oZWxwZXJzL0Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgICBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8vIEZlYXR1cmVzLlxuaW1wb3J0IFNlbGVjdGFibGUgZnJvbSAnLi9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzJztcbmltcG9ydCBNb3ZhYmxlICAgIGZyb20gJy4vZmVhdHVyZXMvTW92YWJsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEdyb3VwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRHcm91cChncm91cCkge1xuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVF9BTEwsICAgICgpID0+IHRoaXMuaW52b2tlRWFjaEZlYXR1cmUoJ3NlbGVjdCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuREVTRUxFQ1RfQUxMLCAgKCkgPT4gdGhpcy5pbnZva2VFYWNoRmVhdHVyZSgnZGVzZWxlY3QnKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEVEX0xJU1QsIChtb2RlbCkgPT4gdGhpcy5pbnZva2VFYWNoRmVhdHVyZSgnc2VsZWN0ZWQnLCBtb2RlbCkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5NT1ZFX0xFRlQsICAgICAobW9kZWwpID0+IHRoaXMuaW52b2tlRWFjaEZlYXR1cmUoJ21vdmVMZWZ0JywgbW9kZWwsICdpc1NlbGVjdGVkJykpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5NT1ZFX1JJR0hULCAgICAobW9kZWwpID0+IHRoaXMuaW52b2tlRWFjaEZlYXR1cmUoJ21vdmVSaWdodCcsIG1vZGVsLCAnaXNTZWxlY3RlZCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuTU9WRV9VUCwgICAgICAgKG1vZGVsKSA9PiB0aGlzLmludm9rZUVhY2hGZWF0dXJlKCdtb3ZlVXAnLCBtb2RlbCwgJ2lzU2VsZWN0ZWQnKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfRE9XTiwgICAgIChtb2RlbCkgPT4gdGhpcy5pbnZva2VFYWNoRmVhdHVyZSgnbW92ZURvd24nLCBtb2RlbCwgJ2lzU2VsZWN0ZWQnKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25zaWJsZSBmb3IgYXR0ZW1wdGluZyB0byBpbnZva2UgYSBzcGVjaWZpZWQgZnVuY3Rpb24gb24gZWFjaCBmZWF0dXJlLCBpZiB0aGUgZnVuY3Rpb24gZXhpc3RzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBpbnZva2VFYWNoRmVhdHVyZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2ROYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbY29uZGl0aW9uYWxGbj1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaW52b2tlRWFjaEZlYXR1cmUobWV0aG9kTmFtZSwgcHJvcGVydGllcyA9IHt9LCBjb25kaXRpb25hbEZuID0gbnVsbCkge1xuXG4gICAgICAgIF8uZm9ySW4odGhpcy5mZWF0dXJlcywgKGZlYXR1cmUpID0+IHtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmZWF0dXJlW21ldGhvZE5hbWVdKSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNTdHJpbmcoY29uZGl0aW9uYWxGbikgJiYgIXRoaXMuZ2V0SW50ZXJmYWNlKClbY29uZGl0aW9uYWxGbl0oKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmVhdHVyZVttZXRob2ROYW1lXShwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3VsZCBiZSBvdmVyd3JpdHRlbiBmb3Igc2hhcGUgdHlwZXMgdGhhdCBoYXZlIGEgZGlmZmVyZW50IG5hbWUgdG8gdGhlaXIgU1ZHIHRhZyBuYW1lLCBzdWNoIGFzIGEgYGZvcmVpZ25PYmplY3RgXG4gICAgICogZWxlbWVudCB1c2luZyB0aGUgYHJlY3RgIHNoYXBlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFnKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnRlcmZhY2VcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZ2V0SW50ZXJmYWNlKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmludGVyZmFjZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IHRoaXMuYWRkSW50ZXJmYWNlKCk7XG4gICAgICAgICAgICBsZXQgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBsZXQgZ2V0QXR0cmlidXRlcyA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCB6SW5kZXggPSB7IHo6IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpLmRhdHVtKCkueiB9LFxuICAgICAgICAgICAgICAgICAgICBtb2RlbCAgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSwgekluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5yZXRyYW5zZm9ybUF0dHJpYnV0ZXMobW9kZWwpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW5lcnMgdGhhdCBob29rIHVwIHRoZSBpbnRlcmZhY2UgYW5kIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsICAgICAgICBnZXRBdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChtb2RlbCkgICAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIG1vZGVsKSk7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX1NFVCwgKG1vZGVsKSA9PiB7IHRoaXMuc2V0QXR0cmlidXRlcyhtb2RlbC5hdHRyaWJ1dGVzKTsgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIGxldCBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIsIHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEZlYXR1cmVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRGZWF0dXJlcygpIHtcblxuICAgICAgICBsZXQgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKHRoaXMpLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlciksXG4gICAgICAgICAgICBtb3ZhYmxlOiAgICBuZXcgTW92YWJsZSh0aGlzKS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEFCTEUuREVTRUxFQ1QsIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUX0FMTCwgbW9kZWwpO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFYWNoRmVhdHVyZSgnZGVzZWxlY3QnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEFCTEUuU0VMRUNULCAobW9kZWwpICAgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVCwgbW9kZWwpO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFYWNoRmVhdHVyZSgnc2VsZWN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1RFRF9HRVQsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RFRF9HRVQpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGxldCB0YWcgPSB0aGlzLmdldFRhZygpLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5nZXRUYWcoKS5zbGljZSgxKTtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfV1gO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEZlYXR1cmUgIGZyb20gJy4vLi4vRmVhdHVyZS5qcyc7XG4vL2ltcG9ydCB1dGlsaXR5ICBmcm9tICcuLy4uLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL1JlZ2lzdHJ5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBNb3ZhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92YWJsZSBleHRlbmRzIEZlYXR1cmUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtNb3ZhYmxlfVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG5cbiAgICAgICAgc3VwZXIoc2hhcGUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgc3RhcnRcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBsZXQgZHJhZ1N0YXJ0ID0gWydkcmFnc3RhcnQnLCAoKSA9PiB0aGlzLmRyYWdTdGFydCgpXSxcbiAgICAgICAgICAgIGRyYWcgICAgICA9IFsnZHJhZycsICAgICAgKCkgPT4gdGhpcy5kcmFnKCldLFxuICAgICAgICAgICAgZHJhZ0VuZCAgID0gWydkcmFnZW5kJywgICAoKSA9PiB0aGlzLmRyYWdFbmQoKV07XG5cbiAgICAgICAgc2hhcGUuZWxlbWVudC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbiguLi5kcmFnU3RhcnQpLm9uKC4uLmRyYWcpLm9uKC4uLmRyYWdFbmQpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBzaGFwZXNcbiAgICAgKiBAcmV0dXJuIHtBcnJheXx2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdGVkKHNoYXBlcykge1xuICAgICAgICByZXR1cm4gc2hhcGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZUxlZnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVMZWZ0KG1vZGVsKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCh0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoKSAtIG1vZGVsLmJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1vdmVSaWdodFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbW92ZVJpZ2h0KG1vZGVsKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCh0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoKSArIG1vZGVsLmJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1vdmVVcFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbW92ZVVwKG1vZGVsKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSh0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoKSAtIG1vZGVsLmJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG1vdmVEb3duXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlRG93bihtb2RlbCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkodGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KCkgKyBtb2RlbC5ieSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnU3RhcnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdTdGFydCh4ID0gbnVsbCwgeSA9IG51bGwpIHtcblxuICAgICAgICB0aGlzLnN0YXJ0ID0ge1xuICAgICAgICAgICAgeDogIV8uaXNOdWxsKHgpID8geCA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFggLSB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoKSxcbiAgICAgICAgICAgIHk6ICFfLmlzTnVsbCh5KSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZIC0gdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNURURfR0VUKTtcbiAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdkcmFnZ2luZycsIHRydWUpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFttdWx0aXBsZU9mPXJlZ2lzdHJ5LnNuYXBHcmlkXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSByZWdpc3RyeS5zbmFwR3JpZCkge1xuXG4gICAgICAgIHggPSAhXy5pc051bGwoeCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WDtcbiAgICAgICAgeSA9ICFfLmlzTnVsbCh5KSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZO1xuXG4gICAgICAgIGxldCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgIG1ZID0gKHkgLSB0aGlzLnN0YXJ0LnkpLFxuICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoZVgpO1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoZVkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnRW5kXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnRW5kKCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ2RyYWdnaW5nJywgZmFsc2UpO1xuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuaW1wb3J0IEV2ZW50cyAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2VsZWN0YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHNoYXBlLmVsZW1lbnQub24oJ21vdXNlZG93bicsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFyZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb2YgdGhlIHNoYXBlcyBpbmNsdWRpbmcgdGhlIGN1cnJlbnQgb25lLCBhcyB0aGlzIGtlZXBzIHRoZSBsb2dpYyBzaW1wbGVyLiBXZSB3aWxsXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdGhlIGN1cnJlbnQgc2hhcGUgdG8gYmUgc2VsZWN0ZWQgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5ERVNFTEVDVCwge1xuICAgICAgICAgICAgICAgICAgICBzaGFwZTogc2hhcGUuZ2V0SW50ZXJmYWNlKClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5TRUxFQ1QsIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcGU6IHNoYXBlLmdldEludGVyZmFjZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdzZWxlY3RlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuc3Ryb2tlKCdibGFjaycpLnN0cm9rZVdpZHRoKDEpLnN0cm9rZURhc2hBcnJheShbMywgM10pO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ3NlbGVjdGVkJywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5kZXNlbGVjdCgpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5zdHJva2UoJ25vbmUnKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59IiwiaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL0ludGVyZmFjZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBmaWxsKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCB2YWx1ZSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBJbnRlcmZhY2UgZnJvbSAnLi8uLi9pbnRlcmZhY2VzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkSW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZEludGVyZmFjZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcmZhY2UodGhpcy5sYWJlbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxufSJdfQ==
