(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        blueprint.add('rect').fill('lightpink').z(100);
        blueprint.add('rect').z(99).x(160).y(100);

    });

})(window, window.document);