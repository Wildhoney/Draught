(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        blueprint.add('rect').fill('lightpink').z(100);
        blueprint.add('rect').fill('lightblue').z(101).x(160).y(100);
        blueprint.add('rect').fill('orange').x(180).y(50);

    });

    //fsadu yagada

})(window, window.document);