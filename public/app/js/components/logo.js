'use strict';

angular.module( 'portailApp' )
    .component( 'logo',
                { bindings: { user: '=' },
                  templateUrl: 'app/js/components/logo.html',
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    var ctrl = this;

                                    ctrl.prefix = APP_PATH;

                                    ctrl.go_home = function() {
                                        ctrl.user.edit_profile = false;

                                        Utils.go_home();
                                    };
                                } ]
                } );
