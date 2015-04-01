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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvWmVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLFNBQVMsMkJBQU8saUNBQWlDOztJQUNqRCxHQUFHLDJCQUFhLGtCQUFrQjs7Ozs7Ozs7SUFPbkMsS0FBSzs7Ozs7Ozs7O0FBUUksYUFSVCxLQUFLLENBUUssT0FBTyxFQUFFLE9BQU8sRUFBRTs7OzhCQVI1QixLQUFLOztBQVVILFlBQUksQ0FBQyxNQUFNLEdBQU8sRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxLQUFLLEdBQVEsQ0FBQyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxRQUFRLEdBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQzs7QUFFN0QsWUFBSSxDQUFDLE9BQU8sR0FBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDcEMsWUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7O0FBSW5DLFNBQUMsVUFBQyxTQUFTLEVBQUs7OztBQUdaLHFCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTt1QkFBTSxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQzthQUFBLENBQUMsQ0FBQzs7O0FBR3ZFLHFCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBSTt1QkFBTSxNQUFLLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSTthQUFBLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDM0UscUJBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFJO3VCQUFNLE1BQUssUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLO2FBQUEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBRzFFLHFCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTt1QkFBTSxNQUFLLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSTthQUFBLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDM0UscUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO3VCQUFNLE1BQUssUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLO2FBQUEsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUU3RSxDQUFBLENBQUUsU0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQzs7O0FBR3BDLFlBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FDL0UsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUN6QyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQzNDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7bUJBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7U0FBQSxDQUFDLENBQUM7OztBQUczRSxZQUFJLENBQUMsTUFBTSxHQUFHO0FBQ1Ysa0JBQU0sRUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7dUJBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7YUFBQSxDQUFDO0FBQ25HLG1CQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO3VCQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO2FBQUEsQ0FBQztTQUN2RyxDQUFDO0tBRUw7O2lCQTlDQyxLQUFLO0FBcURQLFdBQUc7Ozs7Ozs7O21CQUFBLGFBQUMsSUFBSSxFQUFFOztBQUVOLG9CQUFJLEtBQUssR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDL0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFL0Isb0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLHVCQUFPLE1BQU0sQ0FBQzthQUVqQjs7QUFRRCxVQUFFOzs7Ozs7Ozs7bUJBQUEsWUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFO0FBQ2Qsb0JBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNyQzs7QUFPRCxjQUFNOzs7Ozs7OzttQkFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDWCxzQkFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ25COztBQU1ELG1CQUFXOzs7Ozs7O21CQUFBLHVCQUFHO0FBQ1YsdUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLOzJCQUFLLEtBQUssQ0FBQyxVQUFVLEVBQUU7aUJBQUEsQ0FBQyxDQUFDO2FBQzVEOztBQVFELG1CQUFXOzs7Ozs7Ozs7bUJBQUEsdUJBQUc7OztBQUVWLHVCQUFPO0FBQ0gsK0JBQVcsRUFBYSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDbkQsMEJBQU0sRUFBa0IsSUFBSSxDQUFDLE1BQU07QUFDbkMsNEJBQVEsRUFBZ0IsSUFBSSxDQUFDLFFBQVE7QUFDckMsK0JBQVcsRUFBRTsrQkFBVyxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtBQUNsQyxrQ0FBTSxFQUFFLE1BQUssV0FBVyxFQUFFO3lCQUM3QixDQUFDO3FCQUFBO0FBQzFCLDZCQUFTLEVBQUk7K0JBQVcsTUFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7cUJBQUE7QUFDL0QsK0JBQVcsRUFBRTsrQkFBVyxNQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztxQkFBQTtBQUNqRSwyQkFBTyxFQUFNLFVBQUMsS0FBSyxFQUFLO0FBQ3BCLDRCQUFJLE1BQU0sR0FBRyxNQUFLLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUMsMkJBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUM5QjtpQkFDSixDQUFBO2FBRUo7O0FBT0QsbUJBQVc7Ozs7Ozs7O21CQUFBLHFCQUFDLElBQUksRUFBRTs7QUFFZCxvQkFBSSxHQUFHLEdBQUc7QUFDTix3QkFBSSxFQUFFLFNBQVM7aUJBQ2xCLENBQUM7OztBQUdGLG9CQUFJLEtBQUssR0FBRyxLQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUMsRUFBRSxDQUFDO0FBQzFDLHFCQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLHFCQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxxQkFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUMvQyx1QkFBTyxLQUFLLENBQUM7YUFFaEI7O0FBTUQsa0JBQVU7Ozs7Ozs7bUJBQUEsc0JBQUc7O0FBRVQsdUJBQU87QUFDSCxrQ0FBYyxFQUFFLE1BQU07QUFDdEIsaUNBQWEsRUFBRSxNQUFNO0FBQ3JCLDRCQUFRLEVBQUUsRUFBRTtpQkFDZixDQUFDO2FBRUw7Ozs7V0FuSkMsS0FBSzs7O0FBdUpYLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUVwQixnQkFBWSxDQUFDOzs7O0FBSWIsV0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FFekIsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lDbktVLE1BQU07Ozs7Ozs7O0FBT1osYUFQTSxNQUFNLENBT1gsS0FBSyxFQUFFOzhCQVBGLE1BQU07O0FBUW5CLFlBQUksQ0FBQyxLQUFLLEdBQU0sS0FBSyxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0tBQ3pCOztpQkFWZ0IsTUFBTTtBQWdCdkIsY0FBTTs7Ozs7OzttQkFBQSxrQkFBRztBQUNMLG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEMsb0JBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyx1QkFBTyxJQUFJLENBQUM7YUFDZjs7QUFNRCxnQkFBUTs7Ozs7OzttQkFBQSxvQkFBRztBQUNQLG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDMUMsb0JBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyx1QkFBTyxJQUFJLENBQUM7YUFDZjs7QUFNRCxvQkFBWTs7Ozs7OzttQkFBQSx3QkFBRzs7QUFFWCxvQkFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2Ysd0JBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDbkIsTUFBTTtBQUNILHdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2pCOztBQUVELG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyx1QkFBTyxJQUFJLENBQUM7YUFFZjs7QUFRRCxpQkFBUzs7Ozs7Ozs7O21CQUFBLG1CQUFDLFFBQVEsRUFBZ0I7b0JBQWQsS0FBSyxnQ0FBRyxJQUFJOztBQUU1QixvQkFBSSxRQUFRLEtBQUssR0FBRyxFQUFFOzs7O0FBSWxCLDJCQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXhCOztBQUVELG9CQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDaEIsMkJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQy9DOztBQUVELG9CQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDN0Msb0JBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekMsdUJBQU8sSUFBSSxDQUFDO2FBRWY7O0FBUUQsaUJBQVM7Ozs7Ozs7OzttQkFBQSxxQkFBcUI7b0JBQXBCLENBQUMsZ0NBQUcsSUFBSTtvQkFBRSxDQUFDLGdDQUFHLElBQUk7O0FBQ3hCLHVCQUFPLEFBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsaUJBQWUsQ0FBQyxVQUFLLENBQUMsT0FBSSxDQUFDO2FBQzVGOztBQU9ELFNBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztlQUFBLFlBQVc7b0JBQVYsQ0FBQyxnQ0FBRyxJQUFJOztBQUNOLHVCQUFPLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FDM0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDckQ7O0FBT0QsU0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBQUEsWUFBVztvQkFBVixDQUFDLGdDQUFHLElBQUk7O0FBQ04sdUJBQU8sQUFBQyxDQUFDLEtBQUssSUFBSSxHQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUMzRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNyRDs7QUFPRCxTQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFBQSxZQUFXO29CQUFWLENBQUMsZ0NBQUcsSUFBSTs7QUFDTix1QkFBTyxBQUFDLENBQUMsS0FBSyxJQUFJLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3hEOztBQVFELGlCQUFTOzs7Ozs7Ozs7bUJBQUEscUJBQThCO29CQUE3QixNQUFNLGdDQUFHLElBQUk7b0JBQUUsS0FBSyxnQ0FBRyxJQUFJOztBQUNqQyx1QkFBTyxBQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLElBQUksR0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsR0FDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakY7O0FBT0QsY0FBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBQUEsWUFBZ0I7b0JBQWYsTUFBTSxnQ0FBRyxJQUFJOztBQUNoQix1QkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUMzQzs7QUFPRCxhQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFBQSxZQUFlO29CQUFkLEtBQUssZ0NBQUcsSUFBSTs7QUFDZCx1QkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzthQUN6Qzs7QUFNRCxvQkFBWTs7Ozs7OzttQkFBQSx3QkFBRztBQUNYLG9CQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5QixvQkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7O0FBTUQscUJBQWE7Ozs7Ozs7bUJBQUEseUJBQUc7QUFDWixvQkFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QyxvQkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7O0FBTUQsa0JBQVU7Ozs7Ozs7bUJBQUEsc0JBQUc7QUFDVCxvQkFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixvQkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7O0FBTUQscUJBQWE7Ozs7Ozs7bUJBQUEseUJBQUc7QUFDWixvQkFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QyxvQkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsdUJBQU8sSUFBSSxDQUFDO2FBQ2Y7O0FBTUQsZ0JBQVE7Ozs7Ozs7bUJBQUEsb0JBQUc7QUFDUCx1QkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ3JCOztBQU9ELHNCQUFjOzs7Ozs7OzttQkFBQSx3QkFBQyxTQUFTLEVBQUU7QUFDdEIsb0JBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUM1RSx1QkFBTyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQzdEOztBQU1ELGtCQUFVOzs7Ozs7O21CQUFBLHNCQUFHO0FBQ1QsdUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUN4Qjs7OztXQW5OZ0IsTUFBTTs7O2lCQUFOLE1BQU07Ozs7Ozs7Ozs7O0lDTnBCLFVBQVUsMkJBQU0sK0JBQStCOztJQUMvQyxNQUFNLDJCQUFVLDJCQUEyQjs7Ozs7Ozs7O0lBTzdCLEtBQUs7YUFBTCxLQUFLOzhCQUFMLEtBQUs7OztpQkFBTCxLQUFLO0FBTXRCLGVBQU87Ozs7Ozs7bUJBQUEsbUJBQUc7QUFDTix1QkFBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDeEI7O0FBUUQsY0FBTTs7Ozs7Ozs7O21CQUFBLGdCQUFDLGNBQWMsRUFBYztvQkFBWixNQUFNLGdDQUFHLENBQUM7O0FBRTdCLG9CQUFJLENBQUMsS0FBSyxHQUFLLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sYUFBVyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN4RyxvQkFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDOztBQUV2RixvQkFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLDhCQUFVLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDO2lCQUNuQyxDQUFDO2FBRUw7O0FBTUQsaUJBQVM7Ozs7Ozs7bUJBQUEscUJBQUc7QUFDUix1QkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ3RCOztBQU9ELG1CQUFXOzs7Ozs7OzttQkFBQSxxQkFBQyxRQUFRLEVBQUU7QUFDbEIsb0JBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2FBQzVCOztBQU9ELHFCQUFhOzs7Ozs7OzttQkFBQSx1QkFBQyxVQUFVLEVBQUU7OztBQUV0QixvQkFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7O0FBRTdCLDBCQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUk7MkJBQU0sTUFBSyxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUU7aUJBQUEsQ0FBQyxDQUFDO0FBQ3BFLDBCQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7MkJBQU0sTUFBSyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUU7aUJBQUEsQ0FBQyxDQUFDO2FBRXpFOzs7O1dBeERnQixLQUFLOzs7aUJBQUwsS0FBSzs7Ozs7Ozs7Ozs7OztJQ1JuQixNQUFNLDJCQUFNLGdCQUFnQjs7Ozs7Ozs7O0lBUWQsU0FBUztXQUFULFNBQVM7MEJBQVQsU0FBUzs7Ozs7OztZQUFULFNBQVM7O2VBQVQsU0FBUztBQU8xQixRQUFJOzs7Ozs7OzthQUFBLGNBQUMsTUFBTSxFQUFFO0FBQ1QsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUN6Qzs7OztTQVRnQixTQUFTO0dBQVMsTUFBTTs7aUJBQXhCLFNBQVM7Ozs7Ozs7Ozs7Ozs7OztJQ1J2QixLQUFLLDJCQUFXLGVBQWU7O0lBQy9CLE1BQU0sMkJBQVUsMEJBQTBCOzs7Ozs7Ozs7SUFRNUIsU0FBUzs7Ozs7OztBQU1mLFdBTk0sU0FBUyxHQU1aOzBCQU5HLFNBQVM7O0FBUXRCLCtCQVJhLFNBQVMsNkNBUWQ7QUFDUixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBRWxDOztZQVhnQixTQUFTOztlQUFULFNBQVM7QUFpQjFCLFVBQU07Ozs7Ozs7YUFBQSxrQkFBRztBQUNMLGVBQU8sTUFBTSxDQUFDO09BQ2pCOzs7O1NBbkJnQixTQUFTO0dBQVMsS0FBSzs7aUJBQXZCLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7SUNIVCxVQUFVOzs7Ozs7OztBQU9oQixhQVBNLFVBQVUsQ0FPZixLQUFLLEVBQUU7Ozs4QkFQRixVQUFVOztBQVN2QixZQUFJLENBQUMsS0FBSyxHQUFLLEtBQUssQ0FBQztBQUNyQixZQUFJLE9BQU8sR0FBSSxLQUFLLENBQUMsT0FBTztZQUN4QixRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRO1lBQ2xDLE1BQU0sR0FBSyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRWpDLGVBQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQU07O0FBRXRCLGdCQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7QUFDdEIsc0JBQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUN0Qix1QkFBTzthQUNWOztBQUVELGtCQUFLLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbEMsa0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUVuQixDQUFDLENBQUM7S0FFTjs7aUJBMUJnQixVQUFVO0FBZ0MzQixjQUFNOzs7Ozs7O21CQUFBLGtCQUFHO0FBQ0wsb0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzthQUM5Qjs7QUFNRCxnQkFBUTs7Ozs7OzttQkFBQSxvQkFBRztBQUNQLG9CQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7YUFDL0I7Ozs7V0ExQ2dCLFVBQVU7OztpQkFBVixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7O0lDQVYsVUFBVTs7Ozs7OztBQU1oQixhQU5NLFVBQVUsR0FNYjs4QkFORyxVQUFVOztBQU92QixZQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztLQUNwQjs7aUJBUmdCLFVBQVU7QUFnQjNCLFlBQUk7Ozs7Ozs7OzttQkFBQSxjQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUU7O0FBRXhCLG9CQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDeEMsMkJBQU87aUJBQ1Y7O0FBRUQsb0JBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRTsyQkFBSyxFQUFFLENBQUMsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQzthQUUxRDs7QUFRRCxVQUFFOzs7Ozs7Ozs7bUJBQUEsWUFBQyxTQUFTLEVBQUUsRUFBRSxFQUFFOztBQUVkLG9CQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDeEMsd0JBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO2lCQUMvQjs7QUFFRCxvQkFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFFbkM7Ozs7V0F4Q2dCLFVBQVU7OztpQkFBVixVQUFVOzs7Ozs7Ozs7OztpQkNBaEI7O0FBRVgsWUFBVSxFQUFJLFlBQVk7QUFDMUIsY0FBWSxFQUFFLFVBQVU7QUFDeEIsVUFBUSxFQUFNLFVBQVU7O0NBRTNCOzs7Ozs7Ozs7OztpQkNOYzs7Ozs7Ozs7QUFRWCxXQUFPLEVBQUEsaUJBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTs7QUFFbkIsb0JBQVksQ0FBQzs7QUFFYixZQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7OztBQUd6QixZQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFLO0FBQUUsaUJBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQUs7QUFDdkQsWUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUFFLGlCQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztTQUFFOztBQUV2RCxZQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7OztBQUc1QyxjQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7bUJBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUFBLENBQUMsQ0FBQzs7QUFFakMsY0FBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSzs7O0FBR3pCLGdCQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDeEIsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQUksUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUN0Qix3QkFBUSxFQUFFLENBQUM7YUFDZDs7QUFFRCxnQkFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUIsaUJBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7QUFDckIsaUJBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FFdEIsQ0FBQyxDQUFDOzs7QUFHSCxjQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7bUJBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUFBLENBQUMsQ0FBQztLQUVwQzs7Q0FFSiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXIvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMnO1xuaW1wb3J0IHplZCAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1plZC5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fFN0cmluZ30gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ICAgICAgPSAxO1xuICAgICAgICB0aGlzLmtleWJvYXJkICAgPSB7IG11bHRpU2VsZWN0OiBmYWxzZSwgYXNwZWN0UmF0aW86IGZhbHNlIH07XG4gICAgICAgIC8vdGhpcy5vcHRpb25zICAgID0gT2JqZWN0LmFzc2lnbih0aGlzLmdldE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG4gICAgICAgIC8vIFJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIE1vdXNldHJhcCBldmVudHMsIGlmIGl0J3MgYXZhaWxhYmxlLCBvdGhlcndpc2UgYWxsIGF0dGFjaGVkXG4gICAgICAgIC8vIGV2ZW50cyB3aWxsIGJlIGdob3N0IGV2ZW50cy5cbiAgICAgICAgKChtb3VzZXRyYXApID0+IHtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiB0aGlzLmtleWJvYXJkLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHRoaXMua2V5Ym9hcmQubXVsdGlTZWxlY3QgPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICAgICAgICAgIC8vIE1haW50YWluIGFzcGVjdCByYXRpb3Mgd2hlbiByZXNpemluZy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHRoaXMua2V5Ym9hcmQuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gdGhpcy5rZXlib2FyZC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICB9KShNb3VzZXRyYXAgfHwgeyBiaW5kOiAoKSA9PiB7fSB9KTtcblxuICAgICAgICAvLyBWb2lsYS4uLlxuICAgICAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudEhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgLy8gQWRkIGdyb3VwcyB0byB0aGUgU1ZHIGVsZW1lbnQuXG4gICAgICAgIHRoaXMuZ3JvdXBzID0ge1xuICAgICAgICAgICAgc2hhcGVzOiAgdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpLFxuICAgICAgICAgICAgaGFuZGxlczogdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnaGFuZGxlcycpLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIGxldCBzaGFwZSAgPSB0aGlzLmdldEluc3RhbmNlKG5hbWUpLFxuICAgICAgICAgICAgZmFjYWRlID0gc2hhcGUuZ2V0RmFjYWRlKCk7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMucHVzaChmYWNhZGUpO1xuICAgICAgICByZXR1cm4gZmFjYWRlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgb24oZXZlbnROYW1lLCBmbikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIub24oZXZlbnROYW1lLCBmbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0gZmFjYWRlIHtGYWNhZGV9XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoZmFjYWRlKSB7XG4gICAgICAgIGZhY2FkZS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZ2V0U2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5maWx0ZXIoKHNoYXBlKSA9PiBzaGFwZS5pc1NlbGVjdGVkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29ycyB0aGF0IGFyZSBhY2Nlc3NpYmxlIGJ5IHRoZSBzaGFwZXMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgZmFjYWRlcy5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0QWNjZXNzb3JcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QWNjZXNzb3IoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldFNlbGVjdGVkOiAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGdyb3VwczogICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBzLFxuICAgICAgICAgICAga2V5Ym9hcmQ6ICAgICAgICAgICAgICAgdGhpcy5rZXlib2FyZCxcbiAgICAgICAgICAgIGhhc1NlbGVjdGVkOiAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RFRCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlczogdGhpcy5nZXRTZWxlY3RlZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlbGVjdEFsbDogICAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSxcbiAgICAgICAgICAgIGRlc2VsZWN0QWxsOiAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpLFxuICAgICAgICAgICAgcmVvcmRlcjogICAgIChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBncm91cHMgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJ2cuc2hhcGVzIGcnKTtcbiAgICAgICAgICAgICAgICB6ZWQucmVvcmRlcihncm91cHMsIGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0SW5zdGFuY2UobmFtZSkge1xuXG4gICAgICAgIGxldCBtYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnN0YW50aWF0ZSB0aGUgc2hhcGUgb2JqZWN0LCBhbmQgaW5qZWN0IHRoZSBhY2Nlc3NvciBhbmQgbGlzdGVuZXIuXG4gICAgICAgIGxldCBzaGFwZSA9IG5ldyBtYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSgpO1xuICAgICAgICBzaGFwZS5zZXRBY2Nlc3Nvcih0aGlzLmdldEFjY2Vzc29yKCkpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLmluc2VydCh0aGlzLmdyb3Vwcy5zaGFwZXMsIHRoaXMuaW5kZXgrKyk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5EcmFmdCA9IERyYWZ0O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBGYWNhZGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZhY2FkZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlICAgID0gc2hhcGU7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZmVhdHVyZXMuc2VsZWN0YWJsZS5zZWxlY3QoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuaGFzU2VsZWN0ZWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5mZWF0dXJlcy5zZWxlY3RhYmxlLmRlc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5oYXNTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdEludmVydFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBzZWxlY3RJbnZlcnQoKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmhhc1NlbGVjdGVkKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgYXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSA9IG51bGwpIHtcblxuICAgICAgICBpZiAocHJvcGVydHkgPT09ICd6Jykge1xuXG4gICAgICAgICAgICAvLyBTcGVjaWFsIGJlaGF2aW91ciBtdXN0IGJlIGFwcGxpZWQgdG8gdGhlIGB6YCBwcm9wZXJ0eSwgYmVjYXVzZSBpdCBpcyBhcHBsaWVkXG4gICAgICAgICAgICAvLyB0byB0aGUgZ3JvdXAgZWxlbWVudCwgcmF0aGVyIHRoYW4gZGlyZWN0bHkgdG8gdGhlIHNoYXBlIGVsZW1lbnQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy56KHZhbHVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKClbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKClbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2hhcGUuZWxlbWVudC5hdHRyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cmFuc2Zvcm1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHRyYW5zZm9ybSh4ID0gbnVsbCwgeSA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh4ID09PSBudWxsICYmIHkgPT09IG51bGwpID8gW3RoaXMueCgpLCB0aGlzLnkoKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5hdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHgoeCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh4ID09PSBudWxsKSA/IHRoaXMucGFyc2VUcmFuc2xhdGUodGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKCkudHJhbnNmb3JtKS54XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zZm9ybSh4LCB0aGlzLnkoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB5KHkgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeSA9PT0gbnVsbCkgPyB0aGlzLnBhcnNlVHJhbnNsYXRlKHRoaXMuc2hhcGUuZWxlbWVudC5kYXR1bSgpLnRyYW5zZm9ybSkueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy50cmFuc2Zvcm0odGhpcy54KCksIHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB6XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB6KHogPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeiA9PT0gbnVsbCkgPyB0aGlzLnNoYXBlLmdyb3VwLmRhdHVtKCkuelxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5zaGFwZS5ncm91cC5kYXR1bSgpLnogPSB6O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWlnaHQ9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBkaW1lbnNpb24oaGVpZ2h0ID0gbnVsbCwgd2lkdGggPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoaGVpZ2h0ID09PSBudWxsICYmIHdpZHRoID09PSBudWxsKSA/IFt0aGlzLmhlaWdodCgpLCB0aGlzLndpZHRoKCldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuaGVpZ2h0KGhlaWdodCkud2lkdGgod2lkdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWlnaHQ9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGhlaWdodChoZWlnaHQgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt3aWR0aD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgd2lkdGgod2lkdGggPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZSgnd2lkdGgnLCB3aWR0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdUb0Zyb250KCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIEluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpICsgMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlKCd6JywgLUluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpIC0gMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBhcnNlVHJhbnNsYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYW5zZm9ybVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBwYXJzZVRyYW5zbGF0ZSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFN0cmluZyh0cmFuc2Zvcm0pLm1hdGNoKC90cmFuc2xhdGVcXCgoWzAtOV0rKVxccyosXFxzKihbMC05XSspL2kpO1xuICAgICAgICByZXR1cm4geyB4OiBwYXJzZUludChyZXN1bHRbMV0pLCB5OiBwYXJzZUludChyZXN1bHRbMl0pIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL3NoYXBlL2ZlYXR1cmUvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXROYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGluc2VydGlvblBvaW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt6VmFsdWU9MF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGluc2VydChpbnNlcnRpb25Qb2ludCwgelZhbHVlID0gMCkge1xuXG4gICAgICAgIHRoaXMuZ3JvdXAgICA9IGluc2VydGlvblBvaW50LmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgYHNoYXBlICR7dGhpcy5nZXROYW1lKCl9YCkuZGF0dW0oeyB6OiB6VmFsdWUgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZ3JvdXAuYXBwZW5kKHRoaXMuZ2V0VGFnKCkpLmRhdHVtKHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDAsMCknIH0pO1xuXG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRGYWNhZGVcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgZ2V0RmFjYWRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWNhZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBY2Nlc3NvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0QWNjZXNzb3IoYWNjZXNzb3IpIHtcbiAgICAgICAgdGhpcy5hY2Nlc3NvciA9IGFjY2Vzc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5TRUxFQ1RfQUxMLCAgICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuc2VsZWN0KCkpO1xuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5ERVNFTEVDVF9BTEwsICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuZGVzZWxlY3QoKSk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRmFjYWRlIGZyb20gJy4vLi4vRmFjYWRlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgRmFjYWRlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvdXJcbiAgICAgKiBAcmV0dXJuIHtSZWN0YW5nbGV9XG4gICAgICovXG4gICAgZmlsbChjb2xvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdmaWxsJywgY29sb3VyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBGYWNhZGUgICAgIGZyb20gJy4vLi4vZmFjYWRlL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZhY2FkZSA9IG5ldyBGYWNhZGUodGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTZWxlY3RhYmxlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZSAgID0gc2hhcGU7XG4gICAgICAgIGxldCBlbGVtZW50ICA9IHNoYXBlLmVsZW1lbnQsXG4gICAgICAgICAgICBrZXlib2FyZCA9IHNoYXBlLmFjY2Vzc29yLmtleWJvYXJkLFxuICAgICAgICAgICAgZmFjYWRlICAgPSBzaGFwZS5nZXRGYWNhZGUoKTtcblxuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKGtleWJvYXJkLm11bHRpU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgZmFjYWRlLnNlbGVjdEludmVydCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5kZXNlbGVjdEFsbCgpO1xuICAgICAgICAgICAgZmFjYWRlLnNlbGVjdCgpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRGlzcGF0Y2hlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtEaXNwYXRjaGVyfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VuZChldmVudE5hbWUsIHByb3BlcnRpZXMpIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaCgoZm4pID0+IGZuKHByb3BlcnRpZXMpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb25cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG9uKGV2ZW50TmFtZSwgZm4pIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChmbik7XG5cbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICBTRUxFQ1RfQUxMOiAgICdzZWxlY3QtYWxsJyxcbiAgICBERVNFTEVDVF9BTEw6ICdkZXNlbGVjdCcsXG4gICAgU0VMRUNURUQ6ICAgICAnc2VsZWN0ZWQnXG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgWmVkXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlb3JkZXJcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBncm91cHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVvcmRlcihncm91cHMsIGdyb3VwKSB7XG5cbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAgICAgbGV0IHpNYXggPSBncm91cHMuc2l6ZSgpO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGUgbWF4aW11bSBaIGlzIGFib3ZlIHplcm8gYW5kIGJlbG93IHRoZSBtYXhpbXVtLlxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56IDwgMSkgICAgeyBncm91cC5kYXR1bSgpLnogPSAxOyAgICB9XG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPiB6TWF4KSB7IGdyb3VwLmRhdHVtKCkueiA9IHpNYXg7IH1cblxuICAgICAgICBsZXQgelRhcmdldCA9IGdyb3VwLmRhdHVtKCkueiwgekN1cnJlbnQgPSAxO1xuXG4gICAgICAgIC8vIEluaXRpYWwgc29ydCBpbnRvIHotaW5kZXggb3JkZXIuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgICAgIGdyb3Vwc1swXS5mb3JFYWNoKChtb2RlbCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBDdXJyZW50IGdyb3VwIGlzIGltbXV0YWJsZSBpbiB0aGlzIGl0ZXJhdGlvbi5cbiAgICAgICAgICAgIGlmIChtb2RlbCA9PT0gZ3JvdXAubm9kZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTa2lwIHRoZSB0YXJnZXQgWiBpbmRleC5cbiAgICAgICAgICAgIGlmICh6Q3VycmVudCA9PT0gelRhcmdldCkge1xuICAgICAgICAgICAgICAgIHpDdXJyZW50Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzaGFwZSA9IGQzLnNlbGVjdChtb2RlbCksXG4gICAgICAgICAgICAgICAgZGF0dW0gPSBzaGFwZS5kYXR1bSgpO1xuICAgICAgICAgICAgZGF0dW0ueiA9IHpDdXJyZW50Kys7XG4gICAgICAgICAgICBzaGFwZS5kYXR1bShkYXR1bSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRmluYWwgc29ydCBwYXNzLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgIH1cblxufSJdfQ==
