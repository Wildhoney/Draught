/**
 * @class PrivateInterface
 */
export class PrivateInterface {

    /**
     * @property element
     * @type {HTMLElement}
     */
    private element: HTMLElement;

    /**
     * @property options
     * @type {Object}
     */
    options: Object = {};

    /**
     * @property dispatcher
     * @type {Dispatcher}
     */
    dispatcher: Dispatcher;

    /**
     * @method getElement
     * @return {HTMLElement}
     */
    protected getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Helper method for defining an attribute on the shape.
     *
     * @method attr
     * @param {String} name
     * @param {*} value
     * @return {*}
     */
    protected attr(name: string, value: any): any {

        if (typeof value !== 'undefined') {
            this.getElement().attr(name, value);
        }

        return this.getElement().attr(name);

    }

    /**
     * @method setOptions
     * @param {Object} options
     * @return {void}
     */
    public setOptions(options: Object): void {
        this.options = options;
    }

    /**
     * @method setDispatcher
     * @param {Dispatcher} dispatcher
     * @return {void}
     */
    public setOptions(dispatcher: Dispatcher): void {
        this.dispatcher = dispatcher;
    }

}