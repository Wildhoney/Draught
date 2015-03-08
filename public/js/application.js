(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        blueprint.add('rect').fill('lightpink');
        blueprint.add('rect').fill('lightblue').x(160).y(100);
        blueprint.add('rect').fill('lightgreen').x(190).y(50);

    });

})(window, window.document);