'use strict';

angular.module( 'portailApp' )
  .component( 'appiframe',
  {
    bindings: { url: '<' },
    controller: [ function() {
      var ctrl = this;

      ctrl.$onInit = function() {
        ctrl.iOS = ( navigator.userAgent.match( /iPad/i ) !== null ) || ( navigator.userAgent.match( /iPhone/i ) !== null );
      };
    }
    ],
    template: `
<div class="iframe" ng:class="{'ios': $ctrl.iOS}">
    <iframe id="iframe" frameBorder="0"
            scrolling="{{$ctrl.iOS ? 'no': 'yes'}}"
            ng:src="{{$ctrl.url}}">
    </iframe>
</div>
`
  } );
