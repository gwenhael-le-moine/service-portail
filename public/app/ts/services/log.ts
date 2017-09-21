'use strict';

angular.module( 'portailApp' )
  .service( 'log',
  [ '$http', '$state', 'URL_ENT', 'APP_PATH', 'currentUser',
    function( $http, $state, URL_ENT, APP_PATH, currentUser ) {
      this.add = function( app, url, params ) {
        currentUser.get( false )
          .then( function( user ) {
            $http.post( URL_ENT + '/api/logs',
              {
                application_id: app,
                user_id: user.id,
                structure_id: user.active_profile() ? user.active_profile().structure_id : 'none',
                profil_id: user.active_profile() ? user.active_profile().type : 'none',
                url: _( url ).isNull() ? APP_PATH + $state.current.url : url,
                parameters: _( params ).isNull() ? _( $state.params ).map( function( value, key ) { return key + '=' + value; } ).join( '&' ) : params
              } );
          } );
      };
    }
  ] );
