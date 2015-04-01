(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            draft      = new Draft(svgElement);

        draft.add('rect').fill('lightpink');
        draft.add('rect').fill('lightblue').x(160).y(100);
        draft.add('circle').fill('lightgreen').x(390).y(150);

    });

})(window, window.document);