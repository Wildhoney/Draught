import invocator from '../../src/helpers/Invocator.js';

describe('Invocator', () => {

    it('Should be able to invoke the hooks', () => {

        const shapeMock = { didRemove:  () => {}, didAdd: () => {} };

        spyOn(shapeMock, 'didRemove').and.callThrough();
        spyOn(shapeMock, 'didAdd').and.callThrough();

        invocator.did('remove', shapeMock);
        expect(shapeMock.didRemove).toHaveBeenCalled();

        invocator.did('add', shapeMock);
        expect(shapeMock.didAdd).toHaveBeenCalled();

        expect(shapeMock.didRemove.calls.count()).toEqual(1);

        invocator.did('add', shapeMock);
        expect(shapeMock.didAdd.calls.count()).toEqual(2);

    });

});