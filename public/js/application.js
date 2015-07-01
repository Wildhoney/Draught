(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            draft      = new Draft(svgElement);

        var first  = draft.add('rectangle'),
            second = draft.add('rectangle');

        console.log(first);

    });

})(window, window.document);