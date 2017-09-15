'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/tile_app.html',
                          `<div class="flippable"
     ng:class="{ 'show-back': tile.configure }">
    <div class="as-sortable-item-handle"
         data-as-sortable-item-handle
         ng:style="{'background-color': tile.color + '77' }">
    <div class="front"
         ng:class="{'deleted': tile.to_delete}"
         ng:style="{'background-color': tile.color}">

        <button class="btn btn-lg toggle-configure open-configure"
                ng:if="$ctrl.modification"
                ng:click="tile.toggle_configure()">
            <span class="icone parametrer"></span>
        </button>
        <ng-color-picker class="couleurs"
                         ng:click="tile.is_dirty( 'color' )"
                         ng:if="$ctrl.modification"
                         selected="tile.color"
                         colors="$ctrl.COULEURS"></ng-color-picker>

        <div class="tile-icone"
           ng:click="tile.action()"
           title="{{tile.description}}"
           style="cursor: pointer">
            <div class="icone"
                 fittext
                 ng:if="!tile.icon">
                {{tile.name[0]}}
            </div>
            <img draggable="false"
                 class="icone"
                 ng:src="{{$ctrl.prefix}}/{{ tile.icon }}"
                 ng:if="tile.icon">
            <span class="app-name">
                {{tile.name}}
                <i class="glyphicon glyphicon-new-window"
                   ng:if="tile.type === 'EXTERNAL'"></i>
            </span>
        </div>
    </div>

    <div class="configure back blanc"
         ng:if="$ctrl.modification">

        <button class="btn btn-lg toggle-configure close-configure"
                ng:click="tile.toggle_configure()">
            <span class="icone visualiser"></span>
        </button>
        <button class="btn btn-xs btn-link remove glyphicon glyphicon-trash"
                ng:click="tile.remove()"></button>

        <label>
            nom : <input type="text" class="form-control"
                         ng:model="tile.name"
                         ng:change="tile.is_dirty( 'name' )" />
        </label>

        <label>
            description : <input type="text" class="form-control"
                                 ng:model="tile.description"
                                 ng:change="tile.is_dirty( 'description' )" />
        </label>

        <label ng:if="tile.type === 'EXTERNAL' || tile.application_id == 'PRONOTE'">
            url : <input type="text" class="form-control"
                         ng:model="tile.url"
                         ng:change="tile.is_dirty( 'url' )" />
        </label>
    </div>
    </div>
</div>
` );     } ] );