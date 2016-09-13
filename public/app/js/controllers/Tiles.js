'use strict';

angular.module( 'portailApp' )
    .controller( 'TilesCtrl',
                 [ '$scope', '$rootScope', '$uibModal', '$log', '$q', '$http', '$window', 'current_user', 'apps', 'Apps', 'APP_PATH', 'CASES', 'COULEURS', 'log', 'Utils',
                   function( $scope, $rootScope, $uibModal, $log, $q, $http, $window, current_user, apps, Apps, APP_PATH, CASES, COULEURS, log, Utils ) {
                       $scope.prefix = APP_PATH;
                       $scope.couleurs = COULEURS;
                       var tiles_indexes_changed = false;
                       var sortable_callback = function( event ) {
                           tiles_indexes_changed = true;
                           _($scope.cases).each( function( c, i ) {
                               c.index = i;
                           } );
                       };
                       $scope.sortable_options = { accept: function( sourceItemHandleScope, destSortableScope ) { return true; },
                                                   longTouch: true,
                                                   itemMoved: sortable_callback,
                                                   orderChanged: sortable_callback,
                                                   containment: '.damier',
                                                   containerPositioning: 'relative',
                                                   additionalPlaceholderClass: 'col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case',
                                                   clone: false,
                                                   allowDuplicates: false };
                       $scope.tiles_templates = { app: 'views/tile_app.html' };

                       $scope.log_and_open_link = function( tile ) {
                           Utils.log_and_open_link( tile.application_id == 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', tile.url );
                       };

                       var tool_tile = function( tile ) {
                           tile.species = 'app';
                           tile.configure = false;
                           tile.dirty = false;
                           tile.to_delete = false;
                           tile.show = !_(tile.hidden).includes( $rootScope.current_user.profil_actif.profil_id ) && ( tile.application_id !== 'MAIL' || !_.chain(current_user.emails).findWhere({type: 'Ent'}).isUndefined().value() );
                           tile.highlight = tile.application_id == 'CCNUM' && $rootScope.current_user.profil_actif.profil_id != 'TUT' && $rootScope.current_user.profil_actif.profil_id != 'ELV';
                           tile.toggle_configure = function() {
                               _.chain($scope.cases)
                                   .select( function( c ) { return _(c).has( 'tile' ); } )
                                   .each( function( c ) {
                                       if ( c.tile === tile ) {
                                           tile.configure = !tile.configure;
                                       } else  {
                                           c.tile.configure = false;
                                       }
                                   } );
                           };
                           tile.is_dirty = function() { tile.dirty = true; };
                           tile.remove = function() {
                               tile.active = false;
                               tile.toggle_configure();
                               tile.is_dirty();
                               tile.to_delete = true;
                           };
                           tile.colorize = function() {
                               return ( tile.color ) ? { 'background-color': tile.color } : {};
                           };

                           if ( !_(tile.url.match( /^app\..*/ )).isNull() ) {
                               tile.type = 'portail';
                           } else if ( ( tile.type === 'EXTERNAL' ) || ( tile.application_id !== 'BLOGS' && tile.url.match( /^http.*/ ) !== null ) ) {
                               tile.type = 'external';
                           } else {
                               tile.type = 'internal';
                           }

                           tile.status = { app_id: tile.application_id,
                                           app_version: '',
                                           available: false,
                                           rack_env: '',
                                           reason: '',
                                           status: 'KO' };

                           if ( tile.type === 'external' || tile.type === 'portail' || tile.application_id === 'MAIL' || tile.application_id === 'BLOGS' ) {
                               tile.status.status = 'OK';
                               tile.status.available = true;
                           } else if ( !tile.show ) {
                               tile.status.reason = 'Application non affichée.';
                           } else {
                               var save_response = function( response ) {
                                   switch ( response.status ) {
                                   case 200:
                                       tile.status = response.data;
                                       break;
                                   case 404:
                                       tile.status.reason = 'Serveur de l\'application introuvable (' + response.status + ').';
                                       break;
                                   case 500:
                                       tile.status.reason = 'Serveur de l\'application en erreur (' + response.status + ').';
                                       break;
                                   default:
                                       tile.status.reason = 'Erreur non qualifiée (' + response.status + ').';
                                   }
                               };

                               $http.get( tile.url + 'status' ).then( save_response,
                                                                      save_response );
                           }

                           return tile;
                       };

                       var retrieve_tiles = function( force_reload ) {
                           $scope.cases = _(CASES).map( function( c, i ) {
                               c.index = i;

                               return c;
                           } );

                           apps.query( force_reload )
                               .then( function( response ) {
                                   $scope.current_tiles = response;

                                   _.chain($scope.current_tiles)
                                       .each( function( tile ) {
                                           if ( _($scope.cases[ tile.index ]).isUndefined() ) {
                                               $scope.cases.push( { tile: null,
                                                                    index: tile.index,
                                                                    couleur: CASES[ tile.index % ( CASES.length - 1 ) ].couleur } );
                                           }

                                           $scope.cases[ tile.index ].tile = tool_tile( tile );
                                       } );
                               } );
                       };

                       current_user.$promise.then( function() {
                           retrieve_tiles( false );
                       } );

                       // Below related to modification
                       $scope.add_tile = function() {
                           $uibModal.open( { templateUrl: 'views/popup_ajout_app.html',
                                             controller: 'PopupAjoutAppCtrl',
                                             resolve: { current_tiles: function () {
                                                 return _.chain($scope.cases)
                                                     .map( function( c ) {
                                                         return c.tile;
                                                     } )
                                                     .compact()
                                                     .value();
                                             } } } )
                               .result.then( function( new_tiles ) {
                                   var empty_tiles = _($scope.cases).select( function( c ) { return !_(c.tile).has( 'libelle' ) || c.tile.to_delete; } );

                                   _(new_tiles).each( function( new_tile ) {
                                       var recipient = null;
                                       if ( _(empty_tiles).isEmpty() ) {
                                           recipient = { index: $scope.cases.length,
                                                         couleur: 'gris2' };
                                           $scope.cases.push( recipient );
                                       } else {
                                           recipient = empty_tiles.shift();
                                       }

                                       new_tile.index = recipient.index;
                                       new_tile.dirty = true;
                                       new_tile.configure = true;
                                       new_tile.active = true;
                                       new_tile.to_delete = false;

                                       new_tile.$save().then( function() {
                                           recipient.tile = tool_tile( new_tile );
                                       } );
                                   } );
                               } );
                       };

                       $scope.toggle_modification = function( save ) {
                           $rootScope.modification = !$rootScope.modification;
                           $scope.sortable_options.disabled = !$scope.sortable_options.disabled;
                           if ( !$scope.modification ) {
                               var promesses = [];

                               if ( save && tiles_indexes_changed ) {
                                   // mise à jour de l'annuaire avec les nouveaux index des tiles suite au déplacement
                                   _($scope.cases).each( function( c, i ) {
                                       if ( _(c.tile).has( 'id' ) ) {
                                           c.tile.index = i;
                                           promesses.push( c.tile.$update() );
                                       }
                                   } );
                               }

                               _($scope.cases).each( function( c ) {
                                   if ( _(c).has( 'tile' ) ) {
                                       c.tile.configure = false;
                                       if ( save && c.tile.dirty ) {
                                           if ( c.tile.to_delete ) {
                                               promesses.push( c.tile.$delete() );
                                               delete c.tile;

                                               if ( $scope.cases.length > 16 ) {
                                                   $scope.cases = $scope.cases.splice( _($scope.cases).findLastIndex( function(c) {return !_(c).has('tile'); } ), 1 );
                                               }
                                           } else {
                                               promesses.push( c.tile.$update() );
                                               c.tile = tool_tile( c.tile );
                                           }
                                       }
                                   }
                               } );


                               $q.all( promesses ).then( retrieve_tiles( true ) );
                           }
                       };
                   } ] );
