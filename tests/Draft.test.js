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

    describe('Utility:', function() {

        it('Should be able to parse `transform` properties;', function() {

            var svg        = document.createElement('svg'),
                draft      = new Draft(svg),
                facade     = draft.add('rect');

            expect(facade.parseTranslate('translate(65,90)')).toEqual({ x: 65, y: 90 });
            expect(facade.parseTranslate('translate(100, 150)')).toEqual({ x: 100, y: 150 });

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

    describe('Properties:', function() {

        it('Should be able to modify properties on the created shape;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                facade = draft.add('rect').fill('red').height(200).width(100).x(150).y(200);

            expect(facade.fill()).toEqual('red');
            expect(facade.width()).toEqual(100);
            expect(facade.height()).toEqual(200);
            expect(facade.x()).toEqual(150);
            expect(facade.y()).toEqual(200);
            expect(facade.transform()).toEqual([150, 200]);
            expect(facade.dimension()).toEqual([200, 100]);

            expect(facade.transform(100, 200).transform()).toEqual([100, 200]);
            expect(facade.dimension(300, 400).dimension()).toEqual([300, 400]);

        });

        it('Should be able to modify the Z index of the shape groups;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                first  = draft.add('rect').fill('red'),
                second = draft.add('rect').fill('green'),
                third  = draft.add('rect').fill('blue');

            expect(first.z()).toEqual(1);
            expect(second.z()).toEqual(2);
            expect(third.z()).toEqual(3);

            expect(first.bringToFront().z()).toEqual(3);
            expect(second.z()).toEqual(1);
            expect(third.z()).toEqual(2);

        });

    });

});
