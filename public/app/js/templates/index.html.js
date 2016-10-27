'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/index.html',
                          '<div class="row portail">    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 aside">        <helpicon class="btn-group help-icon hidden-xs"></helpicon>        <logo class="col-xs-1 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4"></logo>        <usertile user="current_user"></usertile>        <news class="col-xs-12 col-sm-12 col-md-12 col-lg-12 hidden-xs hidden-sm news"              user="current_user"></news>    </div>    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">        <div class="row user-profil"             ng:if="current_user.edit_profile">            <userprofile user="current_user"></userprofile>        </div>        <div class="row damier gris4"             ng:class="{\'modification\': modification}"             ng:if="!current_user.edit_profile">            <div class="hidden-xs aside laius"                 ng:include="tree.laius_template"                 ng:if="tree.laius_template">                {{tree.laius_template}}            </div>            <ul data-as-sortable="sortable_options"                data-is-disabled="!modification"                ng:model="tree.tiles">                <li class="col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case animate scale-fade-in {{tile.couleur}}"                    data-as-sortable-item                    ng:class="{ \'empty hidden-xs\': !tile.taxonomy }"                    ng:repeat="tile in tree.tiles | filter:tree.filter() | orderBy:\'index\'">                    <div ng:include="tiles_templates[ tile.taxonomy ]"></div>                </li>            </ul>            <!-- Mode normal -->            <span class="hidden-xs hidden-sm floating-button toggle big off blanc"                  ng:if="tree.configurable && current_user.profil_actif.admin && !modification"                  ng:click="edit_tiles()"></span>            <!-- Mode modification -->            <span class="hidden-xs hidden-sm floating-button toggle big on gris4"                  ng:if="modification"></span>            <span class="floating-button small cancel gris3"                  ng:if="modification"                  ng:click="exit_tiles_edition()"></span>            <span class="floating-button small save gris1"                  ng:if="modification"                  ng:click="save_tiles_edition()"></span>            <span class="floating-button small action1 add-app gris1"                  ng:if="modification"                  ng:click="add_tile( tree.tiles, inactive_apps )"></span>        </div>    </div></div>' );     } ] );