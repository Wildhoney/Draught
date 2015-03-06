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
        expect(blueprint.label).toEqual('BP1');
        expect(blueprint.map.rect).toBeDefined();

    });

    it('Should be able to add an element;', function() {

        var svg       = document.createElement('svg'),
            blueprint = new Blueprint(svg),
            rectangle = blueprint.add('rect').x(100).y(100).setAttr({ strokeWidth: 10 }),
            element   = d3.select(svg.querySelector('rect'));

        expect(rectangle.toString()).toEqual('[object Interface: BP2]');
        expect(rectangle.label).toEqual('BP2');
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

});