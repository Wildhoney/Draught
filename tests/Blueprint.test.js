describe('Blueprint', function() {

    var mockBBox = function(blueprint, shapeInterface) {

        var shape = blueprint.shapes.filter(function(model) {
            return model.interface === shapeInterface;
        }).map(function(model) {
            return model.shape;
        })[0];

        spyOn(shape, 'getBoundingBox').and.callFake(function() {
            return { x: shapeInterface.x(),
                     y: shapeInterface.y(),
                     height: shapeInterface.height(),
                     width: shapeInterface.width() };
        });

        return shapeInterface;

    };

    it('Should be able to initialise the module;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg);

        expect(blueprint.element.node()).toEqual(svg);
        expect(Array.isArray(blueprint.shapes)).toBeTruthy();
        expect(typeof blueprint.options).toBe('object');
        expect(typeof blueprint.dispatcher.send).toBe('function');
        expect(blueprint.groups.shapes.node().nodeName).toEqual('G');
        expect(blueprint.groups.handles.node().nodeName).toEqual('G');
        expect(blueprint.map.rect).toBeDefined();

        blueprint = new Blueprint(svg, { dataAttribute: 'data-blueprint-id' });
        blueprint.add('rect');
        var group = svg.querySelector('rect').parentNode;
        expect(group.getAttribute('data-blueprint-id')).toEqual('BP1');

    });

    it('Should be able to add an element;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect').x(100).y(100).setAttr({ strokeWidth: 10 }),
            element   = d3.select(svg.querySelector('rect'));

        expect(rectangle.toString()).toEqual('[object Interface: BP1]');
        expect(rectangle.label).toEqual('BP1');
        expect(typeof rectangle.width).toBe('function');
        expect(element.attr('x')).toBeNull();
        expect(element.attr('y')).toBeNull();
        expect(element.attr('z')).toBeNull();
        expect(element.attr('transform')).not.toBeNull();
        expect(element.attr('stroke-width')).toEqual((10).toString());
        expect(element.datum()['stroke-width']).toEqual(10);
        expect(element.datum().transform).toEqual('translate(100, 100)');

    });

    it('Should be able to return the selected shapes;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            first     = blueprint.add('rect').select(),
            second    = blueprint.add('rect'),
            third     = blueprint.add('rect').select();

        expect(blueprint.selected().length).toEqual(2);
        expect(blueprint.selected()[0]).toEqual(first);
        expect(blueprint.selected()[1]).toEqual(third);

        second.select();
        expect(blueprint.selected().length).toEqual(3);
        first.deselect();
        expect(blueprint.selected().length).toEqual(2);

    });

    it('Should be able to add an element whilst passing in a DOM reference;', function() {

        var svgContainer = document.createElement('svg');
        svgContainer.setAttribute('id', 'svg-container');
        document.body.appendChild(svgContainer);

        var blueprint = new Blueprint('#svg-container'),
            rectangle = blueprint.add(document.createElement('rect')).x(300).y(550);

        expect(svgContainer.querySelectorAll('g[data-id="BP1"]').length).toEqual(1);
        expect(rectangle.x()).toEqual(300);
        expect(rectangle.y()).toEqual(550);

    });

    it('Should be able to add a specialised interface method;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect');

        expect(rectangle.fill('red').fill()).toEqual('red');

    });

    it('Should be able to read attributes from the shape;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect').x(250).y(250).setAttr({ strokeWidth: 10 });

        expect(rectangle.getAttr().x).toEqual(250);
        expect(rectangle.getAttr().y).toEqual(250);
        expect(rectangle.getAttr().strokeWidth).toEqual(10);

    });

    it('Should be able to select and deselect shapes', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect');

        expect(rectangle.isSelected()).toBeFalsy();
        expect(rectangle.select().isSelected()).toBeTruthy();
        expect(rectangle.deselect().isSelected()).toBeFalsy();

    });

    it('Should be able to manage the z-indexes;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            first     = blueprint.add('rect'),
            second    = blueprint.add('rect'),
            third     = blueprint.add('rect');

        expect(second.z(3).z()).toEqual(3);
        expect(first.z()).toEqual(1);
        expect(third.z()).toEqual(2);

        expect(second.z(1).z()).toEqual(1);
        expect(first.z()).toEqual(2);
        expect(third.z()).toEqual(3);

        expect(first.z(9001).z()).toEqual(3);
        expect(second.z(Infinity).z()).toEqual(3);
        expect(third.z(-Infinity).z()).toEqual(1);

        expect(first.bringToFront().z()).toEqual(3);
        expect(first.sendBackwards().z()).toEqual(2);

        expect(second.sendToBack().z()).toEqual(1);
        expect(third.z()).toEqual(2);
        expect(first.z()).toEqual(3);

    });

    it('Should be able to set the zIndex of the shapes;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect'),
            group     = d3.select(svg.querySelector('g[data-id]')),
            element   = d3.select(svg.querySelector('rect'));

        // Add some more rectangles so that the `sort` method is invoked.
        blueprint.add('rect');
        blueprint.add('rect');
        blueprint.add('rect');

        var secondGroup = d3.select(svg.querySelectorAll('g[data-id]')[1]);
        expect(secondGroup.datum().z).toEqual(2);
        var thirdGroup = d3.select(svg.querySelectorAll('g[data-id]')[2]);
        expect(thirdGroup.datum().z).toEqual(3);
        var fourthGroup = d3.select(svg.querySelectorAll('g[data-id]')[3]);
        expect(fourthGroup.datum().z).toEqual(4);

        expect(group.attr('data-id')).toEqual(rectangle.label);
        expect(element.attr('z')).toBeNull();
        expect(element.datum().z).toBeUndefined();
        expect(group.datum().z).toEqual(1);

        rectangle.z(3);
        expect(element.attr('z')).toBeNull();
        expect(element.datum().z).toBeUndefined();
        expect(group.datum().z).toEqual(3);

        var fifth      = blueprint.add('rect'),
            fifthGroup = d3.select(svg.querySelectorAll('g[data-id]')[4]);
        expect(fifthGroup.datum().z).toEqual(5);
        fifth.z(-201);

    });

    it('Should be able to remove shapes from the canvas;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            first     = blueprint.add('rect'),
            second    = blueprint.add('rect'),
            third     = blueprint.add('rect');

        var mapLabels = function() {
            return blueprint.all().map(function(d) {
                return d.label;
            });
        };

        expect(blueprint.all().length).toEqual(3);

        first.remove();
        expect(blueprint.all().length).toEqual(2);
        expect(mapLabels()).toEqual(['BP2', 'BP3']);

        third.remove();
        expect(blueprint.all().length).toEqual(1);
        expect(mapLabels()).toEqual(['BP2']);

        second.remove();
        expect(blueprint.all().length).toEqual(0);
        expect(mapLabels()).toEqual([]);

    });

    it('Should be able to use the `attr` accessor to set/get', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect');

        expect(rectangle.x(125).x()).toEqual(125);
        expect(rectangle.z(1).z()).toEqual(1);
        expect(rectangle.y(275).y()).toEqual(275);
        expect(rectangle.width(300).width()).toEqual(300);
        expect(rectangle.height(250).height()).toEqual(250);

    });

    it('Should be able to register a custom shape;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg);

        expect(function() {
            blueprint.register('new-element', {});
        }).toThrow(new Error('Blueprint.js: Custom shape must be an instance of `Shape`. See: https://github.com/Wildhoney/Blueprint/blob/master/EXCEPTIONS.md#instance-of-shape'));

        var Rect = function Rectangle() {};
        Rect.__proto__ = blueprint.getShapePrototype();
        Rect.prototype = blueprint.getShapePrototype().prototype;

        expect(function() {
            blueprint.register('rect', Rect);
        }).toThrow(new Error('Blueprint.js: Refusing to overwrite existing rect shape without explicit overwrite. See: https://github.com/Wildhoney/Blueprint/blob/master/EXCEPTIONS.md#overwriting-existing-shapes'));

        blueprint.register('rect', Rect, true);
        expect(blueprint.map.rect).toEqual(Rect);
        Rect.prototype.getTag = function getTag() {
            return 'custom-rect';
        };

        blueprint.add('rect');
        expect(blueprint.shapes[0].shape.getTag()).toEqual('custom-rect');

    });

    describe('Selectable', function() {

        it('Should be able to select and deselect the element;', function() {

            var svg       = document.createElement('svg'),
                blueprint = new Blueprint(svg);

            mockBBox(blueprint, blueprint.add('rect'));
            mockBBox(blueprint, blueprint.add('rect'));

            var firstShape       = blueprint.shapes[0].shape,
                secondShape      = blueprint.shapes[1].shape,
                firstSelectable  = firstShape.features.selectable,
                secondSelectable = secondShape.features.selectable;

            spyOn(firstShape.dispatcher, 'send').and.callThrough();
            spyOn(firstSelectable, 'select').and.callThrough();
            spyOn(firstSelectable, 'deselect').and.callThrough();
            expect(firstSelectable.selected).toBeFalsy();
            expect(secondSelectable.selected).toBeFalsy();
            expect(firstShape.group.classed('selected')).toBeFalsy();
            expect(secondShape.group.classed('selected')).toBeFalsy();

            firstShape.element.node().dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true
            }));

            expect(firstShape.dispatcher.send).toHaveBeenCalled();
            expect(firstSelectable.select).toHaveBeenCalled();
            expect(firstSelectable.selected).toBeTruthy();
            expect(secondSelectable.selected).toBeFalsy();
            expect(firstShape.group.classed('selected')).toBeTruthy();
            expect(secondShape.group.classed('selected')).toBeFalsy();

            svg.dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeFalsy();
            expect(secondSelectable.selected).toBeFalsy();

            // And what happens when we select two of the elements without multi-select?
            firstShape.element.node().dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeTruthy();
            expect(secondSelectable.selected).toBeFalsy();

            secondShape.element.node().dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeFalsy();
            expect(secondSelectable.selected).toBeTruthy();

            // We'll then click on the first element with multi-select enabled (mod key).
            Mousetrap.trigger('mod', 'keydown');
            firstShape.element.node().dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeTruthy();
            expect(secondSelectable.selected).toBeTruthy();

            // User disables multi-select.
            Mousetrap.trigger('mod', 'keyup');
            secondShape.element.node().dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeFalsy();
            expect(secondSelectable.selected).toBeTruthy();
            expect(firstShape.group.classed('selected')).toBeFalsy();
            expect(secondShape.group.classed('selected')).toBeTruthy();

            // With mod+a we should be able to select all of the elements.

            Mousetrap.trigger('mod+a');

            expect(firstSelectable.selected).toBeTruthy();
            expect(secondSelectable.selected).toBeTruthy();
            expect(firstShape.group.classed('selected')).toBeTruthy();
            expect(secondShape.group.classed('selected')).toBeTruthy();

            svg.dispatchEvent(new MouseEvent('click', {
                bubbles: true, cancelable: true
            }));

            expect(firstSelectable.selected).toBeFalsy();
            expect(secondSelectable.selected).toBeFalsy();

            Mousetrap.trigger('mod+a');

            expect(firstShape.group.classed('selected')).toBeTruthy();
            expect(secondShape.group.classed('selected')).toBeTruthy();

        });

        it('Should be able to deselect a shape when you mod+click on it;', function() {

            var svg         = document.createElement('svg'),
                blueprint   = new Blueprint(svg),
                first       = mockBBox(blueprint, blueprint.add('rect')),
                second      = mockBBox(blueprint, blueprint.add('rect')),
                third       = mockBBox(blueprint, blueprint.add('rect')),
                firstShape  = blueprint.shapes[0].shape,
                secondShape = blueprint.shapes[1].shape,
                thirdShape  = blueprint.shapes[2].shape;

            expect(blueprint.selected().length).toEqual(0);

            var opts = { bubbles: true, cancelable: true };
            Mousetrap.trigger('mod', 'keydown');
            firstShape.element.node().dispatchEvent(new MouseEvent('mousedown', opts));
            secondShape.element.node().dispatchEvent(new MouseEvent('mousedown', opts));
            thirdShape.element.node().dispatchEvent(new MouseEvent('mousedown', opts));
            Mousetrap.trigger('mod', 'keyup');
            expect(blueprint.selected().length).toEqual(3);

            secondShape.element.node().dispatchEvent(new MouseEvent('mousedown', opts));

            Mousetrap.trigger('mod', 'keydown');

        });

    });

    describe('Movable', function() {

        it('Should be able to move an element;', function() {

            var svg       = document.createElement('svg'),
                blueprint = new Blueprint(svg),
                rectangle = mockBBox(blueprint, blueprint.add('rect'));

            expect(rectangle.x(250).x()).toEqual(250);
            expect(rectangle.y(250).y()).toEqual(250);

            var shape   = blueprint.shapes[0].shape,
                movable = shape.features.movable;
            spyOn(movable.dispatcher, 'send').and.callThrough();
            rectangle.select();

            movable.dragStart(95, 191);
            expect(movable.dispatcher.send).toHaveBeenCalled();
            expect(movable.dispatcher.send.calls.count()).toEqual(1);
            expect(movable.start).toEqual({ x: 95, y: 191 });
            expect(shape.group.classed('dragging')).toBeTruthy();

            movable.drag(191, 301, 10);
            expect(rectangle.x()).toEqual(100);
            expect(rectangle.y()).toEqual(110);
            expect(shape.group.classed('dragging')).toBeTruthy();

            movable.dragEnd();
            expect(shape.group.classed('dragging')).toBeFalsy();

        });

        it('Should be able to draw a collective bounding box for dragging;', function() {

            var svg         = document.createElement('svg'),
                blueprint   = new Blueprint(svg),
                first       = mockBBox(blueprint, blueprint.add('rect').x(100).y(400).height(250).width(250)),
                second      = mockBBox(blueprint, blueprint.add('rect').x(50).y(200).height(125).width(125)),
                firstShape  = blueprint.shapes[0].shape,
                secondShape = blueprint.shapes[1].shape,
                movable     = firstShape.features.movable;

            spyOn(blueprint, 'createBoundingBox').and.callThrough();

            movable.dragStart(250, 350);
            expect(blueprint.createBoundingBox).not.toHaveBeenCalled();
            expect(svg.querySelectorAll('rect.drag-box').length).toEqual(0);

            first.select();
            second.select();
            movable.dragStart(250, 350);
            expect(blueprint.createBoundingBox).toHaveBeenCalled();
            expect(blueprint.createBoundingBox.calls.count()).toEqual(1);
            expect(svg.querySelectorAll('rect.drag-box').length).toEqual(1);

            var box   = blueprint.boundingBox.element,
                datum = box.datum();
            expect(datum).toEqual({ minX: 50, minY: 200, maxX: 350, maxY: 650 });
            expect(box.attr('x')).toEqual(String(datum.minX));
            expect(box.attr('y')).toEqual(String(datum.minY));
            expect(box.attr('width')).toEqual(String(datum.maxX - datum.minX));
            expect(box.attr('height')).toEqual(String(datum.maxY - datum.minY));

        });

        it('Should be able to move an element by pressing the arrow keys;', function() {

            var svg       = document.createElement('svg'),
                blueprint = new Blueprint(svg),
                first     = blueprint.add('rect'),
                second    = blueprint.add('rect').x(100).y(100);

            expect(first.x(250).x()).toEqual(250);
            expect(first.y(250).y()).toEqual(250);

            Mousetrap.trigger('left');

            // Shouldn't move because it's not been selected.
            expect(first.isSelected()).toBeFalsy();
            expect(first.x(250).x()).toEqual(250);
            expect(first.y(250).y()).toEqual(250);

            // Element is now selected and should therefore listen to the arrow key events.
            first.select();
            Mousetrap.trigger('left');
            expect(first.isSelected()).toBeTruthy();
            expect(first.x()).toEqual(249);
            expect(second.x()).toEqual(100);
            expect(first.y()).toEqual(250);

            Mousetrap.trigger('right');
            expect(first.x()).toEqual(250);
            expect(second.x()).toEqual(100);

            Mousetrap.trigger('up');
            expect(first.x()).toEqual(250);
            expect(first.y()).toEqual(249);
            expect(second.x()).toEqual(100);
            expect(second.y()).toEqual(100);

            Mousetrap.trigger('down');
            expect(first.y()).toEqual(250);
            expect(second.y()).toEqual(100);

        });

        it('Should be able to move in large steps with the shift+arrow keys combination;', function() {

            var svg       = document.createElement('svg'),
                blueprint = new Blueprint(svg),
                rectangle = blueprint.add('rect').select().transform(100, 100);

            Mousetrap.trigger('shift+left');
            expect(rectangle.x()).toEqual(90);
            Mousetrap.trigger('shift+left');
            expect(rectangle.x()).toEqual(80);

            Mousetrap.trigger('shift+up');
            expect(rectangle.x()).toEqual(80);
            expect(rectangle.y()).toEqual(90);
            Mousetrap.trigger('shift+down');
            expect(rectangle.y()).toEqual(100);

        });

        it('Should be able to draw a bounding box around selected element(s);', function() {

            var svg       = document.createElement('svg'),
                blueprint = new Blueprint(svg);

            mockBBox(blueprint, blueprint.add('rect').x(100).y(100).select());
            mockBBox(blueprint, blueprint.add('rect').x(200).y(200).select());

            var first   = blueprint.shapes[0].interface,
                second  = blueprint.shapes[1].interface,
                movable = blueprint.shapes[0].shape.features.movable;

            movable.dragStart(300, 300);
            var boundingBox = svg.querySelector('.drag-box');

            expect(parseInt(boundingBox.getAttribute('height'))).toEqual(200);
            expect(parseInt(boundingBox.getAttribute('width'))).toEqual(200);
            expect(parseInt(boundingBox.getAttribute('y'))).toEqual(100);
            expect(parseInt(boundingBox.getAttribute('x'))).toEqual(100);

            second.deselect();
            movable.dragStart(300, 300);
            boundingBox = svg.querySelector('.drag-box');
            expect(parseInt(boundingBox.getAttribute('height'))).toEqual(100);
            expect(parseInt(boundingBox.getAttribute('width'))).toEqual(100);
            expect(parseInt(boundingBox.getAttribute('y'))).toEqual(100);
            expect(parseInt(boundingBox.getAttribute('x'))).toEqual(100);

        });

    });

});
