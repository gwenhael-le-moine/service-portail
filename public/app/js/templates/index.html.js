'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/index.html',
                          '<div class="row portail">    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 aside">        <helpicon class="btn-group help-icon hidden-xs"></helpicon>        <logo class="col-xs-1 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4"></logo>        <usertile user="current_user"></usertile>        <news class="col-xs-12 col-sm-12 col-md-12 col-lg-12 hidden-xs hidden-sm news"              user="current_user"></news>    </div>    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">        <div data-ui-view="main"></div>    </div></div>' );     } ] );