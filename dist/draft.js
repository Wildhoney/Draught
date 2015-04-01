(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var Circle = _interopRequire(require("./shapes/types/Circle.js"));

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Draft = (function () {

    /**
     * @method constructor
     * @param {SVGElement|String} element
     * @param {Object} [options={}]
     * @return {void}
     */

    function Draft(element) {
        var _this = this;

        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Draft);

        this.options = _.assign(this.defaultOptions(), options);
        this.element = d3.select(utility.elementReference(element)).attr("width", this.options.documentWidth).attr("height", this.options.documentHeight);
        this.shapes = [];
        this.index = 1;
        this.boundingBox = { selected: false, element: { remove: function () {} } };

        // Helpers required by Draft and the rest of the system.
        this.dispatcher = new Dispatcher();
        this.zIndex = new ZIndex();
        this.groups = new Groups().addTo(this.element);

        // Register our default components.
        this.map = {
            rect: Rectangle,
            circle: Circle
        };

        // Configure our interface for each shape object.
        this.accessor = {
            getCount: function () {
                return _this.selected().length;
            }
        };

        // Add the event listeners, and setup Mousetrap to listen for keyboard events.
        this.addEventListeners();
        this.setupMousetrap();
    }

    _createClass(Draft, {
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
                shape.setAccessor(this.accessor);
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
            }
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
            }
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
            }
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
            }
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
            }
        },
        ident: {

            /**
             * @method ident
             * @return {String}
             */

            value: function ident() {
                return ["BP", this.index++].join("");
            }
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
            }
        },
        instantiate: {

            /**
             * @method instantiate
             * @param {String} name
             * @return {Shape}
             */

            value: function instantiate(name) {
                return new (this.map[name.toLowerCase()])(this.ident());
            }
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
                this.dispatcher.listen(Events.CREATE_BOUNDING_BOX, function () {
                    return _this.createBoundingBox();
                });
                this.dispatcher.listen(Events.SELECTED_COUNT, function () {
                    return _this.selected().length;
                });
                this.dispatcher.listen(Events.REORDER, function (event) {
                    var groups = _this.element.selectAll("g[" + _this.options.dataAttribute + "]");
                    _this.zIndex.reorder(groups, event.group);
                });

                // When the user clicks on the SVG layer that isn't a part of the shape group, then we'll emit
                // the `Events.DESELECT` event to deselect all selected shapes.
                this.element.on("click", function () {

                    if (!_this.boundingBox.selected) {
                        _this.dispatcher.send(Events.DESELECT_ALL);
                        _this.boundingBox.element.remove();
                    }

                    _this.boundingBox.selected = false;
                });
            }
        },
        createBoundingBox: {

            /**
             * @method createBoundingBox
             * @return {void}
             */

            value: function createBoundingBox() {
                var _this = this;

                var model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                    maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

                /**
                 * Responsible for computing the collective bounding box, based on all of the bounding boxes
                 * from the current selected shapes.
                 *
                 * @method compute
                 * @param {Array} bBoxes
                 * @return {void}
                 */
                var compute = function (bBoxes) {
                    model.minX = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                        return d.x;
                    })));
                    model.minY = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                        return d.y;
                    })));
                    model.maxX = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                        return d.x + d.width;
                    })));
                    model.maxY = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                        return d.y + d.height;
                    })));
                };

                // Compute the collective bounding box.
                compute(this.selected().map(function (shape) {
                    return shape.boundingBox();
                }));

                this.boundingBox.element.remove();
                this.boundingBox.element = this.groups.handles.append("rect").datum(model).classed("drag-box", true).attr("pointer-events", "none").attr("x", function (d) {
                    return d.minX;
                }).attr("y", function (d) {
                    return d.minY;
                }).attr("width", function (d) {
                    return d.maxX - d.minX;
                }).attr("height", function (d) {
                    return d.maxY - d.minY;
                }).attr("fill", "transparent").attr("stroke", "red").attr("stroke-dasharray", [3, 3]).on("mouseup", function () {
                    _this.boundingBox.selected = true;
                });
            }
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
                    return move(Events.MOVE_LEFT, _this.options.moveSmall);
                });
                Mousetrap.bind("right", function () {
                    return move(Events.MOVE_RIGHT, _this.options.moveSmall);
                });
                Mousetrap.bind("up", function () {
                    return move(Events.MOVE_UP, _this.options.moveSmall);
                });
                Mousetrap.bind("down", function () {
                    return move(Events.MOVE_DOWN, _this.options.moveSmall);
                });

                Mousetrap.bind("shift+left", function () {
                    return move(Events.MOVE_LEFT, _this.options.moveLarge);
                });
                Mousetrap.bind("shift+right", function () {
                    return move(Events.MOVE_RIGHT, _this.options.moveLarge);
                });
                Mousetrap.bind("shift+up", function () {
                    return move(Events.MOVE_UP, _this.options.moveLarge);
                });
                Mousetrap.bind("shift+down", function () {
                    return move(Events.MOVE_DOWN, _this.options.moveLarge);
                });
            }
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
                    documentWidth: "100%",
                    moveSmall: 1,
                    moveLarge: 10
                };
            }
        },
        getShapePrototype: {

            /**
             * @method getShapePrototype
             * @return {Shape}
             */

            value: function getShapePrototype() {
                return Shape;
            }
        }
    });

    return Draft;
})();

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Draft = Draft;
})(window);

},{"./helpers/Dispatcher.js":3,"./helpers/Events.js":4,"./helpers/Groups.js":5,"./helpers/Registry.js":6,"./helpers/Utility.js":7,"./helpers/ZIndex.js":8,"./shapes/Shape.js":11,"./shapes/types/Circle.js":16,"./shapes/types/Rectangle.js":17}],2:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Constants
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

module.exports = {

  /**
   * Direct link to elucidating common exception messages.
   *
   * @constant EXCEPTIONS_URL
   * @type {String}
   */
  EXCEPTIONS_URL: "https://github.com/Wildhoney/Draft/blob/master/EXCEPTIONS.md#{title}"

};

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule Dispatcher
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
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

    _createClass(Dispatcher, {
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
            }
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
            }
        }
    });

    return Dispatcher;
})();

module.exports = Dispatcher;

},{}],4:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Events
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

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
    GET_BOUNDING_BOX: "get-bounding-box",
    CREATE_BOUNDING_BOX: "create-bounding-box",
    SELECTED_COUNT: "selected-count",
    SELECTED_LIST: "selected-list"
};

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule Groups
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Groups = (function () {
  function Groups() {
    _classCallCheck(this, Groups);
  }

  _createClass(Groups, {
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
      }
    }
  });

  return Groups;
})();

module.exports = Groups;

},{}],6:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Registry
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

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
 * @module Draft
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
var utility = (function () {

    "use strict";

    return {

        /**
         * @method throwException
         * @param {String} message
         * @param {String} [exceptionsTitle='']
         * @throws Error
         * @return {void}
         */
        throwException: function (message) {
            var exceptionsTitle = arguments[1] === undefined ? "" : arguments[1];

            if (exceptionsTitle) {
                var link = Constants.EXCEPTIONS_URL.replace(/{(.+?)}/i, function () {
                    return _.kebabCase(exceptionsTitle);
                });
                throw new Error("Draft.js: " + message + ". See: " + link);
            }

            throw new Error("Draft.js: " + message + ".");
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

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule ZIndex
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var ZIndex = (function () {
    function ZIndex() {
        _classCallCheck(this, ZIndex);
    }

    _createClass(ZIndex, {
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
            }
        }
    });

    return ZIndex;
})();

module.exports = ZIndex;

},{}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule Feature
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
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

    _createClass(Feature, {
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
            }
        },
        setAccessor: {

            /**
             * @method setAccessor
             * @param {Object} accessor
             * @return {Feature}
             */

            value: function setAccessor(accessor) {
                this.accessor = accessor;
                return this;
            }
        }
    });

    return Feature;
})();

