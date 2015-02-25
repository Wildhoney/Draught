describe('Blueprint', function() {

    var blueprint, svgElement;

    beforeEach(function() {
        svgElement = document.createElement('svg');
        blueprint  = new Blueprint(svgElement);
    });

    it('Should be able to add, delete and clear elements;', function() {

        var firstRectElement  = blueprint.add('rect'),
            secondRectElement = blueprint.add('rect');

        expect(blueprint.shapes.length).toEqual(2);
        expect(blueprint.shapes[0]).toEqual(firstRectElement);
        expect(blueprint.shapes[1]).toEqual(secondRectElement);

        blueprint.remove(secondRectElement);
        expect(blueprint.shapes.length).toEqual(1);
        expect(blueprint.shapes[0]).toEqual(firstRectElement);

        blueprint.clear();
        expect(blueprint.shapes.length).toEqual(0);

    });

});