'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/apps.html',
                          '<div class="row damier gris4"     data-ng-class="{\'modification\': modification}">    <ul data-as-sortable="sortable_options"        data-is-disabled="!modification"        data-ng-model="cases">        <li data-ng-repeat="case in cases | orderBy:\'index\'"            data-as-sortable-item            class="col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case flippable"            data-ng-class="{\'show-back\': case.app.configure, \'unavailable\': case.app && !case.app.portail && !case.app.external && case.app.status.status == \'KO\', \'empty hidden-xs hidden-sm\': !case.app || !case.app.id || !case.app.active}"            data-ng-if="current_user.is_logged">            <div class="front"                 data-as-sortable-item-handle                 data-ng-class="{ {{case.couleur}}: !case.app.id || ( !case.app.color && !case.app.new_color ) }"                 data-ng-style="case.app.colorize()">                <button class="btn btn-lg toggle-configure open-configure"                        data-ng-if="modification && case.app && case.app.active"                        data-ng-click="case.app.toggle_configure()">                    <span class="icone parametrer"></span>                </button>                <ng-color-picker class="couleurs"                                 data-ng-click="case.app.is_dirty()"                                 data-ng-if="modification && case.app && case.app.active"                                 selected="case.app.color"                                 colors="couleurs"></ng-color-picker>                <!-- # Affichage normal -->                <!-- ## Lien vers app interne portail -->                <a data-ng-if="case.app.portail && case.app.active && case.app.show && !modification"                   data-ui-sref="{{ case.app.url }}"                   title="{{ case.app.description }}">                    <div data-ng-include="\'views/app-tile-content.html\'"></div>                </a>                <!-- ## Lien vers app laclasse.com -->                <a data-ng-if="!case.app.portail && !case.app.external && case.app.active && case.app.show && case.app.status.status == \'OK\' && !modification"                   data-ui-sref="app.external({ app: case.app.application_id ? case.app.application_id : case.app.libelle })"                   title="{{ case.app.description }}">                    <div data-ng-include="\'views/app-tile-content.html\'"></div>                </a>                <!-- ## app au status cassé -->                <a data-ng-if="!case.app.portail && !case.app.external && case.app.active && case.app.show && case.app.status.status == \'KO\' && !modification"                   title="{{ case.app.status.reason }}">                    <div data-ng-include="\'views/app-tile-content.html\'"></div>                </a>                <!-- ## Lien vers site externe -->                <a href data-ng-if="case.app.external && case.app.active && case.app.show && !modification"                   data-ng-click="log_and_open_link( case.app )"                    target="_blank"                    title="{{ case.app.description }}">                    <div data-ng-include="\'views/app-tile-content.html\'"></div>                </a>                <!-- # Mode modification -->                <a data-ng-if="case.app.active && case.app.show && modification"                   title="{{ case.app.description }}">                    <div data-ng-include="\'views/app-tile-content.html\'"></div>                </a>            </div>            <button class="btn btn-lg toggle-configure close-configure"                    data-ng-if="modification && case.app"                    data-ng-click="case.app.toggle_configure()">                <span class="icone visualiser"></span>            </button>            <button class="btn btn-xs btn-link remove glyphicon glyphicon-trash"                    data-ng-if="modification && case.app"                    data-ng-click="case.app.remove()"></button>            <div class="configure back blanc"                 data-ng-if="modification">                <label>nom : <input type="text" class="form-control"                                    data-ng-model="case.app.libelle"                                    data-ng-change="case.app.is_dirty()" />                </label>                <label>description : <input type="text" class="form-control"                                            data-ng-model="case.app.description"                                            data-ng-change="case.app.is_dirty()" />                </label>                <label data-ng-if="case.app.external || case.app.application_id == \'PRONOTE\'">url : <input type="text" class="form-control"                                                                                                           data-ng-model="case.app.url"                                                                                                           data-ng-change="case.app.is_dirty()" />                </label>            </div>        </li>    </ul>    <!-- Mode normal -->    <span class="hidden-xs hidden-sm floating-button toggle big off blanc"          data-ng-if="current_user.profil_actif.admin && !modification"          data-ng-click="toggle_modification( !modification )"></span>    <!-- Mode modification -->    <span class="hidden-xs hidden-sm floating-button toggle big on gris4"          data-ng-if="modification"></span>    <span class="floating-button small cancel gris3"          data-ng-if="modification"          data-ng-click="toggle_modification( false )"></span>    <span class="floating-button small save gris1"          data-ng-if="modification"          data-ng-click="toggle_modification( true )"></span>    <span class="floating-button small action1 add-app gris1"          data-ng-if="modification"          data-ng-click="add_tile()"></span></div>' );     } ] );