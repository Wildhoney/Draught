(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            draft      = new Draft(svgElement);

        var first  = draft.add('rectangle');

        first.attr('fill', 'red')
             .attr('x', 100)
             .attr('y', 200)
             .attr('height', 100)
             .attr('width', 200);

    });

})(window, window.document);