import Draft   from '../src/Draft.js';
import Symbols from '../src/helpers/Symbols.js';

describe('Draft', () => {

    const mockSVGElement = document.createElement('svg');
    const getDraft       = (options) => new Draft(mockSVGElement, options);

    it('Should be able to instantiate the constructor function;', () => {
        expect(getDraft() instanceof Draft).toBeTruthy();
    });

    it('Should be able to pass in options that override the defaults;', () => {

        const draft   = getDraft({ documentHeight: '50%', gridSize: 5 });
        const options = draft[Symbols.options];

        expect(options.documentHeight).toEqual('50%');
        expect(options.documentWidth).toEqual('100%');
        expect(draft.getOptions().gridSize).toEqual(5);

    });

});