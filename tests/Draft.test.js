describe('Draft', function() {

    describe('Architecture:', function() {

        it('Should be able to initialise the object;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                facade = draft.add('rect');

            expect(svg.querySelector('g.shapes')).toBeTruthy();
            expect(svg.querySelector('g.handles')).toBeTruthy();
            expect(svg.querySelectorAll('rect').length).toEqual(1);

            expect(facade.shape.dispatcher).toEqual(draft.dispatcher);
            expect(typeof facade.shape.accessor.groups).toBe('object');
            expect(typeof facade.shape.accessor.getSelected).toBe('function');

        });

    });

    describe('Mousetrap:', function() {

        it('Should be able to select all of the elements;', function() {

            var svg        = document.createElement('svg'),
                draft      = new Draft(svg),
                facade     = draft.add('rect'),
                selectable = facade.shape.features.selectable;

            spyOn(selectable, 'select');
            Mousetrap.trigger('mod+a');
            expect(selectable.select).toHaveBeenCalled();
            expect(selectable.shape.accessor.getSelected().length).toEqual(1);

        });

    });

});
