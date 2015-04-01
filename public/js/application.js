(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            draft      = new Draft(svgElement);

        var first  = draft.add('rect').fill('lightpink').x(200).y(120).height(100).width(100),
            second = draft.add('rect').fill('lightblue').x(160).y(100).height(100).width(200);

    });

})(window, window.document);