module.exports = Feature;

},{}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Events = _interopRequire(require("./../helpers/Events.js"));

var utility = _interopRequire(require("./../helpers/Utility.js"));

/**
 * @module Draft
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

    _createClass(Interface, {
        remove: {

            /**
             * @method remove
             * @return {void}
             */

            value: function remove() {

                this.dispatcher.send(Events.REMOVE, {
                    "interface": this
                });
            }
        },
        select: {

            /**
             * @method select
             * @return {Interface}
             */

            value: function select() {
                this.selected = true;
                return this;
            }
        },
        deselect: {

            /**
             * @method deselect
             * @return {Interface}
             */

            value: function deselect() {
                this.selected = false;
                return this;
            }
        },
        isSelected: {

            /**
             * @method isSelected
             * @return {Boolean}
             */

            value: function isSelected() {
                return this.selected;
            }
        },
        x: {

            /**
             * @method x
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
             */

            value: function x(value) {
                return this.attr("x", value);
            }
        },
        y: {

            /**
             * @method y
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
             */

            value: function y(value) {
                return this.attr("y", value);
            }
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
            }
        },
        opacity: {

            /**
             * @method opacity
             * @param {Number} value
             * @return {Interface|Number}
             */

            value: function opacity(value) {
                return this.attr("opacity", value);
            }
        },
        stroke: {

            /**
             * @method stroke
             * @param {String} value
             * @return {Interface|String}
             */

            value: function stroke(value) {
                return this.attr("stroke", value);
            }
        },
        strokeWidth: {

            /**
             * @method strokeWidth
             * @param {Number} value
             * @return {Interface|Number}
             */

            value: function strokeWidth(value) {
                return this.attr("stroke-width", value);
            }
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
            }
        },
        z: {

            /**
             * @method z
             * @param {Number} [value=undefined]
             * @return {Interface}
             */

            value: function z(value) {
                return this.attr("z", value);
            }
        },
        boundingBox: {

            /**
             * @method boundingBox
             * @return {Object}
             */

            value: function boundingBox() {

                var result = {};

                this.dispatcher.send(Events.GET_BOUNDING_BOX, {}, function (response) {
                    result = response;
                });

                return result;
            }
        },
        bringToFront: {

            /**
             * @method bringToFront
             * @return {Interface|Number}
             */

            value: function bringToFront() {
                return this.attr("z", Infinity);
            }
        },
        sendToBack: {

            /**
             * @method sendToBack
             * @return {Interface|Number}
             */

            value: function sendToBack() {
                return this.attr("z", -Infinity);
            }
        },
        sendBackwards: {

            /**
             * @method sendBackwards
             * @return {Interface|Number}
             */

            value: function sendBackwards() {
                return this.attr("z", this.getAttr().z - 1);
            }
        },
        bringForwards: {

            /**
             * @method bringForwards
             * @return {Interface|Number}
             */

            value: function bringForwards() {
                return this.attr("z", this.getAttr().z + 1);
            }
        },
        width: {

            /**
             * @method width
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
             */

            value: function width(value) {
                return this.attr("width", value);
            }
        },
        height: {

            /**
             * @method height
             * @param {Number} [value=undefined]
             * @return {Interface|Number}
             */

            value: function height(value) {
                return this.attr("height", value);
            }
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
            }
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
            }
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
            }
        },
        setDispatcher: {

            /**
             * @method setDispatcher
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function setDispatcher(dispatcher) {
                this.dispatcher = dispatcher;
            }
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
            }
        }
    });

    return Interface;
})();

module.exports = Interface;

},{"./../helpers/Events.js":4,"./../helpers/Utility.js":7}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./../helpers/Dispatcher.js"));

var Events = _interopRequire(require("./../helpers/Events.js"));

var utility = _interopRequire(require("./../helpers/Utility.js"));

// Features.

var Selectable = _interopRequire(require("./features/Selectable.js"));

var Movable = _interopRequire(require("./features/Movable.js"));

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
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

    _createClass(Shape, {
        setElement: {

            /**
             * @method setElement
             * @param {Object} element
             * @return {void}
             */

            value: function setElement(element) {
                this.element = element;
            }
        },
        setGroup: {

            /**
             * @method setGroup
             * @param {Object} group
             * @return {void}
             */

            value: function setGroup(group) {
                this.group = group;
            }
        },
        setDispatcher: {

            /**
             * @method setDispatcher
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function setDispatcher(dispatcher) {
                this.dispatcher = dispatcher;
            }
        },
        setAccessor: {

            /**
             * @method setAccessor
             * @param {Object} accessor
             * @return {void}
             */

            value: function setAccessor(accessor) {
                this.accessor = accessor;
            }
        },
        setOptions: {

            /**
             * @method setOptions
             * @param {Object} options
             * @return {void}
             */

            value: function setOptions(options) {
                this.options = options;
            }
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
            }
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
            }
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
                    dispatcher.listen(Events.GET_BOUNDING_BOX, function () {
                        return _this.getBoundingBox();
                    });
                }

                return this["interface"];
            }
        },
        getBoundingBox: {

            /**
             * @method getBoundingBox
             * @return {Object}
             */

            value: function getBoundingBox() {
                return this.group.node().getBBox();
            }
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
            }
        },
        getAttributes: {

            /**
             * @method getAttributes
             * @return {Object}
             */

            value: function getAttributes() {

                var attributes = {};

                if (_.isFunction(this.addAttributes)) {
                    attributes = _.assign(attributes, this.addAttributes());
                }

                return attributes;
            }
        },
        addElements: {

            /**
             * @method addElements
             * @return {Object}
             */

            value: function addElements() {
                return {};
            }
        },
        addFeatures: {

            /**
             * @method addFeatures
             * @return {void}
             */

            value: function addFeatures() {

                this.features = {
                    selectable: new Selectable(this).setDispatcher(this.dispatcher).setAccessor(this.accessor),
                    movable: new Movable(this).setDispatcher(this.dispatcher).setAccessor(this.accessor)
                };
            }
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
            }
        }
    });

    return Shape;
})();

module.exports = Shape;

},{"./../helpers/Dispatcher.js":3,"./../helpers/Events.js":4,"./../helpers/Utility.js":7,"./features/Movable.js":12,"./features/Selectable.js":13}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

var Events = _interopRequire(require("./../../helpers/Events.js"));

var registry = _interopRequire(require("./../../helpers/Registry.js"));

/**
 * @module Draft
 * @submodule Movable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Movable = (function (_Feature) {

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

        /**
         * Bounding box of the element(s) that are currently being dragged.
         *
         * @property boundingBox
         * @type {{width: number, height: number}}
         */
        this.boundingBox = { width: 0, height: 0 };

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

    _inherits(Movable, _Feature);

    _createClass(Movable, {
        addEvents: {

            /**
             * @method addEvents
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function addEvents(dispatcher) {
                var _this = this;

                /**
                 * @method invokeIfSelected
                 * @param {Function} fn
                 * @param {Object} model
                 * @return {void}
                 */
                var invokeIfSelected = function (fn, model) {

                    if (_this.shape.getInterface().isSelected()) {
                        fn.apply(_this, [model]);
                    }
                };

                dispatcher.listen(Events.MOVE_LEFT, function (model) {
                    return invokeIfSelected(_this.moveLeft, model);
                });
                dispatcher.listen(Events.MOVE_RIGHT, function (model) {
                    return invokeIfSelected(_this.moveRight, model);
                });
                dispatcher.listen(Events.MOVE_UP, function (model) {
                    return invokeIfSelected(_this.moveUp, model);
                });
                dispatcher.listen(Events.MOVE_DOWN, function (model) {
                    return invokeIfSelected(_this.moveDown, model);
                });
            }
        },
        moveLeft: {

            /**
             * @method moveLeft
             * @param {Object} model
             * @return {void}
             */

            value: function moveLeft(model) {
                this.shape.getInterface().x(this.shape.getInterface().x() - model.by);
            }
        },
        moveRight: {

            /**
             * @method moveRight
             * @param {Object} model
             * @return {void}
             */

            value: function moveRight(model) {
                this.shape.getInterface().x(this.shape.getInterface().x() + model.by);
            }
        },
        moveUp: {

            /**
             * @method moveUp
             * @param {Object} model
             * @return {void}
             */

            value: function moveUp(model) {
                this.shape.getInterface().y(this.shape.getInterface().y() - model.by);
            }
        },
        moveDown: {

            /**
             * @method moveDown
             * @param {Object} model
             * @return {void}
             */

            value: function moveDown(model) {
                this.shape.getInterface().y(this.shape.getInterface().y() + model.by);
            }
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

                if (!this.shape.getInterface().isSelected()) {
                    return;
                }

                this.start = {
                    x: !_.isNull(x) ? x : d3.event.sourceEvent.clientX - this.shape.getInterface().x(),
                    y: !_.isNull(y) ? y : d3.event.sourceEvent.clientY - this.shape.getInterface().y()
                };

                this.dispatcher.send(Events.CREATE_BOUNDING_BOX);
                this.shape.group.classed("dragging", true);
            }
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
            }
        },
        dragEnd: {

            /**
             * @method dragEnd
             * @return {void}
             */

            value: function dragEnd() {
                this.shape.group.classed("dragging", false);
            }
        }
    });

    return Movable;
})(Feature);

