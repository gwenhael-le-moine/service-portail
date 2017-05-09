'use strict';

angular.module( 'portailApp' )
    .component( 'logo',
                { templateUrl: 'app/js/components/logo.html',
                  controller: [ 'Utils', 'APP_PATH',
                                function( Utils, APP_PATH ) {
                                    this.prefix = APP_PATH;

                                    this.go_home = function() {
                                        Utils.go_home();
                                    };
                                } ]
                } );
