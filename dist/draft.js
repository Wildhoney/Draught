(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./dispatcher/Dispatcher.js"));

var Events = _interopRequire(require("./dispatcher/Events.js"));

var Rectangle = _interopRequire(require("./components/shape/Rectangle.js"));

//import Zed        from './helpers/Zed.js';

var Draft = (function () {

    /**
     * @constructor
     * @param {SVGElement|String} element
     * @param {Object} options
     * @return {Draft}
     */

    function Draft(element, options) {
        var _this = this;

        _classCallCheck(this, Draft);

        this.shapes = [];
        this.keyboard = { multiSelect: false, aspectRatio: false };
        //this.options    = Object.assign(this.getOptions(), options);
        this.options = this.getOptions();
        this.dispatcher = new Dispatcher();

        // Responsible for setting up Mousetrap events, if it's available, otherwise all attached
        // events will be ghost events.
        (function (mousetrap) {

            // Select all of the available shapes.
            mousetrap.bind("mod+a", function () {
                return _this.dispatcher.send(Events.SELECT_ALL);
            });

            // Multi-selecting shapes.
            mousetrap.bind("mod", function () {
                return _this.keys.multiSelect = true;
            }, "keydown");
            mousetrap.bind("mod", function () {
                return _this.keys.multiSelect = false;
            }, "keyup");

            // Maintain aspect ratios when resizing.
            mousetrap.bind("shift", function () {
                return _this.keys.aspectRatio = true;
            }, "keydown");
            mousetrap.bind("shift", function () {
                return _this.keys.aspectRatio = false;
            }, "keyup");
        })(Mousetrap || { bind: function () {} });

        // Voila...
        this.svg = d3.select(typeof element === "string" ? document.querySelector(element) : element).attr("width", this.options.documentWidth).attr("height", this.options.documentHeight).on("click", function () {
            return _this.dispatcher.send(Events.DESELECT_ALL);
        });

        // Add groups to the SVG element.
        this.groups = {
            shapes: this.svg.append("g").attr("class", "shapes").on("click", function () {
                return d3.event.stopPropagation();
            }),
            handles: this.svg.append("g").attr("class", "handles").on("click", function () {
                return d3.event.stopPropagation();
            })
        };
    }

    _createClass(Draft, {
        add: {

            /**
             * @method add
             * @param {String} name
             * @return {Facade}
             */

            value: function add(name) {

                var shape = this.getInstance(name),
                    facade = shape.getFacade();

                this.shapes.push(facade);
                return facade;
            }
        },
        remove: {

            /**
             * @method remove
             * @param facade {Facade}
             * @return {void}
             */

            value: function remove(facade) {
                facade.remove();
            }
        },
        getSelected: {

            /**
             * @method getSelected
             * @return {Array}
             */

            value: function getSelected() {
                return this.shapes.filter(function (shape) {
                    return shape.isSelected();
                });
            }
        },
        getAccessor: {

            /**
             * Accessors that are accessible by the shapes and their associated facades.
             *
             * @method getAccessor
             * @return {Object}
             */

            value: function getAccessor() {
                var _this = this;

                return {
                    getSelected: this.getSelected.bind(this),
                    groups: this.groups,
                    selectAll: function () {
                        return _this.dispatcher.send(Events.SELECT_ALL);
                    },
                    deselectAll: function () {
                        return _this.dispatcher.send(Events.DESELECT_ALL);
                    }
                };
            }
        },
        getInstance: {

            /**
             * @method getInstance
             * @param {String} name
             * @return {Shape}
             */

            value: function getInstance(name) {

                var map = {
                    rect: Rectangle
                };

                // Instantiate the shape object, and inject the accessor and listener.
                var shape = new (map[name.toLowerCase()])();
                shape.setAccessor(this.getAccessor());
                shape.setDispatcher(this.dispatcher);
                shape.insert(this.groups.shapes);
                return shape;
            }
        },
        getOptions: {

            /**
             * @method getOptions
             * @return {Object}
             */

            value: function getOptions() {

                return {
                    documentHeight: "100%",
                    documentWidth: "100%",
                    gridSize: 10
                };
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

},{"./components/shape/Rectangle.js":5,"./dispatcher/Dispatcher.js":7,"./dispatcher/Events.js":8}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Facade = (function () {

    /**
     * @constructor
     * @param {Shape} shape
     * @return {Facade}
     */

    function Facade(shape) {
        _classCallCheck(this, Facade);

        this.shape = shape;
        this.selected = false;
    }

    _createClass(Facade, {
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {
                this.shape.features.selectable.select();
                this.selected = true;
            }
        },
        deselect: {

            /**
             * @method deselect
             * @return {void}
             */

            value: function deselect() {
                this.shape.features.selectable.deselect();
                this.selected = false;
            }
        },
        invert: {

            /**
             * @method invert
             * @return {void}
             */

            value: function invert() {
                this.selected = !this.selected;
            }
        },
        attribute: {

            /**
             * @method attribute
             * @param {String} property
             * @param {*} [value=null]
             * @return {*}
             */

            value: function attribute(property) {
                var value = arguments[1] === undefined ? null : arguments[1];

                if (value === null) {
                    return this.shape.element.attr(property);
                }

                this.shape.element.datum()[property] = value;
                this.shape.element.attr(property, value);
                return this;
            }
        },
        transform: {

            /**
             * @method transform
             * @param {Number} x
             * @param {Number} y
             * @return {*}
             */

            value: function transform(x, y) {
                return this.attribute("transform", "translate(" + x + ", " + y + ")");
            }
        },
        x: {

            /**
             * @method x
             * @param {Number} [x=null]
             * @return {*}
             */

            value: (function (_x) {
                var _xWrapper = function x() {
                    return _x.apply(this, arguments);
                };

                _xWrapper.toString = function () {
                    return _x.toString();
                };

                return _xWrapper;
            })(function () {
                var x = arguments[0] === undefined ? null : arguments[0];

                if (x === null) {
                    return this.parseTranslate(this.shape.element.datum().transform).x;
                }

                return this.transform(x, this.y());
            })
        },
        y: {

            /**
             * @method y
             * @param {Number} [y=null]
             * @return {*}
             */

            value: (function (_y) {
                var _yWrapper = function y() {
                    return _y.apply(this, arguments);
                };

                _yWrapper.toString = function () {
                    return _y.toString();
                };

                return _yWrapper;
            })(function () {
                var y = arguments[0] === undefined ? null : arguments[0];

                if (y === null) {
                    return this.parseTranslate(this.shape.element.datum().transform).y;
                }

                return this.transform(this.x(), y);
            })
        },
        dimension: {

            /**
             * @method dimension
             * @param {Number} height
             * @param {Number} width
             * @return {*}
             */

            value: function dimension(height, width) {
                return this.height(height).width(width);
            }
        },
        height: {

            /**
             * @method height
             * @param {Number} [height]
             * @return {*}
             */

            value: (function (_height) {
                var _heightWrapper = function height(_x2) {
                    return _height.apply(this, arguments);
                };

                _heightWrapper.toString = function () {
                    return _height.toString();
                };

                return _heightWrapper;
            })(function (height) {
                return this.attribute("height", height);
            })
        },
        width: {

            /**
             * @method width
             * @param {Number} [width]
             * @return {*}
             */

            value: (function (_width) {
                var _widthWrapper = function width(_x3) {
                    return _width.apply(this, arguments);
                };

                _widthWrapper.toString = function () {
                    return _width.toString();
                };

                return _widthWrapper;
            })(function (width) {
                return this.attribute("width", width);
            })
        },
        getShape: {

            /**
             * @method getShape
             * @return {Shape}
             */

            value: function getShape() {
                return this.shape;
            }
        },
        parseTranslate: {

            /**
             * @method parseTranslate
             * @param {String} transform
             * @return {Object}
             */

            value: function parseTranslate(transform) {
                var result = String(transform).match(/translate\(([0-9]+)\s*,\s*([0-9]+)/i);
                return { x: result[1], y: result[2] };
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
        }
    });

    return Facade;
})();

module.exports = Facade;

},{}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Selectable = _interopRequire(require("./shape/feature/Selectable.js"));

var Events = _interopRequire(require("./../dispatcher/Events.js"));

var Shape = (function () {

    /**
     * @constructor
     * @return {Rectangle}
     */

    function Shape() {
        _classCallCheck(this, Shape);

        this.features = {
            selectable: new Selectable(this)
        };
    }

    _createClass(Shape, {
        getName: {

            /**
             * @method getName
             * @return {String}
             */

            value: function getName() {
                return this.getTag();
            }
        },
        insert: {

            /**
             * @method insert
             * @param {Object} group
             * @return {void}
             */

            value: function insert(group) {
                this.element = group.append(this.getTag()).datum({
                    transform: "translate(0,0)"
                });
            }
        },
        getFacade: {

            /**
             * @method getFacade
             * @return {Facade}
             */

            value: function getFacade() {
                return this.facade;
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
        setDispatcher: {

            /**
             * @method setDispatcher
             * @param {Dispatcher} dispatcher
             * @return {void}
             */

            value: function setDispatcher(dispatcher) {
                var _this = this;

                this.dispatcher = dispatcher;

                dispatcher.on(Events.SELECT_ALL, function () {
                    return _this.getFacade().select();
                });
                dispatcher.on(Events.DESELECT_ALL, function () {
                    return _this.getFacade().deselect();
                });
            }
        }
    });

    return Shape;
})();

module.exports = Shape;

},{"./../dispatcher/Events.js":8,"./shape/feature/Selectable.js":6}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Facade = _interopRequire(require("./../Facade.js"));

var Rectangle = (function (_Facade) {
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        if (_Facade != null) {
            _Facade.apply(this, arguments);
        }
    }

    _inherits(Rectangle, _Facade);

    _createClass(Rectangle, {
        fill: {

            /**
             * @method fill
             * @param {String} colour
             * @return {Rectangle}
             */

            value: function fill(colour) {
                return this.attribute("fill", colour);
            }
        }
    });

    return Rectangle;
})(Facade);

module.exports = Rectangle;

},{"./../Facade.js":2}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Shape = _interopRequire(require("./../Shape.js"));

var Facade = _interopRequire(require("./../facade/Rectangle.js"));

var Rectangle = (function (_Shape) {

    /**
     * @constructor
     * @return {Rectangle}
     */

    function Rectangle() {
        _classCallCheck(this, Rectangle);

        _get(Object.getPrototypeOf(Rectangle.prototype), "constructor", this).call(this);
        this.facade = new Facade(this);
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
        }
    });

    return Rectangle;
})(Shape);

module.exports = Rectangle;

},{"./../Shape.js":3,"./../facade/Rectangle.js":4}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Selectable = (function () {

    /**
     * @constructor
     * @param {Shape} shape
     * @return {Selectable}
     */

    function Selectable(shape) {
        _classCallCheck(this, Selectable);

        this.shape = shape;
    }

    _createClass(Selectable, {
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {
                console.log("Here");
                //console.log(this.shape);
                this.shape.selected = true;
            }
            //
            ///**
            // * @method deselect
            // * @return {void}
            // */
            //deselect() {
            //    this.shape.selected = false;
            //}

        }
    });

    return Selectable;
})();

module.exports = Selectable;

},{}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = (function () {

    /**
     * @constructor
     * @return {Dispatcher}
     */

    function Dispatcher() {
        _classCallCheck(this, Dispatcher);

        this.events = [];
    }

    _createClass(Dispatcher, {
        send: {

            /**
             * @method send
             * @param {String} eventName
             * @return {void}
             */

            value: function send(eventName) {

                if (!this.events.hasOwnProperty(eventName)) {
                    return;
                }

                this.events[eventName].forEach(function (fn) {
                    return fn();
                });
            }
        },
        on: {

            /**
             * @method on
             * @param {String} eventName
             * @param {Function} fn
             * @return {void}
             */

            value: function on(eventName, fn) {

                if (!this.events.hasOwnProperty(eventName)) {
                    this.events[eventName] = [];
                }

                this.events[eventName].push(fn);
            }
        }
    });

    return Dispatcher;
})();

