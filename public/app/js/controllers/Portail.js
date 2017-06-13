'use strict';

angular.module( 'portailApp' )
    .controller( 'PortailCtrl',
                 [ '$scope', '$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Apps', 'APP_PATH', 'User',
                   function( $scope, $sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Apps, APP_PATH, User ) {
                       var ctrl = $scope;

                       currentUser.get().then( function( user ) {
                           ctrl.current_user = user;

                           ctrl.prefix = APP_PATH;
                           ctrl.COULEURS = COULEURS;

                           ctrl.tiles_templates = { app: 'app/views/tile_app.html',
                                                    back: 'app/views/tile_app.html',
                                                    regroupement: 'app/views/tile_regroupement.html',
                                                    eleve: 'app/views/tile_eleve.html',
                                                    rn: 'app/views/tile_rn.html',
                                                    ccn: 'app/views/tile_ccn.html' };
                           ctrl.filter_criteria = {};

                           var go_to_root_tile = { index: 0,
                                                   taxonomy: 'back',
                                                   name: '↰ Retour',
                                                   description: 'Retour',
                                                   color: 'gris3',
                                                   action: function() {
                                                       ctrl.tree = ctrl.apps;
                                                       ctrl.parent = null;
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
                                       if ( ctrl.modification ) { return; }
                                       ctrl.tree = { configurable: false,
                                                     filter: default_filter,
                                                     aside_template: 'app/views/aside_CCNUM.html',
                                                     tiles: Utils.pad_tiles_tree( [ go_to_root_tile ]
                                                                                  .concat( CCN.query()
                                                                                           .map( function( ccn, index ) {
                                                                                               ccn.taxonomy = 'ccn';
                                                                                               ccn.index = index + 1;

                                                                                               if ( _(ccn).has('leaves') ) {
                                                                                                   ccn.action = function() {
                                                                                                       ctrl.tree = { configurable: false,
                                                                                                                     filter: default_filter,
                                                                                                                     aside_template: 'app/views/aside_CCNUM_archives.html',
                                                                                                                     tiles: [ go_to_parent_tile( node ) ].concat( ccn.leaves.map( function( ccn, index ) {
                                                                                                                         ccn.taxonomy = 'ccn';
                                                                                                                         ccn.index = index + 1;

                                                                                                                         return ccn;
                                                                                                                     } ) ) };
                                                                                                       ctrl.parent = ccn;
                                                                                                   };
                                                                                               }
                                                                                               return ccn;
                                                                                           } ) ) ) };
                                       ctrl.parent = node;
                                   }
                                          },
                                   GAR: { action: function() {
                                       if ( ctrl.modification ) { return; }
                                       currentUser.ressources().then( function ( response ) {
                                           ctrl.tree = { configurable: false,
                                                         filter: default_filter,
                                                         aside_template: 'app/views/aside_RN.html',
                                                         tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( rn, index ) {
                                                             rn.taxonomy = 'rn';
                                                             rn.index = index + 1;
                                                             rn.icon = APP_PATH + '/app/node_modules/laclasse-common-client/images/' + ( rn.type === 'MANUEL' ? '05_validationcompetences.svg' : ( rn.type === 'AUTRE' ? '07_blogs.svg' : '08_ressources.svg' ) );
                                                             rn.color = CASES[ index % 16 ].color;
                                                             rn.action = function() { Utils.log_and_open_link( 'GAR', rn.url ); };

                                                             return rn;
                                                         } ) ) ) };
                                           ctrl.parent = node;
                                       } );
                                   }
                                        }  // ,
                                   // TROMBI: { action: function() {
                                   //     if ( ctrl.modification ) { return; }
                                   //     ctrl.filter_criteria = { show_classes: true,
                                   //                                show_groupes_eleves: true,
                                   //                                text: '' };

                                   //     currentUser.regroupements().then( function ( response ) {
                                   //         ctrl.tree = { configurable: false,
                                   //                         filter: function() {
                                   //                             return function( tile ) {
                                   //                                 return tile.taxonomy === 'back'
                                   //                                     || ( tile.taxonomy !== 'regroupement'
                                   //                                          || ( _(ctrl.filter_criteria).has('show_classes') && ctrl.filter_criteria.show_classes && tile.type === 'classe' )
                                   //                                          || ( _(ctrl.filter_criteria).has('show_groupes_eleves') && ctrl.filter_criteria.show_groupes_eleves && tile.type === 'groupe_eleve' ) )
                                   //                                     && ( !_(tile).has('name')
                                   //                                          || _(ctrl.filter_criteria.text).isEmpty()
                                   //                                          || tile.name.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() ) );
                                   //                             };
                                   //                         },
                                   //                         aside_template: 'app/views/aside_TROMBI_regroupements.html',
                                   //                         tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( regroupement, index ) {
                                   //                             regroupement.taxonomy = 'regroupement';
                                   //                             regroupement.index = index + 1;
                                   //                             regroupement.color = regroupement.type === 'classe' ? 'vert' : 'bleu';
                                   //                             regroupement.color += index % 2 == 0 ? '' : '-moins';
                                   //                             regroupement.action = function() {
                                   //                                 ctrl.filter_criteria.text = '';

                                   //                                 currentUser.eleves_regroupement( regroupement.id )
                                   //                                     .then( function( response ) {
                                   //                                         ctrl.tree = { configurable: false,
                                   //                                                         filter: function() {
                                   //                                                             return function( tile ) {
                                   //                                                                 return tile.taxonomy !== 'eleve'
                                   //                                                                     || _(ctrl.filter_criteria.text).isEmpty()
                                   //                                                                     || tile.nom.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() )
                                   //                                                                     || tile.prenom.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() );
                                   //                                                             };
                                   //                                                         },
                                   //                                                         aside_template: 'app/views/aside_TROMBI_people.html',
                                   //                                                         tiles: Utils.pad_tiles_tree( [ go_to_parent_tile( node ) ].concat( response.map( function( eleve, index ) {
                                   //                                                             eleve.taxonomy = 'eleve';
                                   //                                                             eleve.index = index + 1;
                                   //                                                             eleve.color = 'jaune';
                                   //                                                             eleve.color += index % 2 == 0 ? '' : '-moins';

                                   //                                                             return eleve;
                                   //                                                         } ) ) ) };
                                   //                                         ctrl.parent = node;
                                   //                                     } );
                                   //                             };

                                   //                             return regroupement;
                                   //                         } ) ) ) };
                                   //         ctrl.parent = node;
                                   //     } );
                                   // }
                                   //         }
                               };

                               node.configure = false;
                               node.toggle_configure = function() {
                                   ctrl.tree.tiles.forEach( function( tile ) {
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
                                       if ( ctrl.modification ) { return; }
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
                                                           tile.structure_id = ctrl.current_user.active_profile().structure_id;
                                                           return Apps.save( tile ).$promise;
                                                       } ) )
                                                   .then( retrieve_tiles_tree );
                                           } );
                                   } else {
                                       response.forEach( function( app ) { app.taxonomy = 'app'; } );

                                       var apps = _(response)
                                           .select( function( app ) {
                                               var now = moment();
                                               var is_it_summer = now.month() > 7 && now.month() < 9;

                                               return ( !is_it_summer || app.summer )
                                                   && ( !ctrl.current_user.profiles || !ctrl.current_user.active_profile() || ( ctrl.current_user.is_admin() || !_(app.hidden).includes( ctrl.current_user.active_profile().type ) ) )
                                                   && ( app.application_id === 'MAIL' ? _.chain(ctrl.current_user.emails).pluck( 'type' ).includes( 'Ent' ).value() : true );
                                           } )
                                           .map( tool_tile );

                                       apps = Utils.fill_empty_tiles( apps );
                                       apps = _(apps).sortBy( function( tile ) { return tile.index; } );
                                       apps = Utils.pad_tiles_tree( apps );

                                       ctrl.apps = { configurable: true,
                                                     aside_template: 'app/views/aside_news.html',
                                                     tiles: apps };

                                       go_to_root_tile.action();
                                   }
                               } );
                           };

                           // Edition
                           ctrl.modification = false;

                           ctrl.edit_tiles = function() {
                               ctrl.modification = true;
                           };

                           ctrl.exit_tiles_edition = function() {
                               ctrl.modification = false;
                               retrieve_tiles_tree();
                           };

                           var sortable_callback = function( event ) {
                               _(ctrl.tree.tiles).each( function( tile, i ) {
                                   tile.index = i;
                                   if ( !_(tile).has('dirty') ) {
                                       tile.dirty = {};
                                   }
                                   tile.dirty.index = true;
                               } );
                           };
                           ctrl.sortable_options = { accept: function( sourceItemHandleScope, destSortableScope ) { return true; },
                                                     longTouch: true,
                                                     itemMoved: sortable_callback,
                                                     orderChanged: sortable_callback,
                                                     containment: '.damier',
                                                     containerPositioning: 'relative',
                                                     additionalPlaceholderClass: 'col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case',
                                                     clone: false,
                                                     allowDuplicates: false };

                           ctrl.add_tile = function( tiles ) {
                               $uibModal.open( { templateUrl: 'app/views/popup_ajout_app.html',
                                                 controller: 'PopupAjoutAppCtrl',
                                                 resolve: { current_tiles: function() { return tiles; } } } )
                                   .result.then( function success( new_tiles ) {
                                       $q.all( _(new_tiles).map( function( new_tile ) {
                                           var recipient_index = _(tiles).findIndex( function( tile ) { return !_(tile).has('taxonomy'); } );

                                           if ( recipient_index === -1 ) {
                                               recipient_index = tiles.length;
                                               tiles.push( { index: recipient_index } );
                                           }

                                           tiles[ recipient_index ] = tool_tile( new_tile );
                                           tiles[ recipient_index ].index = recipient_index;
                                           if ( !_(new_tile).has('id') ) {
                                               tiles[ recipient_index ].to_create = true;
                                           }
                                       } ) );
                                   }, function error() {  } );
                           };

                           ctrl.save_tiles_edition = function( should_save ) {
                               var promises = [];
                               promises.concat( _.chain(ctrl.tree.tiles)
                                                .select( function( tile ) {
                                                    return _(tile).has('id') && !_(tile).has('to_create') && _(tile).has('dirty') && !_(tile.dirty).isEmpty();
                                                } )
                                                .map( function( tile ) {
                                                    switch( tile.taxonomy ) {
                                                    case 'app':
                                                        var updated_fields = {};
                                                        _.chain(tile.dirty)
                                                            .keys()
                                                            .each( function( field ) {
                                                                updated_fields[ field ] = tile[ field ];
                                                            } );
                                                        return Apps.update( { id: tile.id }, updated_fields );
                                                        break;
                                                    case 'rn':
                                                    default:
                                                        console.log(tile)
                                                        return null;
                                                    }
                                                } ) );

                               promises.concat( _.chain(ctrl.tree.tiles)
                                                .where({ to_delete: true })
                                                .map( function( tile ) {
                                                    switch( tile.taxonomy ) {
                                                    case 'app':
                                                        return Apps.delete({ id: tile.id }).$promise;
                                                    case 'rn':
                                                    default:
                                                        console.log(tile)
                                                        return null;
                                                    }
                                                } ) );

                               promises.concat( _.chain(ctrl.tree.tiles)
                                                .where({ to_create: true })
                                                .map( function( tile ) {
                                                    switch( tile.taxonomy ) {
                                                    case 'app':
                                                        tile.structure_id = ctrl.current_user.active_profile().structure_id;

                                                        return Apps.save( {}, tile ).$promise;
                                                    case 'rn':
                                                    default:
                                                        console.log(tile)
                                                        return null;
                                                    }
                                                } ) );

                               $q.all( promises ).then( function( response ) {
                                   ctrl.tree.tiles = Utils.fill_empty_tiles( _(ctrl.tree.tiles).reject( function( tile ) { return tile.to_delete; } ) );
                               } );

                               ctrl.modification = false;
                               ctrl.tree.tiles.forEach( function( tile ) {
                                   if ( _(tile).has('configure') ) {
                                       tile.configure = false;
                                   }
                               } );
                           };

                           // Action!
                           retrieve_tiles_tree();
                       } );
                   } ] );
