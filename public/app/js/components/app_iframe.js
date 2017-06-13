'use strict';

angular.module( 'portailApp' )
    .component( 'appiframe',
                { bindings: { appid: '<' },
                  templateUrl: 'app/js/components/app_iframe.html',
                  controller: [ '$sce', 'Tiles', 'Utils', 'currentUser', 'User',
                                function ( $sce, Tiles, Utils, currentUser, User ) {
                                    var ctrl = this;
                                    ctrl.$onInit = function() {
                                        ctrl.iOS = ( navigator.userAgent.match( /iPad/i ) !== null ) || ( navigator.userAgent.match( /iPhone/i ) !== null );
                                        var apps_list = [];

                                        currentUser.get().then( function( user ) {
                                            if ( _(user.profiles).isEmpty() ) {
                                                apps_list = Tiles.query_defaults().$promise;
                                            } else {
                                                apps_list = Tiles.query({ structure_id: user.active_profile().structure_id }).$promise;
                                            }

                                            apps_list.then( function ( response ) {
                                                // Toutes les applications en iframe
                                                ctrl.app = _( response ).findWhere( { application_id: ctrl.appid } );

                                                if ( _(ctrl.app).isUndefined() ) {
                                                    Utils.go_home();
                                                } else {
                                                    ctrl.app = { nom: ctrl.app.nom,
                                                                 url: $sce.trustAsResourceUrl( ctrl.app.url ) };
                                                }
                                            } );

                                        } );
                                    };
                                }
                              ]
                } );
