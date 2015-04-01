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
    invert: {

      /**
       * @method invert
       * @return {Facade}
       */

      value: function invert() {
        this.selected = !this.selected;
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
                facade.invert();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvRHJhZnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9GYWNhZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9TaGFwZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9jb21wb25lbnRzL2ZhY2FkZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvY29tcG9uZW50cy9zaGFwZS9mZWF0dXJlL1NlbGVjdGFibGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvZGlzcGF0Y2hlci9EaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2Rpc3BhdGNoZXIvRXZlbnRzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvWmVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLDRCQUE0Qjs7SUFDNUMsTUFBTSwyQkFBVSx3QkFBd0I7O0lBQ3hDLFNBQVMsMkJBQU8saUNBQWlDOztJQUNqRCxHQUFHLDJCQUFhLGtCQUFrQjs7Ozs7Ozs7SUFPbkMsS0FBSzs7Ozs7Ozs7O0FBUUksYUFSVCxLQUFLLENBUUssT0FBTyxFQUFFLE9BQU8sRUFBRTs7OzhCQVI1QixLQUFLOztBQVVILFlBQUksQ0FBQyxNQUFNLEdBQU8sRUFBRSxDQUFD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LGdDQUFHLElBQUk7WUFBRSxDQUFDLGdDQUFHLElBQUk7O0FBQ3hCLGVBQU8sQUFBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxpQkFBZSxDQUFDLFVBQUssQ0FBQyxPQUFJLENBQUM7T0FDNUY7O0FBT0QsS0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQUEsWUFBVztZQUFWLENBQUMsZ0NBQUcsSUFBSTs7QUFDTixlQUFPLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FDM0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDckQ7O0FBT0QsS0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQUEsWUFBVztZQUFWLENBQUMsZ0NBQUcsSUFBSTs7QUFDTixlQUFPLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FDM0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDckQ7O0FBT0QsS0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQUEsWUFBVztZQUFWLENBQUMsZ0NBQUcsSUFBSTs7QUFDTixlQUFPLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtB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LENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDeEIsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQUksUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUN0Qix3QkFBUSxFQUFFLENBQUM7YUFDZDs7QUFFRCxnQkFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUIsaUJBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7QUFDckIsaUJBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7U0FFdEIsQ0FBQyxDQUFDOzs7QUFHSCxjQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7bUJBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUFBLENBQUMsQ0FBQztLQUVwQzs7Q0FFSiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXIvRGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgRXZlbnRzICAgICBmcm9tICcuL2Rpc3BhdGNoZXIvRXZlbnRzLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vY29tcG9uZW50cy9zaGFwZS9SZWN0YW5nbGUuanMnO1xuaW1wb3J0IHplZCAgICAgICAgZnJvbSAnLi9oZWxwZXJzL1plZC5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuY2xhc3MgRHJhZnQge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTVkdFbGVtZW50fFN0cmluZ30gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluZGV4ICAgICAgPSAxO1xuICAgICAgICB0aGlzLmtleWJvYXJkICAgPSB7IG11bHRpU2VsZWN0OiBmYWxzZSwgYXNwZWN0UmF0aW86IGZhbHNlIH07XG4gICAgICAgIC8vdGhpcy5vcHRpb25zICAgID0gT2JqZWN0LmFzc2lnbih0aGlzLmdldE9wdGlvbnMoKSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyAgICA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuXG4gICAgICAgIC8vIFJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHVwIE1vdXNldHJhcCBldmVudHMsIGlmIGl0J3MgYXZhaWxhYmxlLCBvdGhlcndpc2UgYWxsIGF0dGFjaGVkXG4gICAgICAgIC8vIGV2ZW50cyB3aWxsIGJlIGdob3N0IGV2ZW50cy5cbiAgICAgICAgKChtb3VzZXRyYXApID0+IHtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGFsbCBvZiB0aGUgYXZhaWxhYmxlIHNoYXBlcy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgICAgIC8vIE11bHRpLXNlbGVjdGluZyBzaGFwZXMuXG4gICAgICAgICAgICBtb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiB0aGlzLmtleWJvYXJkLm11bHRpU2VsZWN0ID0gdHJ1ZSwgJ2tleWRvd24nKTtcbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdtb2QnLCAgICgpID0+IHRoaXMua2V5Ym9hcmQubXVsdGlTZWxlY3QgPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICAgICAgICAgIC8vIE1haW50YWluIGFzcGVjdCByYXRpb3Mgd2hlbiByZXNpemluZy5cbiAgICAgICAgICAgIG1vdXNldHJhcC5iaW5kKCdzaGlmdCcsICgpID0+IHRoaXMua2V5Ym9hcmQuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICAgICAgbW91c2V0cmFwLmJpbmQoJ3NoaWZ0JywgKCkgPT4gdGhpcy5rZXlib2FyZC5hc3BlY3RSYXRpbyA9IGZhbHNlLCAna2V5dXAnKTtcblxuICAgICAgICB9KShNb3VzZXRyYXAgfHwgeyBiaW5kOiAoKSA9PiB7fSB9KTtcblxuICAgICAgICAvLyBWb2lsYS4uLlxuICAgICAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudFdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHRoaXMub3B0aW9ucy5kb2N1bWVudEhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAoKSA9PiB0aGlzLmRpc3BhdGNoZXIuc2VuZChFdmVudHMuREVTRUxFQ1RfQUxMKSk7XG5cbiAgICAgICAgLy8gQWRkIGdyb3VwcyB0byB0aGUgU1ZHIGVsZW1lbnQuXG4gICAgICAgIHRoaXMuZ3JvdXBzID0ge1xuICAgICAgICAgICAgc2hhcGVzOiAgdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpLFxuICAgICAgICAgICAgaGFuZGxlczogdGhpcy5zdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnaGFuZGxlcycpLm9uKCdjbGljaycsICgpID0+IGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKVxuICAgICAgICB9O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIGxldCBzaGFwZSAgPSB0aGlzLmdldEluc3RhbmNlKG5hbWUpLFxuICAgICAgICAgICAgZmFjYWRlID0gc2hhcGUuZ2V0RmFjYWRlKCk7XG5cbiAgICAgICAgdGhpcy5zaGFwZXMucHVzaChmYWNhZGUpO1xuICAgICAgICByZXR1cm4gZmFjYWRlO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgb24oZXZlbnROYW1lLCBmbikge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIub24oZXZlbnROYW1lLCBmbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZW1vdmVcbiAgICAgKiBAcGFyYW0gZmFjYWRlIHtGYWNhZGV9XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoZmFjYWRlKSB7XG4gICAgICAgIGZhY2FkZS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZ2V0U2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcy5maWx0ZXIoKHNoYXBlKSA9PiBzaGFwZS5pc1NlbGVjdGVkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29ycyB0aGF0IGFyZSBhY2Nlc3NpYmxlIGJ5IHRoZSBzaGFwZXMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgZmFjYWRlcy5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZ2V0QWNjZXNzb3JcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QWNjZXNzb3IoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldFNlbGVjdGVkOiAgICAgICAgICAgIHRoaXMuZ2V0U2VsZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGdyb3VwczogICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBzLFxuICAgICAgICAgICAga2V5Ym9hcmQ6ICAgICAgICAgICAgICAgdGhpcy5rZXlib2FyZCxcbiAgICAgICAgICAgIGhhc1NlbGVjdGVkOiAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RFRCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlczogdGhpcy5nZXRTZWxlY3RlZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHNlbGVjdEFsbDogICAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5TRUxFQ1RfQUxMKSxcbiAgICAgICAgICAgIGRlc2VsZWN0QWxsOiAoKSAgICAgID0+IHRoaXMuZGlzcGF0Y2hlci5zZW5kKEV2ZW50cy5ERVNFTEVDVF9BTEwpLFxuICAgICAgICAgICAgcmVvcmRlcjogICAgIChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBncm91cHMgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJ2cuc2hhcGVzIGcnKTtcbiAgICAgICAgICAgICAgICB6ZWQucmVvcmRlcihncm91cHMsIGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBnZXRJbnN0YW5jZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0SW5zdGFuY2UobmFtZSkge1xuXG4gICAgICAgIGxldCBtYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJbnN0YW50aWF0ZSB0aGUgc2hhcGUgb2JqZWN0LCBhbmQgaW5qZWN0IHRoZSBhY2Nlc3NvciBhbmQgbGlzdGVuZXIuXG4gICAgICAgIGxldCBzaGFwZSA9IG5ldyBtYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSgpO1xuICAgICAgICBzaGFwZS5zZXRBY2Nlc3Nvcih0aGlzLmdldEFjY2Vzc29yKCkpO1xuICAgICAgICBzaGFwZS5zZXREaXNwYXRjaGVyKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgIHNoYXBlLmluc2VydCh0aGlzLmdyb3Vwcy5zaGFwZXMsIHRoaXMuaW5kZXgrKyk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0T3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXRPcHRpb25zKCkge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBLYWxpbmthLCBrYWxpbmthLCBrYWxpbmthIG1veWEhXG4gICAgLy8gViBzYWR1IHlhZ29kYSBtYWxpbmthLCBtYWxpbmthIG1veWEhXG4gICAgJHdpbmRvdy5EcmFmdCA9IERyYWZ0O1xuXG59KSh3aW5kb3cpOyIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBGYWNhZGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZhY2FkZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzaGFwZSkge1xuICAgICAgICB0aGlzLnNoYXBlICAgID0gc2hhcGU7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2hhcGUuZmVhdHVyZXMuc2VsZWN0YWJsZS5zZWxlY3QoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuc2hhcGUuYWNjZXNzb3IuaGFzU2VsZWN0ZWQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5mZWF0dXJlcy5zZWxlY3RhYmxlLmRlc2VsZWN0KCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5oYXNTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGludmVydFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBpbnZlcnQoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAhdGhpcy5zZWxlY3RlZDtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5oYXNTZWxlY3RlZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7Kn0gW3ZhbHVlPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICBhdHRyaWJ1dGUocHJvcGVydHksIHZhbHVlID0gbnVsbCkge1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eSA9PT0gJ3onKSB7XG5cbiAgICAgICAgICAgIC8vIFNwZWNpYWwgYmVoYXZpb3VyIG11c3QgYmUgYXBwbGllZCB0byB0aGUgYHpgIHByb3BlcnR5LCBiZWNhdXNlIGl0IGlzIGFwcGxpZWRcbiAgICAgICAgICAgIC8vIHRvIHRoZSBncm91cCBlbGVtZW50LCByYXRoZXIgdGhhbiBkaXJlY3RseSB0byB0aGUgc2hhcGUgZWxlbWVudC5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnoodmFsdWUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKVtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zaGFwZS5lbGVtZW50LmF0dHIocHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeT1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgdHJhbnNmb3JtKHggPSBudWxsLCB5ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHggPT09IG51bGwgJiYgeSA9PT0gbnVsbCkgPyBbdGhpcy54KCksIHRoaXMueSgpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLmF0dHJpYnV0ZSgndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgeFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbeD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgeCh4ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gKHggPT09IG51bGwpID8gdGhpcy5wYXJzZVRyYW5zbGF0ZSh0aGlzLnNoYXBlLmVsZW1lbnQuZGF0dW0oKS50cmFuc2Zvcm0pLnhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNmb3JtKHgsIHRoaXMueSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHkoeSA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh5ID09PSBudWxsKSA/IHRoaXMucGFyc2VUcmFuc2xhdGUodGhpcy5zaGFwZS5lbGVtZW50LmRhdHVtKCkudHJhbnNmb3JtKS55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnRyYW5zZm9ybSh0aGlzLngoKSwgeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCB6XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHpcbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIHooeiA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICh6ID09PSBudWxsKSA/IHRoaXMuc2hhcGUuZ3JvdXAuZGF0dW0oKS56XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLnNoYXBlLmdyb3VwLmRhdHVtKCkueiA9IHo7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaW1lbnNpb25cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodD1udWxsXVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbd2lkdGg9bnVsbF1cbiAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAqL1xuICAgIGRpbWVuc2lvbihoZWlnaHQgPSBudWxsLCB3aWR0aCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIChoZWlnaHQgPT09IG51bGwgJiYgd2lkdGggPT09IG51bGwpID8gW3RoaXMuaGVpZ2h0KCksIHRoaXMud2lkdGgoKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5oZWlnaHQoaGVpZ2h0KS53aWR0aCh3aWR0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoZWlnaHRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2hlaWdodD1udWxsXVxuICAgICAqIEByZXR1cm4geyp9XG4gICAgICovXG4gICAgaGVpZ2h0KGhlaWdodCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgd2lkdGhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3dpZHRoPW51bGxdXG4gICAgICogQHJldHVybiB7Kn1cbiAgICAgKi9cbiAgICB3aWR0aCh3aWR0aCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGJyaW5nVG9Gcm9udFxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBicmluZ1RvRnJvbnQoKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlKCd6JywgSW5maW5pdHkpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLnJlb3JkZXIodGhpcy5zaGFwZS5ncm91cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYnJpbmdGb3J3YXJkc1xuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBicmluZ0ZvcndhcmRzKCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIHRoaXMuYXR0cmlidXRlKCd6JykgKyAxKTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbmRUb0JhY2tcbiAgICAgKiBAcmV0dXJuIHtGYWNhZGV9XG4gICAgICovXG4gICAgc2VuZFRvQmFjaygpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUoJ3onLCAtSW5maW5pdHkpO1xuICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLnJlb3JkZXIodGhpcy5zaGFwZS5ncm91cCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VuZEJhY2t3YXJkc1xuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBzZW5kQmFja3dhcmRzKCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZSgneicsIHRoaXMuYXR0cmlidXRlKCd6JykgLSAxKTtcbiAgICAgICAgdGhpcy5zaGFwZS5hY2Nlc3Nvci5yZW9yZGVyKHRoaXMuc2hhcGUuZ3JvdXApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFNoYXBlXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZ2V0U2hhcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcGFyc2VUcmFuc2xhdGVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNmb3JtXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHBhcnNlVHJhbnNsYXRlKHRyYW5zZm9ybSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gU3RyaW5nKHRyYW5zZm9ybSkubWF0Y2goL3RyYW5zbGF0ZVxcKChbMC05XSspXFxzKixcXHMqKFswLTldKykvaSk7XG4gICAgICAgIHJldHVybiB7IHg6IHBhcnNlSW50KHJlc3VsdFsxXSksIHk6IHBhcnNlSW50KHJlc3VsdFsyXSkgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkO1xuICAgIH1cblxufSIsImltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4vc2hhcGUvZmVhdHVyZS9TZWxlY3RhYmxlLmpzJztcbmltcG9ydCBFdmVudHMgICAgIGZyb20gJy4vLi4vZGlzcGF0Y2hlci9FdmVudHMuanMnO1xuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFNoYXBlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFwZSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldE5hbWVcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFnKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnNlcnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5zZXJ0aW9uUG9pbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3pWYWx1ZT0wXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaW5zZXJ0KGluc2VydGlvblBvaW50LCB6VmFsdWUgPSAwKSB7XG5cbiAgICAgICAgdGhpcy5ncm91cCAgID0gaW5zZXJ0aW9uUG9pbnQuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCBgc2hhcGUgJHt0aGlzLmdldE5hbWUoKX1gKS5kYXR1bSh7IHo6IHpWYWx1ZSB9KTtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5ncm91cC5hcHBlbmQodGhpcy5nZXRUYWcoKSkuZGF0dW0oeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoMCwwKScgfSk7XG5cbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKHRoaXMpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldEZhY2FkZVxuICAgICAqIEByZXR1cm4ge0ZhY2FkZX1cbiAgICAgKi9cbiAgICBnZXRGYWNhZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhY2FkZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldEFjY2Vzc29yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFjY2Vzc29yXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRBY2Nlc3NvcihhY2Nlc3Nvcikge1xuICAgICAgICB0aGlzLmFjY2Vzc29yID0gYWNjZXNzb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXREaXNwYXRjaGVyXG4gICAgICogQHBhcmFtIHtEaXNwYXRjaGVyfSBkaXNwYXRjaGVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXREaXNwYXRjaGVyKGRpc3BhdGNoZXIpIHtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLlNFTEVDVF9BTEwsICAgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5zZWxlY3QoKSk7XG4gICAgICAgIGRpc3BhdGNoZXIub24oRXZlbnRzLkRFU0VMRUNUX0FMTCwgKCkgPT4gdGhpcy5nZXRGYWNhZGUoKS5kZXNlbGVjdCgpKTtcblxuICAgIH1cblxufSIsImltcG9ydCBGYWNhZGUgZnJvbSAnLi8uLi9GYWNhZGUuanMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVjdGFuZ2xlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBGYWNhZGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNvbG91clxuICAgICAqIEByZXR1cm4ge1JlY3RhbmdsZX1cbiAgICAgKi9cbiAgICBmaWxsKGNvbG91cikge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGUoJ2ZpbGwnLCBjb2xvdXIpO1xuICAgIH1cblxufSIsImltcG9ydCBTaGFwZSAgICAgIGZyb20gJy4vLi4vU2hhcGUuanMnO1xuaW1wb3J0IEZhY2FkZSAgICAgZnJvbSAnLi8uLi9mYWNhZGUvUmVjdGFuZ2xlLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFJlY3RhbmdsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHJldHVybiB7UmVjdGFuZ2xlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmFjYWRlID0gbmV3IEZhY2FkZSh0aGlzKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZ2V0VGFnXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGdldFRhZygpIHtcbiAgICAgICAgcmV0dXJuICdyZWN0JztcbiAgICB9XG5cbn0iLCIvKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgICAqIEByZXR1cm4ge1NlbGVjdGFibGV9XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2hhcGUpIHtcblxuICAgICAgICB0aGlzLnNoYXBlICAgPSBzaGFwZTtcbiAgICAgICAgbGV0IGVsZW1lbnQgID0gc2hhcGUuZWxlbWVudCxcbiAgICAgICAgICAgIGtleWJvYXJkID0gc2hhcGUuYWNjZXNzb3Iua2V5Ym9hcmQsXG4gICAgICAgICAgICBmYWNhZGUgICA9IHNoYXBlLmdldEZhY2FkZSgpO1xuXG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoa2V5Ym9hcmQubXVsdGlTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICBmYWNhZGUuaW52ZXJ0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNoYXBlLmFjY2Vzc29yLmRlc2VsZWN0QWxsKCk7XG4gICAgICAgICAgICBmYWNhZGUuc2VsZWN0KCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNoYXBlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zaGFwZS5zZWxlY3RlZCA9IGZhbHNlO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBEaXNwYXRjaGVyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge0Rpc3BhdGNoZXJ9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZW5kXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZW5kKGV2ZW50TmFtZSwgcHJvcGVydGllcykge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKChmbikgPT4gZm4ocHJvcGVydGllcykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgb24oZXZlbnROYW1lLCBmbikge1xuXG4gICAgICAgIGlmICghdGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZuKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIFNFTEVDVF9BTEw6ICAgJ3NlbGVjdC1hbGwnLFxuICAgIERFU0VMRUNUX0FMTDogJ2Rlc2VsZWN0JyxcbiAgICBTRUxFQ1RFRDogICAgICdzZWxlY3RlZCdcblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBaZWRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVvcmRlclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGdyb3Vwc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBncm91cFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICByZW9yZGVyKGdyb3VwcywgZ3JvdXApIHtcblxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICBsZXQgek1heCA9IGdyb3Vwcy5zaXplKCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBtYXhpbXVtIFogaXMgYWJvdmUgemVybyBhbmQgYmVsb3cgdGhlIG1heGltdW0uXG4gICAgICAgIGlmIChncm91cC5kYXR1bSgpLnogPCAxKSAgICB7IGdyb3VwLmRhdHVtKCkueiA9IDE7ICAgIH1cbiAgICAgICAgaWYgKGdyb3VwLmRhdHVtKCkueiA+IHpNYXgpIHsgZ3JvdXAuZGF0dW0oKS56ID0gek1heDsgfVxuXG4gICAgICAgIGxldCB6VGFyZ2V0ID0gZ3JvdXAuZGF0dW0oKS56LCB6Q3VycmVudCA9IDE7XG5cbiAgICAgICAgLy8gSW5pdGlhbCBzb3J0IGludG8gei1pbmRleCBvcmRlci5cbiAgICAgICAgZ3JvdXBzLnNvcnQoKGEsIGIpID0+IGEueiAtIGIueik7XG5cbiAgICAgICAgZ3JvdXBzWzBdLmZvckVhY2goKG1vZGVsKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIEN1cnJlbnQgZ3JvdXAgaXMgaW1tdXRhYmxlIGluIHRoaXMgaXRlcmF0aW9uLlxuICAgICAgICAgICAgaWYgKG1vZGVsID09PSBncm91cC5ub2RlKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNraXAgdGhlIHRhcmdldCBaIGluZGV4LlxuICAgICAgICAgICAgaWYgKHpDdXJyZW50ID09PSB6VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgekN1cnJlbnQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHNoYXBlID0gZDMuc2VsZWN0KG1vZGVsKSxcbiAgICAgICAgICAgICAgICBkYXR1bSA9IHNoYXBlLmRhdHVtKCk7XG4gICAgICAgICAgICBkYXR1bS56ID0gekN1cnJlbnQrKztcbiAgICAgICAgICAgIHNoYXBlLmRhdHVtKGRhdHVtKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGaW5hbCBzb3J0IHBhc3MuXG4gICAgICAgIGdyb3Vwcy5zb3J0KChhLCBiKSA9PiBhLnogLSBiLnopO1xuXG4gICAgfVxuXG59Il19