module.exports = Movable;

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":6,"./../Feature.js":9}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Feature = _interopRequire(require("./../Feature.js"));

var Events = _interopRequire(require("./../../helpers/Events.js"));

var registry = _interopRequire(require("./../../helpers/Registry.js"));

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Selectable = (function (_Feature) {

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

            var isSelected = _this.selected;

            if (!registry.keys.multiSelect) {

                // Deselect all of the shapes including the current one, as this keeps the logic simpler. We will
                // apply the current shape to be selected in the next step.
                _this.dispatcher.send(Events.DESELECT_ALL);
            }

            if (!isSelected || _this.accessor.getCount() === 0) {

                // Simply select the element.
                _this.select();
                return;
            }

            if (_this.accessor.getCount() === 1) {
                _this.dispatcher.send(Events.DESELECT_ALL);
            }
        });
    }

    _inherits(Selectable, _Feature);

    _createClass(Selectable, {
        addEvents: {

            /**
             * @method addEvents
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function addEvents(dispatcher) {
                var _this = this;

                dispatcher.listen(Events.SELECT_ALL, function () {
                    return _this.select();
                });
                dispatcher.listen(Events.DESELECT_ALL, function () {
                    return _this.deselect();
                });
            }
        },
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {

                if (!this.selected) {
                    this.shape.group.classed("selected", true);
                    this.shape.getInterface().select();
                    this.shape.getInterface().stroke("#333").strokeWidth(1);
                    this.selected = true;
                }
            }
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
            }
        }
    });

    return Selectable;
})(Feature);

module.exports = Selectable;

},{"./../../helpers/Events.js":4,"./../../helpers/Registry.js":6,"./../Feature.js":9}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../Interface.js"));

/**
 * @module Draft
 * @submodule Circle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */

var Circle = (function (_Interface) {
  function Circle() {
    _classCallCheck(this, Circle);

    if (_Interface != null) {
      _Interface.apply(this, arguments);
    }
  }

  _inherits(Circle, _Interface);

  _createClass(Circle, {
    fill: {

      /**
       * @method fill
       * @param {String} [value=undefined]
       * @return {Interface}
       */

      value: function fill(value) {
        return this.attr("fill", value);
      }
    }
  });

  return Circle;
})(Interface);

module.exports = Circle;

},{"./../Interface.js":10}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../Interface.js"));

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/object
 */

var Rectangle = (function (_Interface) {
  function Rectangle() {
    _classCallCheck(this, Rectangle);

    if (_Interface != null) {
      _Interface.apply(this, arguments);
    }
  }

  _inherits(Rectangle, _Interface);

  _createClass(Rectangle, {
    fill: {

      /**
       * @method fill
       * @param {String} [value=undefined]
       * @return {Interface}
       */

      value: function fill(value) {
        return this.attr("fill", value);
      }
    }
  });

  return Rectangle;
})(Interface);

module.exports = Rectangle;

},{"./../Interface.js":10}],16:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Shape = _interopRequire(require("./../Shape.js"));

var Interface = _interopRequire(require("./../interfaces/Circle.js"));

var utility = _interopRequire(require("./../../helpers/Utility.js"));

/**
 * @module Draft
 * @submodule Circle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Circle = (function (_Shape) {
  function Circle() {
    _classCallCheck(this, Circle);

    if (_Shape != null) {
      _Shape.apply(this, arguments);
    }
  }

  _inherits(Circle, _Shape);

  _createClass(Circle, {
    getTag: {

      /**
       * @method getTag
       * @return {String}
       */

      value: function getTag() {
        return "circle";
      }
    },
    addInterface: {

      /**
       * @method addInterface
       * @return {Interface}
       */

      value: function addInterface() {
        return new Interface(this.label);
      }
    },
    addAttributes: {

      /**
       * @method addAttributes
       * @return {Object}
       */

      value: function addAttributes() {
        var transform = utility.pointsToTransform(200, 200).transform;
        return { fill: "red", width: 100, height: 100, r: 50, transform: transform };
      }
    }
  });

  return Circle;
})(Shape);

module.exports = Circle;

},{"./../../helpers/Utility.js":7,"./../Shape.js":11,"./../interfaces/Circle.js":14}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Shape = _interopRequire(require("./../Shape.js"));

var Interface = _interopRequire(require("./../interfaces/Rectangle.js"));

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Rectangle = (function (_Shape) {
  function Rectangle() {
    _classCallCheck(this, Rectangle);

    if (_Shape != null) {
      _Shape.apply(this, arguments);
    }
  }

  _inherits(Rectangle, _Shape);

  _createClass(Rectangle, {
    getTag: {

      /**
       * @method getTag
       * @return {String}
       */

      value: function getTag() {
        return "rect";
      }
    },
    addInterface: {

      /**
       * @method addInterface
       * @return {Interface}
       */

      value: function addInterface() {
        return new Interface(this.label);
      }
    },
    addAttributes: {

      /**
       * @method addAttributes
       * @return {Object}
       */

      value: function addAttributes() {
        return { fill: "red", width: 100, height: 100, x: 100, y: 20 };
      }
    }
  });

  return Rectangle;
})(Shape);

