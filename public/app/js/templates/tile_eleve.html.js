'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/tile_eleve.html',
                          '<div ng:style="{ \'background\': \'no-repeat center/100% url({{tile.avatar}})\' }">    <a href       ng:click="tile.action()"       title="{{tile.firstname + \' \' + tile.lastname}}"       target="_blank">        <h1 style="background-color: rgba(0, 0, 0, 0.2);">{{tile.lastname}}</h1>        <h3 style="background-color: rgba(0, 0, 0, 0.2);">{{tile.firstname}}</h3>    </a></div>' );     } ] );