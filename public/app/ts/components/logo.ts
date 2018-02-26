'use strict';

angular.module('portailApp')
  .component('logo',
  {
    bindings: { user: '=' },
    controller: ['Utils', 'APP_PATH',
      function(Utils, APP_PATH) {
        var ctrl = this;

        ctrl.prefix = APP_PATH;

        ctrl.go_home = function() {
          ctrl.user.edit_profile = false;

          Utils.go_home();
        };
      }],
template: `
<a ng:click="$ctrl.go_home()">
  <img draggable="false" ng:src="{{$ctrl.prefix}}/app/node_modules/laclasse-common-client/images/logolaclasse.svg" />
  <h3 class="hidden-xs hidden-sm ent-name" style="/*background-image: url('/portail/app/node_modules/laclasse-common-client/images/grandlyon-logo-blanc.svg');background-size: contain;background-repeat: no-repeat;background-position-x: right;background-position-y: center; background-color: #da0000; background-blend-mode: overlay; width: 300px;height: 42px; text-align: left;margin-right: 0px;*/">laclasse.com</h3>
</a>
`
  });
