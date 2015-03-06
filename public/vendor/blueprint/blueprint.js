(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

var Groups = _interopRequire(require("./helpers/Groups.js"));

var utility = _interopRequire(require("./helpers/Utility.js"));

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
        this.options = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
        this.groups = new Groups(this.element);
        this.label = _.uniqueId("BP");
        this.map = {};

        // Register our custom shapes.
        this.registerComponent("rect", Rectangle);
    }

    _prototypeProperties(Blueprint, null, {
        add: {

            /**
             * @method add
             * @param {String} name
             * @return {Shape}
             */

            value: function add(name) {

                var shape = this["new"](name);

                // Set all the items required for the shape object.
                shape.setOptions(this.options);
                shape.setDispatcher(this.dispatcher);

                // Insert the shape into D3 and apply the attributes.
                var group = this.groups.shapes,
                    element = group.append("g").attr("data-id", shape.label).append(shape.getTag()).datum(utility.transformAttributes(shape.getAttributes()));
                element.attr(element.datum());

                shape.addElements(element);

                this.shapes.push({
                    shape: shape,
                    "interface": shape.getInterface()
                });

                return shape;
            },
            writable: true,
            configurable: true
        },
        remove: {

            /**
             * @method remove
             * @param {Shape} shape
             * @return {void}
             */

            value: function remove(shape) {
                shape.remove();
                var index = this.shapes.indexOf(shape);
                this.shapes.splice(index, 1);
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
                return new (this.map[name.toLowerCase()])(this.label);
            },
            writable: true,
            configurable: true
        },
        registerComponent: {

            /**
             * @method registerComponent
             * @param {String} name
             * @param {Shape} shape
             * @return {void}
             */

            value: function registerComponent(name, shape) {
                this.map[name] = shape;
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
                return {};
            },
            writable: true,
            configurable: true
        }
    });

    return Blueprint;
})();

