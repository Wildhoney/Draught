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
            rectangle = blueprint.add('rect').x(100).y(100).attr({ strokeWidth: 10 }),
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

});