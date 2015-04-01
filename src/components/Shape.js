import Selectable from './shape/feature/Selectable.js';
import Events     from './../dispatcher/Events.js';

export default class Shape {

    /**
     * @constructor
     * @return {Rectangle}
     */
    constructor() {

        this.features = {
            selectable: new Selectable(this)
        };

    }

    /**
     * @method getName
     * @return {String}
     */
    getName() {
        return this.getTag();
    }

    /**
     * @method insert
     * @param {Object} group
     * @return {void}
     */
    insert(group) {
        this.element = group.append(this.getTag()).datum({
            transform: 'translate(0,0)'
        });
    }

    /**
     * @method getFacade
     * @return {Facade}
     */
    getFacade() {
        return this.facade;
    }

    /**
     * @method setAccessor
     * @param {Object} accessor
     * @return {void}
     */
    setAccessor(accessor) {
        this.accessor = accessor;
    }

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    setDispatcher(dispatcher) {

        this.dispatcher = dispatcher;

        dispatcher.on(Events.SELECT_ALL,   () => this.getFacade().select());
        dispatcher.on(Events.DESELECT_ALL, () => this.getFacade().deselect());

    }

}