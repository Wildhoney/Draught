import Draft     from '../../src/Draft.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Rectangle from '../../src/shapes/Rectangle.js';

describe('Ability', () => {

    it('Should be able to return the shape instance from the ability instance;', () => {

        const rectangle = new Rectangle();
        const movable   = rectangle[Symbols.ABILITIES].movable;

        expect(typeof movable.getShape).toBe('function');
        expect(movable.getShape()).toEqual(rectangle);

    });


});