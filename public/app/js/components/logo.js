'use strict';

angular.module( 'portailApp' )
    .component( 'logo',
                { template: '<a ng:click="$ctrl.go_home()">' +
                  '<img draggable="false" ng:src="{{$ctrl.prefix}}/app/node_modules/laclasse-common-client/images/logolaclasse.svg" />' +
                  '<h3 class="hidden-xs hidden-sm ent-name">laclasse.com</h3>' +
                  '</a>',
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    this.prefix = APP_PATH;

                                    this.go_home = function() {
                                        Utils.go_home();
                                    };
                                } ]
                } );
