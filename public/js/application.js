(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        blueprint.add('rect').fill('lightpink').z(1);
        blueprint.add('rect').fill('lightblue').z(200).x(160).y(100);

    });

    //fsadu yagada

})(window, window.document);