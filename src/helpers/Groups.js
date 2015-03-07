/**
 * @module Blueprint
 * @submodule Groups
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Blueprint
 */
export default class Groups {

    /**
     * @method addTo
     * @param {SVGElement} element
     * @return {Groups}
     */
    addTo(element) {
        this.shapes  = element.append('g').classed('shapes', true);
        this.handles = element.append('g').classed('handles', true);
        return this;
    }

}