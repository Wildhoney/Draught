define(["require", "exports"], function (require, exports) {
    /**
     * @class PrivateInterface
     */
    var PrivateInterface = (function () {
        function PrivateInterface() {
            /**
             * @property options
             * @type {Object}
             */
            this.options = {};
        }
        /**
         * @method getElement
         * @return {HTMLElement}
         */
        PrivateInterface.prototype.getElement = function () {
            return this.element;
        };
        /**
         * Helper method for defining an attribute on the shape.
         *
         * @method attr
         * @param {String} name
         * @param {*} value
         * @return {*}
         */
        PrivateInterface.prototype.attr = function (name, value) {
            if (typeof value !== 'undefined') {
                this.getElement().attr(name, value);
            }
            return this.getElement().attr(name);
        };
        /**
         * @method setOptions
         * @param {Object} options
         * @return {void}
         */
        PrivateInterface.prototype.setOptions = function (options) {
            this.options = options;
        };
        /**
         * @method setDispatcher
         * @param {Dispatcher} dispatcher
         * @return {void}
         */
        PrivateInterface.prototype.setOptions = function (dispatcher) {
            this.dispatcher = dispatcher;
        };
        return PrivateInterface;
    })();
    exports.PrivateInterface = PrivateInterface;
});

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    /**
     * @class PublicInterface
     * @extends PrivateInterface
     */
    var PublicInterface = (function (_super) {
        __extends(PublicInterface, _super);
        function PublicInterface() {
            _super.apply(this, arguments);
        }
        /**
         * @method width
         * @param {Number} value
         * @return {Number}
         */
        PublicInterface.prototype.width = function (value) {
            return this.attr('width', value);
        };
        return PublicInterface;
    })(PrivateInterface);
    exports.PublicInterface = PublicInterface;
});

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    /**
     * @class Shape
     * @extends PublicInterface
     */
    var Shape = (function (_super) {
        __extends(Shape, _super);
        function Shape() {
            _super.apply(this, arguments);
        }
        return Shape;
    })(PublicInterface);
    exports.Shape = Shape;
});

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    /**
     * @class Rectangle
     * @extends Shape
     */
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle() {
            _super.apply(this, arguments);
        }
        return Rectangle;
    })(Shape);
    exports.Rectangle = Rectangle;
});

define(["require", "exports"], function (require, exports) {
    /**
     * @class Dispatcher
     */
    var Dispatcher = (function () {
        function Dispatcher() {
            /**
             * @property events
             * @type {Object}
             */
            this.events = {};
        }
        /**
         * @method dispatchEvent
         * @param {String} name
         * @param {Object} [properties={}]
         * @return {void}
         */
        Dispatcher.prototype.dispatchEvent = function (name, properties) {
            if (properties === void 0) { properties = {}; }
            _.forEach(this.events[name], function (callbackFn) { return callbackFn(properties); });
        };
        /**
         * @method addEventListener
         * @param {String} name
         * @param {Function} [fn=function noop() {}]
         * @return {void}
         */
        Dispatcher.prototype.addEventListener = function (name, fn) {
            if (fn === void 0) { fn = function noop() {
            }; }
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(fn);
        };
        return Dispatcher;
    })();
    exports.Dispatcher = Dispatcher;
});

define(["require", "exports", 'shapes/types/Rectangle', 'helpers/Dispatcher'], function (require, exports, Rectangle, Dispatcher) {
    /**
     * @class Blueprint
     */
    var Blueprint = (function () {
        /**
         * @method constructor
         * @param {SVGElement} element
         * @param {Object} [options={}]
         * @return {void}
         */
        function Blueprint(element, options) {
            if (options === void 0) { options = {}; }
            this.element = d3.select(element);
            this.options = _.assign(this.defaultOptions(), options);
            this.dispatcher = new Dispatcher();
        }
        /**
         * @method add
         * @param {String} name
         * @return {Shape}
         */
        Blueprint.prototype.add = function (name) {
            var shape = this.instantiate(name);
            // Set all the items required for the shape object.
            shape.setOptions(this.options);
            shape.setDispatcher(this.dispatcher);
            this.shapes.push(shape);
            return shape;
        };
        /**
         * @method remove
         * @param {Shape} shape
         * @return {void}
         */
        Blueprint.prototype.remove = function (shape) {
            shape.remove();
            var index = this.shapes.indexOf(shape);
            this.shapes.splice(index, 1);
        };
        /**
         * @method all
         * @return {Shape[]}
         */
        Blueprint.prototype.all = function () {
            return this.shapes;
        };
        /**
         * @method clear
         * @return {void}
         */
        Blueprint.prototype.clear = function () {
            var _this = this;
            _.forEach(this.shapes, function (shape) { return _this.remove(shape); });
        };
        /**
         * @method instantiate
         * @param {String} name
         * @return {Shape}
         */
        Blueprint.prototype.instantiate = function (name) {
            var map = {
                rect: Rectangle
            };
            return new map[name.toLowerCase()];
        };
        /**
         * @method defaultOptions
         * @return {Object}
         */
        Blueprint.prototype.defaultOptions = function () {
            return {};
        };
        return Blueprint;
    })();
});

define(["require", "exports"], function (require, exports) {
    /**
     * @class Selectable
     */
    var Selectable = (function () {
        /**
         * @method constructor
         * @return {Selectable}
         */
        function Selectable(shape) {
        }
        return Selectable;
    })();
    exports.Selectable = Selectable;
});
