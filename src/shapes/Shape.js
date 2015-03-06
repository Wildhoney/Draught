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
             * @method set
             * @param {Object} attributes
             * @return {Interface}
             */
            this.interface.set = function set(attributes = {}) {
                setAttributes(attributes);
                return this;
            };

            /**
             * @method getAttributes
             * @return {Object}
             */
            this.interface.getAttributes = function getAttributes() {
                return 1;
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

        attributes = _.assign(this.element.datum() || {}, attributes);
        attributes = utility.transformAttributes(attributes);

        if (!_.isUndefined(attributes.z)) {

            // When the developer specifies the `z` attribute, it actually pertains to the group
            // element that the shape is a child of. We'll therefore need to remove the `z` property
            // from the `attributes` object, and instead apply it to the shape's group element.
            // Afterwards we'll need to broadcast an event to reorder the elements using D3's magical
            // `sort` method.
            var group = d3.select(this.element.node().parentNode);
            group.datum({ z: attributes.z });
            delete attributes.z;
            this.dispatcher.send(Events.REORDER);

        }

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