(function main($window) {

    "use strict";

    $window.Blueprint = Blueprint;
})(window);

},{"./helpers/Dispatcher.js":2,"./helpers/Groups.js":4,"./helpers/Utility.js":6,"./shapes/types/Rectangle.js":8}],2:[function(require,module,exports){
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
        dispatchEvent: {

            /**
             * @method dispatchEvent
             * @param {String} name
             * @param {Object} [properties={}]
             * @return {void}
             */

            value: function dispatchEvent(name) {
                var properties = arguments[1] === undefined ? {} : arguments[1];

                _.forEach(this.events[name], function (callbackFn) {
                    return callbackFn(properties);
                });
            },
            writable: true,
            configurable: true
        },
        addEventListener: {

            /**
             * @method addEventListener
             * @param {String} name
             * @param {Function} [fn=function noop() {}]
             * @return {void}
             */

            value: function addEventListener(name, fn) {

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
  ATTRIBUTE: "attribute"
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

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

},{}],6:[function(require,module,exports){
"use strict";

/**
 * @module Blueprint
 * @submodule Utility
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
var utility = {

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

        if (attributes.x && attributes.y) {

            // We're using the `transform: translate(x, y)` format instead.
            attributes = _.assign(attributes, utility.pointsToTransform(attributes.x, attributes.y));
            delete attributes.x;
            delete attributes.y;
        }

        return attributes;
    },

    /**
     * @method pointsToTransform
     * @param {Number} x
     * @param {Number} y
     * @return {String}
     */
    pointsToTransform: function pointsToTransform(x, y) {
        return { transform: "translate(" + x + ", " + y + ")" };
    }

};

module.exports = utility;

},{}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = _interopRequire(require("./../helpers/Interface.js"));

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

        this.label = label;
        this["interface"] = null;
    }

    _prototypeProperties(Shape, null, {
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

                if (this["interface"] === null) {
                    this["interface"] = new Interface(this.label);
                }

                if (_.isFunction(this.addMethods)) {
                    this["interface"] = _.assign(this["interface"], this.addMethods());
                }

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

},{"./../helpers/Events.js":3,"./../helpers/Interface.js":5,"./../helpers/Utility.js":6}],8:[function(require,module,exports){
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
                return { fill: "red", width: 100, height: 100, x: 100, y: 20, z: 5 };
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
                    width: function (value) {
                        return _this.dispatchAttributeEvent({ value: value });
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

},{"./../Shape.js":7}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0V2ZW50cy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L09CbHVlcHJpbnQvc3JjL2hlbHBlcnMvR3JvdXBzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvT0JsdWVwcmludC9zcmMvaGVscGVycy9JbnRlcmZhY2UuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL1V0aWxpdHkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvU2hhcGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLHlCQUF5Qjs7SUFDekMsTUFBTSwyQkFBVSxxQkFBcUI7O0lBQ3JDLE9BQU8sMkJBQVMsc0JBQXNCOzs7O0lBR3RDLFNBQVMsMkJBQU8sNkJBQTZCOzs7Ozs7OztJQU85QyxTQUFTOzs7Ozs7Ozs7QUFRQSxhQVJULFNBQVMsQ0FRQyxPQUFPO1lBQUUsT0FBTyxnQ0FBRyxFQUFFOzs4QkFSL0IsU0FBUzs7QUFVUCxZQUFJLENBQUMsT0FBTyxHQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFN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QTFHZ0IsS0FBSzs7O2lCQUFMLEtBQUs7Ozs7Ozs7Ozs7Ozs7SUNWbkIsS0FBSywyQkFBTSxlQUFlOzs7Ozs7Ozs7SUFRWixTQUFTLGNBQVMsS0FBSzthQUF2QixTQUFTOzhCQUFULFNBQVM7O1lBQVMsS0FBSztBQUFMLGlCQUFLOzs7O2NBQXZCLFNBQVMsRUFBUyxLQUFLOzt5QkFBdkIsU0FBUztBQU0xQixjQUFNOzs7Ozs7O21CQUFBLGtCQUFHO0FBQ0wsdUJBQU8sTUFBTSxDQUFDO2FBQ2pCOzs7O0FBTUQscUJBQWE7Ozs7Ozs7bUJBQUEseUJBQUc7QUFDWix1QkFBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDeEU7Ozs7QUFNRCxrQkFBVTs7Ozs7OzttQkFBQSxzQkFBRzs7O0FBRVQsdUJBQU87QUFDSCx5QkFBSyxFQUFFLFVBQUMsS0FBSzsrQkFBSyxNQUFLLHNCQUFzQixDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUFBO2lCQUNsRSxDQUFBO2FBRUo7Ozs7OztXQTVCZ0IsU0FBUztHQUFTLEtBQUs7O2lCQUF2QixTQUFTIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vaGVscGVycy9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBHcm91cHMgICAgIGZyb20gJy4vaGVscGVycy9Hcm91cHMuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuXG4vLyBTaGFwZXMuXG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL3NoYXBlcy90eXBlcy9SZWN0YW5nbGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuY2xhc3MgQmx1ZXByaW50IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QoZWxlbWVudCkuYXR0cignd2lkdGgnLCAnMTAwJScpLmF0dHIoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLmdyb3VwcyAgICAgPSBuZXcgR3JvdXBzKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIHRoaXMubGFiZWwgICAgICA9IF8udW5pcXVlSWQoJ0JQJyk7XG4gICAgICAgIHRoaXMubWFwICAgICAgICA9IHt9O1xuXG4gICAgICAgIC8vIFJlZ2lzdGVyIG91ciBjdXN0b20gc2hhcGVzLlxuICAgICAgICB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KCdyZWN0JywgUmVjdGFuZ2xlKVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgdmFyIHNoYXBlID0gdGhpcy5uZXcobmFtZSk7XG5cbiAgICAgICAgLy8gU2V0IGFsbCB0aGUgaXRlbXMgcmVxdWlyZWQgZm9yIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuXG4gICAgICAgIC8vIEluc2VydCB0aGUgc2hhcGUgaW50byBEMyBhbmQgYXBwbHkgdGhlIGF0dHJpYnV0ZXMuXG4gICAgICAgIHZhciBncm91cCAgID0gdGhpcy5ncm91cHMuc2hhcGVzLFxuICAgICAgICAgICAgZWxlbWVudCA9IGdyb3VwLmFwcGVuZCgnZycpLmF0dHIoJ2RhdGEtaWQnLCBzaGFwZS5sYWJlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoc2hhcGUuZ2V0VGFnKCkpLmRhdHVtKHV0aWxpdHkudHJhbnNmb3JtQXR0cmlidXRlcyhzaGFwZS5nZXRBdHRyaWJ1dGVzKCkpKTtcbiAgICAgICAgZWxlbWVudC5hdHRyKGVsZW1lbnQuZGF0dW0oKSk7XG5cbiAgICAgICAgc2hhcGUuYWRkRWxlbWVudHMoZWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMucHVzaCh7XG4gICAgICAgICAgICBzaGFwZTogc2hhcGUsXG4gICAgICAgICAgICBpbnRlcmZhY2U6IHNoYXBlLmdldEludGVyZmFjZSgpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZShzaGFwZSkge1xuICAgICAgICBzaGFwZS5yZW1vdmUoKTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5zaGFwZXMuaW5kZXhPZihzaGFwZSk7XG4gICAgICAgIHRoaXMuc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtTaGFwZVtdfVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLm1hcCgoc2hhcGUpID0+IHNoYXBlLmludGVyZmFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjbGVhclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnNoYXBlcywgKHNoYXBlKSA9PiB0aGlzLnJlbW92ZShzaGFwZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbmV3XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBuZXcobmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMubWFwW25hbWUudG9Mb3dlckNhc2UoKV0odGhpcy5sYWJlbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWdpc3RlckNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlZ2lzdGVyQ29tcG9uZW50KG5hbWUsIHNoYXBlKSB7XG4gICAgICAgIHRoaXMubWFwW25hbWVdID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZWZhdWx0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0T3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gbWFpbigkd2luZG93KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICR3aW5kb3cuQmx1ZXByaW50ID0gQmx1ZXByaW50O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRGlzcGF0Y2hlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlzcGF0Y2hFdmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzPXt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlzcGF0Y2hFdmVudChuYW1lLCBwcm9wZXJ0aWVzID0ge30pIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuZXZlbnRzW25hbWVdLCAoY2FsbGJhY2tGbikgPT4gY2FsbGJhY2tGbihwcm9wZXJ0aWVzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm49ZnVuY3Rpb24gbm9vcCgpIHt9XVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9CbHVlcHJpbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICAgIEFUVFJJQlVURTogJ2F0dHJpYnV0ZSdcbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIEdyb3Vwc1xuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwcyB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fSBlbGVtZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLnNoYXBlcyAgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ3NoYXBlcycsIHRydWUpO1xuICAgICAgICB0aGlzLmhhbmRsZXMgPSBlbGVtZW50LmFwcGVuZCgnZycpLmNsYXNzZWQoJ2hhbmRsZXMnLCB0cnVlKVxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBvYmplY3RcbiAqIEBzdWJtb2R1bGUgSW50ZXJmYWNlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9vYmplY3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJmYWNlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEByZXR1cm4ge0ludGVyZmFjZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihsYWJlbCA9ICcnKSB7XG4gICAgICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRvU3RyaW5nXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlOiAke3RoaXMubGFiZWx9XWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYFtvYmplY3QgSW50ZXJmYWNlXWA7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgQmx1ZXByaW50XG4gKiBAc3VibW9kdWxlIFV0aWxpdHlcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG52YXIgdXRpbGl0eSA9IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGhyb3dFeGNlcHRpb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICB0aHJvd0V4Y2VwdGlvbjogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgdGhyb3cgYEJsdWVwcmludC5qczogJHttZXNzYWdlfS5gO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUF0dHJpYnV0ZXNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm1BdHRyaWJ1dGVzOiAoYXR0cmlidXRlcykgPT4ge1xuXG4gICAgICAgIGlmIChhdHRyaWJ1dGVzLnggJiYgYXR0cmlidXRlcy55KSB7XG5cbiAgICAgICAgICAgIC8vIFdlJ3JlIHVzaW5nIHRoZSBgdHJhbnNmb3JtOiB0cmFuc2xhdGUoeCwgeSlgIGZvcm1hdCBpbnN0ZWFkLlxuICAgICAgICAgICAgYXR0cmlidXRlcyA9IF8uYXNzaWduKGF0dHJpYnV0ZXMsIHV0aWxpdHkucG9pbnRzVG9UcmFuc2Zvcm0oYXR0cmlidXRlcy54LCBhdHRyaWJ1dGVzLnkpKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLng7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy55O1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBvaW50c1RvVHJhbnNmb3JtXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBwb2ludHNUb1RyYW5zZm9ybSh4LCB5KSB7XG4gICAgICAgIHJldHVybiB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCAke3l9KWAgfTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHV0aWxpdHk7IiwiaW1wb3J0IEludGVyZmFjZSBmcm9tICcuLy4uL2hlbHBlcnMvSW50ZXJmYWNlLmpzJztcbmltcG9ydCBFdmVudHMgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgdXRpbGl0eSAgIGZyb20gJy4vLi4vaGVscGVycy9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvQmx1ZXByaW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2xhYmVsPScnXVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGxhYmVsID0gJycpIHtcbiAgICAgICAgdGhpcy5sYWJlbCAgICAgPSBsYWJlbDtcbiAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRPcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW50ZXJmYWNlXG4gICAgICogQHJldHVybiB7SW50ZXJmYWNlfVxuICAgICAqL1xuICAgIGdldEludGVyZmFjZSgpIHtcblxuICAgICAgICBpZiAodGhpcy5pbnRlcmZhY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJmYWNlID0gbmV3IEludGVyZmFjZSh0aGlzLmxhYmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5hZGRNZXRob2RzKSkge1xuICAgICAgICAgICAgdGhpcy5pbnRlcmZhY2UgPSBfLmFzc2lnbih0aGlzLmludGVyZmFjZSwgdGhpcy5hZGRNZXRob2RzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJmYWNlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuYWRkQXR0cmlidXRlcykpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMgPSBfLmFzc2lnbihhdHRyaWJ1dGVzLCB0aGlzLmFkZEF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXR0cmlidXRlcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkRWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRFbGVtZW50cyhlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHRocm93cyBFeGNlcHRpb25cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgdXRpbGl0eS50aHJvd0V4Y2VwdGlvbihgU2hhcGU8JHt0aGlzLmxhYmVsfT4gbXVzdCBkZWZpbmUgYSBcXGBnZXRUYWdcXGAgbWV0aG9kYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaXNwYXRjaEF0dHJpYnV0ZUV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXMgPSB7fVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudChwcm9wZXJ0aWVzID0ge30pIHtcbiAgICAgICAgcHJvcGVydGllcy5lbGVtZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkFUVFJJQlVURSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0b1N0cmluZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcblxuICAgICAgICB2YXIgdGFnID0gdGhpcy5nZXRUYWcoKS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuZ2V0VGFnKCkuc2xpY2UoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ306ICR7dGhpcy5sYWJlbH1dYDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgW29iamVjdCAke3RhZ31dYDtcblxuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSBmcm9tICcuLy4uL1NoYXBlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiB7IGZpbGw6ICdyZWQnLCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCwgeDogMTAwLCB5OiAyMCwgejogNSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkTWV0aG9kc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBhZGRNZXRob2RzKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogKHZhbHVlKSA9PiB0aGlzLmRpc3BhdGNoQXR0cmlidXRlRXZlbnQoeyB2YWx1ZTogdmFsdWUgfSlcbiAgICAgICAgfVxuXG4gICAgfVxuXG59Il19
