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
        return this;
      }
    },
    invert: {

      /**
       * @method invert
       * @return {Facade}
       */

      value: function invert() {
        this.selected = !this.selected;
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
             * @param {Object} insertionPoint
             * @param {Number} [zValue=0]
             * @return {void}
             */

            value: function insert(insertionPoint) {
                var zValue = arguments[1] === undefined ? 0 : arguments[1];

                this.group = insertionPoint.append("g").attr("class", "shape " + this.getName()).datum({ z: zValue });
                this.element = this.group.append(this.getTag()).datum({ transform: "translate(0,0)" });
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
/**
 * @module Draft
 * @submodule Events
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

module.exports = {

  SELECT_ALL: "select-all",
  DESELECT_ALL: "deselect"

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvWmVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLFNBQVMsMkJBQU8saUNBQWlDOztJQUNqRCxHQUFHLDJCQUFhLGtCQUFrQjs7Ozs7Ozs7SUFPbkMsS0FBSzs7Ozs7Ozs7O0FBUUksYUFSVCxLQUFLLENBUUssT0FBTyxFQUFFLE9BQU8sRUFBRTs7OzhCQVI1QixLQUFLOztBQVVILFlBQUksQ0FBQyxNQUFNLEdBQU8sRUFBRSxDQUFD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Q0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUFDOztBQUVqQyxjQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFLOzs7QUFHekIsZ0JBQUksS0FBSyxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRTtBQUN4Qix1QkFBTzthQUNWOzs7QUFHRCxnQkFBSSxRQUFRLEtBQUssT0FBTyxFQUFFO0FBQ3RCLHdCQUFRLEVBQUUsQ0FBQzthQUNkOztBQUVELGdCQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMxQixpQkFBSyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUNyQixpQkFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUV0QixDQUFDLENBQUM7OztBQUdILGNBQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQzttQkFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUFDO0tBRXBDOztDQUVKIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vZGlzcGF0Y2hlci9FdmVudHMuanMnO1xuaW1wb3J0IFJlY3RhbmdsZSAgZnJvbSAnLi9jb21wb25lbnRzL3NoYXBlL1JlY3RhbmdsZS5qcyc7XG5pbXBvcnQgemVkICAgICAgICBmcm9tICcuL2hlbHBlcnMvWmVkLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5jbGFzcyBEcmFmdCB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR8U3RyaW5nfSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtEcmFmdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMgICAgID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggICAgICA9IDE7XG4gICAgICAgIHRoaXMua2V5Ym9hcmQgICA9IHsgbXVsdGlTZWxlY3Q6IGZhbHNlLCBhc3BlY3RSYXRpbzogZmFsc2UgfTtcbiAgICAgICAgLy90aGlzLm9wdGlvbnMgICAgPSBPYmplY3QuYXNzaWduKHRoaXMuZ2V0T3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zICAgID0gdGhpcy5nZXRPcHRpb25zKCk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG5cbiAgICAgICAgLy8gUmVzcG9uc2libGUgZm9yIHNldHRpbmcgdXAgTW91c2V0cmFwIGV2ZW50cywgaWYgaXQncyBhdmFpbGFibGUsIG90aGVyd2lzZSBhbGwgYXR0YWNoZWRcbiAgICAgICAgLy8gZXZlbnRzIHdpbGwgYmUgZ2hvc3QgZXZlbnRzLlxuICAgICAgICAoKG1vdXNldHJhcCkgPT4ge1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgYWxsIG9mIHRoZSBhdmFpbGFibGUgc2hhcGVzLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCthJywgKCkgPT4gdGhpcy5kaXNwYXRjaGVyLnNlbmQoRXZlbnRzLlNFTEVDVF9BTEwpKTtcblxuICAgICAgICAgICAgLy8gTXVsdGktc2VsZWN0aW5nIHNoYXBlcy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHRoaXMua2V5Ym9hcmQubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ21vZCcsICAgKCkgPT4gdGhpcy5rZXlib2FyZC5tdWx0aVNlbGVjdCA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICAgICAgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvcyB3aGVuIHJlc2l6aW5nLlxuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gdGhpcy5rZXlib2FyZC5hc3BlY3RSYXRpbyA9IHRydWUsICdrZXlkb3duJyk7XG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiB0aGlzLmtleWJvYXJkLmFzcGVjdFJhdGlvID0gZmFsc2UsICdrZXl1cCcpO1xuXG4gICAgICAgIH0pKE1vdXNldHJhcCB8fCB7IGJpbmQ6ICgpID0+IHt9IH0pO1xuXG4gICAgICAgIC8vIFZvaWxhLi4uXG4gICAgICAgIHRoaXMuc3ZnID0gZDMuc2VsZWN0KHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkgOiBlbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgdGhpcy5vcHRpb25zLmRvY3VtZW50V2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgdGhpcy5vcHRpb25zLmRvY3VtZW50SGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpKTtcblxuICAgICAgICAvLyBBZGQgZ3JvdXBzIHRvIHRoZSBTVkcgZWxlbWVudC5cbiAgICAgICAgdGhpcy5ncm91cHMgPSB7XG4gICAgICAgICAgICBzaGFwZXM6ICB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdzaGFwZXMnKS5vbignY2xpY2snLCAoKSA9PiBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKSksXG4gICAgICAgICAgICBoYW5kbGVzOiB0aGlzLnN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdoYW5kbGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGFkZChuYW1lKSB7XG5cbiAgICAgICAgbGV0IHNoYXBlICA9IHRoaXMuZ2V0SW5zdGFuY2UobmFtZSksXG4gICAgICAgICAgICBmYWNhZGUgPSBzaGFwZS5nZXRGYWNhZGUoKTtcblxuICAgICAgICB0aGlzLnNoYXBlcy5wdXNoKGZhY2FkZSk7XG4gICAgICAgIHJldHVybiBmYWNhZGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSBmYWNhZGUge0ZhY2FkZX1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlbW92ZShmYWNhZGUpIHtcbiAgICAgICAgZmFjYWRlLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0U2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBnZXRTZWxlY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhcGVzLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjZXNzb3JzIHRoYXQgYXJlIGFjY2Vzc2libGUgYnkgdGhlIHNoYXBlcyBhbmQgdGhlaXIgYXNzb2NpYXRlZCBmYWNhZGVzLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRBY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRBY2Nlc3NvcigpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0U2VsZWN0ZWQ6ICAgICAgICAgICAgdGhpcy5nZXRTZWxlY3RlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZ3JvdXBzOiAgICAgICAgICAgICAgICAgdGhpcy5ncm91cHMsXG4gICAgICAgICAgICBzZWxlY3RBbGw6ICAgKCkgICAgICA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuU0VMRUNUX0FMTCksXG4gICAgICAgICAgICBkZXNlbGVjdEFsbDogKCkgICAgICA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKSxcbiAgICAgICAgICAgIHJlb3JkZXI6ICAgICAoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXBzID0gdGhpcy5zdmcuc2VsZWN0QWxsKCdnLnNoYXBlcyBnJyk7XG4gICAgICAgICAgICAgICAgemVkLnJlb3JkZXIoZ3JvdXBzLCBncm91cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0SW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldEluc3RhbmNlKG5hbWUpIHtcblxuICAgICAgICBsZXQgbWFwID0ge1xuICAgICAgICAgICAgcmVjdDogUmVjdGFuZ2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW5zdGFudGlhdGUgdGhlIHNoYXBlIG9iamVjdCwgYW5kIGluamVjdCB0aGUgYWNjZXNzb3IgYW5kIGxpc3RlbmVyLlxuICAgICAgICBsZXQgc2hhcGUgPSBuZXcgbWFwW25hbWUudG9Mb3dlckNhc2UoKV0oKTtcbiAgICAgICAgc2hhcGUuc2V0QWNjZXNzb3IodGhpcy5nZXRBY2Nlc3NvcigpKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuICAgICAgICBzaGFwZS5pbnNlcnQodGhpcy5ncm91cHMuc2hhcGVzLCB0aGlzLmluZGV4KyspO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0T3B0aW9ucygpIHtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZG9jdW1lbnRIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgIGRvY3VtZW50V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGdyaWRTaXplOiAxMFxuICAgICAgICB9O1xuXG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gS2FsaW5rYSwga2FsaW5rYSwga2FsaW5rYSBtb3lhIVxuICAgIC8vIFYgc2FkdSB5YWdvZGEgbWFsaW5rYSwgbWFsaW5rYSBtb3lhIVxuICAgICR3aW5kb3cuRHJhZnQgPSBEcmFmdDtcblxufSkod2luZG93KTsiLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgRmFjYWRlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGYWNhZGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcbiAgICAgICAgdGhpcy5zaGFwZSAgICA9IHNoYXBlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLmZlYXR1cmVzLnNlbGVjdGFibGUuc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLmZlYXR1cmVzLnNlbGVjdGFibGUuZGVzZWxlY3QoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGludmVydFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBpbnZlcnQoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcGFyYW0geyp9IFt2YWx1ZT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgYXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSA9IG51bGwpIHtcblxuICAgICAgICBpZiAocHJvcGVydHkgPT09ICd6Jykge1xuXG4gICAgICAgICAgICAvLyBTcGVjaWFsIGJlaGF2aW91ciBtdXN0IGJlIGFwcGxpZWQgdG8gdGhlIGB6YCBwcm9wZXJ0eSwgYmVjYXVzZSBpdCBpcyBhcHBsaWVkXG4gICAgICAgICAgICAvLyB0byB0aGUgZ3JvdXAgZWxlbWVudCwgcmF0aGVyIHRoYW4gZGlyZWN0bHkgdG8gdGhlIHNoYXBlIGVsZW1lbnQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy56KHZhbHVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKClbcHJvcGVydHldO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKClbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2hhcGUuZWxlbWVudC5hdHRyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB0cmFuc2Zvcm1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHRyYW5zZm9ybSh4ID0gbnVsbCwgeSA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh4ID09PSBudWxsICYmIHkgPT09IG51bGwpID8gW3RoaXMueCgpLCB0aGlzLnkoKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5hdHRyaWJ1dGUoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHgoeCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh4ID09PSBudWxsKSA/IHRoaXMucGFyc2VUcmFuc2xhdGUodGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKCkudHJhbnNmb3JtKS54XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zZm9ybSh4LCB0aGlzLnkoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB5XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB5KHkgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeSA9PT0gbnVsbCkgPyB0aGlzLnBhcnNlVHJhbnNsYXRlKHRoaXMuc2hhcGUuZWxlbWVudC5kYXR1bSgpLnRyYW5zZm9ybSkueVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy50cmFuc2Zvcm0odGhpcy54KCksIHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgelxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB6XG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB6KHogPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoeiA9PT0gbnVsbCkgPyB0aGlzLnNoYXBlLmdyb3VwLmRhdHVtKCkuelxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5zaGFwZS5ncm91cC5kYXR1bSgpLnogPSB6O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGltZW5zaW9uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWlnaHQ9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBkaW1lbnNpb24oaGVpZ2h0ID0gbnVsbCwgd2lkdGggPSBudWxsKSB7XG4gICAgICAgIHJldHVybiAoaGVpZ2h0ID09PSBudWxsICYmIHdpZHRoID09PSBudWxsKSA/IFt0aGlzLmhlaWdodCgpLCB0aGlzLndpZHRoKCldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuaGVpZ2h0KGhlaWdodCkud2lkdGgod2lkdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaGVpZ2h0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWlnaHQ9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGhlaWdodChoZWlnaHQgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZSgnaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHdpZHRoXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt3aWR0aD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgd2lkdGgod2lkdGggPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZSgnd2lkdGgnLCB3aWR0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBicmluZ1RvRnJvbnRcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdUb0Zyb250KCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIEluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nRm9yd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgYnJpbmdGb3J3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpICsgMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kVG9CYWNrXG4gICAgICogQHJldHVybiB7RmFjYWRlfVxuICAgICAqL1xuICAgIHNlbmRUb0JhY2soKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlKCd6JywgLUluZmluaXR5KTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRCYWNrd2FyZHNcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VuZEJhY2t3YXJkcygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCB0aGlzLmF0dHJpYnV0ZSgneicpIC0gMSk7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IucmVvcmRlcih0aGlzLnNoYXBlLmdyb3VwKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRTaGFwZVxuICAgICAqIEByZXR1cm4ge1NoYXBlfVxuICAgICAqL1xuICAgIGdldFNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBhcnNlVHJhbnNsYXRlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRyYW5zZm9ybVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBwYXJzZVRyYW5zbGF0ZSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFN0cmluZyh0cmFuc2Zvcm0pLm1hdGNoKC90cmFuc2xhdGVcXCgoWzAtOV0rKVxccyosXFxzKihbMC05XSspL2kpO1xuICAgICAgICByZXR1cm4geyB4OiBwYXJzZUludChyZXN1bHRbMV0pLCB5OiBwYXJzZUludChyZXN1bHRbMl0pIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpc1NlbGVjdGVkXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZDtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2VsZWN0YWJsZSBmcm9tICcuL3NoYXBlL2ZlYXR1cmUvU2VsZWN0YWJsZS5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuLy4uL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBTaGFwZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVjdGFuZ2xlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSB7XG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBuZXcgU2VsZWN0YWJsZSh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXROYW1lXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldE5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhZygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5zZXJ0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGluc2VydGlvblBvaW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt6VmFsdWU9MF1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGluc2VydChpbnNlcnRpb25Qb2ludCwgelZhbHVlID0gMCkge1xuXG4gICAgICAgIHRoaXMuZ3JvdXAgICA9IGluc2VydGlvblBvaW50LmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgYHNoYXBlICR7dGhpcy5nZXROYW1lKCl9YCkuZGF0dW0oeyB6OiB6VmFsdWUgfSk7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuZ3JvdXAuYXBwZW5kKHRoaXMuZ2V0VGFnKCkpLmRhdHVtKHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDAsMCknIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRGYWNhZGVcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgZ2V0RmFjYWRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWNhZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRBY2Nlc3NvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhY2Nlc3NvclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0QWNjZXNzb3IoYWNjZXNzb3IpIHtcbiAgICAgICAgdGhpcy5hY2Nlc3NvciA9IGFjY2Vzc29yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2V0RGlzcGF0Y2hlclxuICAgICAqIEBwYXJhbSB7RGlzcGF0Y2hlcn0gZGlzcGF0Y2hlclxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0RGlzcGF0Y2hlcihkaXNwYXRjaGVyKSB7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5TRUxFQ1RfQUxMLCAgICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuc2VsZWN0KCkpO1xuICAgICAgICBkaXNwYXRjaGVyLm9uKEV2ZW50cy5ERVNFTEVDVF9BTEwsICgpID0+IHRoaXMuZ2V0RmFjYWRlKCkuZGVzZWxlY3QoKSk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgRmFjYWRlIGZyb20gJy4vLi4vRmFjYWRlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgRmFjYWRlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZmlsbFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvdXJcbiAgICAgKiBAcmV0dXJuIHtSZWN0YW5nbGV9XG4gICAgICovXG4gICAgZmlsbChjb2xvdXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdmaWxsJywgY29sb3VyKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgICAgICBmcm9tICcuLy4uL1NoYXBlLmpzJztcbmltcG9ydCBGYWNhZGUgICAgIGZyb20gJy4vLi4vZmFjYWRlL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZhY2FkZSA9IG5ldyBGYWNhZGUodGhpcyk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRhZ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRUYWcoKSB7XG4gICAgICAgIHJldHVybiAncmVjdCc7XG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNlbGVjdGFibGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdGFibGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTZWxlY3RhYmxlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge0Rpc3BhdGNoZXJ9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VuZChldmVudE5hbWUpIHtcblxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgb24oZXZlbnROYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIFNFTEVDVF9BTEw6ICAgJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0J1xuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFplZFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW9yZGVyXG4gICAgICogQHBhcmFtIHtBcnJheX0gZ3JvdXBzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdyb3VwXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHJlb3JkZXIoZ3JvdXBzLCBncm91cCkge1xuXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICAgIGxldCB6TWF4ID0gZ3JvdXBzLnNpemUoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIG1heGltdW0gWiBpcyBhYm92ZSB6ZXJvIGFuZCBiZWxvdyB0aGUgbWF4aW11bS5cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA8IDEpICAgIHsgZ3JvdXAuZGF0dW0oKS56ID0gMTsgICAgfVxuICAgICAgICBpZiAoZ3JvdXAuZGF0dW0oKS56ID4gek1heCkgeyBncm91cC5kYXR1bSgpLnogPSB6TWF4OyB9XG5cbiAgICAgICAgbGV0IHpUYXJnZXQgPSBncm91cC5kYXR1bSgpLnosIHpDdXJyZW50ID0gMTtcblxuICAgICAgICAvLyBJbml0aWFsIHNvcnQgaW50byB6LWluZGV4IG9yZGVyLlxuICAgICAgICBncm91cHMuc29ydCgoYSwgYikgPT4gYS56IC0gYi56KTtcblxuICAgICAgICBncm91cHNbMF0uZm9yRWFjaCgobW9kZWwpID0+IHtcblxuICAgICAgICAgICAgLy8gQ3VycmVudCBncm91cCBpcyBpbW11dGFibGUgaW4gdGhpcyBpdGVyYXRpb24uXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IGdyb3VwLm5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgdGFyZ2V0IFogaW5kZXguXG4gICAgICAgICAgICBpZiAoekN1cnJlbnQgPT09IHpUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB6Q3VycmVudCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgc2hhcGUgPSBkMy5zZWxlY3QobW9kZWwpLFxuICAgICAgICAgICAgICAgIGRhdHVtID0gc2hhcGUuZGF0dW0oKTtcbiAgICAgICAgICAgIGRhdHVtLnogPSB6Q3VycmVudCsrO1xuICAgICAgICAgICAgc2hhcGUuZGF0dW0oZGF0dW0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZpbmFsIHNvcnQgcGFzcy5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICB9XG5cbn0iXX0=
