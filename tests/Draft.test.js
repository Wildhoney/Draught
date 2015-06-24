import Draft from '../src/Draft.js';

describe('Draft', () => {

    const mockSVGElement = document.createElement('svg');

    it('Should be able to instantiate the constructor function;', () => {

        const draft = new Draft(mockSVGElement);
        expect(draft instanceof Draft).toBeTruthy();

    });

});