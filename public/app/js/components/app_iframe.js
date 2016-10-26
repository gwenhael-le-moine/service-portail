'use strict';

angular.module( 'portailApp' )
    .component( 'appiframe',
                { bindings: { appid: '<' },
                  template: '<div class="row iframe" ng:class="{\'ios\': $ctrl.iOS}">' +
                  '    <iframe id="iframe"' +
                  '            frameBorder="0"' +
                  '            scrolling="{{$ctrl.iOS ? \'no\': \'yes\'}}"' +
                  '            ng:src="{{$ctrl.app.url}}">' +
                  '    </iframe>' +
                  '</div>',
                  controller: [ '$sce', 'apps', 'Utils',
                                function ( $sce, apps, Utils ) {
                                    var ctrl = this;
                                    ctrl.iOS = ( navigator.userAgent.match( /iPad/i ) !== null ) || ( navigator.userAgent.match( /iPhone/i ) !== null );

                                    apps.query()
                                        .then( function ( response ) {
                                            // Toutes les applications en iframe
                                            ctrl.app = _( response ).findWhere( { application_id: ctrl.appid } );

                                            if ( _(ctrl.app).isUndefined() ) {
                                                Utils.go_home();
                                            } else {
                                                ctrl.app = { nom: ctrl.app.nom,
                                                             url: $sce.trustAsResourceUrl( ctrl.app.url ) };
                                            }
                                        } );
                                }
                              ]
                } );
