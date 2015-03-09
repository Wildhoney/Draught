(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var Events = _interopRequire(require("./helpers/Events.js"));

var ZIndex = _interopRequire(require("./helpers/ZIndex.js"));

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

        // Add the event listeners.
        this.addEventListeners();
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

                this.dispatcher.listen(Events.REORDER, function (event) {
                    var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");
                    _this.zIndex.reorder(groups, event.group);
                });

                this.dispatcher.listen(Events.REMOVE, function (event) {
                    return _this.remove(event["interface"]);
                });

                // When the user clicks on the SVG layer that isn't a part of the shape group, then we'll emit
                // the `Events.DESELECT` event to deselect all selected shapes.
                this.element.on("click", function () {
                    return _this.dispatcher.send(Events.DESELECT);
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

},{"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Utility.js":7,"./helpers/ZIndex.js":8,"./shapes/Shape.js":10,"./shapes/types/Rectangle.js":12}],2:[function(require,module,exports){
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
    DESELECT: "deselect"
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
        bringToFront: {

            /**
             * @method bringToFront
             * @return {*}
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
             * @return {*}
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
             * @return {*}
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
             * @return {*}
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

},{"./../helpers/Events.js":4,"./../helpers/Utility.js":7}],7:[function(require,module,exports){
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

            if (model instanceof HTMLElement) {
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

},{}],9:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Feature
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Feature =

/**
 * @method element
 * @param {Shape} shape
 * @return {Feature}
 */
function Feature(shape) {
  _classCallCheck(this, Feature);

  this.shape = shape;
};

module.exports = Feature;

},{}],10:[function(require,module,exports){
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

                this.dispatcher.listen(Events.DESELECT, function () {
                    return _this.tryInvokeOnEachFeature("cancel");
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

                this.features = {
                    selectable: new Selectable(this)
                };
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

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Interface.js":6,"./../helpers/Utility.js":7,"./features/Selectable.js":11}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

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

        shape.element.on("click", function () {
            _this.original = shape.getInterface().fill();
            shape.getInterface().fill("red");
        });
    }

    _inherits(Selectable, Feature);

    _prototypeProperties(Selectable, null, {
        cancel: {

            /**
             * @method cancel
             * @return {void}
             */

            value: function cancel() {
                this.shape.getInterface().fill(this.original);
            },
            writable: true,
            configurable: true
        }
    });

    return Selectable;
})(Feature);

module.exports = Selectable;

},{"./../Feature.js":9}],12:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0ludGVyZmFjZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvVXRpbGl0eS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvWkluZGV4LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL0ZlYXR1cmUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvZmVhdHVyZXMvU2VsZWN0YWJsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FPLFVB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LCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgWkluZGV4ICAgICBmcm9tICcuL2hlbHBlcnMvWkluZGV4LmpzJztcbmltcG9ydCB1dGlsaXR5ICAgIGZyb20gJy4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLy8gU2hhcGVzLlxuaW1wb3J0IFNoYXBlICAgICAgZnJvbSAnLi9zaGFwZXMvU2hhcGUuanMnO1xuaW1wb3J0IFJlY3RhbmdsZSAgZnJvbSAnLi9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmNsYXNzIEJsdWVwcmludCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fFN0cmluZ30gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9IF8uYXNzaWduKHRoaXMuZGVmYXVsdE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWxlbWVudCAgICA9IGQzLnNlbGVjdCh1dGlsaXR5LmVsZW1lbnRSZWZlcmVuY2UoZWxlbWVudCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy5vcHRpb25zLmRvY3VtZW50V2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudEhlaWdodCk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ICAgICAgPSAxO1xuXG4gICAgICAgIC8vIEhlbHBlcnMgcmVxdWlyZWQgYnkgQmx1ZXByaW50IGFuZCB0aGUgcmVzdCBvZiB0aGUgc3lzdGVtLlxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLnpJbmRleCAgICAgPSBuZXcgWkluZGV4KCk7XG4gICAgICAgIHRoaXMuZ3JvdXBzICAgICA9IG5ldyBHcm91cHMoKS5hZGRUbyh0aGlzLmVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFJlZ2lzdGVyIG91ciBkZWZhdWx0IGNvbXBvbmVudHMuXG4gICAgICAgIHRoaXMubWFwID0ge1xuICAgICAgICAgICAgcmVjdDogUmVjdGFuZ2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQWRkIHRoZSBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICB2YXIgc2hhcGUgICA9IHRoaXMuaW5zdGFudGlhdGUodXRpbGl0eS5lbGVtZW50TmFtZShuYW1lKSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKSxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5pbmRleCAtIDEgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIHNoYXBlLnNldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgc2hhcGUuc2V0QXR0cmlidXRlcyhfLmFzc2lnbih6SW5kZXgsIHNoYXBlLmdldEF0dHJpYnV0ZXMoKSkpO1xuXG4gICAgICAgIC8vIExhc3QgY2hhbmNlIHRvIGRlZmluZSBhbnkgZnVydGhlciBlbGVtZW50cyBmb3IgdGhlIGdyb3VwLCBhbmQgdGhlIGFwcGxpY2F0aW9uIG9mIHRoZVxuICAgICAgICAvLyBmZWF0dXJlcyB3aGljaCBhIHNoYXBlIHNob3VsZCBoYXZlLCBzdWNoIGFzIGJlaW5nIGRyYWdnYWJsZSwgc2VsZWN0YWJsZSwgcmVzaXplYWJsZSwgZXRjLi4uXG4gICAgICAgIHNoYXBlLmFkZEVsZW1lbnRzKCk7XG4gICAgICAgIHNoYXBlLmFkZEZlYXR1cmVzKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFwcGluZyBmcm9tIHRoZSBhY3R1YWwgc2hhcGUgb2JqZWN0LCB0byB0aGUgaW50ZXJmYWNlIG9iamVjdCB0aGF0IHRoZSBkZXZlbG9wZXJcbiAgICAgICAgLy8gaW50ZXJhY3RzIHdpdGguXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goeyBzaGFwZTogc2hhcGUsIGludGVyZmFjZTogc2hhcGUuZ2V0SW50ZXJmYWNlKCl9KTtcbiAgICAgICAgcmV0dXJuIHNoYXBlLmdldEludGVyZmFjZSgpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0ge0ludGVyZmFjZX0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICByZW1vdmUobW9kZWwpIHtcblxuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgaXRlbSAgPSBfLmZpbmQodGhpcy5zaGFwZXMsIChzaGFwZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoc2hhcGUuaW50ZXJmYWNlID09PSBtb2RlbCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge1NoYXBlW119XG4gICAgICovXG4gICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZXMubWFwKChtb2RlbCkgPT4gbW9kZWwuaW50ZXJmYWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpZGVudFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBpZGVudCgpIHtcbiAgICAgICAgcmV0dXJuIFsnQlAnLCB0aGlzLmluZGV4KytdLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3ZlcndyaXRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXIobmFtZSwgc2hhcGUsIG92ZXJ3cml0ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBzaGFwZSBpcyBhIHZhbGlkIGluc3RhbmNlLlxuICAgICAgICB1dGlsaXR5LmFzc2VydChPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc2hhcGUpID09PSBTaGFwZSwgJ0N1c3RvbSBzaGFwZSBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBTaGFwZWAnLCAnSW5zdGFuY2Ugb2YgU2hhcGUnKTtcblxuICAgICAgICBpZiAoIW92ZXJ3cml0ZSAmJiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuXG4gICAgICAgICAgICAvLyBFeGlzdGluZyBzaGFwZXMgY2Fubm90IGJlIG92ZXJ3cml0dGVuLlxuICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgUmVmdXNpbmcgdG8gb3ZlcndyaXRlIGV4aXN0aW5nICR7bmFtZX0gc2hhcGUgd2l0aG91dCBleHBsaWNpdCBvdmVyd3JpdGVgLCAnT3ZlcndyaXRpbmcgRXhpc3RpbmcgU2hhcGVzJyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGluc3RhbnRpYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBpbnN0YW50aWF0ZShuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSh0aGlzLmlkZW50KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRXZlbnRMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFT1JERVIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IHRoaXMuZWxlbWVudC5zZWxlY3RBbGwoYGdbJHt0aGlzLm9wdGlvbnMuZGF0YUF0dHJpYnV0ZX1dYCk7XG4gICAgICAgICAgICB0aGlzLnpJbmRleC5yZW9yZGVyKGdyb3VwcywgZXZlbnQuZ3JvdXApO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChldmVudCkgPT4gdGhpcy5yZW1vdmUoZXZlbnQuaW50ZXJmYWNlKSk7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIFNWRyBsYXllciB0aGF0IGlzbid0IGEgcGFydCBvZiB0aGUgc2hhcGUgZ3JvdXAsIHRoZW4gd2UnbGwgZW1pdFxuICAgICAgICAvLyB0aGUgYEV2ZW50cy5ERVNFTEVDVGAgZXZlbnQgdG8gZGVzZWxlY3QgYWxsIHNlbGVjdGVkIHNoYXBlcy5cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVCkpXG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhQXR0cmlidXRlOiAnZGF0YS1pZCcsXG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlUHJvdG90eXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGVQcm90b3R5cGUoKSB7XG4gICAgICAgIHJldHVybiBTaGFwZTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBDb25zdGFudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RhbnQgUkVHSVNUUllcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIFJFR0lTVFJZOiB7XG4gICAgICAgIFpJTkRFWF9NSU46ICd6LWluZGV4LW1pbicsXG4gICAgICAgIFpJTkRFWF9NQVg6ICd6LWluZGV4LW1heCdcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGlyZWN0IGxpbmsgdG8gZWx1Y2lkYXRpbmcgY29tbW9uIGV4Y2VwdGlvbiBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEBjb25zdGFudCBFWENFUFRJT05TX1VSTFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgRVhDRVBUSU9OU19VUkw6ICdodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludC9ibG9iL21hc3Rlci9FWENFUFRJT05TLm1kI3t0aXRsZX0nXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdW5saXN0ZW5BbGxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB1bmxpc3RlbkFsbCgpIHtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIERFU0VMRUNUOiAnZGVzZWxlY3QnXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBHcm91cHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRUb1xuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0dyb3Vwc31cbiAgICAgKi9cbiAgICBhZGRUbyhlbGVtZW50KSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGVsZW1lbnRzIGZyb20gbGVha2luZyB0aHJvdWdoIHRvIHRoZSBTVkcgbGF5ZXIuXG4gICAgICAgIHRoaXMuc2hhcGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxufSIsImltcG9ydCBFdmVudHMgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgb2JqZWN0XG4gKiBAc3VibW9kdWxlIEludGVyZmFjZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVNT1ZFLCB7XG4gICAgICAgICAgICAnaW50ZXJmYWNlJzogdGhpc1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB4KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHkodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneScsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdUb0Zyb250XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBicmluZ1RvRnJvbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCBJbmZpbml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBzZW5kVG9CYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgLUluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHNlbmRCYWNrd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiAtIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGJyaW5nRm9yd2FyZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAodGhpcy5nZXRBdHRyKCkueiArIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3dpZHRoJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGhlaWdodCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdoZWlnaHQnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAgICogQHJldHVybiB7Knx2b2lkfVxuICAgICAqL1xuICAgIGF0dHIocHJvcGVydHksIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyKClbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1vZGVsICAgICAgID0ge307XG4gICAgICAgIG1vZGVsW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKG1vZGVsKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0clxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHIoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9TRVQsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHV0aWxpdHkua2ViYWJpZnlLZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHIoKSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwge30sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2U6ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2VdYDtcblxuICAgIH1cblxufSIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFV0aWxpdHlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG52YXIgdXRpbGl0eSA9IChmdW5jdGlvbigpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0aHJvd0V4Y2VwdGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2V4Y2VwdGlvbnNUaXRsZT0nJ11cbiAgICAgICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKGV4Y2VwdGlvbnNUaXRsZSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rID0gQ29uc3RhbnRzLkVYQ0VQVElPTlNfVVJMLnJlcGxhY2UoL3soLis/KX0vaSwgKCkgPT4gXy5rZWJhYkNhc2UoZXhjZXB0aW9uc1RpdGxlKSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYXNzZXJ0XG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNzZXJ0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBleGNlcHRpb25zVGl0bGVcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGFzc2VydChhc3NlcnRpb24sIG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSkge1xuXG4gICAgICAgICAgICBpZiAoIWFzc2VydGlvbikge1xuICAgICAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24obWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50TmFtZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudE5hbWUobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudFJlZmVyZW5jZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50UmVmZXJlbmNlKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihtb2RlbCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFpJbmRleFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpJbmRleCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlb3JkZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBncm91cHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVvcmRlcihncm91cHMsIGdyb3VwKSB7XG5cbiAgICAgICAgdmFyIHpNYXggPSBncm91cHMuc2l6ZSgpO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgbWF4aW11bSBaIGlzIGFib3ZlIHplcm8gYW5kIGJlbG93IHRoZSBtYXhpbXVtLlxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPCAxKSAgICB7IGdyb3VwLmRhdHVtKCkueiA9IDE7ICAgIH1cblxuICAgICAgICB2YXIgelRhcmdldCA9IGdyb3VwLmRhdHVtKCkueiwgekN1cnJlbnQgPSAxO1xuXG4gICAgICAgIC8vIEluaXRpYWwgc29ydCBpbnRvIHotaW5kZXggb3JkZXIuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgICAgIF8uZm9yRWFjaChncm91cHNbMF0sIChtb2RlbCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBDdXJyZW50IGdyb3VwIGlzIGltbXV0YWJsZSBpbiB0aGlzIGl0ZXJhdGlvbi5cbiAgICAgICAgICAgIGlmIChtb2RlbCA9PT0gZ3JvdXAubm9kZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTa2lwIHRoZSB0YXJnZXQgWiBpbmRleC5cbiAgICAgICAgICAgIGlmICh6Q3VycmVudCA9PT0gelRhcmdldCkge1xuICAgICAgICAgICAgICAgIHpDdXJyZW50Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzaGFwZSA9IGQzLnNlbGVjdChtb2RlbCksXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBzaGFwZS5kYXR1bSgpO1xuICAgICAgICAgICAgZGF0dW0ueiA9IHpDdXJyZW50Kys7XG4gICAgICAgICAgICBzaGFwZS5kYXR1bShkYXR1bSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRmluYWwgc29ydCBwYXNzLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRmVhdHVyZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZlYXR1cmUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtGZWF0dXJlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgSW50ZXJmYWNlICBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vLi4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBGZWF0dXJlcy5cbmltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4vZmVhdHVyZXMvU2VsZWN0YWJsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEdyb3VwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRHcm91cChncm91cCkge1xuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkRFU0VMRUNULCAoKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ2NhbmNlbCcpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdHJ5SW52b2tlT25FYWNoRmVhdHVyZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2ROYW1lXG4gICAgICovXG4gICAgdHJ5SW52b2tlT25FYWNoRmVhdHVyZShtZXRob2ROYW1lKSB7XG5cbiAgICAgICAgXy5mb3JJbih0aGlzLmZlYXR1cmVzLCAoZmVhdHVyZSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZlYXR1cmVbbWV0aG9kTmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgZmVhdHVyZVttZXRob2ROYW1lXSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3VsZCBiZSBvdmVyd3JpdHRlbiBmb3Igc2hhcGUgdHlwZXMgdGhhdCBoYXZlIGEgZGlmZmVyZW50IG5hbWUgdG8gdGhlaXIgU1ZHIHRhZyBuYW1lLCBzdWNoIGFzIGEgYGZvcmVpZ25PYmplY3RgXG4gICAgICogZWxlbWVudCB1c2luZyB0aGUgYHJlY3RgIHNoYXBlIG5hbWUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFnKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAdGhyb3dzIEV4Y2VwdGlvblxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24oYFNoYXBlPCR7dGhpcy5sYWJlbH0+IG11c3QgZGVmaW5lIGEgXFxgZ2V0VGFnXFxgIG1ldGhvZGApO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnRlcmZhY2VcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZ2V0SW50ZXJmYWNlKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmludGVyZmFjZSA9PT0gbnVsbCkge1xuXG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IG5ldyBJbnRlcmZhY2UodGhpcy5sYWJlbCk7XG4gICAgICAgICAgICB2YXIgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgICAgICB0aGlzLmludGVyZmFjZS5zZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZ2V0QXR0cmlidXRlc1xuICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2YXIgZ2V0QXR0cmlidXRlcyA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIHZhciB6SW5kZXggPSB7IHo6IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpLmRhdHVtKCkueiB9LFxuICAgICAgICAgICAgICAgICAgICBtb2RlbCAgPSBfLmFzc2lnbih0aGlzLmVsZW1lbnQuZGF0dW0oKSwgekluZGV4KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5yZXRyYW5zZm9ybUF0dHJpYnV0ZXMobW9kZWwpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW5lcnMgdGhhdCBob29rIHVwIHRoZSBpbnRlcmZhY2UgYW5kIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVNT1ZFLCAobW9kZWwpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIG1vZGVsKSk7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX0dFVF9BTEwsIGdldEF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkFUVFJJQlVURV9TRVQsIChtb2RlbCkgPT4geyB0aGlzLnNldEF0dHJpYnV0ZXMobW9kZWwuYXR0cmlidXRlcyk7IH0pO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkTWV0aG9kcykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVyZmFjZSA9IF8uYXNzaWduKHRoaXMuaW50ZXJmYWNlLCB0aGlzLmFkZE1ldGhvZHMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVyZmFjZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIsIHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEZlYXR1cmVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRGZWF0dXJlcygpIHtcblxuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUodGhpcylcbiAgICAgICAgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzID0ge31cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpc3BhdGNoQXR0cmlidXRlRXZlbnQocHJvcGVydGllcyA9IHt9KSB7XG4gICAgICAgIHByb3BlcnRpZXMuZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgdmFyIHRhZyA9IHRoaXMuZ2V0VGFnKCkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmdldFRhZygpLnNsaWNlKDEpO1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9OiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgJHt0YWd9XWA7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRmVhdHVyZSBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NlbGVjdGFibGV9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICBzdXBlci5jb25zdHJ1Y3RvcihzaGFwZSk7XG5cbiAgICAgICAgc2hhcGUuZWxlbWVudC5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsID0gc2hhcGUuZ2V0SW50ZXJmYWNlKCkuZmlsbCgpO1xuICAgICAgICAgICAgc2hhcGUuZ2V0SW50ZXJmYWNlKCkuZmlsbCgncmVkJyk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjYW5jZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5maWxsKHRoaXMub3JpZ2luYWwpO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuLy4uL1NoYXBlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkTWV0aG9kc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRNZXRob2RzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiAodmFsdWUpID0+IHRoaXMuc2V0QXR0cmlidXRlcyh7IGZpbGw6IHZhbHVlIH0pXG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
