'use strict';

angular.module( 'portailApp' )
    .component( 'portail',
                { controller: [ '$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Tiles', 'APP_PATH', 'CACHE_BUSTER', 'User', 'Annuaire', 'URL_ENT', 'Popups',
                                function( $sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Tiles, APP_PATH, CACHE_BUSTER, User, Annuaire, URL_ENT, Popups ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        currentUser.get( true )
                                            .then( function( user ) {
                                                ctrl.user = user;

                                                ctrl.prefix = APP_PATH;
                                                ctrl.COULEURS = COULEURS;
                                                ctrl.CACHE_BUSTER = CACHE_BUSTER;

                                                ctrl.get_tile_template = function( taxonomy ) {
                                                    var tiles_templates = { app: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                                                                            back: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                                                                            regroupement: 'app/views/tile_regroupement.html?v=' + CACHE_BUSTER,
                                                                            eleve: 'app/views/tile_eleve.html?v=' + CACHE_BUSTER,
                                                                            rn: 'app/views/tile_rn.html?v=' + CACHE_BUSTER,
                                                                            ccn: 'app/views/tile_ccn.html?v=' + CACHE_BUSTER };

                                                    return tiles_templates[ taxonomy ];
                                                };

                                                ctrl.filter_criteria = {};

                                                var go_to_root_tile = { index: 0,
                                                                        taxonomy: 'back',
                                                                        name: '← Retour',
                                                                        description: 'Retour',
                                                                        color: 'gris3',
                                                                        action: function() {
                                                                            ctrl.tree = ctrl.tiles;
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
                                                                          aside_template: 'app/views/aside_CCNUM.html?v=' + CACHE_BUSTER,
                                                                          tiles: Utils.pad_tiles_tree( [ go_to_root_tile ]
                                                                                                       .concat( CCN.query()
                                                                                                                .map( function( ccn, index ) {
                                                                                                                    ccn.taxonomy = 'ccn';
                                                                                                                    ccn.index = index + 1;

                                                                                                                    if ( _(ccn).has('leaves') ) {
                                                                                                                        ccn.action = function() {
                                                                                                                            ctrl.tree = { configurable: false,
                                                                                                                                          filter: default_filter,
                                                                                                                                          aside_template: 'app/views/aside_CCNUM_archives.html?v=' + CACHE_BUSTER,
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
                                                                              aside_template: 'app/views/aside_RN.html?v=' + CACHE_BUSTER,
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
                                                             }  ,
                                                        TROMBI: { action: function() {
                                                            if ( ctrl.modification ) { return; }
                                                            ctrl.filter_criteria = { show_classes: true,
                                                                                     show_groupes_eleves: true,
                                                                                     show_groupes_libres: true,
                                                                                     text: '' };
                                                            ctrl.get_structure = function( structure_id ) {
                                                                return Annuaire.get_structure( structure_id )
                                                                    .then( function( response ) {
                                                                        return response.data;
                                                                    } );
                                                            };

                                                            currentUser.groups().then( function ( response ) {
                                                                ctrl.tree = { configurable: false,
                                                                              filter: function() {
                                                                                  return function( tile ) {
                                                                                      return tile.taxonomy === 'back'
                                                                                          || ( tile.taxonomy !== 'regroupement'
                                                                                               || ( _(ctrl.filter_criteria).has('show_classes') && ctrl.filter_criteria.show_classes && tile.type === 'CLS' )
                                                                                               || ( _(ctrl.filter_criteria).has('show_groupes_eleves') && ctrl.filter_criteria.show_groupes_eleves && tile.type === 'GRP' )
                                                                                               || ( _(ctrl.filter_criteria).has('show_groupes_libres') && ctrl.filter_criteria.show_groupes_libres && tile.type === 'GPL' ) )
                                                                                          && ( ( !_(tile).has('name')
                                                                                                 || _(ctrl.filter_criteria.text).isEmpty()
                                                                                                 || tile.name.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() ) )
                                                                                               || ( !_(tile).has('structure')
                                                                                                    || _(ctrl.filter_criteria.text).isEmpty()
                                                                                                    || tile.structure.name.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() ) ) );
                                                                                  };
                                                                              },
                                                                              aside_template: 'app/views/aside_TROMBI_regroupements.html?v=' + CACHE_BUSTER,
                                                                              tiles: Utils.pad_tiles_tree( [ go_to_root_tile ].concat( response.map( function( regroupement, index ) {
                                                                                  regroupement.taxonomy = 'regroupement';
                                                                                  regroupement.index = index + 1;
                                                                                  switch( regroupement.type ) {
                                                                                  case 'CLS':
                                                                                      regroupement.color = 'vert';
                                                                                      break;
                                                                                  case 'GRP':
                                                                                      regroupement.color = 'bleu';
                                                                                      break;
                                                                                  default:
                                                                                      regroupement.color = 'jaune';
                                                                                  }
                                                                                  regroupement.color += index % 2 === 0 ? '' : '-moins';
                                                                                  regroupement.action = function() { // TODO: based on group.users
                                                                                      ctrl.filter_criteria.text = '';

                                                                                      Annuaire.get_users( _(regroupement.users).pluck( 'user_id' ) )
                                                                                          .then( function( response ) {
                                                                                              ctrl.tree = { configurable: false,
                                                                                                            filter: function() {
                                                                                                                return function( tile ) {
                                                                                                                    return tile.taxonomy !== 'eleve'
                                                                                                                        || _(ctrl.filter_criteria.text).isEmpty()
                                                                                                                        || tile.lastname.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() )
                                                                                                                        || tile.firstname.toUpperCase().includes( ctrl.filter_criteria.text.toUpperCase() );
                                                                                                                };
                                                                                                            },
                                                                                                            aside_template: 'app/views/aside_TROMBI_people.html?v=' + CACHE_BUSTER,
                                                                                                            tiles: Utils.pad_tiles_tree( [ go_to_parent_tile( node ) ].concat( response.data.map( function( eleve, index ) {
                                                                                                                eleve.taxonomy = 'eleve';
                                                                                                                eleve.index = index + 1;
                                                                                                                eleve.color = 'jaune';
                                                                                                                eleve.color += index % 2 === 0 ? '' : '-moins';
                                                                                                                eleve.avatar = ( _(eleve.avatar.match(/^(user|http)/)).isNull() ? URL_ENT  + '/': '' ) + eleve.avatar;

                                                                                                                return eleve;
                                                                                                            } ) ) ) };
                                                                                              ctrl.parent = node;
                                                                                          } );
                                                                                  };

                                                                                  return regroupement;
                                                                              } ) ) ) };
                                                                ctrl.parent = node;
                                                            } );
                                                        }
                                                                }
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
                                                            if ( node.type !== 'EXTERNAL' && !_(node.application_id).isNull() && node.application_id !== 'PRONOTE' ) {
                                                                $state.go( 'app', { appid: node.application_id } );
                                                            } else {
                                                                Utils.log_and_open_link( node.application_id === 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url );
                                                            }
                                                        };
                                                    }

                                                    return node;
                                                };

                                                var retrieve_tiles_tree = function() {
                                                    currentUser.tiles()
                                                        .then( function( response ) {
                                                            response.forEach( function( app ) { app.taxonomy = 'app'; } );

                                                            var tiles = _(response)
                                                                .select( function( app ) {
                                                                    var now = moment();
                                                                    var is_it_summer = now.month() == 7;

                                                                    return ( !is_it_summer
                                                                             || ( app.summer
                                                                                  || ( !_(ctrl.user.profiles).isEmpty()
                                                                                       && !_(['ELV', 'TUT']).includes( ctrl.user.active_profile().type ) ) ) )
                                                                        && ( !ctrl.user.profiles || !ctrl.user.active_profile() || ( ctrl.user.is_admin() || !_(app.hidden).includes( ctrl.user.active_profile().type ) ) )
                                                                        && ( app.application_id === 'MAIL' ? _.chain(ctrl.user.emails).pluck( 'type' ).includes( 'Ent' ).value() : true );
                                                                } )
                                                                .map( tool_tile );

                                                            tiles = Utils.fill_empty_tiles( tiles );
                                                            tiles = _(tiles).sortBy( function( tile ) { return tile.index; } );
                                                            tiles = Utils.pad_tiles_tree( tiles );

                                                            ctrl.tiles = { configurable: true,
                                                                           aside_template: 'app/views/aside_news.html?v=' + CACHE_BUSTER,
                                                                           tiles: tiles };

                                                            go_to_root_tile.action();
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
                                                    Popups.add_tiles( tiles,
                                                                      function success( new_tiles ) {
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
                                                                     .where({ to_delete: true })
                                                                     .map( function( tile ) {
                                                                         switch( tile.taxonomy ) {
                                                                         case 'app':
                                                                             return Tiles.delete({ id: tile.id }).$promise;
                                                                         case 'rn':
                                                                         default:
                                                                             console.log(tile)
                                                                             return null;
                                                                         }
                                                                     } ) );

                                                    promises.concat( _.chain(ctrl.tree.tiles)
                                                                     .select( function( tile ) {
                                                                         return _(tile).has('id')
                                                                             && !_(tile).has('to_create')
                                                                             && _(tile).has('dirty')
                                                                             && !_(tile.dirty).isEmpty();
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
                                                                             return Tiles.update( { id: tile.id }, updated_fields );
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
                                                                             tile.structure_id = ctrl.user.active_profile().structure_id;
                                                                             return Tiles.save( {}, tile ).$promise;
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
                                    };
                                } ],
                  template: `
<div class="row portail"
     ng:if="$ctrl.user">
    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 aside">
        <help-icon class="btn-group hidden-xs help-icon"
                   user="$ctrl.user"></help-icon>

        <logo class="col-xs-1 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4"
              user="$ctrl.user"></logo>

        <user-tile user="$ctrl.user"></user-tile>

        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 hidden-xs hidden-sm aside-bottom"
             ng:include="$ctrl.user.edit_profile ? 'app/views/aside_news.html?v=' + $ctrl.CACHE_BUSTER : $ctrl.tree.aside_template"></div>
    </div>

    <div class="col-xs-12 col-sm-12 col-md-8 col-lg-8">
        <div class="row user-profil"
             ng:if="$ctrl.user.edit_profile">
            <user-profile user="$ctrl.user"></user-profile>
        </div>

        <div class="row damier gris4"
             ng:class="{'modification': $ctrl.modification}"
             ng:if="!$ctrl.user.edit_profile">

            <ul data-as-sortable="$ctrl.sortable_options"
                data-is-disabled="!$ctrl.modification"
                ng:model="$ctrl.tree.tiles">

                <li ng:repeat="tile in $ctrl.tree.tiles | filter:$ctrl.tree.filter() | orderBy:'index'"
                    class="col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case animate scale-fade-in {{tile.color}}"
                    data-as-sortable-item
                    ng:class="{ 'empty hidden-xs': !tile.taxonomy }">
                    <div ng:include="$ctrl.get_tile_template( tile.taxonomy )"></div>
                </li>
            </ul>

            <!-- Mode normal -->
            <span class="hidden-xs hidden-sm floating-button toggle big off blanc"
                  ng:if="$ctrl.tree.configurable && $ctrl.user.is_admin() && !$ctrl.modification"
                  ng:click="$ctrl.edit_tiles()"></span>

            <!-- Mode modification -->
            <span class="hidden-xs hidden-sm floating-button toggle big on gris4"
                  ng:if="$ctrl.modification"></span>
            <span class="floating-button small cancel gris3"
                  ng:if="$ctrl.modification"
                  ng:click="$ctrl.exit_tiles_edition()"></span>
            <span class="floating-button small save gris1"
                  ng:if="$ctrl.modification"
                  ng:click="$ctrl.save_tiles_edition()"></span>

            <span class="floating-button small action1 add-app gris1"
                  ng:if="$ctrl.modification"
                  ng:click="$ctrl.add_tile( $ctrl.tree.tiles )"></span>
        </div>

    </div>
</div>
`
                } );
