'use strict';

angular.module( 'portailApp' )
    .service( 'log',
              [ '$http', '$state', 'UID', 'URL_ENT', 'APP_PATH', 'currentUser',
                function( $http, $state, UID, URL_ENT, APP_PATH, currentUser ) {
                    this.add = function( app, url, params ) {
                        currentUser.get( false )
                            .then( function( user ) {
                                $http.post( URL_ENT + '/api/logs',
                                            { application_id: app,
                                              user_id: UID,
                                              etablissement_id: user.profil_actif ? user.profil_actif.etablissement_code_uai : 'none',
                                              profil_id: user.profil_actif ? user.profil_actif.profil_id : 'none',
                                              timestamp: Date.now(),
                                              url: _(url).isNull() ? APP_PATH + $state.current.url: url,
                                              params: _(params).isNull() ? _($state.params).map( function( value, key ) { return key + '=' + value; } ).join( '&' ) : params } );
                            } );
                    };
                }
              ] );
