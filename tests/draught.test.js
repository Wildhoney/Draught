import test from 'ava';
import create from '../src/draught';
import rectangle from '../src/shapes/rectangle';


test('is able to add shapes to the weakmap', t => {

    const element = document.querySelector('svg');
    const diagram = create(element, { width: 200, height: 200 });
    diagram.render(rectangle);
    diagram.render(rectangle);

    t.is(diagram.count(), 2);
    
});