module.exports = Rectangle;

},{"./../Shape.js":11,"./../interfaces/Rectangle.js":15}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Db25zdGFudHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvUmVnaXN0cnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9VdGlsaXR5LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvWkluZGV4LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9GZWF0dXJlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1NoYXBlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9mZWF0dXJlcy9Nb3ZhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9mZWF0dXJlcy9TZWxlY3RhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL3NoYXBlcy9pbnRlcmZhY2VzL0NpcmNsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvaW50ZXJmYWNlcy9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL3R5cGVzL0NpcmNsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0FPLFVBQVUsMkJBQU0seUJBQXlCOztJQUN6QyxNQUFNLDJCQUFVLHFCQUFxQjs7SUFDckMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE1BQU0sMkJBQVUscUJBQXFCOztJQUNyQyxRQUFRLDJCQUFRLHVCQUF1Qjs7SUFDdkMsT0FBTywyQkFBUyxzQkFBc0I7Ozs7SUFHdEMsS0FBSywyQkFBVyxtQkFBbUI7O0lBQ25DLFNBQVMsMkJBQU8sNkJBQTZCOztJQUM3QyxNQUFNLDJCQUFVLDBCQUEwQjs7Ozs7Ozs7SUFPM0MsS0FBSzs7Ozs7Ozs7O0FBUUksYUFSVCxLQUFLLENBUUssT0FBTyxFQUFnQjs7O1lBQWQsT0FBTyxnQ0FBRyxFQUFFOzs4QkFSL0IsS0FBSzs7QUFVSCxZQUFJLENBQUMsT0FBTyxHQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzVELFlBQUksQ0FBQyxPQUFPLEdBQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDMUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDakUsWUFBSSxDQUFDLE1BQU0sR0FBUSxFQUFFLENBQUM7QUFDdEIs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SSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3BDOztBQU1ELGlCQUFhOzs7Ozs7O2FBQUEseUJBQUc7QUFDWixlQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7T0FDbEU7Ozs7U0F4QmdCLFNBQVM7R0FBUyxLQUFLOztpQkFBdkIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgR3JvdXBzICAgICBmcm9tICcuL2hlbHBlcnMvR3JvdXBzLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IFpJbmRleCAgICAgZnJvbSAnLi9oZWxwZXJzL1pJbmRleC5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgICBmcm9tICcuL2hlbHBlcnMvUmVnaXN0cnkuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgU2hhcGUgICAgICBmcm9tICcuL3NoYXBlcy9TaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuaW1wb3J0IENpcmNsZSAgICAgZnJvbSAnLi9zaGFwZXMvdHlwZXMvQ2lyY2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5jbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fFN0cmluZ30gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyAgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgICAgID0gZDMuc2VsZWN0KHV0aWxpdHkuZWxlbWVudFJlZmVyZW5jZShlbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFwZXMgICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ICAgICAgID0gMTtcbiAgICAgICAgdGhpcy5ib3VuZGluZ0JveCA9IHsgc2VsZWN0ZWQ6IGZhbHNlLCBlbGVtZW50OiB7IHJlbW92ZTogKCkgPT4ge319IH07XG5cbiAgICAgICAgLy8gSGVscGVycyByZXF1aXJlZCBieSBEcmFmdCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyICA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgICAgIHRoaXMuekluZGV4ICAgICAgPSBuZXcgWkluZGV4KCk7XG4gICAgICAgIHRoaXMuZ3JvdXBzICAgICAgPSBuZXcgR3JvdXBzKCkuYWRkVG8odGhpcy5lbGVtZW50KTtcblxuICAgICAgICAvLyBSZWdpc3RlciBvdXIgZGVmYXVsdCBjb21wb25lbnRzLlxuICAgICAgICB0aGlzLm1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6ICAgUmVjdGFuZ2xlLFxuICAgICAgICAgICAgY2lyY2xlOiBDaXJjbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb25maWd1cmUgb3VyIGludGVyZmFjZSBmb3IgZWFjaCBzaGFwZSBvYmplY3QuXG4gICAgICAgIHRoaXMuYWNjZXNzb3IgPSB7XG4gICAgICAgICAgICBnZXRDb3VudDogKCkgPT4gdGhpcy5zZWxlY3RlZCgpLmxlbmd0aFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBhbmQgc2V0dXAgTW91c2V0cmFwIHRvIGxpc3RlbiBmb3Iga2V5Ym9hcmQgZXZlbnRzLlxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBNb3VzZXRyYXAoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd8SFRNTEVsZW1lbnR9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkKG5hbWUpIHtcblxuICAgICAgICBsZXQgc2hhcGUgICA9IHRoaXMuaW5zdGFudGlhdGUodXRpbGl0eS5lbGVtZW50TmFtZShuYW1lKSksXG4gICAgICAgICAgICBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLmFwcGVuZCgnZycpLmF0dHIodGhpcy5vcHRpb25zLmRhdGFBdHRyaWJ1dGUsIHNoYXBlLmxhYmVsKSxcbiAgICAgICAgICAgIGVsZW1lbnQgPSBncm91cC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLFxuICAgICAgICAgICAgekluZGV4ICA9IHsgejogdGhpcy5pbmRleCAtIDEgfTtcblxuICAgICAgICAvLyBTZXQgYWxsIG9mIHRoZSBlc3NlbnRpYWwgb2JqZWN0cyB0aGF0IHRoZSBzaGFwZSByZXF1aXJlcy5cbiAgICAgICAgc2hhcGUuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLnNldEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IpO1xuICAgICAgICBzaGFwZS5zZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICBzaGFwZS5zZXRHcm91cChncm91cCk7XG4gICAgICAgIHNoYXBlLnNldEF0dHJpYnV0ZXMoXy5hc3NpZ24oekluZGV4LCBzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcblxuICAgICAgICAvLyBMYXN0IGNoYW5jZSB0byBkZWZpbmUgYW55IGZ1cnRoZXIgZWxlbWVudHMgZm9yIHRoZSBncm91cCwgYW5kIHRoZSBhcHBsaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gZmVhdHVyZXMgd2hpY2ggYSBzaGFwZSBzaG91bGQgaGF2ZSwgc3VjaCBhcyBiZWluZyBkcmFnZ2FibGUsIHNlbGVjdGFibGUsIHJlc2l6ZWFibGUsIGV0Yy4uLlxuICAgICAgICBzaGFwZS5hZGRFbGVtZW50cygpO1xuICAgICAgICBzaGFwZS5hZGRGZWF0dXJlcygpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIG1hcHBpbmcgZnJvbSB0aGUgYWN0dWFsIHNoYXBlIG9iamVjdCwgdG8gdGhlIGludGVyZmFjZSBvYmplY3QgdGhhdCB0aGUgZGV2ZWxvcGVyXG4gICAgICAgIC8vIGludGVyYWN0cyB3aXRoLlxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKHsgc2hhcGU6IHNoYXBlLCBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpfSk7XG4gICAgICAgIHJldHVybiBzaGFwZS5nZXRJbnRlcmZhY2UoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtJbnRlcmZhY2V9IG1vZGVsXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgcmVtb3ZlKG1vZGVsKSB7XG5cbiAgICAgICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgICAgIGl0ZW0gID0gXy5maW5kKHRoaXMuc2hhcGVzLCAoc2hhcGUsIGkpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzaGFwZS5pbnRlcmZhY2UgPT09IG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5zaGFwZS5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5hbGwoKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5tYXAoKG1vZGVsKSA9PiBtb2RlbC5pbnRlcmZhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuZmlsdGVyKChzaGFwZUludGVyZmFjZSkgPT4gc2hhcGVJbnRlcmZhY2UuaXNTZWxlY3RlZCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpZGVudFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBpZGVudCgpIHtcbiAgICAgICAgcmV0dXJuIFsnQlAnLCB0aGlzLmluZGV4KytdLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVnaXN0ZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3ZlcndyaXRlPWZhbHNlXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVnaXN0ZXIobmFtZSwgc2hhcGUsIG92ZXJ3cml0ZSA9IGZhbHNlKSB7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBzaGFwZSBpcyBhIHZhbGlkIGluc3RhbmNlLlxuICAgICAgICB1dGlsaXR5LmFzc2VydChPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc2hhcGUpID09PSBTaGFwZSwgJ0N1c3RvbSBzaGFwZSBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBTaGFwZWAnLCAnSW5zdGFuY2Ugb2YgU2hhcGUnKTtcblxuICAgICAgICBpZiAoIW92ZXJ3cml0ZSAmJiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuXG4gICAgICAgICAgICAvLyBFeGlzdGluZyBzaGFwZXMgY2Fubm90IGJlIG92ZXJ3cml0dGVuLlxuICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgUmVmdXNpbmcgdG8gb3ZlcndyaXRlIGV4aXN0aW5nICR7bmFtZX0gc2hhcGUgd2l0aG91dCBleHBsaWNpdCBvdmVyd3JpdGVgLCAnT3ZlcndyaXRpbmcgRXhpc3RpbmcgU2hhcGVzJyk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGluc3RhbnRpYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBpbnN0YW50aWF0ZShuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSh0aGlzLmlkZW50KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRXZlbnRMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEV2ZW50TGlzdGVuZXJzKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKGV2ZW50KSAgPT4gdGhpcy5yZW1vdmUoZXZlbnQuaW50ZXJmYWNlKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkNSRUFURV9CT1VORElOR19CT1gsICgpID0+IHRoaXMuY3JlYXRlQm91bmRpbmdCb3goKSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlNFTEVDVEVEX0NPVU5ULCAoKSA9PiB0aGlzLnNlbGVjdGVkKCkubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuUkVPUkRFUiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JvdXBzID0gdGhpcy5lbGVtZW50LnNlbGVjdEFsbChgZ1ske3RoaXMub3B0aW9ucy5kYXRhQXR0cmlidXRlfV1gKTtcbiAgICAgICAgICAgIHRoaXMuekluZGV4LnJlb3JkZXIoZ3JvdXBzLCBldmVudC5ncm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSBTVkcgbGF5ZXIgdGhhdCBpc24ndCBhIHBhcnQgb2YgdGhlIHNoYXBlIGdyb3VwLCB0aGVuIHdlJ2xsIGVtaXRcbiAgICAgICAgLy8gdGhlIGBFdmVudHMuREVTRUxFQ1RgIGV2ZW50IHRvIGRlc2VsZWN0IGFsbCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgIHRoaXMuZWxlbWVudC5vbignY2xpY2snLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5ib3VuZGluZ0JveC5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpO1xuICAgICAgICAgICAgICAgIHRoaXMuYm91bmRpbmdCb3guZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5ib3VuZGluZ0JveC5zZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjcmVhdGVCb3VuZGluZ0JveFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY3JlYXRlQm91bmRpbmdCb3goKSB7XG5cbiAgICAgICAgbGV0IG1vZGVsID0geyBtaW5YOiBOdW1iZXIuTUFYX1ZBTFVFLCBtaW5ZOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgIG1heFg6IE51bWJlci5NSU5fVkFMVUUsIG1heFk6IE51bWJlci5NSU5fVkFMVUUgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzcG9uc2libGUgZm9yIGNvbXB1dGluZyB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3gsIGJhc2VkIG9uIGFsbCBvZiB0aGUgYm91bmRpbmcgYm94ZXNcbiAgICAgICAgICogZnJvbSB0aGUgY3VycmVudCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29tcHV0ZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBiQm94ZXNcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGxldCBjb21wdXRlID0gKGJCb3hlcykgPT4ge1xuICAgICAgICAgICAgbW9kZWwubWluWCA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCkpO1xuICAgICAgICAgICAgbW9kZWwubWluWSA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WCA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCArIGQud2lkdGgpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFkgPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkgKyBkLmhlaWdodCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LlxuICAgICAgICBjb21wdXRlKHRoaXMuc2VsZWN0ZWQoKS5tYXAoKHNoYXBlKSA9PiBzaGFwZS5ib3VuZGluZ0JveCgpKSk7XG5cbiAgICAgICAgdGhpcy5ib3VuZGluZ0JveC5lbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmJvdW5kaW5nQm94LmVsZW1lbnQgPSB0aGlzLmdyb3Vwcy5oYW5kbGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdkcmFnLWJveCcsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigncG9pbnRlci1ldmVudHMnLCAnbm9uZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsICAgICAgKChkKSA9PiBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAgICAgICgoZCkgPT4gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsICAoKGQpID0+IGQubWF4WCAtIGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgKChkKSA9PiBkLm1heFkgLSBkLm1pblkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAndHJhbnNwYXJlbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknLCBbMywgM10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ21vdXNldXAnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib3VuZGluZ0JveC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0dXBNb3VzZXRyYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldHVwTW91c2V0cmFwKCkge1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHJlZ2lzdHJ5LmtleXMubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiByZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHJlZ2lzdHJ5LmtleXMuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiByZWdpc3RyeS5rZXlzLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgbW92ZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIGxldCBtb3ZlID0gKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChuYW1lLCB7IGJ5OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbGVmdCcsICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX0xFRlQsIHRoaXMub3B0aW9ucy5tb3ZlU21hbGwpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3JpZ2h0JywgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9SSUdIVCwgdGhpcy5vcHRpb25zLm1vdmVTbWFsbCkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgndXAnLCAgICAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1VQLCB0aGlzLm9wdGlvbnMubW92ZVNtYWxsKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdkb3duJywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfRE9XTiwgdGhpcy5vcHRpb25zLm1vdmVTbWFsbCkpO1xuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCtsZWZ0JywgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfTEVGVCwgdGhpcy5vcHRpb25zLm1vdmVMYXJnZSkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrcmlnaHQnLCAoKSA9PiBtb3ZlKEV2ZW50cy5NT1ZFX1JJR0hULCB0aGlzLm9wdGlvbnMubW92ZUxhcmdlKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCt1cCcsICAgICgpID0+IG1vdmUoRXZlbnRzLk1PVkVfVVAsIHRoaXMub3B0aW9ucy5tb3ZlTGFyZ2UpKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0K2Rvd24nLCAgKCkgPT4gbW92ZShFdmVudHMuTU9WRV9ET1dOLCB0aGlzLm9wdGlvbnMubW92ZUxhcmdlKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhQXR0cmlidXRlOiAnZGF0YS1pZCcsXG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgbW92ZVNtYWxsOiAxLFxuICAgICAgICAgICAgbW92ZUxhcmdlOiAxMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVByb3RvdHlwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlUHJvdG90eXBlKCkge1xuICAgICAgICByZXR1cm4gU2hhcGU7XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxufSkod2luZG93KTsiLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQ29uc3RhbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBEaXJlY3QgbGluayB0byBlbHVjaWRhdGluZyBjb21tb24gZXhjZXB0aW9uIG1lc3NhZ2VzLlxuICAgICAqXG4gICAgICogQGNvbnN0YW50IEVYQ0VQVElPTlNfVVJMXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKi9cbiAgICBFWENFUFRJT05TX1VSTDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnQvYmxvYi9tYXN0ZXIvRVhDRVBUSU9OUy5tZCN7dGl0bGV9J1xuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIERpc3BhdGNoZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbj0oKSA9PiB7fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbmQobmFtZSwgcHJvcGVydGllcyA9IHt9LCBmbiA9IG51bGwpIHtcblxuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBjYWxsYmFja0ZuKHByb3BlcnRpZXMpO1xuXG4gICAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZuKSkge1xuXG4gICAgICAgICAgICAgICAgLy8gRXZlbnQgZGlzcGF0Y2hlcidzIHR3by13YXkgY29tbXVuaWNhdGlvbiB2aWEgZXZlbnRzLlxuICAgICAgICAgICAgICAgIGZuKHJlc3VsdCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGlzdGVuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgbGlzdGVuKG5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0ucHVzaChmbik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEV2ZW50c1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZScsXG4gICAgQVRUUklCVVRFX0dFVF9BTEw6ICdhdHRyaWJ1dGUtZ2V0LWFsbCcsXG4gICAgQVRUUklCVVRFX1NFVDogJ2F0dHJpYnV0ZS1zZXQnLFxuICAgIFJFT1JERVI6ICdyZW9yZGVyJyxcbiAgICBSRU1PVkU6ICdyZW1vdmUnLFxuICAgIE1PVkVfVVA6ICdtb3ZlLXVwJyxcbiAgICBNT1ZFX0RPV046ICdtb3ZlLWRvd24nLFxuICAgIE1PVkVfTEVGVDogJ21vdmUtbGVmdCcsXG4gICAgTU9WRV9SSUdIVDogJ21vdmUtcmlnaHQnLFxuICAgIFNFTEVDVDogJ3NlbGVjdCcsXG4gICAgU0VMRUNUX0FMTDogJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1Q6ICdkZXNlbGVjdCcsXG4gICAgR0VUX0JPVU5ESU5HX0JPWDogJ2dldC1ib3VuZGluZy1ib3gnLFxuICAgIENSRUFURV9CT1VORElOR19CT1g6ICdjcmVhdGUtYm91bmRpbmctYm94JyxcbiAgICBTRUxFQ1RFRF9DT1VOVDogJ3NlbGVjdGVkLWNvdW50JyxcbiAgICBTRUxFQ1RFRF9MSVNUOiAnc2VsZWN0ZWQtbGlzdCdcbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgR3JvdXBzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cHMge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRUb1xuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0dyb3Vwc31cbiAgICAgKi9cbiAgICBhZGRUbyhlbGVtZW50KSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdzaGFwZXMnLCB0cnVlKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzID0gZWxlbWVudC5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdoYW5kbGVzJywgdHJ1ZSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGVsZW1lbnRzIGZyb20gbGVha2luZyB0aHJvdWdoIHRvIHRoZSBTVkcgbGF5ZXIuXG4gICAgICAgIHRoaXMuc2hhcGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgICAgICAgdGhpcy5oYW5kbGVzLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWdpc3RyeVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogUmVzcG9uc2libGUgZm9yIGRldGVybWluaW5nIHdoZW4gY2VydGFpbiBrZXlzIGFyZSBwcmVzc2VkIGRvd24sIHdoaWNoIHdpbGwgZGV0ZXJtaW5lIHRoZVxuICAgICAqIHN0cmF0ZWd5IGF0IHJ1bnRpbWUgZm9yIGNlcnRhaW4gZnVuY3Rpb25zLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IGtleXNcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIGtleXM6IHtcbiAgICAgICAgbXVsdGlTZWxlY3Q6IGZhbHNlLFxuICAgICAgICBhc3BlY3RSYXRpbzogZmFsc2VcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IHNuYXBHcmlkXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICBzbmFwR3JpZDogMTBcblxufSIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgVXRpbGl0eVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xudmFyIHV0aWxpdHkgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IFtleGNlcHRpb25zVGl0bGU9JyddXG4gICAgICAgICAqIEB0aHJvd3MgRXJyb3JcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHRocm93RXhjZXB0aW9uOiAobWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlID0gJycpID0+IHtcblxuICAgICAgICAgICAgaWYgKGV4Y2VwdGlvbnNUaXRsZSkge1xuICAgICAgICAgICAgICAgIGxldCBsaW5rID0gQ29uc3RhbnRzLkVYQ0VQVElPTlNfVVJMLnJlcGxhY2UoL3soLis/KX0vaSwgKCkgPT4gXy5rZWJhYkNhc2UoZXhjZXB0aW9uc1RpdGxlKSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS4gU2VlOiAke2xpbmt9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRHJhZnQuanM6ICR7bWVzc2FnZX0uYCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBhc3NlcnRcbiAgICAgICAgICogQHBhcmFtIHtCb29sZWFufSBhc3NlcnRpb25cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV4Y2VwdGlvbnNUaXRsZVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgYXNzZXJ0KGFzc2VydGlvbiwgbWVzc2FnZSwgZXhjZXB0aW9uc1RpdGxlKSB7XG5cbiAgICAgICAgICAgIGlmICghYXNzZXJ0aW9uKSB7XG4gICAgICAgICAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihtZXNzYWdlLCBleGNlcHRpb25zVGl0bGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdHJhbnNmb3JtQXR0cmlidXRlc1xuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0cmFuc2Zvcm1BdHRyaWJ1dGVzOiAoYXR0cmlidXRlcykgPT4ge1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy50cmFuc2Zvcm0pIHtcblxuICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGF0dHJpYnV0ZXMudHJhbnNmb3JtLm1hdGNoKC8oXFxkKylcXHMqLFxccyooXFxkKykvaSksXG4gICAgICAgICAgICAgICAgICAgIHggICAgID0gcGFyc2VJbnQobWF0Y2hbMV0pLFxuICAgICAgICAgICAgICAgICAgICB5ICAgICA9IHBhcnNlSW50KG1hdGNoWzJdKTtcblxuICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmIF8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy55KSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gXy5hc3NpZ24oYXR0cmlidXRlcywgdXRpbGl0eS5wb2ludHNUb1RyYW5zZm9ybShhdHRyaWJ1dGVzLngsIHkpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oeCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChhdHRyaWJ1dGVzLngpICYmICFfLmlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMueSkpIHtcblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHVzaW5nIHRoZSBgdHJhbnNmb3JtOiB0cmFuc2xhdGUoeCwgeSlgIGZvcm1hdCBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB1dGlsaXR5LnBvaW50c1RvVHJhbnNmb3JtKGF0dHJpYnV0ZXMueCwgYXR0cmlidXRlcy55KSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMueDtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmV0cmFuc2Zvcm1BdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHJldHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKSB7XG5cbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnRyYW5zZm9ybSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG1hdGNoID0gYXR0cmlidXRlcy50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKVxccyosXFxzKihcXGQrKS9pKTtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnggPSBwYXJzZUludChtYXRjaFsxXSk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy55ID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLnRyYW5zZm9ybTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXRpbGl0eS5jYW1lbGlmeUtleXMoYXR0cmlidXRlcyk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBwb2ludHNUb1RyYW5zZm9ybVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBwb2ludHNUb1RyYW5zZm9ybSh4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qga2ViYWJpZnlLZXlzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBrZWJhYmlmeUtleXMobW9kZWwpIHtcblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkTW9kZWwgPSB7fTtcblxuICAgICAgICAgICAgXy5mb3JJbihtb2RlbCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZE1vZGVsW18ua2ViYWJDYXNlKGtleSldID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkTW9kZWw7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBjYW1lbGlmeUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIGNhbWVsaWZ5S2V5cyhtb2RlbCkge1xuXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRNb2RlbCA9IHt9O1xuXG4gICAgICAgICAgICBfLmZvckluKG1vZGVsLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTW9kZWxbXy5jYW1lbENhc2Uoa2V5KV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGVsZW1lbnROYW1lXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBlbGVtZW50TmFtZShtb2RlbCkge1xuXG4gICAgICAgICAgICBpZiAobW9kZWwubm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBlbGVtZW50UmVmZXJlbmNlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfEhUTUxFbGVtZW50fSBtb2RlbFxuICAgICAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIGVsZW1lbnRSZWZlcmVuY2UobW9kZWwpIHtcblxuICAgICAgICAgICAgaWYgKG1vZGVsLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihtb2RlbCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbGl0eTsiLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgWkluZGV4XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaSW5kZXgge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIGxldCB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG5cbiAgICAgICAgdmFyIHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBfLmZvckVhY2goZ3JvdXBzWzBdLCAobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRmVhdHVyZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge0ZlYXR1cmV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcbiAgICAgICAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7RmVhdHVyZX1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5hZGRFdmVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEV2ZW50cyhkaXNwYXRjaGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBY2Nlc3NvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge0ZlYXR1cmV9XG4gICAgICovXG4gICAgc2V0QWNjZXNzb3IoYWNjZXNzb3IpIHtcbiAgICAgICAgdGhpcy5hY2Nlc3NvciA9IGFjY2Vzc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbn0iLCJpbXBvcnQgRXZlbnRzICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5IGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEludGVyZmFjZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtsYWJlbD0nJ11cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGFiZWwgPSAnJykge1xuICAgICAgICB0aGlzLmxhYmVsICAgID0gbGFiZWw7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlKCkge1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5SRU1PVkUsIHtcbiAgICAgICAgICAgICdpbnRlcmZhY2UnOiB0aGlzXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgeCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd4JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgeSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdHJhbnNmb3JtXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHRyYW5zZm9ybSh4ID0gbnVsbCwgeSA9IG51bGwpIHtcblxuICAgICAgICBpZiAoIV8uaXNOdWxsKHgpKSB7XG4gICAgICAgICAgICB0aGlzLngoeCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNOdWxsKHkpKSB7XG4gICAgICAgICAgICB0aGlzLnkoeSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3BhY2l0eVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgb3BhY2l0eSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdvcGFjaXR5JywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc3Ryb2tlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfFN0cmluZ31cbiAgICAgKi9cbiAgICBzdHJva2UodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlJywgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc3Ryb2tlV2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIHN0cm9rZVdpZHRoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZS13aWR0aCcsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHN0cm9rZURhc2hBcnJheVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzdHJva2VEYXNoQXJyYXkodmFsdWUpIHtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICB1dGlsaXR5LmFzc2VydChfLmlzQXJyYXkodmFsdWUpLCAnTWV0aG9kIGBzdHJva2VEYXNoQXJyYXlgIGV4cGVjdHMgYW4gYXJyYXkgdmFsdWUnKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3N0cm9rZS1kYXNoYXJyYXknLCB2YWx1ZS5qb2luKCcsJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignc3Ryb2tlLWRhc2hhcnJheScpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB6XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt2YWx1ZT11bmRlZmluZWRdXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHoodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGJvdW5kaW5nQm94KCkge1xuXG4gICAgICAgIGxldCByZXN1bHQgPSB7fTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuR0VUX0JPVU5ESU5HX0JPWCwge30sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nVG9Gcm9udFxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgYnJpbmdUb0Zyb250KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgSW5maW5pdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFRvQmFja1xuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgc2VuZFRvQmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cigneicsIC1JbmZpbml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kQmFja3dhcmRzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBzZW5kQmFja3dhcmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgKHRoaXMuZ2V0QXR0cigpLnogLSAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ0ZvcndhcmRzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfE51bWJlcn1cbiAgICAgKi9cbiAgICBicmluZ0ZvcndhcmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCd6JywgKHRoaXMuZ2V0QXR0cigpLnogKyAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZXxOdW1iZXJ9XG4gICAgICovXG4gICAgd2lkdGgodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignd2lkdGgnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V8TnVtYmVyfVxuICAgICAqL1xuICAgIGhlaWdodCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdoZWlnaHQnLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGF0dHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT1udWxsXVxuICAgICAqIEByZXR1cm4geyp8dm9pZH1cbiAgICAgKi9cbiAgICBhdHRyKHByb3BlcnR5LCB2YWx1ZSA9IG51bGwpIHtcblxuICAgICAgICBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyKClbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1vZGVsICAgICAgID0ge307XG4gICAgICAgIG1vZGVsW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKG1vZGVsKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0clxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIHNldEF0dHIoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURV9TRVQsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHV0aWxpdHkua2ViYWJpZnlLZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHIoKSB7XG5cbiAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwge30sIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdG9TdHJpbmdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2U6ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCBJbnRlcmZhY2VdYDtcblxuICAgIH1cblxufSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vLi4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBGZWF0dXJlcy5cbmltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4vZmVhdHVyZXMvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgTW92YWJsZSAgICBmcm9tICcuL2ZlYXR1cmVzL01vdmFibGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5ncm91cCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRFbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0R3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEdyb3VwKGdyb3VwKSB7XG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldERpc3BhdGNoZXJcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QWNjZXNzb3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYWNjZXNzb3JcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEFjY2Vzc29yKGFjY2Vzc29yKSB7XG4gICAgICAgIHRoaXMuYWNjZXNzb3IgPSBhY2Nlc3NvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldE9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIGJlIG92ZXJ3cml0dGVuIGZvciBzaGFwZSB0eXBlcyB0aGF0IGhhdmUgYSBkaWZmZXJlbnQgbmFtZSB0byB0aGVpciBTVkcgdGFnIG5hbWUsIHN1Y2ggYXMgYSBgZm9yZWlnbk9iamVjdGBcbiAgICAgKiBlbGVtZW50IHVzaW5nIHRoZSBgcmVjdGAgc2hhcGUgbmFtZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0TmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXROYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYWcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEludGVyZmFjZVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBnZXRJbnRlcmZhY2UoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuaW50ZXJmYWNlID09PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gdGhpcy5hZGRJbnRlcmZhY2UoKTtcbiAgICAgICAgICAgIGxldCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlLnNldERpc3BhdGNoZXIoZGlzcGF0Y2hlcik7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGxldCBnZXRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHpJbmRleCA9IHsgejogZDMuc2VsZWN0KHRoaXMuZWxlbWVudC5ub2RlKCkucGFyZW50Tm9kZSkuZGF0dW0oKS56IH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsICA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpLCB6SW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1dGlsaXR5LnJldHJhbnNmb3JtQXR0cmlidXRlcyhtb2RlbCk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyB0aGF0IGhvb2sgdXAgdGhlIGludGVyZmFjZSBhbmQgdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfR0VUX0FMTCwgICAgICAgIGdldEF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLlJFTU9WRSwgKG1vZGVsKSAgICAgICAgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFTU9WRSwgbW9kZWwpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5BVFRSSUJVVEVfU0VULCAobW9kZWwpID0+IHsgdGhpcy5zZXRBdHRyaWJ1dGVzKG1vZGVsLmF0dHJpYnV0ZXMpOyB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5HRVRfQk9VTkRJTkdfQk9YLCAoKSA9PiAgICAgICB0aGlzLmdldEJvdW5kaW5nQm94KCkpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcmZhY2U7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEJvdW5kaW5nQm94XG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ncm91cC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldEF0dHJpYnV0ZXMoYXR0cmlidXRlcyA9IHt9KSB7XG5cbiAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKHRoaXMuZWxlbWVudC5kYXR1bSgpIHx8IHt9LCBhdHRyaWJ1dGVzKTtcbiAgICAgICAgYXR0cmlidXRlcyA9IHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhhdHRyaWJ1dGVzKTtcblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoYXR0cmlidXRlcy56KSkge1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBkZXZlbG9wZXIgc3BlY2lmaWVzIHRoZSBgemAgYXR0cmlidXRlLCBpdCBhY3R1YWxseSBwZXJ0YWlucyB0byB0aGUgZ3JvdXBcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdGhhdCB0aGUgc2hhcGUgaXMgYSBjaGlsZCBvZi4gV2UnbGwgdGhlcmVmb3JlIG5lZWQgdG8gcmVtb3ZlIHRoZSBgemAgcHJvcGVydHlcbiAgICAgICAgICAgIC8vIGZyb20gdGhlIGBhdHRyaWJ1dGVzYCBvYmplY3QsIGFuZCBpbnN0ZWFkIGFwcGx5IGl0IHRvIHRoZSBzaGFwZSdzIGdyb3VwIGVsZW1lbnQuXG4gICAgICAgICAgICAvLyBBZnRlcndhcmRzIHdlJ2xsIG5lZWQgdG8gYnJvYWRjYXN0IGFuIGV2ZW50IHRvIHJlb3JkZXIgdGhlIGVsZW1lbnRzIHVzaW5nIEQzJ3MgbWFnaWNhbFxuICAgICAgICAgICAgLy8gYHNvcnRgIG1ldGhvZC5cbiAgICAgICAgICAgIGxldCBncm91cCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQubm9kZSgpLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgZ3JvdXAuZGF0dW0oeyB6OiBhdHRyaWJ1dGVzLnogfSk7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy56O1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlJFT1JERVIsIHtcbiAgICAgICAgICAgICAgICBncm91cDogZ3JvdXBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0dW0oYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuZWxlbWVudC5kYXR1bSgpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSB7fTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkRWxlbWVudHMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEZlYXR1cmVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRGZWF0dXJlcygpIHtcblxuICAgICAgICB0aGlzLmZlYXR1cmVzID0ge1xuICAgICAgICAgICAgc2VsZWN0YWJsZTogbmV3IFNlbGVjdGFibGUodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IpLFxuICAgICAgICAgICAgbW92YWJsZTogICAgbmV3IE1vdmFibGUodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldEFjY2Vzc29yKHRoaXMuYWNjZXNzb3IpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGxldCB0YWcgPSB0aGlzLmdldFRhZygpLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5nZXRUYWcoKS5zbGljZSgxKTtcblxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfTogJHt0aGlzLmxhYmVsfV1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGBbb2JqZWN0ICR7dGFnfV1gO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IEZlYXR1cmUgIGZyb20gJy4vLi4vRmVhdHVyZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi8uLi8uLi9oZWxwZXJzL1JlZ2lzdHJ5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1vdmFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmFibGUgZXh0ZW5kcyBGZWF0dXJlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TW92YWJsZX1cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuXG4gICAgICAgIHN1cGVyKHNoYXBlKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3BlcnR5IHN0YXJ0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnN0YXJ0ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJvdW5kaW5nIGJveCBvZiB0aGUgZWxlbWVudChzKSB0aGF0IGFyZSBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByb3BlcnR5IGJvdW5kaW5nQm94XG4gICAgICAgICAqIEB0eXBlIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ib3VuZGluZ0JveCA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgICAgIGxldCBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldLFxuICAgICAgICAgICAgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV0sXG4gICAgICAgICAgICBkcmFnRW5kICAgPSBbJ2RyYWdlbmQnLCAgICgpID0+IHRoaXMuZHJhZ0VuZCgpXTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKC4uLmRyYWdTdGFydCkub24oLi4uZHJhZykub24oLi4uZHJhZ0VuZCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudHNcbiAgICAgKiBAcGFyYW0ge0Rpc3BhdGNoZXJ9IGRpc3BhdGNoZXJcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGFkZEV2ZW50cyhkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW52b2tlSWZTZWxlY3RlZFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGxldCBpbnZva2VJZlNlbGVjdGVkID0gKGZuLCBtb2RlbCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBbbW9kZWxdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIGRpc3BhdGNoZXIubGlzdGVuKEV2ZW50cy5NT1ZFX0xFRlQsICAobW9kZWwpID0+IGludm9rZUlmU2VsZWN0ZWQodGhpcy5tb3ZlTGVmdCwgbW9kZWwpKTtcbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfUklHSFQsIChtb2RlbCkgPT4gaW52b2tlSWZTZWxlY3RlZCh0aGlzLm1vdmVSaWdodCwgbW9kZWwpKTtcbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfVVAsICAgIChtb2RlbCkgPT4gaW52b2tlSWZTZWxlY3RlZCh0aGlzLm1vdmVVcCwgbW9kZWwpKTtcbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLk1PVkVfRE9XTiwgIChtb2RlbCkgPT4gaW52b2tlSWZTZWxlY3RlZCh0aGlzLm1vdmVEb3duLCBtb2RlbCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlTGVmdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgbW92ZUxlZnQobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpIC0gbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZVJpZ2h0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlUmlnaHQobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS54KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpICsgbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZVVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1vZGVsXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBtb3ZlVXAobW9kZWwpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS55KHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSgpIC0gbW9kZWwuYnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbW92ZURvd25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVEb3duKG1vZGVsKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueSh0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoKSArIG1vZGVsLmJ5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdTdGFydFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ1N0YXJ0KHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAhXy5pc051bGwoeCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WCAtIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkueCgpLFxuICAgICAgICAgICAgeTogIV8uaXNOdWxsKHkpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFkgLSB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5DUkVBVEVfQk9VTkRJTkdfQk9YKTtcbiAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdkcmFnZ2luZycsIHRydWUpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFttdWx0aXBsZU9mPXJlZ2lzdHJ5LnNuYXBHcmlkXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSByZWdpc3RyeS5zbmFwR3JpZCkge1xuXG4gICAgICAgIHggPSAhXy5pc051bGwoeCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WDtcbiAgICAgICAgeSA9ICFfLmlzTnVsbCh5KSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZO1xuXG4gICAgICAgIGxldCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgIG1ZID0gKHkgLSB0aGlzLnN0YXJ0LnkpLFxuICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLngoZVgpO1xuICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnkoZVkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnRW5kXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnRW5kKCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdyb3VwLmNsYXNzZWQoJ2RyYWdnaW5nJywgZmFsc2UpO1xuICAgIH1cblxufSIsImltcG9ydCBGZWF0dXJlICBmcm9tICcuLy4uL0ZlYXR1cmUuanMnO1xuaW1wb3J0IEV2ZW50cyAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9FdmVudHMuanMnO1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vLi4vLi4vaGVscGVycy9SZWdpc3RyeS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTZWxlY3RhYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIGV4dGVuZHMgRmVhdHVyZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NlbGVjdGFibGV9XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICBzdXBlcihzaGFwZSk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBpc1NlbGVjdGVkID0gdGhpcy5zZWxlY3RlZDtcblxuICAgICAgICAgICAgaWYgKCFyZWdpc3RyeS5rZXlzLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb2YgdGhlIHNoYXBlcyBpbmNsdWRpbmcgdGhlIGN1cnJlbnQgb25lLCBhcyB0aGlzIGtlZXBzIHRoZSBsb2dpYyBzaW1wbGVyLiBXZSB3aWxsXG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdGhlIGN1cnJlbnQgc2hhcGUgdG8gYmUgc2VsZWN0ZWQgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWlzU2VsZWN0ZWQgfHwgdGhpcy5hY2Nlc3Nvci5nZXRDb3VudCgpID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTaW1wbHkgc2VsZWN0IHRoZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmFjY2Vzc29yLmdldENvdW50KCkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRXZlbnRzXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRFdmVudHMoZGlzcGF0Y2hlcikge1xuICAgICAgICBkaXNwYXRjaGVyLmxpc3RlbihFdmVudHMuU0VMRUNUX0FMTCwgICAoKSA9PiB0aGlzLnNlbGVjdCgpKTtcbiAgICAgICAgZGlzcGF0Y2hlci5saXN0ZW4oRXZlbnRzLkRFU0VMRUNUX0FMTCwgKCkgPT4gdGhpcy5kZXNlbGVjdCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5jbGFzc2VkKCdzZWxlY3RlZCcsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5zaGFwZS5nZXRJbnRlcmZhY2UoKS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ2V0SW50ZXJmYWNlKCkuc3Ryb2tlKCcjMzMzJykuc3Ryb2tlV2lkdGgoMSk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3QoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUuZ3JvdXAuY2xhc3NlZCgnc2VsZWN0ZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLmRlc2VsZWN0KCk7XG4gICAgICAgICAgICB0aGlzLnNoYXBlLmdldEludGVyZmFjZSgpLnN0cm9rZSgnbm9uZScpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgSW50ZXJmYWNlIGZyb20gJy4vLi4vSW50ZXJmYWNlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIENpcmNsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSBleHRlbmRzIEludGVyZmFjZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGZpbGxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgZmlsbCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdmaWxsJywgdmFsdWUpO1xuICAgIH1cblxufSIsImltcG9ydCBJbnRlcmZhY2UgZnJvbSAnLi8uLi9JbnRlcmZhY2UuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBmaWxsKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2ZpbGwnLCB2YWx1ZSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IFNoYXBlICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBJbnRlcmZhY2UgZnJvbSAnLi8uLi9pbnRlcmZhY2VzL0NpcmNsZS5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgIGZyb20gJy4vLi4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIENpcmNsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2lyY2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ2NpcmNsZSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRJbnRlcmZhY2VcbiAgICAgKiBAcmV0dXJuIHtJbnRlcmZhY2V9XG4gICAgICovXG4gICAgYWRkSW50ZXJmYWNlKCkge1xuICAgICAgICByZXR1cm4gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYWRkQXR0cmlidXRlcygpIHtcbiAgICAgICAgbGV0IHRyYW5zZm9ybSA9IHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oMjAwLCAyMDApLnRyYW5zZm9ybTtcbiAgICAgICAgcmV0dXJuIHsgZmlsbDogJ3JlZCcsIHdpZHRoOiAxMDAsIGhlaWdodDogMTAwLCByOiA1MCwgdHJhbnNmb3JtOiB0cmFuc2Zvcm0gfTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgICAgIGZyb20gJy4vLi4vU2hhcGUuanMnO1xuaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL2ludGVyZmFjZXMvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRUYWdcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0VGFnKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkSW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGFkZEludGVyZmFjZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcmZhY2UodGhpcy5sYWJlbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCB9O1xuICAgIH1cblxufSJdfQ==
