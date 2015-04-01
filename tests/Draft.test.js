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

        it('Should be able to invoke the callback when shapes are selected;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                facade = draft.add('rect');

            var callback = { fn: function(event) {
                expect(event.shapes.length).toEqual(1);
            }};

            spyOn(callback, 'fn').and.callThrough();
            draft.on('selected', callback.fn);
            facade.select();

            expect(callback.fn).toHaveBeenCalled();

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

            expect(facade.isSelected()).toBeFalsy();
            spyOn(selectable, 'select').and.callThrough();
            Mousetrap.trigger('mod+a');
            expect(selectable.select).toHaveBeenCalled();
            expect(selectable.shape.accessor.getSelected().length).toEqual(1);
            expect(facade.isSelected()).toBeTruthy();

            expect(draft.getSelected().length).toEqual(1);
            facade.selectInvert();
            expect(facade.isSelected()).toBeFalsy();
            expect(draft.getSelected().length).toEqual(0);

        });

    });

    describe('Selectable:', function() {

        it('Should be able to toggle shape selected with multiSelect;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                first  = draft.add('rect'),
                second = draft.add('rect');

            expect(draft.keyboard.multiSelect).toBeFalsy();
            expect(draft.getSelected().length).toEqual(0);

            Mousetrap.trigger('mod', 'keydown');

            first.shape.element.node().dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true
            }));

            expect(draft.getSelected().length).toEqual(1);
            expect(first.isSelected()).toBeTruthy();
            expect(second.isSelected()).toBeFalsy();

        });

        it('Should be able to select an element exclusively when clicked on;', function() {

            var svg    = document.createElement('svg'),
                draft  = new Draft(svg),
                first  = draft.add('rect').select(),
                second = draft.add('rect').select();

            expect(draft.keyboard.multiSelect).toBeFalsy();
            expect(draft.getSelected().length).toEqual(2);

            second.shape.element.node().dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true
            }));

            expect(draft.getSelected().length).toEqual(1);
            expect(first.isSelected()).toBeFalsy();
            expect(second.isSelected()).toBeTruthy();

        });

    });

    describe('Behaviour:', function() {

        it('Should be able to deselect all elements when clicking on SVGElement;', function() {

            var svg        = document.createElement('svg'),
                draft      = new Draft(svg),
                facade     = draft.add('rect').select(),
                selectable = facade.shape.features.selectable;

            spyOn(selectable, 'deselect').and.callThrough();
            expect(draft.getSelected().length).toEqual(1);

            svg.dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true
            }));

            expect(selectable.deselect).toHaveBeenCalled();
            expect(draft.getSelected().length).toEqual(0);

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
