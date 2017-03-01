'use strict';

angular.module( 'portailApp' )
    .controller( 'PortailCtrl',
                 [ '$scope', '$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Apps', 'current_user', 'APP_PATH',
                   function( $scope, $sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Apps, current_user, APP_PATH ) {
                       $scope.prefix = APP_PATH;
                       $scope.COULEURS = COULEURS;

                       $scope.tiles_templates = { app: 'views/tile_app.html',
                                                  back: 'views/tile_app.html',
                                                  regroupement: 'views/tile_regroupement.html',
                                                  eleve: 'views/tile_eleve.html',
                                                  rn: 'views/tile_rn.html',
                                                  ccn: 'views/tile_ccn.html' };
                       $scope.filter_criteria = {};

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
                                                   aside_template: 'views/aside_CCNUM.html',
                                                   tiles: Utils.pad_tiles_tree( [ go_to_root_tile ]
                                                                                .concat( CCN.query()
                                                                                         .map( function( ccn, index ) {
                                                                                             ccn.taxonomy = 'ccn';
                                                                                             ccn.index = index + 1;

                                                                                             if ( _(ccn).has('leaves') ) {
                                                                                                 ccn.action = function() {
                                                                                                     $scope.tree = { configurable: false,
                                                                                                                     filter: default_filter,
                                                                                                                     aside_template: 'views/aside_CCNUM_archives.html',
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
                                                       aside_template: 'views/aside_RN.html',
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
                                                                        || ( _($scope.filter_criteria).has('show_groupes_eleves') && $scope.filter_criteria.show_groupes_eleves && tile.type === 'groupe_eleve' ) )
                                                                   && ( !_(tile).has('libelle')
                                                                        || _($scope.filter_criteria.text).isEmpty()
                                                                        || tile.libelle.toUpperCase().includes( $scope.filter_criteria.text.toUpperCase() ) );
                                                           };
                                                       },
                                                       aside_template: 'views/aside_TROMBI_regroupements.html',
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
                                                                                       aside_template: 'views/aside_TROMBI_people.html',
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
                                   tile.configure = tile.index === node.index ? !tile.configure : false;
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
                                   if ( !_(node.application_id).isNull() && node.application_id !== 'PRONOTE' ) {
                                       $state.go( 'app', { appid: node.application_id } );
                                   } else {
                                       Utils.log_and_open_link( node.application_id === 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url );
                                   }
                               };
                           }

                           return node;
                       };

                       var retrieve_tiles_tree = function() {
                           currentUser.apps().then( function( response ) {
                               if ( _(response).isEmpty() ) {
                                   Apps.query_defaults().$promise
                                       .then( function( response ) {
                                           $q.all( _.chain(response)
                                                   .where( { default: true } )
                                                   .map( function( tile ) {
                                                       tile.etab_code_uai = current_user.profil_actif.etablissement_code_uai;
                                                       return Apps.save( tile ).$promise;
                                                   } ) )
                                               .then( retrieve_tiles_tree );
                                       } );
                               } else {
                                   response.forEach( function( app ) { app.taxonomy = 'app'; } );

                                   $scope.inactive_tiles = _(response).where({ active: false });

                                   var apps = _(response)
                                       .select( function( app ) {
                                           var now = moment();
                                           var is_it_summer = now.month() > 7 && now.month() < 9;

                                           return app.active
                                               && ( !is_it_summer || app.summer )
                                               && ( !current_user.profils || !current_user.profil_actif || ( current_user.profil_actif.admin || !_(app.hidden).includes( current_user.profil_actif.profil_id ) ) )
                                               && ( app.application_id === 'MAIL' ? _.chain(current_user.emails).pluck( 'type' ).includes( 'Ent' ).value() : true );
                                       } )
                                       .map( tool_tile );

                                   apps = Utils.fill_empty_tiles( apps );
                                   apps = _(apps).sortBy( function( tile ) { return tile.index; } );
                                   apps = Utils.pad_tiles_tree( apps );

                                   $scope.apps = { configurable: true,
                                                   aside_template: 'views/aside_news.html',
                                                   tiles: apps };

                                   go_to_root_tile.action();
                               }
                           } );
                       };

                       // Edition
                       $scope.modification = false;
                       var sortable_callback = function( event ) {
                           _($scope.tree.tiles).each( function( tile, i ) {
                               tile.index = i;
                               if ( !_(tile).has('dirty') ) {
                                   tile.dirty = {};
                               }
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

                       $scope.add_tile = function( tiles, inactive_tiles ) {
                           $uibModal.open( { templateUrl: 'views/popup_ajout_app.html',
                                             controller: 'PopupAjoutAppCtrl',
                                             resolve: { current_tiles: function() { return tiles; },
                                                        inactive_tiles: function() { return inactive_tiles; } } } )
                               .result.then( function success( new_tiles ) {
                                   $q.all( _(new_tiles).map( function( new_tile ) {
                                       var recipient_index = _(tiles).findIndex( function( tile ) { return !_(tile).has('taxonomy'); } );

                                       if ( recipient_index === -1 ) {
                                           recipient_index = tiles.length;
                                           tiles.push( { index: recipient_index } );
                                       }

                                       tiles[ recipient_index ] = tool_tile( new_tile );
                                       tiles[ recipient_index ].index = recipient_index;
                                       tiles[ recipient_index ].active = true;
                                       if ( !_(new_tile).has('id') ) {
                                           tiles[ recipient_index ].to_create = true;
                                       }
                                   } ) );
                               }, function error() {  } );
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
                                   return _(tile).has('id') && _(tile).has('dirty') && !_(tile.dirty).isEmpty() && !_(tile).has('to_create');
                               } )
                               .each( function( tile ) {
                                   switch( tile.taxonomy ) {
                                   case 'app':
                                       var updated_fields = { id: tile.id };
                                       _.chain(tile.dirty)
                                           .keys()
                                           .each( function( field ) {
                                               updated_fields[ field ] = tile[ field ];
                                           } );
                                       Apps.update( updated_fields );
                                       break;
                                   case 'rn':
                                       console.log(tile)
                                       break;
                                   default:
                                       console.log(tile)
                                   }
                               } );

                           var promises = _.chain($scope.tree.tiles)
                               .where({ to_delete: true })
                               .map( function( tile ) {
                                   switch( tile.taxonomy ) {
                                   case 'app':
                                       return Apps.delete({ id: tile.id }).$promise;
                                   case 'rn':
                                       console.log(tile)
                                       return null;
                                   default:
                                       console.log(tile)
                                       return null;
                                   }
                               } );

                           promises.concat( _.chain($scope.tree.tiles)
                                            .where({ to_create: true })
                                            .map( function( tile ) {
                                                switch( tile.taxonomy ) {
                                                case 'app':
                                                    tile.etab_code_uai = current_user.profil_actif.etablissement_code_uai;

                                                    return Apps.save( tile ).$promise;
                                                case 'rn':
                                                    console.log(tile)
                                                    return null;
                                                default:
                                                    console.log(tile)
                                                    return null;
                                                }
                                            } ) );

                           $q.all( promises ).then( function( response ) {
                               $scope.tree.tiles = Utils.fill_empty_tiles( _($scope.tree.tiles).reject( function( tile ) { return tile.to_delete; } ) );
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
