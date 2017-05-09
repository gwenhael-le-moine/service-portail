'use strict';

angular.module( 'portailApp' )
    .component( 'usermenu',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/user_menu.html',
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    this.prefix = APP_PATH;

                                    this.go_home = function() {
                                        Utils.go_home();
                                    };
                                } ]
                } );