module.exports = Dispatcher;

},{}],8:[function(require,module,exports){
"use strict";

module.exports = {

    SELECT_ALL: "select-all",
    DESELECT_ALL: "deselect"

};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLFNBQVMsMkJBQU8saUNBQWlDOzs7O0lBR2xELEtBQUs7Ozs7Ozs7OztBQVFJLGFBUlQsS0FBSyxDQVFLLE9BQU8sRUFBRSxPQUFPLEVBQUU7Ozs4QkFSNUIsS0FBSzs7QUFVSCxZQUFJLENBQUMsTUFBTSxHQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsUUFBUSxHQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7O0FBRTdE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Q3hDLHdCQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztpQkFDL0I7O0FBRUQsb0JBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBRW5DOzs7O1dBdkNnQixVQUFVOzs7aUJBQVYsVUFBVTs7Ozs7aUJDQWhCOztBQUVYLGNBQVUsRUFBSSxZQUFZO0FBQzFCLGdCQUFZLEVBQUUsVUFBVTs7Q0FFM0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyL0Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IEV2ZW50cyAgICAgZnJvbSAnLi9kaXNwYXRjaGVyL0V2ZW50cy5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlICBmcm9tICcuL2NvbXBvbmVudHMvc2hhcGUvUmVjdGFuZ2xlLmpzJztcbi8vaW1wb3J0IFplZCAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1plZC5qcyc7XG5cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudHxTdHJpbmd9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge0RyYWZ0fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICB0aGlzLnNoYXBlcyAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5rZXlib2FyZCAgID0geyBtdWx0aVNlbGVjdDogZmFsc2UsIGFzcGVjdFJhdGlvOiBmYWxzZSB9O1xuICAgICAgICAvL3RoaXMub3B0aW9ucyAgICA9IE9iamVjdC5hc3NpZ24odGhpcy5nZXRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSB0aGlzLmdldE9wdGlvbnMoKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcblxuICAgICAgICAvLyBSZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBNb3VzZXRyYXAgZXZlbnRzLCBpZiBpdCdzIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGFsbCBhdHRhY2hlZFxuICAgICAgICAvLyBldmVudHMgd2lsbCBiZSBnaG9zdCBldmVudHMuXG4gICAgICAgICgobW91c2V0cmFwKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgb2YgdGhlIGF2YWlsYWJsZSBzaGFwZXMuXG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCkpO1xuXG4gICAgICAgICAgICAvLyBNdWx0aS1zZWxlY3Rpbmcgc2hhcGVzLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gdGhpcy5rZXlzLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHRoaXMua2V5cy5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAgICAgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvcyB3aGVuIHJlc2l6aW5nLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gdGhpcy5rZXlzLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHRoaXMua2V5cy5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICB9KShNb3VzZXRyYXAgfHwgeyBiaW5kOiAoKSA9PiB7fSB9KTtcblxuICAgICAgICAvLyBWb2lsYS4uLlxuICAgICAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudEhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgLy8gQWRkIGdyb3VwcyB0byB0aGUgU1ZHIGVsZW1lbnQuXG4gICAgICAgIHRoaXMuZ3JvdXBzID0ge1xuICAgICAgICAgICAgc2hhcGVzOiAgdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpLFxuICAgICAgICAgICAgaGFuZGxlczogdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnaGFuZGxlcycpLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIGxldCBzaGFwZSAgPSB0aGlzLmdldEluc3RhbmNlKG5hbWUpLFxuICAgICAgICAgICAgZmFjYWRlID0gc2hhcGUuZ2V0RmFjYWRlKCk7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMucHVzaChmYWNhZGUpO1xuICAgICAgICByZXR1cm4gZmFjYWRlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0gZmFjYWRlIHtGYWNhZGV9XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoZmFjYWRlKSB7XG4gICAgICAgIGZhY2FkZS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZ2V0U2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5maWx0ZXIoKHNoYXBlKSA9PiBzaGFwZS5pc1NlbGVjdGVkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29ycyB0aGF0IGFyZSBhY2Nlc3NpYmxlIGJ5IHRoZSBzaGFwZXMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgZmFjYWRlcy5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0QWNjZXNzb3JcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QWNjZXNzb3IoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldFNlbGVjdGVkOiAgICAgICB0aGlzLmdldFNlbGVjdGVkLmJpbmQodGhpcyksXG4gICAgICAgICAgICBncm91cHM6ICAgICAgICAgICAgdGhpcy5ncm91cHMsXG4gICAgICAgICAgICBzZWxlY3RBbGw6ICAgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVF9BTEwpLFxuICAgICAgICAgICAgZGVzZWxlY3RBbGw6ICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldEluc3RhbmNlKG5hbWUpIHtcblxuICAgICAgICBsZXQgbWFwID0ge1xuICAgICAgICAgICAgcmVjdDogUmVjdGFuZ2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW5zdGFudGlhdGUgdGhlIHNoYXBlIG9iamVjdCwgYW5kIGluamVjdCB0aGUgYWNjZXNzb3IgYW5kIGxpc3RlbmVyLlxuICAgICAgICBsZXQgc2hhcGUgPSBuZXcgbWFwW25hbWUudG9Mb3dlckNhc2UoKV0oKTtcbiAgICAgICAgc2hhcGUuc2V0QWNjZXNzb3IodGhpcy5nZXRBY2Nlc3NvcigpKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5pbnNlcnQodGhpcy5ncm91cHMuc2hhcGVzKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldE9wdGlvbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gbWFpbigkd2luZG93KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIEthbGlua2EsIGthbGlua2EsIGthbGlua2EgbW95YSFcbiAgICAvLyBWIHNhZHUgeWFnb2RhIG1hbGlua2EsIG1hbGlua2EgbW95YSFcbiAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbn0pKHdpbmRvdyk7IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFjYWRlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgICAgPSBzaGFwZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZmVhdHVyZXMuc2VsZWN0YWJsZS5zZWxlY3QoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZmVhdHVyZXMuc2VsZWN0YWJsZS5kZXNlbGVjdCgpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnZlcnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGludmVydCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9ICF0aGlzLnNlbGVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUgPSBudWxsKSB7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFwZS5lbGVtZW50LmF0dHIocHJvcGVydHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKClbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2hhcGUuZWxlbWVudC5hdHRyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cmFuc2Zvcm1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oeCwgeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHgoeCA9IG51bGwpIHtcblxuICAgICAgICBpZiAoeCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VUcmFuc2xhdGUodGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKCkudHJhbnNmb3JtKS54O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKHgsIHRoaXMueSgpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgeSh5ID0gbnVsbCkge1xuXG4gICAgICAgIGlmICh5ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVRyYW5zbGF0ZSh0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKS50cmFuc2Zvcm0pLnk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0odGhpcy54KCksIHkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBkaW1lbnNpb24oaGVpZ2h0LCB3aWR0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQoaGVpZ2h0KS53aWR0aCh3aWR0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGhlaWdodChoZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgd2lkdGgod2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcGFyc2VUcmFuc2xhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNmb3JtXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHBhcnNlVHJhbnNsYXRlKHRyYW5zZm9ybSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gU3RyaW5nKHRyYW5zZm9ybSkubWF0Y2goL3RyYW5zbGF0ZVxcKChbMC05XSspXFxzKixcXHMqKFswLTldKykvaSk7XG4gICAgICAgIHJldHVybiB7IHg6IHJlc3VsdFsxXSwgeTogcmVzdWx0WzJdIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL3NoYXBlL2ZlYXR1cmUvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVjdGFuZ2xlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXROYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBpbnNlcnQoZ3JvdXApIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZ3JvdXAuYXBwZW5kKHRoaXMuZ2V0VGFnKCkpLmRhdHVtKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgwLDApJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEZhY2FkZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBnZXRGYWNhZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhY2FkZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEFjY2Vzc29yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFjY2Vzc29yXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRBY2Nlc3NvcihhY2Nlc3Nvcikge1xuICAgICAgICB0aGlzLmFjY2Vzc29yID0gYWNjZXNzb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLlNFTEVDVF9BTEwsICAgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5zZWxlY3QoKSk7XG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLkRFU0VMRUNUX0FMTCwgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5kZXNlbGVjdCgpKTtcblxuICAgIH1cblxufSIsImltcG9ydCBGYWNhZGUgZnJvbSAnLi8uLi9GYWNhZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBGYWNhZGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbG91clxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBmaWxsKGNvbG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ2ZpbGwnLCBjb2xvdXIpO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vLi4vU2hhcGUuanMnO1xuaW1wb3J0IEZhY2FkZSAgICAgZnJvbSAnLi8uLi9mYWNhZGUvUmVjdGFuZ2xlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVjdGFuZ2xlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmFjYWRlID0gbmV3IEZhY2FkZSh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RhYmxlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7U2VsZWN0YWJsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0hlcmUnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNoYXBlKTtcbiAgICAgICAgdGhpcy5zaGFwZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgfVxuICAgIC8vXG4gICAgLy8vKipcbiAgICAvLyAqIEBtZXRob2QgZGVzZWxlY3RcbiAgICAvLyAqIEByZXR1cm4ge3ZvaWR9XG4gICAgLy8gKi9cbiAgICAvL2Rlc2VsZWN0KCkge1xuICAgIC8vICAgIHRoaXMuc2hhcGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAvL31cblxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7RGlzcGF0Y2hlcn1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKGV2ZW50TmFtZSkge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBvbihldmVudE5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldmVudE5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goZm4pO1xuXG4gICAgfVxuXG59IiwiZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgU0VMRUNUX0FMTDogICAnc2VsZWN0LWFsbCcsXG4gICAgREVTRUxFQ1RfQUxMOiAnZGVzZWxlY3QnXG5cbn0iXX0=
