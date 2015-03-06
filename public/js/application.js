(function($window, $document) {

    "use strict";

    $document.addEventListener('DOMContentLoaded', function DOMContentLoaded() {

        var svgElement = $document.querySelector('svg'),
            blueprint  = new Blueprint(svgElement);

        var rect = blueprint.add('rect');
        rect.x(10).fill('blue').y(10).width(200).height(200).attr({
            strokeWidth: 10,
            stroke: 'red'
        });

    });

})(window, window.document);