import setAttribute from '../../src/helpers/Attributes.js';

describe('Attributes', () => {

    let mockElement;

    beforeEach(() => {

        mockElement = { attr: () => {}, datum: () => {
            return { x: 10, y: 20 }
        } };

    });

    it('Should be able to set basic attributes;', () => {

        spyOn(mockElement, 'attr');

        setAttribute(mockElement, 'height', 200);
        expect(mockElement.attr).toHaveBeenCalledWith('height', 200);
        setAttribute(mockElement, 'width', 250);
        expect(mockElement.attr).toHaveBeenCalledWith('width', 250);

    });

    it('Should be able to set transform attribute when passed X and Y;', () => {

        spyOn(mockElement, 'attr');

        setAttribute(mockElement, 'x', 150);
        expect(mockElement.attr).toHaveBeenCalledWith('transform', 'translate(150, 20)');
        setAttribute(mockElement, 'y', 250);
        expect(mockElement.attr).toHaveBeenCalledWith('transform', 'translate(10, 250)');

    });

});