'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/aside_TROMBI_people.html',
                          '<div class="laius">    <h2>{{parent.description}}</h2>    <br>    <div class="blanc form-horizontal"         style="height: auto;">        <div class="col-md-12 form-group">            <label for="text"                   class="col-md-3 control-label">Filtre :</label>            <div class="col-md-8">                <input id="text"                       class="form-control gris1"                       ng:model="filter_criteria.text" />            </div>        </div>    </div></div>' );     } ] );