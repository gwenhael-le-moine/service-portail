'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/user.html',
                          '<div class="row user-profil">    <userprofile user="current_user"></userprofile></div>' );     } ] );