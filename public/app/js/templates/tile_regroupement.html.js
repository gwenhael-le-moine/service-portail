'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/tile_regroupement.html',
                          '<a href   ng:click="tile.action()"   title="{{tile.description}}"   target="_blank">    <h1>{{tile.name}}</h1>    <em>{{tile.structure.name}}</em></a>' );     } ] );