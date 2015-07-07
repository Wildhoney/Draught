import Ability from './Ability';
import Symbols from './../helpers/Symbols';

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Selectable extends Ability {

    /**
     * @method didAdd
     * @return {void}
     */
    didAdd() {

        const element = this.shape()[Symbols.ELEMENT];
        element.on('click', this.handleClick.bind(this));
        element.call(d3.behavior.drag().on('drag', () => this.handleDrag()));

    }

    /**
     * @method handleDrag
     * @return {Object}
     */
    handleDrag() {

        this.handleClick();

        const middleman = this.shape()[Symbols.MIDDLEMAN];
        middleman.preventDeselect(true);

        // Create a fake event to drag the shape with an override X and Y value.
        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: false });
        event.overrideX = d3.event.sourceEvent.pageX;
        event.overrideY = d3.event.sourceEvent.pageY;

        const bBox = middleman.boundingBox().bBox.node();
        bBox.dispatchEvent(event);
        return event;

    }

    /**
     * @method handleClick
     * @return {void}
     */
    handleClick() {

        const keyMap = this.middleman()[Symbols.KEY_MAP];

        if (this.shape().isSelected()) {

            if (!keyMap.multiSelect) {

                // Deselect all others and select only the current shape.
                return void this.middleman().deselect({ exclude: this.shape() });

            }

            // Deselect the shape if it's currently selected.
            return void this.middleman().deselect({ include: this.shape() });

        }

        if (!keyMap.multiSelect) {

            // Deselect all shapes except for the current.
            this.middleman().deselect({ exclude: this.shape() });

        }

        this.middleman().select({ include: this.shape() });

    }

}