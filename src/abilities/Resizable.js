import Ability from './Ability';

/**
 * @module Draft
 * @submodule Resizable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
export default class Resizable extends Ability {

    /**
     * @method didSelect
     * @return {void}
     */
    didSelect() {
        this.reattachHandles();
    }

    /**
     * @method didDeselect
     * @return {void}
     */
    didDeselect() {
        this.detachHandles();
    }

    /**
     * @method reattachHandles
     * @return {void}
     */
    reattachHandles() {
        this.detachHandles();
        this.attachHandles();
    }

    /**
     * @method attachHandles
     * @return {void}
     */
    attachHandles() {

        const shape  = this.shape();
        const layer  = this.middleman().layers().markers;
        this.handles = layer.append('g').attr('class', 'resize-handles');

        const x      = shape.attr('x');
        const y      = shape.attr('y');
        const width  = shape.attr('width');
        const height = shape.attr('height');

        const edgeMap = [
            { x,                  y },
            { x: x + (width / 2), y },
            { x: x + width,       y },
            { x: x,               y: y + (height / 2) },
            { x: x,               y: y + height },
            { x: x + (width / 2), y: y + height },
            { x: x + width,       y: y + height },
            { x: x + width,       y: y + (height / 2) }
        ];

        edgeMap.forEach((edge) => {

            this.handles.append('circle')
                        .attr('fill', 'black')
                        .attr('stroke', 'white')
                        .attr('stroke-width', 1)
                        .attr('r', 3)
                        .attr('cx', edge.x)
                        .attr('cy', edge.y);

        });

    }

    /**
     * @method detachHandles
     * @return {void}
     */
    detachHandles() {
        
        if (this.handles) {
            this.handles.remove();
        }
        
    }

}