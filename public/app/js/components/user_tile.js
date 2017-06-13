'use strict';

angular.module( 'portailApp' )
    .component( 'usertile',
                { bindings: { user: '=' },
                  templateUrl: 'app/js/components/user_tile.html',
                  controller: [ 'APP_PATH', 'URL_ENT',
                                function( APP_PATH, URL_ENT ) {
                                    var ctrl = this;

                                    ctrl.APP_PATH = APP_PATH;
                                    ctrl.URL_ENT = URL_ENT;

                                    ctrl.change_password_message = 'Pensez à changer votre mot de passe...';

                                    ctrl.edit_profile = function() {
                                        ctrl.user.edit_profile = !ctrl.user.edit_profile;
                                    };
                                } ]
                } );
