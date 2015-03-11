import Dispatcher from './../helpers/Dispatcher.js';
import Events     from './../helpers/Events.js';
import utility    from './../helpers/Utility.js';

// Features.
import Selectable from './features/Selectable.js';
import Movable    from './features/Movable.js';

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
        this.element = null;
        this.group = null;
        this.label = label;
        this.interface = null;
        this.features = {};
    }

    /**
     * @method setElement
     * @param {Object} element
     * @return {void}
     */
    setElement(element) {
        this.element = element;
    }

    /**
     * @method setGroup
     * @param {Object} group
     * @return {void}
     */
    setGroup(group) {
        this.group = group;
    }

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    setDispatcher(dispatcher) {

        this.dispatcher = dispatcher;

        this.dispatcher.listen(Events.SELECT_ALL,   ()      => this.tryInvokeOnEachFeature('select'));
        this.dispatcher.listen(Events.DESELECT_ALL, ()      => this.tryInvokeOnEachFeature('deselect'));
        this.dispatcher.listen(Events.MOVE_LEFT,    (model) => this.tryInvokeOnEachFeature('moveLeft', model, 'isSelected'));
        this.dispatcher.listen(Events.MOVE_RIGHT,   (model) => this.tryInvokeOnEachFeature('moveRight', model, 'isSelected'));
        this.dispatcher.listen(Events.MOVE_UP,      (model) => this.tryInvokeOnEachFeature('moveUp', model, 'isSelected'));
        this.dispatcher.listen(Events.MOVE_DOWN,    (model) => this.tryInvokeOnEachFeature('moveDown', model, 'isSelected'));

    }

    /**
     * @method tryInvokeOnEachFeature
     * @param {String} methodName
     * @param {Object} [properties={}]
     * @param {String} [conditionalFn=null]
     * @return {void}
     */
    tryInvokeOnEachFeature(methodName, properties = {}, conditionalFn = null) {

        _.forIn(this.features, (feature) => {

            if (_.isFunction(feature[methodName])) {

                if (_.isString(conditionalFn) && !this.getInterface()[conditionalFn]()) {
                    return;
                }

                feature[methodName](properties);

            }

        });

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
     * Should be overwritten for shape types that have a different name to their SVG tag name, such as a `foreignObject`
     * element using the `rect` shape name.
     *
     * @method getName
     * @return {String}
     */
    getName() {
        return this.getTag();
    }

    /**
     * @method getTag
     * @throws Exception
     * @return {String}
     */
    getTag() {
        utility.throwException(`Shape<${this.label}> must define a \`getTag\` method`);
        return '';
    }

    /**
     * @method getInterface
     * @return {Interface}
     */
    getInterface() {

        if (this.interface === null) {

            this.interface = this.addInterface();
            let dispatcher = new Dispatcher();
            this.interface.setDispatcher(dispatcher);

            /**
             * @method getAttributes
             * @return {Object}
             */
            let getAttributes = () => {

                let zIndex = { z: d3.select(this.element.node().parentNode).datum().z },
                    model  = _.assign(this.element.datum(), zIndex);
                return utility.retransformAttributes(model);

            };

            // Listeners that hook up the interface and the shape object.
            dispatcher.listen(Events.ATTRIBUTE_GET_ALL,        getAttributes);
            dispatcher.listen(Events.REMOVE, (model)        => this.dispatcher.send(Events.REMOVE, model));
            dispatcher.listen(Events.ATTRIBUTE_SET, (model) => { this.setAttributes(model.attributes); });

        }

        return this.interface;

    }

    /**
     * @method setAttributes
     * @param {Object} attributes
     * @return {Object}
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
            let group = d3.select(this.element.node().parentNode);
            group.datum({ z: attributes.z });
            delete attributes.z;
            this.dispatcher.send(Events.REORDER, {
                group: group
            });

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

        let attributes = { x: 0, y: 0 };

        if (_.isFunction(this.addAttributes)) {
            attributes = _.assign(attributes, this.addAttributes());
        }

        return attributes;

    }

    /**
     * @method addElements
     * @return {Object}
     */
    addElements() {
        return {};
    }

    /**
     * @method addFeatures
     * @return {void}
     */
    addFeatures() {

        let dispatcher = new Dispatcher();

        this.features = {
            selectable: new Selectable(this).setDispatcher(dispatcher),
            movable:    new Movable(this).setDispatcher(dispatcher)
        };

        dispatcher.listen(Events.SELECTABLE.DESELECT, (model) => {
            this.dispatcher.send(Events.DESELECT_ALL, model);
            this.tryInvokeOnEachFeature('deselect');
        });

        dispatcher.listen(Events.SELECTABLE.SELECT, (model)   => {
            this.dispatcher.send(Events.SELECT, model);
            this.tryInvokeOnEachFeature('select');
        });

    }

    /**
     * @method toString
     * @return {String}
     */
    toString() {

        let tag = this.getTag().charAt(0).toUpperCase() + this.getTag().slice(1);

        if (this.label) {
            return `[object ${tag}: ${this.label}]`;
        }

        return `[object ${tag}]`;

    }

}