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

                           var app_specific_actions = {
                               CCNUM: function() {
                                   if ( $scope.modification ) { return; }
                                   $scope.tree = { configurable: false,
                                                   laius: $sce.trustAsHtml( '<p class="laius">Des collégiens qui jouent sur le web et sur scène avec des auteurs de théâtre et des écrivains, qui découvrent que design et développement durable peuvent s\'allier contre le gaspillage alimentaire, qui cartographient leur territoire grâce à la Big Data en compagnie d\'un philosophe, ou encore qui réalisent une enquête-expo sur la grande guerre avec les archives du Rhône, tout cela ce sont les Classes Culturelles Numériques de laclasse.com. 50 classes, du cm2 à la 3ème engagées dans 5 projets collaboratifs et innovants sur l\'ENT, à suivre en ligne toute l\'année, et lors des rencontres finales.</p><p class="laius">En partenariat avec <a href="http://www.ia69.ac-lyon.fr/" target="_blank">l\'Inspection Académique</a> et la DANE de <a href="http://www.ac-lyon.fr/" target="_blank">l\'Académie de Lyon</a>.</p><p class="laius">Inscriptions en mai : <a href="mailto:info@laclasse.com">info@laclasse.com</a></p>' ),
                                                   tiles: Utils.pad_tiles_tree( [ go_to_root_tile ]
                                                                                .concat( CCN.query()
                                                                                         .map( function( ccn, index ) {
                                                                                             ccn.taxonomy = 'ccn';
                                                                                             ccn.index = index + 1;

                                                                                             if ( _(ccn).has('leaves') ) {
                                                                                                 ccn.action = function() {
                                                                                                     $scope.tree = { configurable: false,
                                                                                                                     laius: $sce.trustAsHtml( '<p class="laius">Au fil des années, des projets pédagogiques, des résidences d\'artistes, de scientifiques, et d\'écrivains se sont déroulés dans tout le département du rhône, et parfois au delà, amenant plusieurs classes de différents établissements à travailler ensemble autour de l\'outil numérique.<br/>Retrouver et revisitez les travaux des classes sur ces projets, ici.<br/><br/></p>' ),
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
                               },
                               GAR: function() {
                                   if ( $scope.modification ) { return; }
                                   currentUser.ressources().then( function ( response ) {
                                       $scope.tree = { configurable: false,
                                                       laius: $sce.trustAsHtml( '<p class="laius">Retrouvez ici les ressources numériques que votre établissement a sélectionné pour vous. Ces ressources peuvent être des manuels scolaires en ligne, des dictionnaires, des sites proposant des ressources pour s\'entraîner, etc...</p><p class="laius">Si rien n\'est affiché dans cette page, c\'est que votre établissement n\'a ps encore activé les ressources numériques. Vous pouvez contacter un de vos administrateur de l\'ENT pour lui demander l\'activation de celles-ci.</p>' ),
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
                               },
                               TROMBI: function() {
                                   if ( $scope.modification ) { return; }
                                   currentUser.regroupements().then( function ( response ) {
                                       $scope.tree = { configurable: false,
                                                       tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( regroupement, index ) {
                                                           regroupement.taxonomy = 'regroupement';
                                                           regroupement.index = index + 1;
                                                           regroupement.couleur = regroupement.type === 'classe' ? 'vert' : 'bleu';
                                                           regroupement.couleur += index % 2 == 0 ? '' : '-moins';
                                                           regroupement.action = function() {
                                                               currentUser.eleves_regroupement( regroupement.id )
                                                                   .then( function( response ) {
                                                                       $scope.tree = { configurable: false,
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
                           };

                           node.configure = false;
                           node.toggle_configure = function() {
                               $scope.tree.forEach( function( tile ) {
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

                           if ( _(app_specific_actions[node.application_id]).isUndefined() ) {
                               node.action = function() {
                                   if ( $scope.modification ) { return; }
                                   if ( !_(node.application_id).isNull() ) {
                                       $state.go( 'app.external', { app: node.application_id } );
                                   } else {
                                       Utils.log_and_open_link( node.application_id == 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url );
                                   }
                               };
                           } else {
                               node.action = app_specific_actions[node.application_id];
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
                                       var recipient_index = _($scope.tree).findIndex( function( tile ) { return !_(tile).has('taxonomy'); } );

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
