import Symbols from './Symbols';

/**
 * @module Draft
 * @submodule KeyBindings
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class KeyBindings {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {KeyBindings}
     */
    constructor(middleman) {

        const keyMap            = middleman[Symbols.KEY_MAP];
        this[Symbols.MIDDLEMAN] = middleman;

        // Default kep mappings
        keyMap.multiSelect = false;
        keyMap.aspectRatio = false;

        // Listen for changes to the key map.
        this.attachBindings(keyMap);

    }

    /**
     * @method attachBindings
     * @param {Object} keyMap
     * @return {void}
     */
    attachBindings(keyMap) {

        // Select all of the available shapes.
        Mousetrap.bind('mod+a', () => this[Symbols.MIDDLEMAN].select());

        // Multi-selecting shapes.
        Mousetrap.bind('mod',   () => keyMap.multiSelect = true, 'keydown');
        Mousetrap.bind('mod',   () => keyMap.multiSelect = false, 'keyup');

        // Maintain aspect ratios when resizing.
        Mousetrap.bind('shift', () => keyMap.aspectRatio = true, 'keydown');
        Mousetrap.bind('shift', () => keyMap.aspectRatio = false, 'keyup');

    }

}