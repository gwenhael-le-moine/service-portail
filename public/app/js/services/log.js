'use strict';

angular.module( 'portailApp' )
    .service( 'log',
              [ '$http', '$state', 'APP_PATH', 'URL_ENT', 'currentUser',
                function( $http, $state, APP_PATH, URL_ENT, currentUser ) {
                    this.add = function( app, url, params ) {
                        currentUser.get( false )
                            .then( function( user ) {
                                $http.post( URL_ENT + '/api/app/v2/log',
                                            { app: app,
                                              uid: user.uid,
                                              uai: user.has_profil ? user.profil_actif.etablissement_code_uai : 'none',
                                              user_type: user.has_profil ? user.profil_actif.profil_id : 'none',
                                              timestamp: Date.now(),
                                              url: _(url).isNull() ? APP_PATH + $state.current.url: url,
                                              params: _(params).isNull() ? _($state.params).map( function( value, key ) { return key + '=' + value; } ).join( '&' ) : params } );
                            } );
                    };
                }
              ] );
