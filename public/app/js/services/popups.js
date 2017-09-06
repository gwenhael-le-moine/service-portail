'use strict';

angular.module( 'portailApp' )
    .service( 'Popups',
              [ '$uibModal',
                function( $uibModal ) {
                    var Popups = this;

                    Popups.add_tiles = function( current_tiles, callback_success, callback_error ) {
                        $uibModal.open( { controller: [ '$scope', '$uibModalInstance', 'APP_PATH', 'Tiles', 'currentUser', 'Annuaire',
                                                        'current_tiles',
                                                        function( $scope, $uibModalInstance, APP_PATH, Tiles, currentUser, Annuaire,
                                                                  current_tiles ) {
                                                            $scope.prefix = APP_PATH;

                                                            $scope.available_tiles = [];
                                                            $scope.tiles_selected = false;

                                                            $scope.add_empty_link_tile = function() {
                                                                $scope.available_tiles.push( new Tiles( { creation: true,
                                                                                                          present: false,
                                                                                                          type: 'EXTERNAL',
                                                                                                          name: '',
                                                                                                          description: '',
                                                                                                          url: 'http://',
                                                                                                          color: '',
                                                                                                          selected: true,
                                                                                                          taxonomy: 'app'} ) );
                                                            };

                                                            $scope.keep_tile_selected = function( event, app ) {
                                                                app.selected = false; // opposite of what we want
                                                                $scope.selected( app );
                                                                event.stopImmediatePropagation();
                                                            };

                                                            $scope.selected = function( tile ) {
                                                                tile.selected = !tile.selected;
                                                                $scope.tiles_selected = _($scope.available_tiles).select( { selected: true } ).length > 0;
                                                            };

                                                            $scope.ok = function () {
                                                                $uibModalInstance.close( _($scope.available_tiles).select( { selected: true } ) );
                                                            };

                                                            $scope.cancel = function () {
                                                                $uibModalInstance.dismiss();
                                                            };

                                                            Annuaire.query_applications()
                                                                .then( function( response ) {
                                                                    $scope.available_tiles = $scope.available_tiles.concat( _.chain( response )
                                                                                                                            .uniq( function( app ) { return app.application_id; } )
                                                                                                                            .each( function( app ) {
                                                                                                                                app.taxonomy = 'app';
                                                                                                                                app.available = function() {
                                                                                                                                    return !_.chain(current_tiles)
                                                                                                                                        .reject( function( a ) {
                                                                                                                                            return a.to_delete;
                                                                                                                                        } )
                                                                                                                                        .pluck( 'application_id' )
                                                                                                                                        .contains( app.application_id )
                                                                                                                                        .value();
                                                                                                                                };
                                                                                                                            } )
                                                                                                                            .value() );
                                                                        _($scope.available_tiles).each( function( tile ) { tile.selected = false; } );
                                                                    } );
                                                            } ],
                                          resolve: { current_tiles: function() { return current_tiles; } },
                                          template: `
<div class="modal-header">
    <h3 class="modal-title">Ajouter une tuile</h3>
</div>
<div class="modal-body available-apps">
    <ul>
        <li class="new-app"
            ng:repeat="tile in available_tiles"
            ng:if="tile.available() || tile.creation"
            ng:class="{'selected': tile.selected, 'creation': tile.creation, 'pronote': tile.application_id == 'PRONOTE'}"
            ng:click="selected( tile )">

            <a ng:if="!tile.creation"
               title="{{ tile.description }}"
               ng:style="{'background-color': tile.color }">
                <img draggable="false" class="icone" ng:src="{{prefix}}/{{tile.icon}}"
                     ng:if="tile.icon"/>
                <span class="app-name" ng:cloak>{{ tile.name }}</span>
                <label ng:if="tile.application_id == 'PRONOTE'">lien <input type="text" ng:model="tile.url" ng:click="keep_tile_selected( $event, tile )"/></label>
            </a>

            <fieldset ng:if="tile.creation">
                <legend>lien libre</legend>

                <label>libellé <input type="text" ng:model="tile.name" ng:click="keep_tile_selected( $event, tile )" /></label>
                <label>lien <input type="text" ng:model="tile.url" ng:click="keep_tile_selected( $event, tile )" /></label>
            </fieldset>
        </li>
    </ul>
    <div class="clearfix"></div>
</div>
<div class="modal-footer">
    <button class="btn btn-primary pull-left" ng:click="add_empty_link_tile()">
        <span class="glyphicon glyphicon-plus-sign"></span> Ajouter un lien libre
    </button>

    <button class="btn btn-default" ng:click="cancel()">
        <span class="glyphicon glyphicon-remove-sign"></span> <span ng:if="tiles_selected">Annuler</span><span ng:if="!tiles_selected">Fermer</span>
    </button>
    <button class="btn btn-success"
            ng:click="ok()"
            ng:disabled="!tiles_selected">
        <span class="glyphicon glyphicon-ok-sign"></span> Valider
    </button>
</div>
`,
                                          backdrop: 'static' } )
                            .result.then( callback_success, callback_error );
                    };

                    Popups.manage_fluxes = function( callback_success, callback_error ) {
                        $uibModal.open( { template: `
<div class="modal-header">
    <h3 class="modal-title">Gérer les flux RSS affichés sur le portail de l'établissement</h3>
</div>
<div class="modal-body config-fluxes">
    <ul>
        <li ng:repeat="flux in $ctrl.current_flux">
            <label>titre <input type="text"
                                ng:model="flux.name"
                                ng:change="$ctrl.dirtify( flux )" /></label>
            <label>url <input type="text"
                              ng:model="flux.url"
                              ng:change="$ctrl.dirtify( flux )" /></label>

            <div class="controls">
                <button class="btn-default delete"
                        ng:click="$ctrl.delete( flux )"><span class="glyphicon glyphicon-trash"></span></button>
                <button class="btn-primary save"
                        ng:if="flux.dirty"
                        ng:click="$ctrl.save( flux )"><span class="glyphicon glyphicon-ok-sign"></span></button>
            </div>
            <div class="clearfix"></div>
        </li>
    </ul>
    <div class="clearfix"></div>

    <button style="right: 4em;"
            ng:click="$ctrl.add_default_flux()"><span class="glyphicon glyphicon-cloud-download"></span></button>
    <button ng:click="$ctrl.add_flux()"><span class="glyphicon glyphicon-plus-sign"></span></button>
</div>
<div class="modal-footer">
    <button class="btn btn-default" ng:click="$ctrl.close()">
        <span class="glyphicon glyphicon-remove-sign"></span> Fermer
    </button>
</div>
`,
                                          controller: [ '$scope', '$uibModalInstance', 'currentUser', 'Flux', 'CONFIG',
                                                        function( $scope, $uibModalInstance, currentUser, Flux, CONFIG ) {
                                                            var ctrl = $scope;
                                                            ctrl.$ctrl = ctrl;

                                                            ctrl.nb_articles = _.range( 1, 11 );
                                                            ctrl.current_flux = [];

                                                            ctrl.delete = function( flux ) {
                                                                flux.$delete();
                                                                ctrl.current_flux = _(ctrl.current_flux).difference( [ flux ] );
                                                            };

                                                            ctrl.save = function( flux ) {
                                                                flux.structure_id = ctrl.user.active_profile().structure_id;
                                                                return _(flux).has( 'id' ) ? flux.$update() : flux.$save();
                                                            };

                                                            ctrl.dirtify = function( flux ) {
                                                                flux.dirty = true;
                                                            };

                                                            ctrl.add_flux = function() {
                                                                ctrl.current_flux.push( new Flux( { name: '',
                                                                                                    url: '',
                                                                                                    icon: '' } ) );
                                                            };

                                                            ctrl.add_default_flux = function() {
                                                                _(CONFIG.news_feed).each( function( flux ) {
                                                                    ctrl.dirtify( flux );
                                                                    ctrl.current_flux.push( new Flux( flux ) );
                                                                } );
                                                            };

                                                            ctrl.close = function () {
                                                                $uibModalInstance.close();
                                                            };

                                                            ctrl.$onInit = function() {
                                                                currentUser.get( false ).then( function( user ) {
                                                                    ctrl.user = user;

                                                                    Flux.get({ structure_id: ctrl.user.active_profile().structure_id }).$promise
                                                                        .then( function( response ) {
                                                                            ctrl.current_flux = _(response).map( function( flux ) {
                                                                                flux.dirty = false;

                                                                                return flux;
                                                                            } );
                                                                        } );
                                                                } );
                                                            };

                                                            ctrl.$onInit();
                                                        } ],
                                          backdrop: 'static'  } )
                            .result.then( callback_success, callback_error );
                    };
                }
              ] );
