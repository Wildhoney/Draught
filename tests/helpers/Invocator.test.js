import invocator from '../../src/helpers/Invocator.js';

describe('Invocator', () => {

    it('Should be able to invoke the hooks', () => {

        const shapeMock = {
            didRemove:  () => {}, willRemove: () => {},
            didAdd:     () => {}, willAdd:    () => {}
        };

        spyOn(shapeMock, 'willRemove').and.callThrough();
        spyOn(shapeMock, 'didRemove').and.callThrough();
        spyOn(shapeMock, 'willAdd').and.callThrough();
        spyOn(shapeMock, 'didAdd').and.callThrough();

        invocator.will('remove', shapeMock);
        expect(shapeMock.willRemove).toHaveBeenCalled();

        invocator.did('remove', shapeMock);
        expect(shapeMock.didRemove).toHaveBeenCalled();

        invocator.will('add', shapeMock);
        invocator.did('add', shapeMock);
        expect(shapeMock.willAdd).toHaveBeenCalled();
        expect(shapeMock.didAdd).toHaveBeenCalled();

        expect(shapeMock.willRemove.calls.count()).toEqual(1);
        expect(shapeMock.didRemove.calls.count()).toEqual(1);
        expect(shapeMock.willAdd.calls.count()).toEqual(1);

        invocator.did('add', shapeMock);
        expect(shapeMock.didAdd.calls.count()).toEqual(2);

    });

});