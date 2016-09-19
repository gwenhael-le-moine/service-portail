'use strict';

angular.module( 'portailApp' )
    .controller( 'NewTilesCtrl',
                 [ '$scope', '$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Apps',
                   function( $scope, $sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Apps ) {
                       $scope.COULEURS = COULEURS;
                       $scope.tiles_templates = { app: 'views/new_tile_app.html',
                                                  back: 'views/new_tile_app.html',
                                                  regroupement: 'views/new_tile_regroupement.html',
                                                  eleve: 'views/new_tile_eleve.html',
                                                  rn: 'views/new_tile_rn.html',
                                                  ccn: 'views/new_tile_ccn.html' };
                       $scope.filter_criteria = {};

                       var fill_empty_tiles = function( tiles_tree ) {
                           var indexes = tiles_tree.map( function( tile ) { return tile.index; } );
                           _.chain(indexes)
                               .max()
                               .range()
                               .difference( indexes )
                               .each( function( index ) {
                                   tiles_tree.push( { index: index,
                                                      couleur: CASES[ index % CASES.length ].couleur + '-moins' } );
                               } );

                           return tiles_tree;
                       };

                       var go_to_root_tile = {
                           index: 0,
                           taxonomy: 'back',
                           libelle: '↰ Retour',
                           description: 'Retour',
                           couleur: 'gris3',
                           action: function() {
                               $scope.tree = $scope.apps;
                               $scope.parent = null;
                           }
                       };

                       var tool_tile = function( node ) {
                           var go_to_parent_tile = function( parent ) {
                               var back_to_parent = angular.copy( go_to_root_tile );
                               back_to_parent.action = parent.action;

                               return back_to_parent;
                           };

                           var default_filter = function() {
                               return function( tile ) {
                                   return true;
                               };
                           };

                           var app_specific = {
                               CCNUM: { action: function() {
                                   if ( $scope.modification ) { return; }
                                   $scope.tree = { configurable: false,
                                                   filter: default_filter,
                                                   laius_template: 'views/laius_CCNUM.html',
                                                   tiles: Utils.pad_tiles_tree( [ go_to_root_tile ]
                                                                                .concat( CCN.query()
                                                                                         .map( function( ccn, index ) {
                                                                                             ccn.taxonomy = 'ccn';
                                                                                             ccn.index = index + 1;

                                                                                             if ( _(ccn).has('leaves') ) {
                                                                                                 ccn.action = function() {
                                                                                                     $scope.tree = { configurable: false,
                                                                                                                     filter: default_filter,
                                                                                                                     laius_template: 'views/laius_CCNUM_archives.html',
                                                                                                                     tiles: [ go_to_parent_tile( node ) ].concat( ccn.leaves.map( function( ccn, index ) {
                                                                                                                         ccn.taxonomy = 'ccn';
                                                                                                                         ccn.index = index + 1;

                                                                                                                         return ccn;
                                                                                                                     } ) ) };
                                                                                                     $scope.parent = ccn;
                                                                                                 };
                                                                                             }
                                                                                             return ccn;
                                                                                         } ) ) ) };
                                   $scope.parent = node;
                               }
                                      },
                               GAR: { action: function() {
                                   if ( $scope.modification ) { return; }
                                   currentUser.ressources().then( function ( response ) {
                                       $scope.tree = { configurable: false,
                                                       filter: default_filter,
                                                       laius_template: 'views/laius_RN.html',
                                                       tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( rn, index ) {
                                                           rn.taxonomy = 'rn';
                                                           rn.index = index + 1;
                                                           rn.icon = '/app/node_modules/laclasse-common-client/images/' + rn.icon;
                                                           rn.couleur = CASES[ index % 16 ].couleur;
                                                           rn.action = function() { Utils.log_and_open_link( 'GAR', rn.url ); };

                                                           return rn;
                                                       } ) ) ) };
                                       $scope.parent = node;
                                   } );
                               }
                                    },
                               TROMBI: { action: function() {
                                   if ( $scope.modification ) { return; }
                                   $scope.filter_criteria = { show_classes: true,
                                                              show_groupes_eleves: true,
                                                              text: '' };

                                   currentUser.regroupements().then( function ( response ) {
                                       $scope.tree = { configurable: false,
                                                       filter: function() {
                                                           return function( tile ) {
                                                               return tile.taxonomy === 'back'
                                                                   || ( tile.taxonomy !== 'regroupement'
                                                                        || ( _($scope.filter_criteria).has('show_classes') && $scope.filter_criteria.show_classes && tile.type === 'classe' )
                                                                        || ( _($scope.filter_criteria).has('show_groupes_eleves') && $scope.filter_criteria.show_groupes_eleves && tile.type === 'groupe_eleves' ) )
                                                                   && ( !_(tile).has('libelle')
                                                                        || _($scope.filter_criteria.text).isEmpty()
                                                                        || tile.libelle.toUpperCase().includes( $scope.filter_criteria.text.toUpperCase() ) );
                                                           };
                                                       },
                                                       laius_template: 'views/laius_TROMBI_regroupements.html',
                                                       tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( regroupement, index ) {
                                                           regroupement.taxonomy = 'regroupement';
                                                           regroupement.index = index + 1;
                                                           regroupement.couleur = regroupement.type === 'classe' ? 'vert' : 'bleu';
                                                           regroupement.couleur += index % 2 == 0 ? '' : '-moins';
                                                           regroupement.action = function() {
                                                               $scope.filter_criteria.text = '';

                                                               currentUser.eleves_regroupement( regroupement.id )
                                                                   .then( function( response ) {
                                                                       $scope.tree = { configurable: false,
                                                                                       filter: function() {
                                                                                           return function( tile ) {
                                                                                               return tile.taxonomy !== 'eleve'
                                                                                                   || _($scope.filter_criteria.text).isEmpty()
                                                                                                   || tile.nom.toUpperCase().includes( $scope.filter_criteria.text.toUpperCase() )
                                                                                                   || tile.prenom.toUpperCase().includes( $scope.filter_criteria.text.toUpperCase() );
                                                                                           };
                                                                                       },
                                                                                       laius_template: 'views/laius_TROMBI_people.html',
                                                                                       tiles: Utils.pad_tiles_tree( [ go_to_parent_tile( node ) ].concat( response.map( function( eleve, index ) {
                                                                                           eleve.taxonomy = 'eleve';
                                                                                           eleve.index = index + 1;
                                                                                           eleve.couleur = 'jaune';
                                                                                           eleve.couleur += index % 2 == 0 ? '' : '-moins';

                                                                                           return eleve;
                                                                                       } ) ) ) };
                                                                       $scope.parent = node;
                                                                   } );
                                                           };

                                                           return regroupement;
                                                       } ) ) ) };
                                       $scope.parent = node;
                                   } );
                               }
                                       }
                           };

                           node.configure = false;
                           node.toggle_configure = function() {
                               $scope.tree.tiles.forEach( function( tile ) {
                                   tile.configure = tile.index === node.index;
                               } );
                           };

                           node.dirty = {};
                           node.is_dirty = function( field ) {
                               node.dirty[ field ] = true;
                           };

                           node.to_delete = false;
                           node.remove = function() {
                               node.to_delete = !node.to_delete;
                               node.dirty = node.dirty || node.to_delete;
                               node.configure = false;
                           };

                           if ( !_(app_specific[node.application_id]).isUndefined() && _(app_specific[ node.application_id ]).has('action') ) {
                               node.action = app_specific[ node.application_id ].action;
                           } else {
                               node.action = function() {
                                   if ( $scope.modification ) { return; }
                                   if ( !_(node.application_id).isNull() ) {
                                       $state.go( 'app.external', { app: node.application_id } );
                                   } else {
                                       Utils.log_and_open_link( node.application_id == 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url );
                                   }
                               };
                           }

                           return node;
                       };

                       var retrieve_tiles_tree = function() {
                           currentUser.apps().then( function( response ) {
                               response.forEach( function( app ) { app.taxonomy = 'app'; } );

                               $scope.inactive_apps = _(response).where({ active: false });

                               var apps = _(response)
                                   .where({ active: true })
                                   .map( tool_tile );
                               apps = fill_empty_tiles( apps );
                               apps = _(apps).sortBy( function( tile ) { return tile.index; } );
                               apps = Utils.pad_tiles_tree( apps );

                               $scope.apps = { configurable: true,
                                               tiles: apps };

                               go_to_root_tile.action();
                           } );
                       };

                       // Edition
                       $scope.modification = false;
                       var sortable_callback = function( event ) {
                           _($scope.tree).each( function( tile, i ) {
                               tile.index = i;
                               tile.dirty.index = true;
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

                       $scope.add_tile = function() {
                           $uibModal.open( { templateUrl: 'views/popup_ajout_app.html',
                                             controller: 'PopupAjoutAppCtrl',
                                             resolve: { current_tiles: function () { return $scope.tree.tiles; },
                                                        inactive_tiles: function () { return $scope.inactive_apps; } } } )
                               .result.then( function( new_tiles ) {
                                   $q.all( _(new_tiles).map( function( new_tile ) {
                                       var recipient_index = _($scope.tree.tiles).findIndex( function( tile ) { return !_(tile).has('taxonomy'); } );

                                       if ( recipient_index === -1 ) {
                                           recipient_index = $scope.tree.tiles.length;
                                           $scope.tree.tiles.push( { index: recipient_index } );
                                       }

                                       $scope.tree.tiles[ recipient_index ] = tool_tile( new_tile );
                                       $scope.tree.tiles[ recipient_index ].index = recipient_index;
                                       $scope.tree.tiles[ recipient_index ].active = true;
                                       if ( !_(new_tile).has('id') ) {
                                           $scope.tree.tiles[ recipient_index ].to_create = true;
                                       }
                                   } ) );
                               } );
                       };

                       $scope.edit_tiles = function() {
                           $scope.modification = true;
                       };

                       $scope.exit_tiles_edition = function() {
                           $scope.modification = false;
                           retrieve_tiles_tree();
                       };

                       $scope.save_tiles_edition = function( should_save ) {
                           _.chain($scope.tree.tiles)
                               .select( function( tile ) {
                                   return _(tile).has('dirty') && !_(tile.dirty).isEmpty() && !_(tile).has('to_create');
                               } )
                               .each( function( tile ) {
                                   var updated_fields = { id: tile.id };
                                   _.chain(tile.dirty)
                                       .keys()
                                       .each( function( field ) {
                                           updated_fields[ field ] = tile[ field ];
                                       } );
                                   Apps.update( updated_fields );
                               } );

                           var promises = _.chain($scope.tree.tiles)
                               .where({ to_delete: true })
                               .map( function( tile ) {
                                   return Apps.delete({ id: tile.id }).$promise;
                               } );
                           promises.concat( _.chain($scope.tree.tiles)
                                            .where({ to_create: true })
                                            .map( function( tile ) {
                                                return Apps.save( tile ).$promise;
                                            } ) );
                           $q.all( promises ).then( function( response ) {
                               $scope.tree.tiles = fill_empty_tiles( _($scope.tree.tiles).reject( function( tile ) { return tile.to_delete; } ) );
                           } );

                           $scope.modification = false;
                           $scope.tree.tiles.forEach( function( tile ) {
                               if ( _(tile).has('configure') ) {
                                   tile.configure = false;
                               }
                           } );
                       };

                       // Action!
                       retrieve_tiles_tree();
                   } ] );
