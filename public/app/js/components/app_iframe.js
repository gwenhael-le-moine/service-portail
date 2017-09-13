'use strict';
angular.module('portailApp')
    .component('appiframe', { bindings: { url: '<' },
    controller: [function () {
            var ctrl = this;
            ctrl.$onInit = function () {
                ctrl.iOS = (navigator.userAgent.match(/iPad/i) !== null) || (navigator.userAgent.match(/iPhone/i) !== null);
            };
        }
    ],
    template: "\n<div class=\"iframe\" ng:class=\"{'ios': $ctrl.iOS}\">\n    <iframe id=\"iframe\" frameBorder=\"0\"\n            scrolling=\"{{$ctrl.iOS ? 'no': 'yes'}}\"\n            ng:src=\"{{$ctrl.url}}\">\n    </iframe>\n</div>\n"
});
