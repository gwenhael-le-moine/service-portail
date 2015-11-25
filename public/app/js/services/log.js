angular.module( 'portailApp' )
    .service( 'log',
              [ '$http', '$state', 'APP_PATH', 'currentUser',
                function( $http, $state, APP_PATH, currentUser ) {
                    this.add = function( app, url, params ) {
                        currentUser.get( false )
                            .then( function( user ) {
                                $http.post( APP_PATH + '/api/log',
                                            { app: app,
                                              uid: user.uid,
                                              uai: user.profil_actif.etablissement_code_uai,
                                              user_type: user.profil_actif.profil_id,
                                              timestamp: Date.now(),
                                              url: _(url).isNull() ? APP_PATH + $state.current.url: url,
                                              params: _(params).isNull() ? _($state.params).map( function( value, key ) { return key + '=' + value; } ).join( '&' ) : params } );
                            } );
                    };
                }
              ] );
