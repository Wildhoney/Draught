import create from '../../src/index';

document.addEventListener('DOMContentLoaded', () => {

    const diagram = create(document.querySelector('svg'));
    console.log(diagram);

    // diagram.add('rect');

});
