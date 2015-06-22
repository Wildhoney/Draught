(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./dispatcher/Dispatcher.js"));

var Events = _interopRequire(require("./dispatcher/Events.js"));

var Rectangle = _interopRequire(require("./components/shape/Rectangle.js"));

var zed = _interopRequire(require("./helpers/Zed.js"));

var BoundingBox = _interopRequire(require("./helpers/BoundingBox.js"));

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

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
        this.index = 1;
        this.keyboard = { multiSelect: false, aspectRatio: false };
        this.options = Object.assign(this.getOptions(), options);
        this.dispatcher = new Dispatcher();
        this.boundingBox = new BoundingBox();
        this.boundingBox.setAccessor(this.getAccessor());

        // Responsible for setting up Mousetrap events, if it's available, otherwise all attached
        // events will be ghost events.
        (function (mousetrap) {

            // Select all of the available shapes.
            mousetrap.bind("mod+a", function () {
                return _this.dispatcher.send(Events.SELECT_ALL);
            });

            // Multi-selecting shapes.
            mousetrap.bind("mod", function () {
                return _this.keyboard.multiSelect = true;
            }, "keydown");
            mousetrap.bind("mod", function () {
                return _this.keyboard.multiSelect = false;
            }, "keyup");

            // Maintain aspect ratios when resizing.
            mousetrap.bind("shift", function () {
                return _this.keyboard.aspectRatio = true;
            }, "keydown");
            mousetrap.bind("shift", function () {
                return _this.keyboard.aspectRatio = false;
            }, "keyup");
        })(Mousetrap || { bind: function () {} });

        // Voila...
        this.svg = d3.select(typeof element === "string" ? document.querySelector(element) : element).attr("width", this.options.documentWidth).attr("height", this.options.documentHeight).on("click", function () {});

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
        on: {

            /**
             * @method on
             * @param {String} eventName
             * @param {Function} fn
             * @return {void}
             */

            value: function on(eventName, fn) {
                this.dispatcher.on(eventName, fn);
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
                    dragBBox: function () {
                        return _this.boundingBox.dragStart();
                    },
                    createBBox: function () {
                        return _this.boundingBox.create(_this.getSelected(), _this.groups.handles);
                    },
                    keyboard: this.keyboard,
                    hasSelected: function () {
                        return _this.dispatcher.send(Events.SELECTED, {
                            shapes: _this.getSelected()
                        });
                    },
                    selectAll: function () {
                        return _this.dispatcher.send(Events.SELECT_ALL);
                    },
                    deselectAll: function () {
                        return _this.dispatcher.send(Events.DESELECT_ALL);
                    },
                    remove: function (facade) {
                        var index = _this.shapes.indexOf(facade);
                        _this.shapes.splice(index, 1);
                    },
                    reorder: function (group) {
                        var groups = _this.svg.selectAll("g.shapes g");
                        zed.reorder(groups, group);
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
                shape.insert(this.groups.shapes, this.index++);
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

/**
 * @property Object.assign
 * @type {Function}
 * @see https://github.com/sindresorhus/object-assign
 */
Object.assign = Object.assign || function assign(target, source) {

    "use strict";

    var from = undefined,
        keys = undefined,
        to = Object(target);

    for (var s = 1; s < arguments.length; s++) {
        from = arguments[s];
        keys = Object.keys(Object(from));

        for (var i = 0; i < keys.length; i++) {
            to[keys[i]] = from[keys[i]];
        }
    }

    return to;
};

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Draft = Draft;
})(window);

//this.dispatcher.send(Events.DESELECT_ALL);

},{"./components/shape/Rectangle.js":5,"./dispatcher/Dispatcher.js":7,"./dispatcher/Events.js":8,"./helpers/BoundingBox.js":9,"./helpers/Zed.js":10}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule Facade
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

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
        remove: {

            /**
             * @method remove
             * @return {void}
             */

            value: function remove() {
                this.shape.group.remove();
                this.shape.accessor.remove(this);
            }
        },
        select: {

            /**
             * @method select
             * @return {Facade}
             */

            value: function select() {
                this.shape.features.selectable.select();
                this.shape.accessor.hasSelected();
                return this;
            }
        },
        deselect: {

            /**
             * @method deselect
             * @return {Facade}
             */

            value: function deselect() {
                this.shape.features.selectable.deselect();
                this.shape.accessor.hasSelected();
                return this;
            }
        },
        selectInvert: {

            /**
             * @method selectInvert
             * @return {Facade}
             */

            value: function selectInvert() {

                if (this.selected) {
                    this.deselect();
                } else {
                    this.select();
                }

                this.shape.accessor.hasSelected();
                return this;
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

                if (property === "z") {

                    // Special behaviour must be applied to the `z` property, because it is applied
                    // to the group element, rather than directly to the shape element.
                    return this.z(value);
                }

                if (value === null) {
                    return this.shape.element.datum()[property];
                }

                this.shape.element.datum()[property] = value;
                this.shape.element.attr(property, value);
                return this;
            }
        },
        transform: {

            /**
             * @method transform
             * @param {Number} [x=null]
             * @param {Number} [y=null]
             * @return {*}
             */

            value: function transform() {
                var x = arguments[0] === undefined ? null : arguments[0];
                var y = arguments[1] === undefined ? null : arguments[1];

                return x === null && y === null ? [this.x(), this.y()] : this.attribute("transform", "translate(" + x + ", " + y + ")");
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

                return x === null ? this.parseTranslate(this.shape.element.datum().transform).x : this.transform(x, this.y());
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

                return y === null ? this.parseTranslate(this.shape.element.datum().transform).y : this.transform(this.x(), y);
            })
        },
        z: {

            /**
             * @method z
             * @param {Number} z
             * @return {*}
             */

            value: (function (_z) {
                var _zWrapper = function z() {
                    return _z.apply(this, arguments);
                };

                _zWrapper.toString = function () {
                    return _z.toString();
                };

                return _zWrapper;
            })(function () {
                var z = arguments[0] === undefined ? null : arguments[0];

                return z === null ? this.shape.group.datum().z : this.shape.group.datum().z = z;
            })
        },
        dimension: {

            /**
             * @method dimension
             * @param {Number} [height=null]
             * @param {Number} [width=null]
             * @return {*}
             */

            value: function dimension() {
                var height = arguments[0] === undefined ? null : arguments[0];
                var width = arguments[1] === undefined ? null : arguments[1];

                return height === null && width === null ? [this.height(), this.width()] : this.height(height).width(width);
            }
        },
        height: {

            /**
             * @method height
             * @param {Number} [height=null]
             * @return {*}
             */

            value: (function (_height) {
                var _heightWrapper = function height() {
                    return _height.apply(this, arguments);
                };

                _heightWrapper.toString = function () {
                    return _height.toString();
                };

                return _heightWrapper;
            })(function () {
                var height = arguments[0] === undefined ? null : arguments[0];

                return this.attribute("height", height);
            })
        },
        width: {

            /**
             * @method width
             * @param {Number} [width=null]
             * @return {*}
             */

            value: (function (_width) {
                var _widthWrapper = function width() {
                    return _width.apply(this, arguments);
                };

                _widthWrapper.toString = function () {
                    return _width.toString();
                };

                return _widthWrapper;
            })(function () {
                var width = arguments[0] === undefined ? null : arguments[0];

                return this.attribute("width", width);
            })
        },
        boundingBox: {

            /**
             * @method boundingBox
             * @return {Object}
             */

            value: function boundingBox() {
                return this.shape.group.node().getBBox();
            }
        },
        bringToFront: {

            /**
             * @method bringToFront
             * @return {Facade}
             */

            value: function bringToFront() {
                this.attribute("z", Infinity);
                this.shape.accessor.reorder(this.shape.group);
                return this;
            }
        },
        bringForwards: {

            /**
             * @method bringForwards
             * @return {Facade}
             */

            value: function bringForwards() {
                this.attribute("z", this.attribute("z") + 1);
                this.shape.accessor.reorder(this.shape.group);
                return this;
            }
        },
        sendToBack: {

            /**
             * @method sendToBack
             * @return {Facade}
             */

            value: function sendToBack() {
                this.attribute("z", -Infinity);
                this.shape.accessor.reorder(this.shape.group);
                return this;
            }
        },
        sendBackwards: {

            /**
             * @method sendBackwards
             * @return {Facade}
             */

            value: function sendBackwards() {
                this.attribute("z", this.attribute("z") - 1);
                this.shape.accessor.reorder(this.shape.group);
                return this;
            }
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
                return { x: parseInt(result[1]), y: parseInt(result[2]) };
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

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Shape = (function () {
    function Shape() {
        _classCallCheck(this, Shape);
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
             * @param {Object} insertionPoint
             * @param {Number} [zValue=0]
             * @return {void}
             */

            value: function insert(insertionPoint) {
                var zValue = arguments[1] === undefined ? 0 : arguments[1];

                this.group = insertionPoint.append("g").attr("class", "shape " + this.getName()).datum({ z: zValue });
                this.element = this.group.append(this.getTag()).datum({ transform: "translate(0,0)" });

                this.features = {
                    selectable: new Selectable(this)
                };
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

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

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

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

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

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Selectable = (function () {

    /**
     * @constructor
     * @param {Shape} shape
     * @return {Selectable}
     */

    function Selectable(shape) {
        var _this = this;

        _classCallCheck(this, Selectable);

        this.shape = shape;
        var element = shape.element,
            keyboard = shape.accessor.keyboard,
            facade = shape.getFacade();

        element.on("mousedown", function () {

            if (_this.clickDisabled) {
                _this.clickDisabled = false;
                return;
            }

            if (keyboard.multiSelect) {
                facade.selectInvert();
                return;
            }

            _this.shape.accessor.deselectAll();
            facade.select();
        });

        shape.element.call(d3.behavior.drag().on("drag", function () {
            _this.clickDisabled = true;
            facade.shape.accessor.dragBBox();
        }));
    }

    _createClass(Selectable, {
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {
                this.shape.getFacade().selected = true;
                this.shape.getFacade().fill("green");
                this.shape.accessor.createBBox();
            }
        },
        deselect: {

            /**
             * @method deselect
             * @return {void}
             */

            value: function deselect() {
                this.shape.getFacade().selected = false;
                this.shape.getFacade().fill("lightgrey");
                this.shape.accessor.createBBox();
            }
        }
    });

    return Selectable;
})();

module.exports = Selectable;

},{}],7:[function(require,module,exports){
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
             * @param {Object} properties
             * @return {void}
             */

            value: function send(eventName, properties) {

                if (!this.events.hasOwnProperty(eventName)) {
                    return;
                }

                this.events[eventName].forEach(function (fn) {
                    return fn(properties);
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
/**
 * @module Draft
 * @submodule Events
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

module.exports = {

  SELECT_ALL: "select-all",
  DESELECT_ALL: "deselect",
  SELECTED: "selected"

};

},{}],9:[function(require,module,exports){
"use strict";

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var BoundingBox = (function () {
    function BoundingBox() {
        _classCallCheck(this, BoundingBox);
    }

    _createClass(BoundingBox, {
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
        create: {

            /**
             * @method create
             * @property {Array} selected
             * @property {Object} group
             * @return {void}
             */

            value: function create(selected, group) {
                var _this = this;

                var _d3$behavior$drag$on$on, _d3$behavior$drag$on, _d3$behavior$drag;

                if (this.bBox) {
                    this.bBox.remove();
                }

                if (selected.length === 0) {
                    return;
                }

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
                compute(selected.map(function (shape) {
                    return shape.boundingBox();
                }));

                this.bBox = group.append("rect").datum(model).classed("drag-box", true)
                //.attr('pointer-events', 'none')
                .attr("x", function (d) {
                    return d.minX;
                }).attr("y", function (d) {
                    return d.minY;
                }).attr("width", function (d) {
                    return d.maxX - d.minX;
                }).attr("height", function (d) {
                    return d.maxY - d.minY;
                });

                var dragStart = ["dragstart", function () {
                    return _this.dragStart();
                }],
                    drag = ["drag", function () {
                    return _this.drag();
                }],
                    dragEnd = ["dragend", function () {
                    return _this.dragEnd();
                }];

                this.bBox.call((_d3$behavior$drag$on$on = (_d3$behavior$drag$on = (_d3$behavior$drag = d3.behavior.drag()).on.apply(_d3$behavior$drag, dragStart)).on.apply(_d3$behavior$drag$on, drag)).on.apply(_d3$behavior$drag$on$on, dragEnd));
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

                console.log("Ah");

                this.start = {
                    x: x !== null ? x : d3.event.sourceEvent.clientX - parseInt(this.bBox.attr("x")),
                    y: y !== null ? y : d3.event.sourceEvent.clientY - parseInt(this.bBox.attr("y"))
                };
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
                var multipleOf = arguments[2] === undefined ? 10 : arguments[2];

                x = x !== null ? x : d3.event.sourceEvent.clientX;
                y = y !== null ? y : d3.event.sourceEvent.clientY;

                var mX = x - this.start.x,
                    mY = y - this.start.y,
                    eX = Math.ceil(mX / multipleOf) * multipleOf,
                    eY = Math.ceil(mY / multipleOf) * multipleOf;

                //console.log(x, y);

                this.bBox.datum().x = eX;
                this.bBox.attr("x", eX);

                this.bBox.datum().y = eY;
                this.bBox.attr("y", eY);
            }
        },
        dragEnd: {

            /**
             * @method dragEnd
             * @return {void}
             */

            value: function dragEnd() {}
        }
    });

    return BoundingBox;
})();

module.exports = BoundingBox;

//this.bBox.remove();

},{}],10:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Zed
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

