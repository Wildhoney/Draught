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

},{"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Registry.js":7,"./helpers/Utility.js":8,"./helpers/ZIndex.js":9,"./shapes/Shape.js":11,"./shapes/types/Rectangle.js":13}],2:[function(require,module,exports){
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
        },
        unlistenAll: {

            /**
             * @method unlistenAll
             * @param {String} name
             * @param {Function} fn
             * @return {void}
             */

            value: function unlistenAll() {},
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
  }

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
                if (group.datum().z > zMax) {
                    group.datum().z = zMax;
                }
                if (group.datum().z < 1) {
                    group.datum().z = 1;
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
                    selectable: new Selectable(this).setDispatcher(dispatcher)
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

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Interface.js":6,"./../helpers/Utility.js":8,"./features/Selectable.js":12}],12:[function(require,module,exports){
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

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":7,"./../Feature.js":10}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0ludGVyZmFjZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1pJbmRleC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9GZWF0dXJlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL1NoYXBlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ZlYXR1cmVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMv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ZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCByZWdpc3RyeSAgIGZyb20gJy4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgICBmcm9tICcuL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8vIFNoYXBlcy5cbmltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vc2hhcGVzL1NoYXBlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudHxTdHJpbmd9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QodXRpbGl0eS5lbGVtZW50UmVmZXJlbmNlKGVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRIZWlnaHQpO1xuICAgICAgICB0aGlzLnNoYXBlcyAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5pbmRleCAgICAgID0gMTtcblxuICAgICAgICAvLyBIZWxwZXJzIHJlcXVpcmVkIGJ5IEJsdWVwcmludCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgdGhpcy56SW5kZXggICAgID0gbmV3IFpJbmRleCgpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKCkuYWRkVG8odGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBhbmQgc2V0dXAgTW91c2V0cmFwIHRvIGxpc3RlbiBmb3Iga2V5Ym9hcmQgZXZlbnRzLlxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBNb3VzZXRyYXAoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICB2YXIgc2hhcGUgICA9IHRoaXMuaW5zdGFudGlhdGUodXRpbGl0eS5lbGVtZW50TmFtZShuYW1lKSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKSxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5pbmRleCAtIDEgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgc2hhcGUuc2V0QXR0cmlidXRlcyhfLmFzc2lnbih6SW5kZXgsIHNoYXBlLmdldEF0dHJpYnV0ZXMoKSkpO1xuXG4gICAgICAgIC8vIExhc3QgY2hhbmNlIHRvIGRlZmluZSBhbnkgZnVydGhlciBlbGVtZW50cyBmb3IgdGhlIGdyb3VwLCBhbmQgdGhlIGFwcGxpY2F0aW9uIG9mIHRoZVxuICAgICAgICAvLyBmZWF0dXJlcyB3aGljaCBhIHNoYXBlIHNob3VsZCBoYXZlLCBzdWNoIGFzIGJlaW5nIGRyYWdnYWJsZSwgc2VsZWN0YWJsZSwgcmVzaXplYWJsZSwgZXRjLi4uXG4gICAgICAgIHNoYXBlLmFkZEVsZW1lbnRzKCk7XG4gICAgICAgIHNoYXBlLmFkZEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge0ludGVyZmFjZX0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICByZW1vdmUobW9kZWwpIHtcblxuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgaXRlbSAgPSBfLmZpbmQodGhpcy5zaGFwZXMsIChzaGFwZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNoYXBlLmludGVyZmFjZSA9PT0gbW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpdGVtLnNoYXBlLmVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtTaGFwZVtdfVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLm1hcCgobW9kZWwpID0+IG1vZGVsLmludGVyZmFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnNoYXBlcywgKHNoYXBlKSA9PiB0aGlzLnJlbW92ZShzaGFwZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaWRlbnRcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgaWRlbnQoKSB7XG4gICAgICAgIHJldHVybiBbJ0JQJywgdGhpcy5pbmRleCsrXS5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlZ2lzdGVyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW292ZXJ3cml0ZT1mYWxzZV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlZ2lzdGVyKG5hbWUsIHNoYXBlLCBvdmVyd3JpdGUgPSBmYWxzZSkge1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgc2hhcGUgaXMgYSB2YWxpZCBpbnN0YW5jZS5cbiAgICAgICAgdXRpbGl0eS5hc3NlcnQoT2JqZWN0LmdldFByb3RvdHlwZU9mKHNoYXBlKSA9PT0gU2hhcGUsICdDdXN0b20gc2hhcGUgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBgU2hhcGVgJywgJ0luc3RhbmNlIG9mIFNoYXBlJyk7XG5cbiAgICAgICAgaWYgKCFvdmVyd3JpdGUgJiYgdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcblxuICAgICAgICAgICAgLy8gRXhpc3Rpbmcgc2hhcGVzIGNhbm5vdCBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFJlZnVzaW5nIHRvIG92ZXJ3cml0ZSBleGlzdGluZyAke25hbWV9IHNoYXBlIHdpdGhvdXQgZXhwbGljaXQgb3ZlcndyaXRlYCwgJ092ZXJ3cml0aW5nIEV4aXN0aW5nIFNoYXBlcycpO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcFtuYW1lXSA9IHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnN0YW50aWF0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgaW5zdGFudGlhdGUobmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV0odGhpcy5pZGVudCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEV2ZW50TGlzdGVuZXJzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRFdmVudExpc3RlbmVycygpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChldmVudCkgID0+IHRoaXMucmVtb3ZlKGV2ZW50LmludGVyZmFjZSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU9SREVSLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHZhciBncm91cHMgPSB0aGlzLmVsZW1lbnQuc2VsZWN0QWxsKGBnWyR7dGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGV9XWApO1xuICAgICAgICAgICAgdGhpcy56SW5kZXgucmVvcmRlcihncm91cHMsIGV2ZW50Lmdyb3VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIFNWRyBsYXllciB0aGF0IGlzbid0IGEgcGFydCBvZiB0aGUgc2hhcGUgZ3JvdXAsIHRoZW4gd2UnbGwgZW1pdFxuICAgICAgICAvLyB0aGUgYEV2ZW50cy5ERVNFTEVDVGAgZXZlbnQgdG8gZGVzZWxlY3QgYWxsIHNlbGVjdGVkIHNoYXBlcy5cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0dXBNb3VzZXRyYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldHVwTW91c2V0cmFwKCkge1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAoKSAgID0+IHJlZ2lzdHJ5LmtleXMubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgKCkgICA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCksICdrZXlkb3duJyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhQXR0cmlidXRlOiAnZGF0YS1pZCcsXG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlUHJvdG90eXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGVQcm90b3R5cGUoKSB7XG4gICAgICAgIHJldHVybiBTaGFwZTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBDb25zdGFudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBEaXJlY3QgbGluayB0byBlbHVjaWRhdGluZyBjb21tb24gZXhjZXB0aW9uIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQGNvbnN0YW50IEVYQ0VQVElPTlNfVVJMXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBFWENFUFRJT05TX1VSTDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50L2Jsb2IvbWFzdGVyL0VYQ0VQVElPTlMubWQje3RpdGxlfSdcblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRGlzcGF0Y2hlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbj0oKSA9PiB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbmQobmFtZSwgcHJvcGVydGllcyA9IHt9LCBmbiA9IG51bGwpIHtcblxuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFja0ZuKHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZuKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gRXZlbnQgZGlzcGF0Y2hlcidzIHR3by13YXkgY29tbXVuaWNhdGlvbiB2aWEgZXZlbnRzLlxuICAgICAgICAgICAgICAgIGZuKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGlzdGVuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgbGlzdGVuKG5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0ucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB1bmxpc3RlbkFsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHVubGlzdGVuQWxsKCkge1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgQVRUUklCVVRFOiAnYXR0cmlidXRlJyxcbiAgICBBVFRSSUJVVEVfR0VUX0FMTDogJ2F0dHJpYnV0ZS1nZXQtYWxsJyxcbiAgICBBVFRSSUJVVEVfU0VUOiAnYXR0cmlidXRlLXNldCcsXG4gICAgUkVPUkRFUjogJ3Jlb3JkZXInLFxuICAgIFJFTU9WRTogJ3JlbW92ZScsXG4gICAgU0VMRUNUOiAnc2VsZWN0JyxcbiAgICBTRUxFQ1RfQUxMOiAnc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1RfQUxMOiAnZGVzZWxlY3QtYWxsJyxcbiAgICBERVNFTEVDVDogJ2Rlc2VsZWN0JyxcbiAgICBTRUxFQ1RBQkxFOiB7XG4gICAgICAgIFNFTEVDVDogJ3NlbGVjdGFibGUtc2VsZWN0JyxcbiAgICAgICAgREVTRUxFQ1Q6ICdzZWxlY3RhYmxlLWRlc2VsZWN0J1xuICAgIH1cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFRvXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7R3JvdXBzfVxuICAgICAqL1xuICAgIGFkZFRvKGVsZW1lbnQpIHtcblxuICAgICAgICB0aGlzLnNoYXBlcyAgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ3NoYXBlcycsIHRydWUpO1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ2hhbmRsZXMnLCB0cnVlKTtcblxuICAgICAgICAvLyBQcmV2ZW50IGNsaWNrcyBvbiB0aGUgZWxlbWVudHMgZnJvbSBsZWFraW5nIHRocm91Z2ggdG8gdGhlIFNWRyBsYXllci5cbiAgICAgICAgdGhpcy5zaGFwZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICB0aGlzLmhhbmRsZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEV2ZW50cyAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIHtcbiAgICAgICAgICAgICdpbnRlcmZhY2UnOiB0aGlzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICB5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3knLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcGFjaXR5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBvcGFjaXR5KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ29wYWNpdHknLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB6XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHoodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nVG9Gcm9udFxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgYnJpbmdUb0Zyb250KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgSW5maW5pdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFRvQmFja1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc2VuZFRvQmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIC1JbmZpbml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kQmFja3dhcmRzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzZW5kQmFja3dhcmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgKHRoaXMuZ2V0QXR0cigpLnogLSAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ0ZvcndhcmRzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBicmluZ0ZvcndhcmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgKHRoaXMuZ2V0QXR0cigpLnogKyAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgd2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignd2lkdGgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGhlaWdodCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdoZWlnaHQnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAgICogQHJldHVybiB7Knx2b2lkfVxuICAgICAqL1xuICAgIGF0dHIocHJvcGVydHksIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyKClbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1vZGVsICAgICAgID0ge307XG4gICAgICAgIG1vZGVsW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKG1vZGVsKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0clxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHIoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9TRVQsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHV0aWxpdHkua2ViYWJpZnlLZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHIoKSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwge30sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2U6ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2VdYDtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVnaXN0cnlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgd2hlbiBjZXJ0YWluIGtleXMgYXJlIHByZXNzZWQgZG93biwgd2hpY2ggd2lsbCBkZXRlcm1pbmUgdGhlXG4gICAgICogc3RyYXRlZ3kgYXQgcnVudGltZSBmb3IgY2VydGFpbiBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkga2V5c1xuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5czoge1xuICAgICAgICBtdWx0aVNlbGVjdDogZmFsc2VcbiAgICB9XG5cbn0iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBVdGlsaXR5XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtleGNlcHRpb25zVGl0bGU9JyddXG4gICAgICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aHJvd0V4Y2VwdGlvbjogKG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSA9ICcnKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChleGNlcHRpb25zVGl0bGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluayA9IENvbnN0YW50cy5FWENFUFRJT05TX1VSTC5yZXBsYWNlKC97KC4rPyl9L2ksICgpID0+IF8ua2ViYWJDYXNlKGV4Y2VwdGlvbnNUaXRsZSkpO1xuICAgICAgICAgICAgICAgIHRocm93IGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uIFNlZTogJHtsaW5rfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IGBCbHVlcHJpbnQuanM6ICR7bWVzc2FnZX0uYDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGFzc2VydFxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFzc2VydGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXhjZXB0aW9uc1RpdGxlXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBhc3NlcnQoYXNzZXJ0aW9uLCBtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUpIHtcblxuICAgICAgICAgICAgaWYgKCFhc3NlcnRpb24pIHtcbiAgICAgICAgICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0cmFuc2Zvcm1BdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRyYW5zZm9ybUF0dHJpYnV0ZXM6IChhdHRyaWJ1dGVzKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnRyYW5zZm9ybSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gYXR0cmlidXRlcy50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKS9pKSxcbiAgICAgICAgICAgICAgICAgICAgeCAgICAgPSBwYXJzZUludChtYXRjaFsxXSksXG4gICAgICAgICAgICAgICAgICAgIHkgICAgID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgeSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybSh4LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueCkgJiYgIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgdXNpbmcgdGhlIGB0cmFuc2Zvcm06IHRyYW5zbGF0ZSh4LCB5KWAgZm9ybWF0IGluc3RlYWQuXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy54O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXM7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCByZXRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpIHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueCA9IHBhcnNlSW50KG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnkgPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMudHJhbnNmb3JtO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LmNhbWVsaWZ5S2V5cyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHBvaW50c1RvVHJhbnNmb3JtXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHBvaW50c1RvVHJhbnNmb3JtKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCAke3l9KWAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBrZWJhYmlmeUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGtlYmFiaWZ5S2V5cyhtb2RlbCkge1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtZWRNb2RlbCA9IHt9O1xuXG4gICAgICAgICAgICBfLmZvckluKG1vZGVsLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTW9kZWxbXy5rZWJhYkNhc2Uoa2V5KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGNhbWVsaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgY2FtZWxpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmNhbWVsQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudE5hbWVcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIGVsZW1lbnROYW1lKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbW9kZWwudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGVsZW1lbnRSZWZlcmVuY2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudFJlZmVyZW5jZShtb2RlbCkge1xuXG4gICAgICAgICAgICBpZiAobW9kZWwubm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG1vZGVsKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCB1dGlsaXR5OyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgWkluZGV4XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWkluZGV4IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBncm91cFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3VwcywgZ3JvdXApIHtcblxuICAgICAgICB2YXIgek1heCA9IGdyb3Vwcy5zaXplKCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBtYXhpbXVtIFogaXMgYWJvdmUgemVybyBhbmQgYmVsb3cgdGhlIG1heGltdW0uXG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPiB6TWF4KSB7IGdyb3VwLmRhdHVtKCkueiA9IHpNYXg7IH1cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuXG4gICAgICAgIHZhciB6VGFyZ2V0ID0gZ3JvdXAuZGF0dW0oKS56LCB6Q3VycmVudCA9IDE7XG5cbiAgICAgICAgLy8gSW5pdGlhbCBzb3J0IGludG8gei1pbmRleCBvcmRlci5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICAgICAgXy5mb3JFYWNoKGdyb3Vwc1swXSwgKG1vZGVsKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEN1cnJlbnQgZ3JvdXAgaXMgaW1tdXRhYmxlIGluIHRoaXMgaXRlcmF0aW9uLlxuICAgICAgICAgICAgaWYgKG1vZGVsID09PSBncm91cC5ub2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNraXAgdGhlIHRhcmdldCBaIGluZGV4LlxuICAgICAgICAgICAgaWYgKHpDdXJyZW50ID09PSB6VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgekN1cnJlbnQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNoYXBlID0gZDMuc2VsZWN0KG1vZGVsKSxcbiAgICAgICAgICAgICAgICBkYXR1bSA9IHNoYXBlLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXR1bS56ID0gekN1cnJlbnQrKztcbiAgICAgICAgICAgIHNoYXBlLmRhdHVtKGRhdHVtKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGaW5hbCBzb3J0IHBhc3MuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBGZWF0dXJlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge0ZlYXR1cmV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG59IiwiaW1wb3J0IEludGVyZmFjZSAgZnJvbSAnLi8uLi9oZWxwZXJzL0ludGVyZmFjZS5qcyc7XG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuLy4uL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gRmVhdHVyZXMuXG5pbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL2ZlYXR1cmVzL1NlbGVjdGFibGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbGFiZWw9JyddXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmdyb3VwID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xuICAgICAgICB0aGlzLmludGVyZmFjZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRHcm91cFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBncm91cFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0R3JvdXAoZ3JvdXApIHtcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1RfQUxMLCAgICgpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnc2VsZWN0JykpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5ERVNFTEVDVF9BTEwsICgpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnZGVzZWxlY3QnKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyeUludm9rZU9uRWFjaEZlYXR1cmVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kTmFtZVxuICAgICAqL1xuICAgIHRyeUludm9rZU9uRWFjaEZlYXR1cmUobWV0aG9kTmFtZSkge1xuXG4gICAgICAgIF8uZm9ySW4odGhpcy5mZWF0dXJlcywgKGZlYXR1cmUpID0+IHtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmZWF0dXJlW21ldGhvZE5hbWVdKSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmVbbWV0aG9kTmFtZV0oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0T3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgYmUgb3ZlcndyaXR0ZW4gZm9yIHNoYXBlIHR5cGVzIHRoYXQgaGF2ZSBhIGRpZmZlcmVudCBuYW1lIHRvIHRoZWlyIFNWRyB0YWcgbmFtZSwgc3VjaCBhcyBhIGBmb3JlaWduT2JqZWN0YFxuICAgICAqIGVsZW1lbnQgdXNpbmcgdGhlIGByZWN0YCBzaGFwZSBuYW1lLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXROYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKGBTaGFwZTwke3RoaXMubGFiZWx9PiBtdXN0IGRlZmluZSBhIFxcYGdldFRhZ1xcYCBtZXRob2RgKTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGdldEludGVyZmFjZSgpIHtcblxuICAgICAgICBpZiAodGhpcy5pbnRlcmZhY2UgPT09IG51bGwpIHtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBuZXcgSW50ZXJmYWNlKHRoaXMubGFiZWwpO1xuICAgICAgICAgICAgdmFyIGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2Uuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGdldEF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGdldEF0dHJpYnV0ZXMgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB2YXIgekluZGV4ID0geyB6OiBkMy5zZWxlY3QodGhpcy5lbGVtZW50Lm5vZGUoKS5wYXJlbnROb2RlKS5kYXR1bSgpLnogfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwgID0gXy5hc3NpZ24odGhpcy5lbGVtZW50LmRhdHVtKCksIHpJbmRleCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkucmV0cmFuc2Zvcm1BdHRyaWJ1dGVzKG1vZGVsKTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuZXJzIHRoYXQgaG9vayB1cCB0aGUgaW50ZXJmYWNlIGFuZCB0aGUgc2hhcGUgb2JqZWN0LlxuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCAgICAgICAgZ2V0QXR0cmlidXRlcyk7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVNT1ZFLCAobW9kZWwpICAgICAgICA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCBtb2RlbCkpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkFUVFJJQlVURV9TRVQsIChtb2RlbCkgPT4geyB0aGlzLnNldEF0dHJpYnV0ZXMobW9kZWwuYXR0cmlidXRlcyk7IH0pO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkTWV0aG9kcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IF8uYXNzaWduKHRoaXMuaW50ZXJmYWNlLCB0aGlzLmFkZE1ldGhvZHMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIsIHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEZlYXR1cmVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRGZWF0dXJlcygpIHtcblxuICAgICAgICB2YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKHRoaXMpLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcilcbiAgICAgICAgfTtcblxuICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUQUJMRS5ERVNFTEVDVCwgKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMLCBtb2RlbCk7XG4gICAgICAgICAgICB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ2Rlc2VsZWN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1RBQkxFLlNFTEVDVCwgKG1vZGVsKSAgID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1QsIG1vZGVsKTtcbiAgICAgICAgICAgIHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnc2VsZWN0Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICB2YXIgdGFnID0gdGhpcy5nZXRUYWcoKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuZ2V0VGFnKCkuc2xpY2UoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ306ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ31dYDtcblxuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuaW1wb3J0IEV2ZW50cyAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2VsZWN0YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHNoYXBlLmVsZW1lbnQub24oJ21vdXNlZG93bicsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFyZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb2YgdGhlIHNoYXBlcyBpbmNsdWRpbmcgdGhlIGN1cnJlbnQgb25lLCBhcyB0aGlzIGtlZXBzIHRoZSBsb2dpYyBzaW1wbGVyLiBXZSB3aWxsXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdGhlIGN1cnJlbnQgc2hhcGUgdG8gYmUgc2VsZWN0ZWQgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5ERVNFTEVDVCwge1xuICAgICAgICAgICAgICAgICAgICBzaGFwZTogc2hhcGUuZ2V0SW50ZXJmYWNlKClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUQUJMRS5TRUxFQ1QsIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcGU6IHNoYXBlLmdldEludGVyZmFjZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5vcGFjaXR5KDAuNSk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3QoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkub3BhY2l0eSgxKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWwgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi8uLi9TaGFwZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkQXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4geyBmaWxsOiAncmVkJywgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDEwMCwgeTogMjAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZE1ldGhvZHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkTWV0aG9kcygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlsbDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
