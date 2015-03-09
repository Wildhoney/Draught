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
        setupMousetrap: {

            /**
             * @method setupMousetrap
             * @return {void}
             */

            value: function setupMousetrap() {

                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = true;
                }, "keydown");
                Mousetrap.bind("mod", function () {
                    return registry.keys.multiSelect = false;
                }, "keyup");
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

                this.dispatcher.listen(Events.DESELECT, function () {
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
                var _this = this;

                var dispatcher = new Dispatcher();

                this.features = {
                    selectable: new Selectable(this).setDispatcher(dispatcher)
                };

                dispatcher.listen(Events.SELECT, function () {
                    return _this.tryInvokeOnEachFeature("select");
                });
                dispatcher.listen(Events.DESELECT, function () {
                    return _this.dispatcher.send(Events.DESELECT);
                });
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

        shape.element.on("click", function () {

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                _this.dispatcher.send(Events.DESELECT);
            }

            if (!_this.selected) {
                _this.dispatcher.send(Events.SELECT);
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
                this.original = this.shape.getInterface().fill();
                this.shape.getInterface().fill("grey");
                this.selected = true;
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
                    this.shape.getInterface().fill(this.original);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0NvbnN0YW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9Hcm91cHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0ludGVyZmFjZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1pJbmRleC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL3NoYXBlcy9GZWF0dXJlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL1NoYXBlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvc2hhcGVzL2ZlYXR1cmVzL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMv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RztBQUNMLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7OztBQU1ELHFCQUFhOzs7Ozs7O21CQUFBLHlCQUFHO0FBQ1osdUJBQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNsRTs7OztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHOztBQUVULHVCQUFPO0FBQ0gsd0JBQUksRUFBRSxjQUFTLEtBQUssRUFBRTtBQUNsQiwrQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztxQkFDbkM7aUJBQ0osQ0FBQTthQUVKOzs7Ozs7V0E5QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IFpJbmRleCAgICAgZnJvbSAnLi9oZWxwZXJzL1pJbmRleC5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgU2hhcGUgICAgICBmcm9tICcuL3NoYXBlcy9TaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR8U3RyaW5nfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gXy5hc3NpZ24odGhpcy5kZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5lbGVtZW50ICAgID0gZDMuc2VsZWN0KHV0aWxpdHkuZWxlbWVudFJlZmVyZW5jZShlbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG5cbiAgICAgICAgLy8gSGVscGVycyByZXF1aXJlZCBieSBCbHVlcHJpbnQgYW5kIHRoZSByZXN0IG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMuekluZGV4ICAgICA9IG5ldyBaSW5kZXgoKTtcbiAgICAgICAgdGhpcy5ncm91cHMgICAgID0gbmV3IEdyb3VwcygpLmFkZFRvKHRoaXMuZWxlbWVudCk7XG5cbiAgICAgICAgLy8gUmVnaXN0ZXIgb3VyIGRlZmF1bHQgY29tcG9uZW50cy5cbiAgICAgICAgdGhpcy5tYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBZGQgdGhlIGV2ZW50IGxpc3RlbmVycywgYW5kIHNldHVwIE1vdXNldHJhcCB0byBsaXN0ZW4gZm9yIGtleWJvYXJkIGV2ZW50cy5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLnNldHVwTW91c2V0cmFwKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBuYW1lXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgdmFyIHNoYXBlICAgPSB0aGlzLmluc3RhbnRpYXRlKHV0aWxpdHkuZWxlbWVudE5hbWUobmFtZSkpLFxuICAgICAgICAgICAgZ3JvdXAgICA9IHRoaXMuZ3JvdXBzLnNoYXBlcy5hcHBlbmQoJ2cnKS5hdHRyKHRoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlLCBzaGFwZS5sYWJlbCksXG4gICAgICAgICAgICBlbGVtZW50ID0gZ3JvdXAuYXBwZW5kKHNoYXBlLmdldFRhZygpKSxcbiAgICAgICAgICAgIHpJbmRleCAgPSB7IHo6IHRoaXMuaW5kZXggLSAxIH07XG5cbiAgICAgICAgLy8gU2V0IGFsbCBvZiB0aGUgZXNzZW50aWFsIG9iamVjdHMgdGhhdCB0aGUgc2hhcGUgcmVxdWlyZXMuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRHcm91cChncm91cCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cCwgYW5kIHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gZmVhdHVyZXMgd2hpY2ggYSBzaGFwZSBzaG91bGQgaGF2ZSwgc3VjaCBhcyBiZWluZyBkcmFnZ2FibGUsIHNlbGVjdGFibGUsIHJlc2l6ZWFibGUsIGV0Yy4uLlxuICAgICAgICBzaGFwZS5hZGRFbGVtZW50cygpO1xuICAgICAgICBzaGFwZS5hZGRGZWF0dXJlcygpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgYWN0dWFsIHNoYXBlIG9iamVjdCwgdG8gdGhlIGludGVyZmFjZSBvYmplY3QgdGhhdCB0aGUgZGV2ZWxvcGVyXG4gICAgICAgIC8vIGludGVyYWN0cyB3aXRoLlxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKHsgc2hhcGU6IHNoYXBlLCBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpfSk7XG4gICAgICAgIHJldHVybiBzaGFwZS5nZXRJbnRlcmZhY2UoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtJbnRlcmZhY2V9IG1vZGVsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGl0ZW0gID0gXy5maW5kKHRoaXMuc2hhcGVzLCAoc2hhcGUsIGkpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFwZS5pbnRlcmZhY2UgPT09IG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5tYXAoKG1vZGVsKSA9PiBtb2RlbC5pbnRlcmZhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5zaGFwZXMsIChzaGFwZSkgPT4gdGhpcy5yZW1vdmUoc2hhcGUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlkZW50XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGlkZW50KCkge1xuICAgICAgICByZXR1cm4gWydCUCcsIHRoaXMuaW5kZXgrK10uam9pbignJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWdpc3RlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvdmVyd3JpdGU9ZmFsc2VdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWdpc3RlcihuYW1lLCBzaGFwZSwgb3ZlcndyaXRlID0gZmFsc2UpIHtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIHNoYXBlIGlzIGEgdmFsaWQgaW5zdGFuY2UuXG4gICAgICAgIHV0aWxpdHkuYXNzZXJ0KE9iamVjdC5nZXRQcm90b3R5cGVPZihzaGFwZSkgPT09IFNoYXBlLCAnQ3VzdG9tIHNoYXBlIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFNoYXBlYCcsICdJbnN0YW5jZSBvZiBTaGFwZScpO1xuXG4gICAgICAgIGlmICghb3ZlcndyaXRlICYmIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG5cbiAgICAgICAgICAgIC8vIEV4aXN0aW5nIHNoYXBlcyBjYW5ub3QgYmUgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICB1dGlsaXR5LnRocm93RXhjZXB0aW9uKGBSZWZ1c2luZyB0byBvdmVyd3JpdGUgZXhpc3RpbmcgJHtuYW1lfSBzaGFwZSB3aXRob3V0IGV4cGxpY2l0IG92ZXJ3cml0ZWAsICdPdmVyd3JpdGluZyBFeGlzdGluZyBTaGFwZXMnKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXBbbmFtZV0gPSBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zdGFudGlhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGluc3RhbnRpYXRlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKHRoaXMuaWRlbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnMoKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB2YXIgZ3JvdXBzID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHRoaXMuekluZGV4LnJlb3JkZXIoZ3JvdXBzLCBldmVudC5ncm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKGV2ZW50KSA9PiB0aGlzLnJlbW92ZShldmVudC5pbnRlcmZhY2UpKTtcblxuICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGUgU1ZHIGxheWVyIHRoYXQgaXNuJ3QgYSBwYXJ0IG9mIHRoZSBzaGFwZSBncm91cCwgdGhlbiB3ZSdsbCBlbWl0XG4gICAgICAgIC8vIHRoZSBgRXZlbnRzLkRFU0VMRUNUYCBldmVudCB0byBkZXNlbGVjdCBhbGwgc2VsZWN0ZWQgc2hhcGVzLlxuICAgICAgICB0aGlzLmVsZW1lbnQub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUKSlcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0dXBNb3VzZXRyYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldHVwTW91c2V0cmFwKCkge1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gdHJ1ZSwgICdrZXlkb3duJyk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YUF0dHJpYnV0ZTogJ2RhdGEtaWQnLFxuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJ1xuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogRGlyZWN0IGxpbmsgdG8gZWx1Y2lkYXRpbmcgY29tbW9uIGV4Y2VwdGlvbiBtZXNzYWdlcy5cbiAgICAgKlxuICAgICAqIEBjb25zdGFudCBFWENFUFRJT05TX1VSTFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgRVhDRVBUSU9OU19VUkw6ICdodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludC9ibG9iL21hc3Rlci9FWENFUFRJT05TLm1kI3t0aXRsZX0nXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllcz17fV1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49KCkgPT4ge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKG5hbWUsIHByb3BlcnRpZXMgPSB7fSwgZm4gPSBudWxsKSB7XG5cbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4ge1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcblxuICAgICAgICAgICAgICAgIC8vIEV2ZW50IGRpc3BhdGNoZXIncyB0d28td2F5IGNvbW11bmljYXRpb24gdmlhIGV2ZW50cy5cbiAgICAgICAgICAgICAgICBmbihyZXN1bHQpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGxpc3RlbihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdW5saXN0ZW5BbGxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB1bmxpc3RlbkFsbCgpIHtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIFNFTEVDVDogJ3NlbGVjdCcsXG4gICAgREVTRUxFQ1Q6ICdkZXNlbGVjdCdcbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFRvXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7R3JvdXBzfVxuICAgICAqL1xuICAgIGFkZFRvKGVsZW1lbnQpIHtcblxuICAgICAgICB0aGlzLnNoYXBlcyAgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ3NoYXBlcycsIHRydWUpO1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ2hhbmRsZXMnLCB0cnVlKTtcblxuICAgICAgICAvLyBQcmV2ZW50IGNsaWNrcyBvbiB0aGUgZWxlbWVudHMgZnJvbSBsZWFraW5nIHRocm91Z2ggdG8gdGhlIFNWRyBsYXllci5cbiAgICAgICAgdGhpcy5zaGFwZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuICAgICAgICB0aGlzLmhhbmRsZXMub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEV2ZW50cyAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIHtcbiAgICAgICAgICAgICdpbnRlcmZhY2UnOiB0aGlzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgeSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICB6KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGJyaW5nVG9Gcm9udCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIEluZmluaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRUb0JhY2tcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3onLCAtSW5maW5pdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZEJhY2t3YXJkc1xuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56IC0gMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdGb3J3YXJkc1xuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsICh0aGlzLmdldEF0dHIoKS56ICsgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgd2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignd2lkdGgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgaGVpZ2h0KHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2hlaWdodCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHsqfHZvaWR9XG4gICAgICovXG4gICAgYXR0cihwcm9wZXJ0eSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbW9kZWwgICAgICAgPSB7fTtcbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIobW9kZWwpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgc2V0QXR0cihhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuQVRUUklCVVRFX1NFVCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdXRpbGl0eS5rZWJhYmlmeUtleXMoYXR0cmlidXRlcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cigpIHtcblxuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9HRVRfQUxMLCB7fSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0IEludGVyZmFjZV1gO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWdpc3RyeVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIC8qKlxuICAgICAqIFJlc3BvbnNpYmxlIGZvciBkZXRlcm1pbmluZyB3aGVuIGNlcnRhaW4ga2V5cyBhcmUgcHJlc3NlZCBkb3duLCB3aGljaCB3aWxsIGRldGVybWluZSB0aGVcbiAgICAgKiBzdHJhdGVneSBhdCBydW50aW1lIGZvciBjZXJ0YWluIGZ1bmN0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwcm9wZXJ0eSBrZXlzXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBrZXlzOiB7XG4gICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZVxuICAgIH1cblxufSIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFV0aWxpdHlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG52YXIgdXRpbGl0eSA9IChmdW5jdGlvbigpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0aHJvd0V4Y2VwdGlvblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2V4Y2VwdGlvbnNUaXRsZT0nJ11cbiAgICAgICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKGV4Y2VwdGlvbnNUaXRsZSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rID0gQ29uc3RhbnRzLkVYQ0VQVElPTlNfVVJMLnJlcGxhY2UoL3soLis/KX0vaSwgKCkgPT4gXy5rZWJhYkNhc2UoZXhjZXB0aW9uc1RpdGxlKSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgYXNzZXJ0XG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNzZXJ0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBleGNlcHRpb25zVGl0bGVcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGFzc2VydChhc3NlcnRpb24sIG1lc3NhZ2UsIGV4Y2VwdGlvbnNUaXRsZSkge1xuXG4gICAgICAgICAgICBpZiAoIWFzc2VydGlvbikge1xuICAgICAgICAgICAgICAgIHV0aWxpdHkudGhyb3dFeGNlcHRpb24obWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdHJhbnNmb3JtQXR0cmlidXRlczogKGF0dHJpYnV0ZXMpID0+IHtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMudHJhbnNmb3JtKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBhdHRyaWJ1dGVzLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspXFxzKixcXHMqKFxcZCspL2kpLFxuICAgICAgICAgICAgICAgICAgICB4ICAgICA9IHBhcnNlSW50KG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgeSAgICAgPSBwYXJzZUludChtYXRjaFsyXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiBfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCB5KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKHgsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy54KSAmJiAhXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSB1c2luZyB0aGUgYHRyYW5zZm9ybTogdHJhbnNsYXRlKHgsIHkpYCBmb3JtYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIGF0dHJpYnV0ZXMueSkpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHJldHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyYW5zZm9ybUF0dHJpYnV0ZXMoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy54ID0gcGFyc2VJbnQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMueSA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy50cmFuc2Zvcm07XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHV0aWxpdHkuY2FtZWxpZnlLZXlzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcG9pbnRzVG9UcmFuc2Zvcm1cbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRzVG9UcmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGtlYmFiaWZ5S2V5c1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAga2ViYWJpZnlLZXlzKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZE1vZGVsID0ge307XG5cbiAgICAgICAgICAgIF8uZm9ySW4obW9kZWwsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRNb2RlbFtfLmtlYmFiQ2FzZShrZXkpXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZE1vZGVsO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgY2FtZWxpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBjYW1lbGlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18uY2FtZWxDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50TmFtZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZWxlbWVudE5hbWUobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZWxlbWVudFJlZmVyZW5jZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xIVE1MRWxlbWVudH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7SFRNTEVsZW1lbnR9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50UmVmZXJlbmNlKG1vZGVsKSB7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5ub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobW9kZWwpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBaSW5kZXhcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaSW5kZXgge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIHZhciB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA+IHpNYXgpIHsgZ3JvdXAuZGF0dW0oKS56ID0gek1heDsgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56IDwgMSkgICAgeyBncm91cC5kYXR1bSgpLnogPSAxOyAgICB9XG5cbiAgICAgICAgdmFyIHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBfLmZvckVhY2goZ3JvdXBzWzBdLCAobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEZlYXR1cmVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHtGZWF0dXJlfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbn0iLCJpbXBvcnQgSW50ZXJmYWNlICBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vLi4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBGZWF0dXJlcy5cbmltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4vZmVhdHVyZXMvU2VsZWN0YWJsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhYmVsID0gbGFiZWw7XG4gICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEdyb3VwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRHcm91cChncm91cCkge1xuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkRFU0VMRUNULCAoKSA9PiB0aGlzLnRyeUludm9rZU9uRWFjaEZlYXR1cmUoJ2Rlc2VsZWN0JykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cnlJbnZva2VPbkVhY2hGZWF0dXJlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZE5hbWVcbiAgICAgKi9cbiAgICB0cnlJbnZva2VPbkVhY2hGZWF0dXJlKG1ldGhvZE5hbWUpIHtcblxuICAgICAgICBfLmZvckluKHRoaXMuZmVhdHVyZXMsIChmZWF0dXJlKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZmVhdHVyZVttZXRob2ROYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlW21ldGhvZE5hbWVdKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldE9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGJlIG92ZXJ3cml0dGVuIGZvciBzaGFwZSB0eXBlcyB0aGF0IGhhdmUgYSBkaWZmZXJlbnQgbmFtZSB0byB0aGVpciBTVkcgdGFnIG5hbWUsIHN1Y2ggYXMgYSBgZm9yZWlnbk9iamVjdGBcbiAgICAgKiBlbGVtZW50IHVzaW5nIHRoZSBgcmVjdGAgc2hhcGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0TmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYWcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICAgICAgICAgIHZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciBnZXRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgdmFyIHpJbmRleCA9IHsgejogZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSkuZGF0dW0oKS56IH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsICA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpLCB6SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LnJldHJhbnNmb3JtQXR0cmlidXRlcyhtb2RlbCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyB0aGF0IGhvb2sgdXAgdGhlIGludGVyZmFjZSBhbmQgdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5SRU1PVkUsIChtb2RlbCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwgbW9kZWwpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwgZ2V0QXR0cmlidXRlcyk7XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuQVRUUklCVVRFX1NFVCwgKG1vZGVsKSA9PiB7IHRoaXMuc2V0QXR0cmlidXRlcyhtb2RlbC5hdHRyaWJ1dGVzKTsgfSk7XG5cbiAgICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5hZGRNZXRob2RzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gXy5hc3NpZ24odGhpcy5pbnRlcmZhY2UsIHRoaXMuYWRkTWV0aG9kcygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBdHRyaWJ1dGVzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVzID0ge30pIHtcblxuICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24odGhpcy5lbGVtZW50LmRhdHVtKCkgfHwge30sIGF0dHJpYnV0ZXMpO1xuICAgICAgICBhdHRyaWJ1dGVzID0gdXRpbGl0eS50cmFuc2Zvcm1BdHRyaWJ1dGVzKGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLnopKSB7XG5cbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIGRldmVsb3BlciBzcGVjaWZpZXMgdGhlIGB6YCBhdHRyaWJ1dGUsIGl0IGFjdHVhbGx5IHBlcnRhaW5zIHRvIHRoZSBncm91cFxuICAgICAgICAgICAgLy8gZWxlbWVudCB0aGF0IHRoZSBzaGFwZSBpcyBhIGNoaWxkIG9mLiBXZSdsbCB0aGVyZWZvcmUgbmVlZCB0byByZW1vdmUgdGhlIGB6YCBwcm9wZXJ0eVxuICAgICAgICAgICAgLy8gZnJvbSB0aGUgYGF0dHJpYnV0ZXNgIG9iamVjdCwgYW5kIGluc3RlYWQgYXBwbHkgaXQgdG8gdGhlIHNoYXBlJ3MgZ3JvdXAgZWxlbWVudC5cbiAgICAgICAgICAgIC8vIEFmdGVyd2FyZHMgd2UnbGwgbmVlZCB0byBicm9hZGNhc3QgYW4gZXZlbnQgdG8gcmVvcmRlciB0aGUgZWxlbWVudHMgdXNpbmcgRDMncyBtYWdpY2FsXG4gICAgICAgICAgICAvLyBgc29ydGAgbWV0aG9kLlxuICAgICAgICAgICAgdmFyIGdyb3VwID0gZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSk7XG4gICAgICAgICAgICBncm91cC5kYXR1bSh7IHo6IGF0dHJpYnV0ZXMueiB9KTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLno7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuUkVPUkRFUiwge1xuICAgICAgICAgICAgICAgIGdyb3VwOiBncm91cFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXR1bShhdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmF0dHIodGhpcy5lbGVtZW50LmRhdHVtKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QXR0cmlidXRlcygpIHtcblxuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHsgeDogMCwgeTogMCB9O1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5hZGRBdHRyaWJ1dGVzKSkge1xuICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHRoaXMuYWRkQXR0cmlidXRlcygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFbGVtZW50c1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRmVhdHVyZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEZlYXR1cmVzKCkge1xuXG4gICAgICAgIHZhciBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUodGhpcykuc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKVxuICAgICAgICB9O1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5TRUxFQ1QsICgpID0+IHRoaXMudHJ5SW52b2tlT25FYWNoRmVhdHVyZSgnc2VsZWN0JykpO1xuICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuREVTRUxFQ1QsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaXNwYXRjaEF0dHJpYnV0ZUV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgPSB7fVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudChwcm9wZXJ0aWVzID0ge30pIHtcbiAgICAgICAgcHJvcGVydGllcy5lbGVtZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICB2YXIgdGFnID0gdGhpcy5nZXRUYWcoKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuZ2V0VGFnKCkuc2xpY2UoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ306ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ31dYDtcblxuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuaW1wb3J0IEV2ZW50cyAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2VsZWN0YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIHNoYXBlLmVsZW1lbnQub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIXJlZ2lzdHJ5LmtleXMubXVsdGlTZWxlY3QpIHtcblxuICAgICAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBvZiB0aGUgc2hhcGVzIGluY2x1ZGluZyB0aGUgY3VycmVudCBvbmUsIGFzIHRoaXMga2VlcHMgdGhlIGxvZ2ljIHNpbXBsZXIuIFdlIHdpbGxcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0aGUgY3VycmVudCBzaGFwZSB0byBiZSBzZWxlY3RlZCBpbiB0aGUgbmV4dCBzdGVwLlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLm9yaWdpbmFsID0gdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5maWxsKCk7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuZmlsbCgnZ3JleScpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcblxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5maWxsKHRoaXMub3JpZ2luYWwpO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuLy4uL1NoYXBlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkTWV0aG9kc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRNZXRob2RzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxsOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxufSJdfQ==