module.exports = {

    /**
     * @method reorder
     * @param {Array} groups
     * @param {Object} group
     * @return {Object}
     */
    reorder: function reorder(groups, group) {

        "use strict";

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

        groups[0].forEach(function (model) {

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

};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvQm91bmRpbmdCb3guanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9aZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FPLFVBQVUsMkJBQU8sNEJBQTRCOztJQUM3QyxNQUFNLDJCQUFXLHdCQUF3Qjs7SUFDekMsU0FBUywyQkFBUSxpQ0FBaUM7O0lBQ2xELEdBQUcsMkJBQWMsa0JBQWtCOztJQUNuQyxXQUFXLDJCQUFNLDBCQUEwQjs7Ozs7Ozs7SUFPNUMsS0FBSzs7Ozs7Ozs7O0FB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QUFDdEIsd0JBQVEsRUFBRSxDQUFDO2FBQ2Q7O0FBRUQsZ0JBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUN4QixLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzFCLGlCQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLGlCQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBRXRCLENBQUMsQ0FBQzs7O0FBR0gsY0FBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO21CQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FBQSxDQUFDLENBQUM7S0FFcEM7O0NBRUoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IERpc3BhdGNoZXIgIGZyb20gJy4vZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgICBmcm9tICcuL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgICBmcm9tICcuL2NvbXBvbmVudHMvc2hhcGUvUmVjdGFuZ2xlLmpzJztcbmltcG9ydCB6ZWQgICAgICAgICBmcm9tICcuL2hlbHBlcnMvWmVkLmpzJztcbmltcG9ydCBCb3VuZGluZ0JveCBmcm9tICcuL2hlbHBlcnMvQm91bmRpbmdCb3guanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U1ZHRWxlbWVudHxTdHJpbmd9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge0RyYWZ0fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICB0aGlzLnNoYXBlcyAgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICAgPSAxO1xuICAgICAgICB0aGlzLmtleWJvYXJkICAgID0geyBtdWx0aVNlbGVjdDogZmFsc2UsIGFzcGVjdFJhdGlvOiBmYWxzZSB9O1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgID0gT2JqZWN0LmFzc2lnbih0aGlzLmdldE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciAgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgICAgICB0aGlzLmJvdW5kaW5nQm94ID0gbmV3IEJvdW5kaW5nQm94KCk7XG4gICAgICAgIHRoaXMuYm91bmRpbmdCb3guc2V0QWNjZXNzb3IodGhpcy5nZXRBY2Nlc3NvcigpKTtcblxuICAgICAgICAvLyBSZXNwb25zaWJsZSBmb3Igc2V0dGluZyB1cCBNb3VzZXRyYXAgZXZlbnRzLCBpZiBpdCdzIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIGFsbCBhdHRhY2hlZFxuICAgICAgICAvLyBldmVudHMgd2lsbCBiZSBnaG9zdCBldmVudHMuXG4gICAgICAgICgobW91c2V0cmFwKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFNlbGVjdCBhbGwgb2YgdGhlIGF2YWlsYWJsZSBzaGFwZXMuXG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnbW9kK2EnLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCkpO1xuXG4gICAgICAgICAgICAvLyBNdWx0aS1zZWxlY3Rpbmcgc2hhcGVzLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gdGhpcy5rZXlib2FyZC5tdWx0aVNlbGVjdCA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiB0aGlzLmtleWJvYXJkLm11bHRpU2VsZWN0ID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgICAgICAvLyBNYWludGFpbiBhc3BlY3QgcmF0aW9zIHdoZW4gcmVzaXppbmcuXG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiB0aGlzLmtleWJvYXJkLmFzcGVjdFJhdGlvID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHRoaXMua2V5Ym9hcmQuYXNwZWN0UmF0aW8gPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICAgICAgfSkoTW91c2V0cmFwIHx8IHsgYmluZDogKCkgPT4ge30gfSk7XG5cbiAgICAgICAgLy8gVm9pbGEuLi5cbiAgICAgICAgdGhpcy5zdmcgPSBkMy5zZWxlY3QodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtZW50KSA6IGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLm9wdGlvbnMuZG9jdW1lbnRIZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUX0FMTCk7XG4gICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgZ3JvdXBzIHRvIHRoZSBTVkcgZWxlbWVudC5cbiAgICAgICAgdGhpcy5ncm91cHMgPSB7XG4gICAgICAgICAgICBzaGFwZXM6ICB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzaGFwZXMnKS5vbignY2xpY2snLCAoKSA9PiBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKSksXG4gICAgICAgICAgICBoYW5kbGVzOiB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdoYW5kbGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgbGV0IHNoYXBlICA9IHRoaXMuZ2V0SW5zdGFuY2UobmFtZSksXG4gICAgICAgICAgICBmYWNhZGUgPSBzaGFwZS5nZXRGYWNhZGUoKTtcblxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKGZhY2FkZSk7XG4gICAgICAgIHJldHVybiBmYWNhZGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBvbihldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5vbihldmVudE5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSBmYWNhZGUge0ZhY2FkZX1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZShmYWNhZGUpIHtcbiAgICAgICAgZmFjYWRlLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0U2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBnZXRTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjZXNzb3JzIHRoYXQgYXJlIGFjY2Vzc2libGUgYnkgdGhlIHNoYXBlcyBhbmQgdGhlaXIgYXNzb2NpYXRlZCBmYWNhZGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRBY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBY2Nlc3NvcigpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0U2VsZWN0ZWQ6ICAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGdyb3VwczogICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwcyxcbiAgICAgICAgICAgIGRyYWdCQm94OiAgICAoKSAgICAgICA9PiB0aGlzLmJvdW5kaW5nQm94LmRyYWdTdGFydCgpLFxuICAgICAgICAgICAgY3JlYXRlQkJveDogICgpICAgICAgID0+IHRoaXMuYm91bmRpbmdCb3guY3JlYXRlKHRoaXMuZ2V0U2VsZWN0ZWQoKSwgdGhpcy5ncm91cHMuaGFuZGxlcyksXG4gICAgICAgICAgICBrZXlib2FyZDogICAgICAgICAgICAgICAgdGhpcy5rZXlib2FyZCxcbiAgICAgICAgICAgIGhhc1NlbGVjdGVkOiAoKSAgICAgICA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNURUQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFwZXM6IHRoaXMuZ2V0U2VsZWN0ZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzZWxlY3RBbGw6ICAgKCkgICAgICAgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVF9BTEwpLFxuICAgICAgICAgICAgZGVzZWxlY3RBbGw6ICgpICAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpLFxuICAgICAgICAgICAgcmVtb3ZlOiAgICAgIChmYWNhZGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnNoYXBlcy5pbmRleE9mKGZhY2FkZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFwZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW9yZGVyOiAgICAgKGdyb3VwKSAgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBncm91cHMgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJ2cuc2hhcGVzIGcnKTtcbiAgICAgICAgICAgICAgICB6ZWQucmVvcmRlcihncm91cHMsIGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0SW5zdGFuY2UobmFtZSkge1xuXG4gICAgICAgIGxldCBtYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnN0YW50aWF0ZSB0aGUgc2hhcGUgb2JqZWN0LCBhbmQgaW5qZWN0IHRoZSBhY2Nlc3NvciBhbmQgbGlzdGVuZXIuXG4gICAgICAgIGxldCBzaGFwZSA9IG5ldyBtYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSgpO1xuICAgICAgICBzaGFwZS5zZXRBY2Nlc3Nvcih0aGlzLmdldEFjY2Vzc29yKCkpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLmluc2VydCh0aGlzLmdyb3Vwcy5zaGFwZXMsIHRoaXMuaW5kZXgrKyk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuLyoqXG4gKiBAcHJvcGVydHkgT2JqZWN0LmFzc2lnblxuICogQHR5cGUge0Z1bmN0aW9ufVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL29iamVjdC1hc3NpZ25cbiAqL1xuT2JqZWN0LmFzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGxldCBmcm9tLCBrZXlzLCB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgZm9yIChsZXQgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgZnJvbSA9IGFyZ3VtZW50c1tzXTtcbiAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKE9iamVjdChmcm9tKSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG87XG5cbn07XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxufSkod2luZG93KTsiLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRmFjYWRlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGYWNhZGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcbiAgICAgICAgdGhpcy5zaGFwZSAgICA9IHNoYXBlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5ncm91cC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW1vdmUodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLmZlYXR1cmVzLnNlbGVjdGFibGUuc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuaGFzU2VsZWN0ZWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5mZWF0dXJlcy5zZWxlY3RhYmxlLmRlc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuaGFzU2VsZWN0ZWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RJbnZlcnRcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VsZWN0SW52ZXJ0KCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5oYXNTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZShwcm9wZXJ0eSwgdmFsdWUgPSBudWxsKSB7XG5cbiAgICAgICAgaWYgKHByb3BlcnR5ID09PSAneicpIHtcblxuICAgICAgICAgICAgLy8gU3BlY2lhbCBiZWhhdmlvdXIgbXVzdCBiZSBhcHBsaWVkIHRvIHRoZSBgemAgcHJvcGVydHksIGJlY2F1c2UgaXQgaXMgYXBwbGllZFxuICAgICAgICAgICAgLy8gdG8gdGhlIGdyb3VwIGVsZW1lbnQsIHJhdGhlciB0aGFuIGRpcmVjdGx5IHRvIHRoZSBzaGFwZSBlbGVtZW50LlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMueih2YWx1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGUuZWxlbWVudC5kYXR1bSgpW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hhcGUuZWxlbWVudC5kYXR1bSgpW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNoYXBlLmVsZW1lbnQuYXR0cihwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdHJhbnNmb3JtXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB0cmFuc2Zvcm0oeCA9IG51bGwsIHkgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeCA9PT0gbnVsbCAmJiB5ID09PSBudWxsKSA/IFt0aGlzLngoKSwgdGhpcy55KCldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuYXR0cmlidXRlKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB4KHggPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeCA9PT0gbnVsbCkgPyB0aGlzLnBhcnNlVHJhbnNsYXRlKHRoaXMuc2hhcGUuZWxlbWVudC5kYXR1bSgpLnRyYW5zZm9ybSkueFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy50cmFuc2Zvcm0oeCwgdGhpcy55KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgeSh5ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHkgPT09IG51bGwpID8gdGhpcy5wYXJzZVRyYW5zbGF0ZSh0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKS50cmFuc2Zvcm0pLnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNmb3JtKHRoaXMueCgpLCB5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gelxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgeih6ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHogPT09IG51bGwpID8gdGhpcy5zaGFwZS5ncm91cC5kYXR1bSgpLnpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuc2hhcGUuZ3JvdXAuZGF0dW0oKS56ID0gejtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpbWVuc2lvblxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbaGVpZ2h0PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt3aWR0aD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgZGltZW5zaW9uKGhlaWdodCA9IG51bGwsIHdpZHRoID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKGhlaWdodCA9PT0gbnVsbCAmJiB3aWR0aCA9PT0gbnVsbCkgPyBbdGhpcy5oZWlnaHQoKSwgdGhpcy53aWR0aCgpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLmhlaWdodChoZWlnaHQpLndpZHRoKHdpZHRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhlaWdodFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbaGVpZ2h0PW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBoZWlnaHQoaGVpZ2h0ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ2hlaWdodCcsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB3aWR0aFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbd2lkdGg9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHdpZHRoKHdpZHRoID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ3dpZHRoJywgd2lkdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYm91bmRpbmdCb3hcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYm91bmRpbmdCb3goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlLmdyb3VwLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdUb0Zyb250KCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIEluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpICsgMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlKCd6JywgLUluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpIC0gMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBhcnNlVHJhbnNsYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYW5zZm9ybVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBwYXJzZVRyYW5zbGF0ZSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFN0cmluZyh0cmFuc2Zvcm0pLm1hdGNoKC90cmFuc2xhdGVcXCgoWzAtOV0rKVxccyosXFxzKihbMC05XSspL2kpO1xuICAgICAgICByZXR1cm4geyB4OiBwYXJzZUludChyZXN1bHRbMV0pLCB5OiBwYXJzZUludChyZXN1bHRbMl0pIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL3NoYXBlL2ZlYXR1cmUvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXROYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGluc2VydGlvblBvaW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt6VmFsdWU9MF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGluc2VydChpbnNlcnRpb25Qb2ludCwgelZhbHVlID0gMCkge1xuXG4gICAgICAgIHRoaXMuZ3JvdXAgICA9IGluc2VydGlvblBvaW50LmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgYHNoYXBlICR7dGhpcy5nZXROYW1lKCl9YCkuZGF0dW0oeyB6OiB6VmFsdWUgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZ3JvdXAuYXBwZW5kKHRoaXMuZ2V0VGFnKCkpLmRhdHVtKHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDAsMCknIH0pO1xuXG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRGYWNhZGVcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgZ2V0RmFjYWRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWNhZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBY2Nlc3NvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0QWNjZXNzb3IoYWNjZXNzb3IpIHtcbiAgICAgICAgdGhpcy5hY2Nlc3NvciA9IGFjY2Vzc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5TRUxFQ1RfQUxMLCAgICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuc2VsZWN0KCkpO1xuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5ERVNFTEVDVF9BTEwsICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuZGVzZWxlY3QoKSk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRmFjYWRlIGZyb20gJy4vLi4vRmFjYWRlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgRmFjYWRlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvdXJcbiAgICAgKiBAcmV0dXJuIHtSZWN0YW5nbGV9XG4gICAgICovXG4gICAgZmlsbChjb2xvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdmaWxsJywgY29sb3VyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBGYWNhZGUgICAgIGZyb20gJy4vLi4vZmFjYWRlL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZhY2FkZSA9IG5ldyBGYWNhZGUodGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTZWxlY3RhYmxlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZSAgID0gc2hhcGU7XG4gICAgICAgIGxldCBlbGVtZW50ICA9IHNoYXBlLmVsZW1lbnQsXG4gICAgICAgICAgICBrZXlib2FyZCA9IHNoYXBlLmFjY2Vzc29yLmtleWJvYXJkLFxuICAgICAgICAgICAgZmFjYWRlICAgPSBzaGFwZS5nZXRGYWNhZGUoKTtcblxuICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNsaWNrRGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXlib2FyZC5tdWx0aVNlbGVjdCkge1xuICAgICAgICAgICAgICAgIGZhY2FkZS5zZWxlY3RJbnZlcnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuZGVzZWxlY3RBbGwoKTtcbiAgICAgICAgICAgIGZhY2FkZS5zZWxlY3QoKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBzaGFwZS5lbGVtZW50LmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpLm9uKCdkcmFnJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbGlja0Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZhY2FkZS5zaGFwZS5hY2Nlc3Nvci5kcmFnQkJveCgpO1xuICAgICAgICB9KSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLmdldEZhY2FkZSgpLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRGYWNhZGUoKS5maWxsKCdncmVlbicpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmNyZWF0ZUJCb3goKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5nZXRGYWNhZGUoKS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNoYXBlLmdldEZhY2FkZSgpLmZpbGwoJ2xpZ2h0Z3JleScpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmNyZWF0ZUJCb3goKTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRGlzcGF0Y2hlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtEaXNwYXRjaGVyfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VuZChldmVudE5hbWUsIHByb3BlcnRpZXMpIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaCgoZm4pID0+IGZuKHByb3BlcnRpZXMpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG9uKGV2ZW50TmFtZSwgZm4pIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChmbik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICBTRUxFQ1RfQUxMOiAgICdzZWxlY3QtYWxsJyxcbiAgICBERVNFTEVDVF9BTEw6ICdkZXNlbGVjdCcsXG4gICAgU0VMRUNURUQ6ICAgICAnc2VsZWN0ZWQnXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQm91bmRpbmdCb3hcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvdW5kaW5nQm94IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0QWNjZXNzb3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYWNjZXNzb3JcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNldEFjY2Vzc29yKGFjY2Vzc29yKSB7XG4gICAgICAgIHRoaXMuYWNjZXNzb3IgPSBhY2Nlc3NvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNyZWF0ZVxuICAgICAqIEBwcm9wZXJ0eSB7QXJyYXl9IHNlbGVjdGVkXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjcmVhdGUoc2VsZWN0ZWQsIGdyb3VwKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYkJveCkge1xuICAgICAgICAgICAgdGhpcy5iQm94LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1vZGVsID0geyBtaW5YOiBOdW1iZXIuTUFYX1ZBTFVFLCBtaW5ZOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgIG1heFg6IE51bWJlci5NSU5fVkFMVUUsIG1heFk6IE51bWJlci5NSU5fVkFMVUUgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzcG9uc2libGUgZm9yIGNvbXB1dGluZyB0aGUgY29sbGVjdGl2ZSBib3VuZGluZyBib3gsIGJhc2VkIG9uIGFsbCBvZiB0aGUgYm91bmRpbmcgYm94ZXNcbiAgICAgICAgICogZnJvbSB0aGUgY3VycmVudCBzZWxlY3RlZCBzaGFwZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgY29tcHV0ZVxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBiQm94ZXNcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGxldCBjb21wdXRlID0gKGJCb3hlcykgPT4ge1xuICAgICAgICAgICAgbW9kZWwubWluWCA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCkpO1xuICAgICAgICAgICAgbW9kZWwubWluWSA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WCA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCArIGQud2lkdGgpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFkgPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkgKyBkLmhlaWdodCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LlxuICAgICAgICBjb21wdXRlKHNlbGVjdGVkLm1hcCgoc2hhcGUpID0+IHNoYXBlLmJvdW5kaW5nQm94KCkpKTtcblxuICAgICAgICB0aGlzLmJCb3ggPSBncm91cC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZHJhZy1ib3gnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vLmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgICAgICAoKGQpID0+IGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAgICAgICgoZCkgPT4gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAgKChkKSA9PiBkLm1heFggLSBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAoKGQpID0+IGQubWF4WSAtIGQubWluWSkpO1xuXG4gICAgICAgIGxldCBkcmFnU3RhcnQgPSBbJ2RyYWdzdGFydCcsICgpID0+IHRoaXMuZHJhZ1N0YXJ0KCldLFxuICAgICAgICAgICAgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV0sXG4gICAgICAgICAgICBkcmFnRW5kICAgPSBbJ2RyYWdlbmQnLCAgICgpID0+IHRoaXMuZHJhZ0VuZCgpXTtcblxuICAgICAgICB0aGlzLmJCb3guY2FsbChkMy5iZWhhdmlvci5kcmFnKCkub24oLi4uZHJhZ1N0YXJ0KS5vbiguLi5kcmFnKS5vbiguLi5kcmFnRW5kKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdTdGFydFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ1N0YXJ0KHggPSBudWxsLCB5ID0gbnVsbCkge1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdBaCcpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAoeCAhPT0gbnVsbCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WCAtIHBhcnNlSW50KHRoaXMuYkJveC5hdHRyKCd4JykpLFxuICAgICAgICAgICAgeTogKHkgIT09IG51bGwpID8geSA6IGQzLmV2ZW50LnNvdXJjZUV2ZW50LmNsaWVudFkgLSBwYXJzZUludCh0aGlzLmJCb3guYXR0cigneScpKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkcmFnXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFttdWx0aXBsZU9mPXJlZ2lzdHJ5LnNuYXBHcmlkXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSAxMCkge1xuXG4gICAgICAgIHggPSAoeCAhPT0gbnVsbCkgPyB4IDogZDMuZXZlbnQuc291cmNlRXZlbnQuY2xpZW50WDtcbiAgICAgICAgeSA9ICh5ICE9PSBudWxsKSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5jbGllbnRZO1xuXG4gICAgICAgIGxldCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgIG1ZID0gKHkgLSB0aGlzLnN0YXJ0LnkpLFxuICAgICAgICAgICAgZVggPSBNYXRoLmNlaWwobVggLyBtdWx0aXBsZU9mKSAqIG11bHRpcGxlT2YsXG4gICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKHgsIHkpO1xuXG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnggPSBlWDtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3gnLCBlWCk7XG5cbiAgICAgICAgdGhpcy5iQm94LmRhdHVtKCkueSA9IGVZO1xuICAgICAgICB0aGlzLmJCb3guYXR0cigneScsIGVZKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ0VuZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZ0VuZCgpIHtcbiAgICAgICAgLy90aGlzLmJCb3gucmVtb3ZlKCk7XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFplZFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICAgIGxldCB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG5cbiAgICAgICAgbGV0IHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBncm91cHNbMF0uZm9yRWFjaCgobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iXX0=
