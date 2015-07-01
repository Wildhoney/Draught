(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            draft      = new Draft(svgElement);

        draft.add('rectangle')
             .attr('fill', 'red')
             .attr('x', 100)
             .attr('y', 200);

        draft.add('rectangle')
             .attr('fill', 'blue')
             .attr('x', 50)
             .attr('y', 25);

    });

})(window, window.document);