'use strict';

angular.module( 'portailApp' )
    .component( 'helpicon',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/help_icon.html',
                  controller: [ 'CONFIG',
                                function( CONFIG ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        ctrl.help_links = _(CONFIG.help_links)
                                            .select( function( link ) {
                                                return !_(ctrl.user.profils).isEmpty() && _(link.profils).includes( ctrl.user.profil_actif.profil_id );
                                            } );
                                    };
                                } ]
                } );
