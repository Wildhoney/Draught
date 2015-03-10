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

                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = true;
                }, "keydown");
                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = false;
                }, "keyup");
                Mousetrap.bind("mod+a", function () {
                    return _this.dispatcher.send(Events.SELECT_ALL);
                }, "keydown");
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

},{"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Registry.js":7,"./helpers/Utility.js":8,"./helpers/ZIndex.js":9,"./shapes/Shape.js":11,"./shapes/types/Rectangle.js":14}],2:[function(require,module,exports){
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
    multiSelect: false
  },

  /**
   * @property snapGrid
   * @type {Number}
   */
  snapGrid: 10

};

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

},{}],10:[function(require,module,exports){
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
        return this;
      },
      writable: true,
      configurable: true
    }
  });

  return Feature;
})();

module.exports = Feature;

},{}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../helpers/Interface.js"));

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
            },
            writable: true,
            configurable: true
        },
        tryInvokeOnEachFeature: {

            /**
             * @method tryInvokeOnEachFeature
             * @param {String} methodName
             */

            value: function tryInvokeOnEachFeature(methodName) {

                _.forIn(this.features, function (feature) {

                    if (_.isFunction(feature[methodName])) {
                        feature[methodName]();
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
                    dispatcher.listen(Events.ATTRIBUTE_GET_ALL, getAttributes);
                    dispatcher.listen(Events.REMOVE, function (model) {
                        return _this.dispatcher.send(Events.REMOVE, model);
                    });
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

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Interface.js":6,"./../helpers/Utility.js":8,"./features/Movable.js":12,"./features/Selectable.js":13}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

//import Events   from './../../helpers/Events.js';
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

},{"./../../helpers/Registry.js":7,"./../Feature.js":10}],13:[function(require,module,exports){
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
                    this.shape.getInterface().opacity(0.5);
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
                    this.shape.getInterface().opacity(1);
                    this.original = null;
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

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":7,"./../Feature.js":10}],14:[function(require,module,exports){
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

                return {
                    fill: function fill(value) {
                        return this.attr("fill", value);
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

},{"./../Shape.js":11}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0ludGVyZmFjZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1pJbmRleC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9GZWF0dXJlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL1NoYXBlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ZlYXR1cmVzL01vdmFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvZmVhdHVyZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FPLFVBQVUsMkJBQU0seUJBQXlCOztJQUN6QyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxRQUFRLDJCQUFRLHVCQUF1Qjs7SUFDdkMsT0FBTywyQkFBUyxzQkFBc0I7Ozs7SUFHdEMsS0FBSywyQkFBVyxtQkFBbUI7O0lBQ25DLFNBQVMsMkJBQU8sNkJBQTZCOzs7Ozs7OztJQU85QyxTQUFTOzs7Ozs7Ozs7QUFRQSxhQVJULFNBQVMsQ0FRQyxPQUFPO1lBQUUsT0FBTyxnQ0FBRyxFQUFFOzs4QkFSL0IsU0FBUzs7QUFVUCxZQUFJLENBQUMsT0FBTyxHQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxPQUFPLEdBQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDekMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDakUsWUFBSSxDQUFDLE1BQU0sR0FBTyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLEtBQUssR0FBUSxDQUFDLENBQUM7OztBQUdwQixZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDbkMsWUFBSSxDQUFDLE1BQU0sR0FBTyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQy9CLFlBQUksQ0FBQyxNQUFNLEdBQU8sSUFBSSxNQUFN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Ozs7Ozs7O0lDVnhCLEtBQUssMkJBQU0sZUFBZTs7Ozs7Ozs7O0lBUVosU0FBUyxjQUFTLEtBQUs7YUFBdkIsU0FBUzs4QkFBVCxTQUFTOztZQUFTLEtBQUs7QUFBTCxpQkFBSzs7OztjQUF2QixTQUFTLEVBQVMsS0FBSzs7eUJBQXZCLFNBQVM7QUFNMUIsY0FBTTs7Ozs7OzttQkFBQSxrQkFBRztBQUNMLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNsRTs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHOztBQUVULHVCQUFPO0FBQ0gsd0JBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNsQiwrQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztxQkFDbkM7aUJBQ0osQ0FBQTthQUVKOzs7Ozs7V0E5QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IFpJbmRleCAgICAgZnJvbSAnLi9oZWxwZXJzL1pJbmRleC5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgU2hhcGUgICAgICBmcm9tICcuL3NoYXBlcy9TaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR8U3RyaW5nfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gXy5hc3NpZ24odGhpcy5kZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgID0gZDMuc2VsZWN0KHV0aWxpdHkuZWxlbWVudFJlZmVyZW5jZShlbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG5cbiAgICAgICAgLy8gSGVscGVycyByZXF1aXJlZCBieSBCbHVlcHJpbnQgYW5kIHRoZSByZXN0IG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMuekluZGV4ICAgICA9IG5ldyBaSW5kZXgoKTtcbiAgICAgICAgdGhpcy5ncm91cHMgICAgID0gbmV3IEdyb3VwcygpLmFkZFRvKHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gUmVnaXN0ZXIgb3VyIGRlZmF1bHQgY29tcG9uZW50cy5cbiAgICAgICAgdGhpcy5tYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBZGQgdGhlIGV2ZW50IGxpc3RlbmVycywgYW5kIHNldHVwIE1vdXNldHJhcCB0byBsaXN0ZW4gZm9yIGtleWJvYXJkIGV2ZW50cy5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnNldHVwTW91c2V0cmFwKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBuYW1lXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgbGV0IHNoYXBlICAgPSB0aGlzLmluc3RhbnRpYXRlKHV0aWxpdHkuZWxlbWVudE5hbWUobmFtZSkpLFxuICAgICAgICAgICAgZ3JvdXAgICA9IHRoaXMuZ3JvdXBzLnNoYXBlcy5hcHBlbmQoJ2cnKS5hdHRyKHRoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlLCBzaGFwZS5sYWJlbCksXG4gICAgICAgICAgICBlbGVtZW50ID0gZ3JvdXAuYXBwZW5kKHNoYXBlLmdldFRhZygpKSxcbiAgICAgICAgICAgIHpJbmRleCAgPSB7IHo6IHRoaXMuaW5kZXggLSAxIH07XG5cbiAgICAgICAgLy8gU2V0IGFsbCBvZiB0aGUgZXNzZW50aWFsIG9iamVjdHMgdGhhdCB0aGUgc2hhcGUgcmVxdWlyZXMuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRHcm91cChncm91cCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cCwgYW5kIHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gZmVhdHVyZXMgd2hpY2ggYSBzaGFwZSBzaG91bGQgaGF2ZSwgc3VjaCBhcyBiZWluZyBkcmFnZ2FibGUsIHNlbGVjdGFibGUsIHJlc2l6ZWFibGUsIGV0Yy4uLlxuICAgICAgICBzaGFwZS5hZGRFbGVtZW50cygpO1xuICAgICAgICBzaGFwZS5hZGRGZWF0dXJlcygpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgYWN0dWFsIHNoYXBlIG9iamVjdCwgdG8gdGhlIGludGVyZmFjZSBvYmplY3QgdGhhdCB0aGUgZGV2ZWxvcGVyXG4gICAgICAgIC8vIGludGVyYWN0cyB3aXRoLlxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKHsgc2hhcGU6IHNoYXBlLCBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpfSk7XG4gICAgICAgIHJldHVybiBzaGFwZS5nZXRJbnRlcmZhY2UoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtJbnRlcmZhY2V9IG1vZGVsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG5cbiAgICAgICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgICAgIGl0ZW0gID0gXy5maW5kKHRoaXMuc2hhcGVzLCAoc2hhcGUsIGkpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFwZS5pbnRlcmZhY2UgPT09IG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5tYXAoKG1vZGVsKSA9PiBtb2RlbC5pbnRlcmZhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5zaGFwZXMsIChzaGFwZSkgPT4gdGhpcy5yZW1vdmUoc2hhcGUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlkZW50XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGlkZW50KCkge1xuICAgICAgICByZXR1cm4gWydCUCcsIHRoaXMuaW5kZXgrK10uam9pbignJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWdpc3RlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvdmVyd3JpdGU9ZmFsc2VdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWdpc3RlcihuYW1lLCBzaGFwZSwgb3ZlcndyaXRlID0gZmFsc2UpIHtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIHNoYXBlIGlzIGEgdmFsaWQgaW5zdGFuY2UuXG4gICAgICAgIHV0aWxpdHkuYXNzZXJ0KE9iamVjdC5nZXRQcm90b3R5cGVPZihzaGFwZSkgPT09IFNoYXBlLCAnQ3VzdG9tIHNoYXBlIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFNoYXBlYCcsICdJbnN0YW5jZSBvZiBTaGFwZScpO1xuXG4gICAgICAgIGlmICghb3ZlcndyaXRlICYmIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cbiAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNoYXBlcyBjYW5ub3QgYmUgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKGBSZWZ1c2luZyB0byBvdmVyd3JpdGUgZXhpc3RpbmcgJHtuYW1lfSBzaGFwZSB3aXRob3V0IGV4cGxpY2l0IG92ZXJ3cml0ZWAsICdPdmVyd3JpdGluZyBFeGlzdGluZyBTaGFwZXMnKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zdGFudGlhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGluc3RhbnRpYXRlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKHRoaXMuaWRlbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVNT1ZFLCAoZXZlbnQpICA9PiB0aGlzLnJlbW92ZShldmVudC5pbnRlcmZhY2UpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JvdXBzID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHRoaXMuekluZGV4LnJlb3JkZXIoZ3JvdXBzLCBldmVudC5ncm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBTVkcgbGF5ZXIgdGhhdCBpc24ndCBhIHBhcnQgb2YgdGhlIHNoYXBlIGdyb3VwLCB0aGVuIHdlJ2xsIGVtaXRcbiAgICAgICAgLy8gdGhlIGBFdmVudHMuREVTRUxFQ1RgIGV2ZW50IHRvIGRlc2VsZWN0IGFsbCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgIHRoaXMuZWxlbWVudC5vbignY2xpY2snLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldHVwTW91c2V0cmFwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXR1cE1vdXNldHJhcCgpIHtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgKCkgICA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCcsICgpICAgPT4gcmVnaXN0cnkua2V5cy5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVF9BTEwpLCAna2V5ZG93bicpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YUF0dHJpYnV0ZTogJ2RhdGEtaWQnLFxuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJ1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogRGlyZWN0IGxpbmsgdG8gZWx1Y2lkYXRpbmcgY29tbW9uIGV4Y2VwdGlvbiBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEBjb25zdGFudCBFWENFUFRJT05TX1VSTFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgRVhDRVBUSU9OU19VUkw6ICdodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludC9ibG9iL21hc3Rlci9FWENFUFRJT05TLm1kI3t0aXRsZX0nXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIFNFTEVDVDogJ3NlbGVjdCcsXG4gICAgU0VMRUNUX0FMTDogJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1Q6ICdkZXNlbGVjdCcsXG4gICAgU0VMRUNUQUJMRToge1xuICAgICAgICBTRUxFQ1Q6ICdzZWxlY3RhYmxlLXNlbGVjdCcsXG4gICAgICAgIERFU0VMRUNUOiAnc2VsZWN0YWJsZS1kZXNlbGVjdCdcbiAgICB9XG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRUb1xuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0dyb3Vwc31cbiAgICAgKi9cbiAgICBhZGRUbyhlbGVtZW50KSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGVsZW1lbnRzIGZyb20gbGVha2luZyB0aHJvdWdoIHRvIHRoZSBTVkcgbGF5ZXIuXG4gICAgICAgIHRoaXMuc2hhcGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxufSIsImltcG9ydCBFdmVudHMgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgb2JqZWN0XG4gKiBAc3VibW9kdWxlIEludGVyZmFjZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCB7XG4gICAgICAgICAgICAnaW50ZXJmYWNlJzogdGhpc1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgeCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd4JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgeSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgb3BhY2l0eSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdvcGFjaXR5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGJyaW5nVG9Gcm9udCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIEluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRUb0JhY2tcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAtSW5maW5pdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZEJhY2t3YXJkc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56IC0gMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdGb3J3YXJkc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56ICsgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3dpZHRoJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBoZWlnaHQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignaGVpZ2h0JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBhdHRyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgICAqIEByZXR1cm4geyp8dm9pZH1cbiAgICAgKi9cbiAgICBhdHRyKHByb3BlcnR5LCB2YWx1ZSkge1xuXG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cigpW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtb2RlbCAgICAgICA9IHt9O1xuICAgICAgICBtb2RlbFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cihtb2RlbCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBzZXRBdHRyKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfU0VULCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB1dGlsaXR5LmtlYmFiaWZ5S2V5cyhhdHRyaWJ1dGVzKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0clxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyKCkge1xuXG4gICAgICAgIGxldCByZXN1bHQgPSB7fTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsIHt9LCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlOiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlXWA7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFJlZ2lzdHJ5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogUmVzcG9uc2libGUgZm9yIGRldGVybWluaW5nIHdoZW4gY2VydGFpbiBrZXlzIGFyZSBwcmVzc2VkIGRvd24sIHdoaWNoIHdpbGwgZGV0ZXJtaW5lIHRoZVxuICAgICAqIHN0cmF0ZWd5IGF0IHJ1bnRpbWUgZm9yIGNlcnRhaW4gZnVuY3Rpb25zLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGtleXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIGtleXM6IHtcbiAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBzbmFwR3JpZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgc25hcEdyaWQ6IDEwXG5cbn0iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBVdGlsaXR5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtleGNlcHRpb25zVGl0bGU9JyddXG4gICAgICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aHJvd0V4Y2VwdGlvbjogKG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChleGNlcHRpb25zVGl0bGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGluayA9IENvbnN0YW50cy5FWENFUFRJT05TX1VSTC5yZXBsYWNlKC97KC4rPyl9L2ksICgpID0+IF8ua2ViYWJDYXNlKGV4Y2VwdGlvbnNUaXRsZSkpO1xuICAgICAgICAgICAgICAgIHRocm93IGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uIFNlZTogJHtsaW5rfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uYDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGFzc2VydFxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFzc2VydGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXhjZXB0aW9uc1RpdGxlXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBhc3NlcnQoYXNzZXJ0aW9uLCBtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUpIHtcblxuICAgICAgICAgICAgaWYgKCFhc3NlcnRpb24pIHtcbiAgICAgICAgICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0cmFuc2Zvcm1BdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRyYW5zZm9ybUF0dHJpYnV0ZXM6IChhdHRyaWJ1dGVzKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnRyYW5zZm9ybSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gYXR0cmlidXRlcy50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKS9pKSxcbiAgICAgICAgICAgICAgICAgICAgeCAgICAgPSBwYXJzZUludChtYXRjaFsxXSksXG4gICAgICAgICAgICAgICAgICAgIHkgICAgID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgeSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybSh4LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgdXNpbmcgdGhlIGB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh4LCB5KWAgZm9ybWF0IGluc3RlYWQuXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCByZXRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpIHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnkgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMudHJhbnNmb3JtO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LmNhbWVsaWZ5S2V5cyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHBvaW50c1RvVHJhbnNmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHBvaW50c1RvVHJhbnNmb3JtKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCAke3l9KWAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBrZWJhYmlmeUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGtlYmFiaWZ5S2V5cyhtb2RlbCkge1xuXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRNb2RlbCA9IHt9O1xuXG4gICAgICAgICAgICBfLmZvckluKG1vZGVsLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTW9kZWxbXy5rZWJhYkNhc2Uoa2V5KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGNhbWVsaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgY2FtZWxpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmNhbWVsQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudE5hbWVcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIGVsZW1lbnROYW1lKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGVsZW1lbnRSZWZlcmVuY2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudFJlZmVyZW5jZShtb2RlbCkge1xuXG4gICAgICAgICAgICBpZiAobW9kZWwubm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG1vZGVsKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCB1dGlsaXR5OyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgWkluZGV4XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWkluZGV4IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBncm91cFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3VwcywgZ3JvdXApIHtcblxuICAgICAgICBsZXQgek1heCA9IGdyb3Vwcy5zaXplKCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBtYXhpbXVtIFogaXMgYWJvdmUgemVybyBhbmQgYmVsb3cgdGhlIG1heGltdW0uXG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPCAxKSAgICB7IGdyb3VwLmRhdHVtKCkueiA9IDE7ICAgIH1cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA+IHpNYXgpIHsgZ3JvdXAuZGF0dW0oKS56ID0gek1heDsgfVxuXG4gICAgICAgIHZhciB6VGFyZ2V0ID0gZ3JvdXAuZGF0dW0oKS56LCB6Q3VycmVudCA9IDE7XG5cbiAgICAgICAgLy8gSW5pdGlhbCBzb3J0IGludG8gei1pbmRleCBvcmRlci5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICAgICAgXy5mb3JFYWNoKGdyb3Vwc1swXSwgKG1vZGVsKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEN1cnJlbnQgZ3JvdXAgaXMgaW1tdXRhYmxlIGluIHRoaXMgaXRlcmF0aW9uLlxuICAgICAgICAgICAgaWYgKG1vZGVsID09PSBncm91cC5ub2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNraXAgdGhlIHRhcmdldCBaIGluZGV4LlxuICAgICAgICAgICAgaWYgKHpDdXJyZW50ID09PSB6VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgekN1cnJlbnQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHNoYXBlID0gZDMuc2VsZWN0KG1vZGVsKSxcbiAgICAgICAgICAgICAgICBkYXR1bSA9IHNoYXBlLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXR1bS56ID0gekN1cnJlbnQrKztcbiAgICAgICAgICAgIHNoYXBlLmRhdHVtKGRhdHVtKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGaW5hbCBzb3J0IHBhc3MuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBGZWF0dXJlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge0ZlYXR1cmV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG59IiwiaW1wb3J0IEludGVyZmFjZSAgZnJvbSAnLi8uLi9oZWxwZXJzL0ludGVyZmFjZS5qcyc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuLy4uL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gRmVhdHVyZXMuXG5pbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL2ZlYXR1cmVzL1NlbGVjdGFibGUuanMnO1xuaW1wb3J0IE1vdmFibGUgICAgZnJvbSAnLi9mZWF0dXJlcy9Nb3ZhYmxlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ncm91cCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0R3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEdyb3VwKGdyb3VwKSB7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUX0FMTCwgICAoKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ3NlbGVjdCcpKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuREVTRUxFQ1RfQUxMLCAoKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ2Rlc2VsZWN0JykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cnlJbnZva2VPbkVhY2hGZWF0dXJlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZE5hbWVcbiAgICAgKi9cbiAgICB0cnlJbnZva2VPbkVhY2hGZWF0dXJlKG1ldGhvZE5hbWUpIHtcblxuICAgICAgICBfLmZvckluKHRoaXMuZmVhdHVyZXMsIChmZWF0dXJlKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZmVhdHVyZVttZXRob2ROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlW21ldGhvZE5hbWVdKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldE9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGJlIG92ZXJ3cml0dGVuIGZvciBzaGFwZSB0eXBlcyB0aGF0IGhhdmUgYSBkaWZmZXJlbnQgbmFtZSB0byB0aGVpciBTVkcgdGFnIG5hbWUsIHN1Y2ggYXMgYSBgZm9yZWlnbk9iamVjdGBcbiAgICAgKiBlbGVtZW50IHVzaW5nIHRoZSBgcmVjdGAgc2hhcGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0TmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYWcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICAgICAgICAgIGxldCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBnZXRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHpJbmRleCA9IHsgejogZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSkuZGF0dW0oKS56IH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsICA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpLCB6SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LnJldHJhbnNmb3JtQXR0cmlidXRlcyhtb2RlbCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyB0aGF0IGhvb2sgdXAgdGhlIGludGVyZmFjZSBhbmQgdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwgICAgICAgIGdldEF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSAgICAgICAgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwgbW9kZWwpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfU0VULCAobW9kZWwpID0+IHsgdGhpcy5zZXRBdHRyaWJ1dGVzKG1vZGVsLmF0dHJpYnV0ZXMpOyB9KTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZE1ldGhvZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMgPSB7fSkge1xuXG4gICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSB8fCB7fSwgYXR0cmlidXRlcyk7XG4gICAgICAgIGF0dHJpYnV0ZXMgPSB1dGlsaXR5LnRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueikpIHtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZGV2ZWxvcGVyIHNwZWNpZmllcyB0aGUgYHpgIGF0dHJpYnV0ZSwgaXQgYWN0dWFsbHkgcGVydGFpbnMgdG8gdGhlIGdyb3VwXG4gICAgICAgICAgICAvLyBlbGVtZW50IHRoYXQgdGhlIHNoYXBlIGlzIGEgY2hpbGQgb2YuIFdlJ2xsIHRoZXJlZm9yZSBuZWVkIHRvIHJlbW92ZSB0aGUgYHpgIHByb3BlcnR5XG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBgYXR0cmlidXRlc2Agb2JqZWN0LCBhbmQgaW5zdGVhZCBhcHBseSBpdCB0byB0aGUgc2hhcGUncyBncm91cCBlbGVtZW50LlxuICAgICAgICAgICAgLy8gQWZ0ZXJ3YXJkcyB3ZSdsbCBuZWVkIHRvIGJyb2FkY2FzdCBhbiBldmVudCB0byByZW9yZGVyIHRoZSBlbGVtZW50cyB1c2luZyBEMydzIG1hZ2ljYWxcbiAgICAgICAgICAgIC8vIGBzb3J0YCBtZXRob2QuXG4gICAgICAgICAgICBsZXQgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgIGdyb3VwLmRhdHVtKHsgejogYXR0cmlidXRlcy56IH0pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuejtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU9SREVSLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXA6IGdyb3VwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdHVtKGF0dHJpYnV0ZXMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXR0cih0aGlzLmVsZW1lbnQuZGF0dW0oKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBdHRyaWJ1dGVzKCkge1xuXG4gICAgICAgIGxldCBhdHRyaWJ1dGVzID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLmFkZEF0dHJpYnV0ZXMpKSB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdGhpcy5hZGRBdHRyaWJ1dGVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEVsZW1lbnRzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEVsZW1lbnRzKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRGZWF0dXJlc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRmVhdHVyZXMoKSB7XG5cbiAgICAgICAgbGV0IGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSh0aGlzKS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpLFxuICAgICAgICAgICAgbW92YWJsZTogICAgbmV3IE1vdmFibGUodGhpcykuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKVxuICAgICAgICB9O1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1RBQkxFLkRFU0VMRUNULCAobW9kZWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwsIG1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnZGVzZWxlY3QnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEFCTEUuU0VMRUNULCAobW9kZWwpICAgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVCwgbW9kZWwpO1xuICAgICAgICAgICAgdGhpcy50cnlJbnZva2VPbkVhY2hGZWF0dXJlKCdzZWxlY3QnKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGxldCB0YWcgPSB0aGlzLmdldFRhZygpLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5nZXRUYWcoKS5zbGljZSgxKTtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfV1gO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEZlYXR1cmUgIGZyb20gJy4vLi4vRmVhdHVyZS5qcyc7XG4vL2ltcG9ydCBFdmVudHMgICBmcm9tICcuLy4uLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbi8vaW1wb3J0IHV0aWxpdHkgIGZyb20gJy4vLi4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcbmltcG9ydCByZWdpc3RyeSBmcm9tICcuLy4uLy4uL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIE1vdmFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZhYmxlIGV4dGVuZHMgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge01vdmFibGV9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICBzdXBlcihzaGFwZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzdGFydFxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zdGFydCA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgICAgIHZhciBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldLFxuICAgICAgICAgICAgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV0sXG4gICAgICAgICAgICBkcmFnRW5kICAgPSBbJ2RyYWdlbmQnLCAgICgpID0+IHRoaXMuZHJhZ0VuZCgpXTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKC4uLmRyYWdTdGFydCkub24oLi4uZHJhZykub24oLi4uZHJhZ0VuZCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnU3RhcnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdTdGFydCh4ID0gbnVsbCwgeSA9IG51bGwpIHtcblxuICAgICAgICB0aGlzLnN0YXJ0ID0ge1xuICAgICAgICAgICAgeDogIV8uaXNOdWxsKHgpID8geCA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFggLSB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoKSxcbiAgICAgICAgICAgIHk6ICFfLmlzTnVsbCh5KSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZIC0gdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ2RyYWdnaW5nJywgdHJ1ZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW211bHRpcGxlT2Y9cmVnaXN0cnkuc25hcEdyaWRdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnKHggPSBudWxsLCB5ID0gbnVsbCwgbXVsdGlwbGVPZiA9IHJlZ2lzdHJ5LnNuYXBHcmlkKSB7XG5cbiAgICAgICAgeCA9ICFfLmlzTnVsbCh4KSA/IHggOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRYO1xuICAgICAgICB5ID0gIV8uaXNOdWxsKHkpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgbGV0IG1YID0gKHggLSB0aGlzLnN0YXJ0LngpLFxuICAgICAgICAgICAgbVkgPSAoeSAtIHRoaXMuc3RhcnQueSksXG4gICAgICAgICAgICBlWCA9IE1hdGguY2VpbChtWCAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZixcbiAgICAgICAgICAgIGVZID0gTWF0aC5jZWlsKG1ZIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mO1xuXG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueChlWCk7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueShlWSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdFbmRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdFbmQoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ3JvdXAuY2xhc3NlZCgnZHJhZ2dpbmcnLCBmYWxzZSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IEZlYXR1cmUgIGZyb20gJy4vLi4vRmVhdHVyZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL1JlZ2lzdHJ5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSBleHRlbmRzIEZlYXR1cmUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTZWxlY3RhYmxlfVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG5cbiAgICAgICAgc3VwZXIoc2hhcGUpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgc2hhcGUuZWxlbWVudC5vbignbW91c2Vkb3duJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIXJlZ2lzdHJ5LmtleXMubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBvZiB0aGUgc2hhcGVzIGluY2x1ZGluZyB0aGUgY3VycmVudCBvbmUsIGFzIHRoaXMga2VlcHMgdGhlIGxvZ2ljIHNpbXBsZXIuIFdlIHdpbGxcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0aGUgY3VycmVudCBzaGFwZSB0byBiZSBzZWxlY3RlZCBpbiB0aGUgbmV4dCBzdGVwLlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RBQkxFLkRFU0VMRUNULCB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXBlOiBzaGFwZS5nZXRJbnRlcmZhY2UoKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RBQkxFLlNFTEVDVCwge1xuICAgICAgICAgICAgICAgICAgICBzaGFwZTogc2hhcGUuZ2V0SW50ZXJmYWNlKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ3NlbGVjdGVkJywgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLm9wYWNpdHkoMC41KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcblxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdzZWxlY3RlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkub3BhY2l0eSgxKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWwgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
