import Draft     from '../../src/Draft.js';
import Symbols   from '../../src/helpers/Symbols.js';
import Middleman from '../../src/helpers/Middleman.js';
import Rectangle from '../../src/shapes/Rectangle.js';
import Movable   from '../../src/abilities/Movable.js';

describe('Shape', () => {

    it('Should be able to define the abilities for each shape;', () => {

        const rectangle = new Rectangle();
        const abilities = rectangle[Symbols.ABILITIES];
        expect(abilities.movable instanceof Movable).toBeTruthy();

    });

});