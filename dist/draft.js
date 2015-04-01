(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./dispatcher/Dispatcher.js"));

var Events = _interopRequire(require("./dispatcher/Events.js"));

var Rectangle = _interopRequire(require("./components/shape/Rectangle.js"));

var zed = _interopRequire(require("./helpers/Zed.js"));

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

(function main($window) {

    "use strict";

    // Kalinka, kalinka, kalinka moya!
    // V sadu yagoda malinka, malinka moya!
    $window.Draft = Draft;
})(window);

},{"./components/shape/Rectangle.js":5,"./dispatcher/Dispatcher.js":7,"./dispatcher/Events.js":8,"./helpers/Zed.js":9}],2:[function(require,module,exports){
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
                this.selected = true;
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
                this.selected = false;
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

        element.on("click", function () {

            if (keyboard.multiSelect) {
                facade.selectInvert();
                return;
            }

            _this.shape.accessor.deselectAll();
            facade.select();
        });
    }

    _createClass(Selectable, {
        select: {

            /**
             * @method select
             * @return {void}
             */

            value: function select() {
                this.shape.selected = true;
            }
        },
        deselect: {

            /**
             * @method deselect
             * @return {void}
             */

            value: function deselect() {
                this.shape.selected = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvWmVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLFNBQVMsMkJBQU8saUNBQWlDOztJQUNqRCxHQUFHLDJCQUFhLGtCQUFrQjs7Ozs7Ozs7SUFPbkMsS0FBSzs7Ozs7Ozs7O0FBUUksYUFSVCxLQUFLLENBUUssT0FBTyxFQUFFLE9BQU8sRUFBRTs7OzhCQVI1QixLQUFLOztBQVVILFlBQUksQ0FBQyxNQUFNLEdBQU8sRUFBRSxDQUFD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dCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vZGlzcGF0Y2hlci9FdmVudHMuanMnO1xuaW1wb3J0IFJlY3RhbmdsZSAgZnJvbSAnLi9jb21wb25lbnRzL3NoYXBlL1JlY3RhbmdsZS5qcyc7XG5pbXBvcnQgemVkICAgICAgICBmcm9tICcuL2hlbHBlcnMvWmVkLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5jbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR8U3RyaW5nfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG4gICAgICAgIHRoaXMua2V5Ym9hcmQgICA9IHsgbXVsdGlTZWxlY3Q6IGZhbHNlLCBhc3BlY3RSYXRpbzogZmFsc2UgfTtcbiAgICAgICAgLy90aGlzLm9wdGlvbnMgICAgPSBPYmplY3QuYXNzaWduKHRoaXMuZ2V0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gdGhpcy5nZXRPcHRpb25zKCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cbiAgICAgICAgLy8gUmVzcG9uc2libGUgZm9yIHNldHRpbmcgdXAgTW91c2V0cmFwIGV2ZW50cywgaWYgaXQncyBhdmFpbGFibGUsIG90aGVyd2lzZSBhbGwgYXR0YWNoZWRcbiAgICAgICAgLy8gZXZlbnRzIHdpbGwgYmUgZ2hvc3QgZXZlbnRzLlxuICAgICAgICAoKG1vdXNldHJhcCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBhdmFpbGFibGUgc2hhcGVzLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVF9BTEwpKTtcblxuICAgICAgICAgICAgLy8gTXVsdGktc2VsZWN0aW5nIHNoYXBlcy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHRoaXMua2V5Ym9hcmQubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gdGhpcy5rZXlib2FyZC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAgICAgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvcyB3aGVuIHJlc2l6aW5nLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gdGhpcy5rZXlib2FyZC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiB0aGlzLmtleWJvYXJkLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIH0pKE1vdXNldHJhcCB8fCB7IGJpbmQ6ICgpID0+IHt9IH0pO1xuXG4gICAgICAgIC8vIFZvaWxhLi4uXG4gICAgICAgIHRoaXMuc3ZnID0gZDMuc2VsZWN0KHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkgOiBlbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy5vcHRpb25zLmRvY3VtZW50V2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpKTtcblxuICAgICAgICAvLyBBZGQgZ3JvdXBzIHRvIHRoZSBTVkcgZWxlbWVudC5cbiAgICAgICAgdGhpcy5ncm91cHMgPSB7XG4gICAgICAgICAgICBzaGFwZXM6ICB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzaGFwZXMnKS5vbignY2xpY2snLCAoKSA9PiBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKSksXG4gICAgICAgICAgICBoYW5kbGVzOiB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdoYW5kbGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgbGV0IHNoYXBlICA9IHRoaXMuZ2V0SW5zdGFuY2UobmFtZSksXG4gICAgICAgICAgICBmYWNhZGUgPSBzaGFwZS5nZXRGYWNhZGUoKTtcblxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKGZhY2FkZSk7XG4gICAgICAgIHJldHVybiBmYWNhZGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIG9uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBvbihldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlci5vbihldmVudE5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSBmYWNhZGUge0ZhY2FkZX1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZShmYWNhZGUpIHtcbiAgICAgICAgZmFjYWRlLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0U2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBnZXRTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjZXNzb3JzIHRoYXQgYXJlIGFjY2Vzc2libGUgYnkgdGhlIHNoYXBlcyBhbmQgdGhlaXIgYXNzb2NpYXRlZCBmYWNhZGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRBY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBY2Nlc3NvcigpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0U2VsZWN0ZWQ6ICAgICAgICAgICAgdGhpcy5nZXRTZWxlY3RlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZ3JvdXBzOiAgICAgICAgICAgICAgICAgdGhpcy5ncm91cHMsXG4gICAgICAgICAgICBrZXlib2FyZDogICAgICAgICAgICAgICB0aGlzLmtleWJvYXJkLFxuICAgICAgICAgICAgaGFzU2VsZWN0ZWQ6ICgpICAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RFRCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlczogdGhpcy5nZXRTZWxlY3RlZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlbGVjdEFsbDogICAoKSAgICAgICA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCksXG4gICAgICAgICAgICBkZXNlbGVjdEFsbDogKCkgICAgICAgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLkRFU0VMRUNUX0FMTCksXG4gICAgICAgICAgICByZW1vdmU6ICAgICAgKGZhY2FkZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuc2hhcGVzLmluZGV4T2YoZmFjYWRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlb3JkZXI6ICAgICAoZ3JvdXApICA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGdyb3VwcyA9IHRoaXMuc3ZnLnNlbGVjdEFsbCgnZy5zaGFwZXMgZycpO1xuICAgICAgICAgICAgICAgIHplZC5yZW9yZGVyKGdyb3VwcywgZ3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEluc3RhbmNlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBnZXRJbnN0YW5jZShuYW1lKSB7XG5cbiAgICAgICAgbGV0IG1hcCA9IHtcbiAgICAgICAgICAgIHJlY3Q6IFJlY3RhbmdsZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEluc3RhbnRpYXRlIHRoZSBzaGFwZSBvYmplY3QsIGFuZCBpbmplY3QgdGhlIGFjY2Vzc29yIGFuZCBsaXN0ZW5lci5cbiAgICAgICAgbGV0IHNoYXBlID0gbmV3IG1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKCk7XG4gICAgICAgIHNoYXBlLnNldEFjY2Vzc29yKHRoaXMuZ2V0QWNjZXNzb3IoKSk7XG4gICAgICAgIHNoYXBlLnNldERpc3BhdGNoZXIodGhpcy5kaXNwYXRjaGVyKTtcbiAgICAgICAgc2hhcGUuaW5zZXJ0KHRoaXMuZ3JvdXBzLnNoYXBlcywgdGhpcy5pbmRleCsrKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldE9wdGlvbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRvY3VtZW50SGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICBkb2N1bWVudFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBncmlkU2l6ZTogMTBcbiAgICAgICAgfTtcblxuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gbWFpbigkd2luZG93KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIEthbGlua2EsIGthbGlua2EsIGthbGlua2EgbW95YSFcbiAgICAvLyBWIHNhZHUgeWFnb2RhIG1hbGlua2EsIG1hbGlua2EgbW95YSFcbiAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEZhY2FkZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFjYWRlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgICAgPSBzaGFwZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVtb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZ3JvdXAucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVtb3ZlKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIHNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5mZWF0dXJlcy5zZWxlY3RhYmxlLnNlbGVjdCgpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5oYXNTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLmZlYXR1cmVzLnNlbGVjdGFibGUuZGVzZWxlY3QoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmhhc1NlbGVjdGVkKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0SW52ZXJ0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIHNlbGVjdEludmVydCgpIHtcblxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuaGFzU2VsZWN0ZWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBhdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlID0gbnVsbCkge1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3onKSB7XG5cbiAgICAgICAgICAgIC8vIFNwZWNpYWwgYmVoYXZpb3VyIG11c3QgYmUgYXBwbGllZCB0byB0aGUgYHpgIHByb3BlcnR5LCBiZWNhdXNlIGl0IGlzIGFwcGxpZWRcbiAgICAgICAgICAgIC8vIHRvIHRoZSBncm91cCBlbGVtZW50LCByYXRoZXIgdGhhbiBkaXJlY3RseSB0byB0aGUgc2hhcGUgZWxlbWVudC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnoodmFsdWUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zaGFwZS5lbGVtZW50LmF0dHIocHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgdHJhbnNmb3JtKHggPSBudWxsLCB5ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHggPT09IG51bGwgJiYgeSA9PT0gbnVsbCkgPyBbdGhpcy54KCksIHRoaXMueSgpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgeCh4ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHggPT09IG51bGwpID8gdGhpcy5wYXJzZVRyYW5zbGF0ZSh0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKS50cmFuc2Zvcm0pLnhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNmb3JtKHgsIHRoaXMueSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHkoeSA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh5ID09PSBudWxsKSA/IHRoaXMucGFyc2VUcmFuc2xhdGUodGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKCkudHJhbnNmb3JtKS55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zZm9ybSh0aGlzLngoKSwgeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB6XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHpcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHooeiA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh6ID09PSBudWxsKSA/IHRoaXMuc2hhcGUuZ3JvdXAuZGF0dW0oKS56XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnNoYXBlLmdyb3VwLmRhdHVtKCkueiA9IHo7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbd2lkdGg9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGRpbWVuc2lvbihoZWlnaHQgPSBudWxsLCB3aWR0aCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIChoZWlnaHQgPT09IG51bGwgJiYgd2lkdGggPT09IG51bGwpID8gW3RoaXMuaGVpZ2h0KCksIHRoaXMud2lkdGgoKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5oZWlnaHQoaGVpZ2h0KS53aWR0aCh3aWR0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgaGVpZ2h0KGhlaWdodCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB3aWR0aCh3aWR0aCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nVG9Gcm9udFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBicmluZ1RvRnJvbnQoKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlKCd6JywgSW5maW5pdHkpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLnJlb3JkZXIodGhpcy5zaGFwZS5ncm91cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdGb3J3YXJkc1xuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBicmluZ0ZvcndhcmRzKCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIHRoaXMuYXR0cmlidXRlKCd6JykgKyAxKTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRUb0JhY2tcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VuZFRvQmFjaygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCAtSW5maW5pdHkpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLnJlb3JkZXIodGhpcy5zaGFwZS5ncm91cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZEJhY2t3YXJkc1xuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBzZW5kQmFja3dhcmRzKCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIHRoaXMuYXR0cmlidXRlKCd6JykgLSAxKTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcGFyc2VUcmFuc2xhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNmb3JtXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHBhcnNlVHJhbnNsYXRlKHRyYW5zZm9ybSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gU3RyaW5nKHRyYW5zZm9ybSkubWF0Y2goL3RyYW5zbGF0ZVxcKChbMC05XSspXFxzKixcXHMqKFswLTldKykvaSk7XG4gICAgICAgIHJldHVybiB7IHg6IHBhcnNlSW50KHJlc3VsdFsxXSksIHk6IHBhcnNlSW50KHJlc3VsdFsyXSkgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkO1xuICAgIH1cblxufSIsImltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4vc2hhcGUvZmVhdHVyZS9TZWxlY3RhYmxlLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vZGlzcGF0Y2hlci9FdmVudHMuanMnO1xuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFnKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnNlcnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5zZXJ0aW9uUG9pbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3pWYWx1ZT0wXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaW5zZXJ0KGluc2VydGlvblBvaW50LCB6VmFsdWUgPSAwKSB7XG5cbiAgICAgICAgdGhpcy5ncm91cCAgID0gaW5zZXJ0aW9uUG9pbnQuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCBgc2hhcGUgJHt0aGlzLmdldE5hbWUoKX1gKS5kYXR1bSh7IHo6IHpWYWx1ZSB9KTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5ncm91cC5hcHBlbmQodGhpcy5nZXRUYWcoKSkuZGF0dW0oeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoMCwwKScgfSk7XG5cbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKHRoaXMpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEZhY2FkZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBnZXRGYWNhZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhY2FkZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEFjY2Vzc29yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFjY2Vzc29yXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRBY2Nlc3NvcihhY2Nlc3Nvcikge1xuICAgICAgICB0aGlzLmFjY2Vzc29yID0gYWNjZXNzb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLlNFTEVDVF9BTEwsICAgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5zZWxlY3QoKSk7XG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLkRFU0VMRUNUX0FMTCwgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5kZXNlbGVjdCgpKTtcblxuICAgIH1cblxufSIsImltcG9ydCBGYWNhZGUgZnJvbSAnLi8uLi9GYWNhZGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBGYWNhZGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbG91clxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBmaWxsKGNvbG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ2ZpbGwnLCBjb2xvdXIpO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vLi4vU2hhcGUuanMnO1xuaW1wb3J0IEZhY2FkZSAgICAgZnJvbSAnLi8uLi9mYWNhZGUvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVjdGFuZ2xlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmFjYWRlID0gbmV3IEZhY2FkZSh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NlbGVjdGFibGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICB0aGlzLnNoYXBlICAgPSBzaGFwZTtcbiAgICAgICAgbGV0IGVsZW1lbnQgID0gc2hhcGUuZWxlbWVudCxcbiAgICAgICAgICAgIGtleWJvYXJkID0gc2hhcGUuYWNjZXNzb3Iua2V5Ym9hcmQsXG4gICAgICAgICAgICBmYWNhZGUgICA9IHNoYXBlLmdldEZhY2FkZSgpO1xuXG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoa2V5Ym9hcmQubXVsdGlTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBmYWNhZGUuc2VsZWN0SW52ZXJ0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmRlc2VsZWN0QWxsKCk7XG4gICAgICAgICAgICBmYWNhZGUuc2VsZWN0KCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge0Rpc3BhdGNoZXJ9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKGV2ZW50TmFtZSwgcHJvcGVydGllcykge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKChmbikgPT4gZm4ocHJvcGVydGllcykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgb24oZXZlbnROYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIFNFTEVDVF9BTEw6ICAgJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0JyxcbiAgICBTRUxFQ1RFRDogICAgICdzZWxlY3RlZCdcblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBaZWRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBncm91cFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3VwcywgZ3JvdXApIHtcblxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICBsZXQgek1heCA9IGdyb3Vwcy5zaXplKCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBtYXhpbXVtIFogaXMgYWJvdmUgemVybyBhbmQgYmVsb3cgdGhlIG1heGltdW0uXG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPCAxKSAgICB7IGdyb3VwLmRhdHVtKCkueiA9IDE7ICAgIH1cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA+IHpNYXgpIHsgZ3JvdXAuZGF0dW0oKS56ID0gek1heDsgfVxuXG4gICAgICAgIGxldCB6VGFyZ2V0ID0gZ3JvdXAuZGF0dW0oKS56LCB6Q3VycmVudCA9IDE7XG5cbiAgICAgICAgLy8gSW5pdGlhbCBzb3J0IGludG8gei1pbmRleCBvcmRlci5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICAgICAgZ3JvdXBzWzBdLmZvckVhY2goKG1vZGVsKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEN1cnJlbnQgZ3JvdXAgaXMgaW1tdXRhYmxlIGluIHRoaXMgaXRlcmF0aW9uLlxuICAgICAgICAgICAgaWYgKG1vZGVsID09PSBncm91cC5ub2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNraXAgdGhlIHRhcmdldCBaIGluZGV4LlxuICAgICAgICAgICAgaWYgKHpDdXJyZW50ID09PSB6VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgekN1cnJlbnQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHNoYXBlID0gZDMuc2VsZWN0KG1vZGVsKSxcbiAgICAgICAgICAgICAgICBkYXR1bSA9IHNoYXBlLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXR1bS56ID0gekN1cnJlbnQrKztcbiAgICAgICAgICAgIHNoYXBlLmRhdHVtKGRhdHVtKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGaW5hbCBzb3J0IHBhc3MuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgfVxuXG59Il19
