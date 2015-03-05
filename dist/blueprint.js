(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = _interopRequire(require("./helpers/Dispatcher.js"));

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
     * @param {element} element
     * @param {Object} [options={}]
     * @return {void}
     */

    function Blueprint(element) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Blueprint);

        this.element = d3.select(element);
        this.shapes = [];
        this.options = _.assign(this.defaultOptions(), options);
        this.dispatcher = new Dispatcher();
    }

    _prototypeProperties(Blueprint, null, {
        add: {

            /**
             * @method add
             * @param {String} name
             * @return {Shape}
             */

            value: function add(name) {

                var shape = this.instantiate(name);

                // Set all the items required for the shape object.
                shape.setOptions(this.options);
                shape.setDispatcher(this.dispatcher);

                this.shapes.push(shape);
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
                return this.shapes;
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
        instantiate: {

            /**
             * @method instantiate
             * @param {String} name
             * @return {Shape}
             */

            value: function instantiate(name) {

                var map = {
                    rect: Rectangle
                };

                return new (map[name.toLowerCase()])();
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

},{"./helpers/Dispatcher.js":2,"./shapes/types/Rectangle.js":3}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @class Dispatcher
 */

var Dispatcher = exports.Dispatcher = (function () {

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

Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * @module Blueprint
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */

var Rectangle = exports.Rectangle = (function (Shape) {
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        if (Shape != null) {
            Shape.apply(this, arguments);
        }
    }

    _inherits(Rectangle, Shape);

    _prototypeProperties(Rectangle, null, {
        addInterfaceMethods: {

            /**
             * @method addInterfaceMethods
             * @return {Object}
             */

            value: function addInterfaceMethods() {
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9CbHVlcHJpbnQuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9oZWxwZXJzL0Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9PQmx1ZXByaW50L3NyYy9zaGFwZXMvdHlwZXMvUmVjdGFuZ2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7SUNBTyxVQUFVLDJCQUFNLHlCQUF5Qjs7OztJQUd6QyxTQUFTLDJCQUFPLDZCQUE2Qjs7Ozs7Ozs7SUFPOUMsU0FBUzs7Ozs7Ozs7O0FBUUEsYUFSVCxTQUFTLENBUUMsT0FBTztZQUFFLE9BQU8sZ0NBQUcsRUFBRTs7OEJBUi9CLFNBQVM7O0FBU1AsWUFBSSxDQUFDLE9BQU8sR0FBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxNQUFNLEdBQU8sRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxPQUFPLEdBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0QsWUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQ3RDOzt5QkFiQyxTQUFTO0FBb0JYLFdBQUc7Ozs7Ozs7O21CQUFBLGFBQUMsSUFBSSxFQUFFOztBQUVOLG9CQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHbkMscUJBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLHFCQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckMsb0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLHVCQUFPLEtBQUssQ0FBQzthQUVoQjs7OztBQU9ELGNBQU07Ozs7Ozs7O21CQUFBLGdCQUFDLEtBQUssRUFBRTtBQUNWLHFCQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDZixvQkFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkMsb0JBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNoQzs7OztBQU1ELFdBQUc7Ozs7Ozs7bUJBQUEsZUFBRztBQUNGLHVCQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDdEI7Ozs7QUFNRCxhQUFLOzs7Ozs7O21CQUFBLGlCQUFHOzs7QUFDSixpQkFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSzsyQkFBSyxNQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBQ3pEOzs7O0FBT0QsbUJBQVc7Ozs7Ozs7O21CQUFBLHFCQUFDLElBQUksRUFBRTs7QUFFZCxvQkFBSSxHQUFHLEdBQUc7QUFDTix3QkFBSSxFQUFFLFNBQVM7aUJBQ2xCLENBQUM7O0FBRUYsdUJBQU8sS0FBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFDLEVBQUUsQ0FBQzthQUV4Qzs7OztBQU1ELHNCQUFjOzs7Ozs7O21CQUFBLDBCQUFHO0FBQ2IsdUJBQU8sRUFBRSxDQUFDO2FBQ2I7Ozs7OztXQWpGQyxTQUFTOzs7QUFxRmYsQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRXBCLGdCQUFZLENBQUM7O0FBRWIsV0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FFakMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0lDbEdFLFVBQVUsV0FBVixVQUFVOzs7Ozs7O0FBTVIsYUFORixVQUFVOzhCQUFWLFVBQVU7O0FBT2YsWUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7S0FDcEI7O3lCQVJRLFVBQVU7QUFnQm5CLHFCQUFhOzs7Ozs7Ozs7bUJBQUEsdUJBQUMsSUFBSSxFQUFtQjtvQkFBakIsVUFBVSxnQ0FBRyxFQUFFOztBQUMvQixpQkFBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQUMsVUFBVTsyQkFBSyxVQUFVLENBQUMsVUFBVSxDQUFDO2lCQUFBLENBQUMsQ0FBQzthQUN4RTs7OztBQVFELHdCQUFnQjs7Ozs7Ozs7O21CQUFBLDBCQUFDLElBQUksRUFBRSxFQUFFLEVBQUU7O0FBRXZCLG9CQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNwQix3QkFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQzFCOztBQUVELG9CQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUU5Qjs7Ozs7O1dBbENRLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDR1YsU0FBUyxXQUFULFNBQVMsY0FBUyxLQUFLO2FBQXZCLFNBQVM7OEJBQVQsU0FBUzs7WUFBUyxLQUFLO0FBQUwsaUJBQUs7Ozs7Y0FBdkIsU0FBUyxFQUFTLEtBQUs7O3lCQUF2QixTQUFTO0FBTWxCLDJCQUFtQjs7Ozs7OzttQkFBQSwrQkFBRzs7O0FBRWxCLHVCQUFPO0FBQ0gseUJBQUssRUFBRSxVQUFDLEtBQUs7K0JBQUssTUFBSyxzQkFBc0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztxQkFBQTtpQkFDbEUsQ0FBQTthQUVKOzs7Ozs7V0FaUSxTQUFTO0dBQVMsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2hlbHBlcnMvRGlzcGF0Y2hlci5qcyc7XG5cbi8vIFNoYXBlcy5cbmltcG9ydCBSZWN0YW5nbGUgIGZyb20gJy4vc2hhcGVzL3R5cGVzL1JlY3RhbmdsZS5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBCbHVlcHJpbnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5jbGFzcyBCbHVlcHJpbnQge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgICAgPSBkMy5zZWxlY3QoZWxlbWVudCk7XG4gICAgICAgIHRoaXMuc2hhcGVzICAgICA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgICAgPSBfLmFzc2lnbih0aGlzLmRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWRkXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBhZGQobmFtZSkge1xuXG4gICAgICAgIHZhciBzaGFwZSA9IHRoaXMuaW5zdGFudGlhdGUobmFtZSk7XG5cbiAgICAgICAgLy8gU2V0IGFsbCB0aGUgaXRlbXMgcmVxdWlyZWQgZm9yIHRoZSBzaGFwZSBvYmplY3QuXG4gICAgICAgIHNoYXBlLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgICAgc2hhcGUuc2V0RGlzcGF0Y2hlcih0aGlzLmRpc3BhdGNoZXIpO1xuXG4gICAgICAgIHRoaXMuc2hhcGVzLnB1c2goc2hhcGUpO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmUoc2hhcGUpIHtcbiAgICAgICAgc2hhcGUucmVtb3ZlKCk7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuc2hhcGVzLmluZGV4T2Yoc2hhcGUpO1xuICAgICAgICB0aGlzLnNoYXBlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYWxsXG4gICAgICogQHJldHVybiB7U2hhcGVbXX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYXBlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNsZWFyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGVhcigpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuc2hhcGVzLCAoc2hhcGUpID0+IHRoaXMucmVtb3ZlKHNoYXBlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBpbnN0YW50aWF0ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgaW5zdGFudGlhdGUobmFtZSkge1xuXG4gICAgICAgIHZhciBtYXAgPSB7XG4gICAgICAgICAgICByZWN0OiBSZWN0YW5nbGVcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IG1hcFtuYW1lLnRvTG93ZXJDYXNlKCldKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRPcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG59XG5cbihmdW5jdGlvbiBtYWluKCR3aW5kb3cpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgJHdpbmRvdy5CbHVlcHJpbnQgPSBCbHVlcHJpbnQ7XG5cbn0pKHdpbmRvdyk7IiwiLyoqXG4gKiBAY2xhc3MgRGlzcGF0Y2hlclxuICovXG5leHBvcnQgY2xhc3MgRGlzcGF0Y2hlciB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGNvbnN0cnVjdG9yXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaXNwYXRjaEV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9e31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaXNwYXRjaEV2ZW50KG5hbWUsIHByb3BlcnRpZXMgPSB7fSkge1xuICAgICAgICBfLmZvckVhY2godGhpcy5ldmVudHNbbmFtZV0sIChjYWxsYmFja0ZuKSA9PiBjYWxsYmFja0ZuKHByb3BlcnRpZXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFkZEV2ZW50TGlzdGVuZXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbj1mdW5jdGlvbiBub29wKCkge31dXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBhZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIEJsdWVwcmludFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0JsdWVwcmludFxuICovXG5leHBvcnQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRJbnRlcmZhY2VNZXRob2RzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGFkZEludGVyZmFjZU1ldGhvZHMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiAodmFsdWUpID0+IHRoaXMuZGlzcGF0Y2hBdHRyaWJ1dGVFdmVudCh7IHZhbHVlOiB2YWx1ZSB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn0iXX0=
