'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/aside_news.html',
                          '<news class="news gris4"      edition="$ctrl.modification"></news>' );     } ] );