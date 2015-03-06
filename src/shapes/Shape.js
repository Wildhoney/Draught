import Interface from './../helpers/Interface.js';
import Events    from './../helpers/Events.js';
import utility   from './../helpers/Utility.js';

/**
 * @module Blueprint
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Shape {

    /**
     * @method constructor
     * @param {String} [label='']
     * @constructor
     */
    constructor(label = '') {
        this.element   = null;
        this.label     = label;
        this.interface = null;
    }

    /**
     * @method setElement
     * @param {Object} element
     */
    setElement(element) {
        this.element = element;
    }

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    setDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
    }

    /**
     * @method setOptions
     * @param {Object} options
     * @return {void}
     */
    setOptions(options) {
        this.options = options;
    }

    /**
     * @method getInterface
     * @return {Interface}
     */
    getInterface() {

        if (this.interface === null) {

            this.interface    = new Interface(this.label);
            var setAttributes = this.setAttributes.bind(this);

            /**
             * @method applyAttributes
             * @param {Object} attributes
             */
            this.interface.applyAttributes = function applyAttributes(attributes = {}) {
                setAttributes(attributes);
                return this;
            };

            if (_.isFunction(this.addMethods)) {
                this.interface = _.assign(this.interface, this.addMethods());
            }

        }

        return this.interface;

    }

    /**
     * @method setAttributes
     * @param {Object} attributes
     * @return {Interface}
     */
    setAttributes(attributes = {}) {

        attributes = _.assign(this.element.datum(), attributes);
        attributes = utility.transformAttributes(attributes);

        this.element.datum(attributes);
        this.element.attr(this.element.datum());
        return this.interface;

    }

    /**
     * @method getAttributes
     * @return {Object}
     */
    getAttributes() {

        var attributes = { x: 0, y: 0 };

        if (_.isFunction(this.addAttributes)) {
            attributes = _.assign(attributes, this.addAttributes());
        }

        return attributes;

    }

    /**
     * @method addElements
     * @param {Object} element
     * @return {Object}
     */
    addElements(element) {
        return element;
    }

    /**
     * @method getTag
     * @throws Exception
     * @return {void}
     */
    getTag() {
        utility.throwException(`Shape<${this.label}> must define a \`getTag\` method`);
    }

    /**
     * @method dispatchAttributeEvent
     * @param {Object} properties = {}
     * @return {void}
     */
    dispatchAttributeEvent(properties = {}) {
        properties.element = this;
        this.dispatcher.send(Events.ATTRIBUTE, properties);
    }

    /**
     * @method toString
     * @return {String}
     */
    toString() {

        var tag = this.getTag().charAt(0).toUpperCase() + this.getTag().slice(1);

        if (this.label) {
            return `[object ${tag}: ${this.label}]`;
        }

        return `[object ${tag}]`;

    }

}