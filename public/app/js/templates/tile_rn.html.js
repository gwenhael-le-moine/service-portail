'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/tile_rn.html',
                          '<a href   ng:click="tile.action()"   title="{{tile.name}}"   target="_blank">    <img draggable="false"         class="icone"         ng:src="{{ tile.icon }}"         ng:if="tile.icon">    <span class="app-name">        {{tile.name}}        <i class="glyphicon glyphicon-new-window" ng:if="tile.type === \'EXTERNAL\'"></i>    </span></a>' );     } ] );