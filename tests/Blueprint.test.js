describe('Blueprint', function() {

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

    it('Should be able to read attributes from the shape;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect').x(250).y(250).z(9001).setAttr({ strokeWidth: 10 });

        expect(rectangle.getAttr().x).toEqual(250);
        expect(rectangle.getAttr().y).toEqual(250);
        expect(rectangle.getAttr().z).toEqual(9001);
        expect(rectangle.getAttr().strokeWidth).toEqual(10);

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
        expect(blueprint.registry.get('z-index-min')).toEqual(1);
        expect(blueprint.registry.get('z-index-max')).toEqual(4);

        rectangle.z(101);
        expect(element.attr('z')).toBeNull();
        expect(element.datum().z).toBeUndefined();
        expect(group.datum().z).toEqual(101);
        expect(blueprint.registry.get('z-index-min')).toEqual(1);
        expect(blueprint.registry.get('z-index-max')).toEqual(101);

        var fifth      = blueprint.add('rect'),
            fifthGroup = d3.select(svg.querySelectorAll('g[data-id]')[4]);
        expect(fifthGroup.datum().z).toEqual(102);
        fifth.z(-201);

        expect(blueprint.registry.get('z-index-min')).toEqual(-201);
        expect(blueprint.registry.get('z-index-max')).toEqual(101);

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
        expect(rectangle.z(2).z()).toEqual(2);
        expect(rectangle.y(275).y()).toEqual(275);
        expect(rectangle.width(300).width()).toEqual(300);
        expect(rectangle.height(250).height()).toEqual(250);

    });

    it('Should be able to register a custom shape;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg);

        expect(function() {
            blueprint.register('circle', {});
        }).toThrow('Blueprint.js: Custom shape must be an instance of `Shape`. See: https://github.com/Wildhoney/Blueprint/blob/master/EXCEPTIONS.md#instance-of-shape');

        var Rect = function Rectangle() {};
        Rect.__proto__ = blueprint.getShapePrototype();
        Rect.prototype = blueprint.getShapePrototype().prototype;

        expect(function() {
            blueprint.register('rect', Rect);
        }).toThrow('Blueprint.js: Refusing to overwrite existing rect shape without explicit overwrite. See: https://github.com/Wildhoney/Blueprint/blob/master/EXCEPTIONS.md#overwriting-existing-shapes');

        blueprint.register('rect', Rect, true);
        expect(blueprint.map.rect).toEqual(Rect);
        Rect.prototype.getTag = function getTag() {
            return 'custom-rect';
        };

        var rectangle = blueprint.add('rect');
        expect(blueprint.shapes[0].shape.getTag()).toEqual('custom-rect');

    });

});