(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        blueprint.add('rect').fill('lightpink');
        blueprint.add('rect').fill('lightblue').x(160).y(100);
        blueprint.add('circle').fill('lightgreen').x(390).y(150);

    });

})(window, window.document);