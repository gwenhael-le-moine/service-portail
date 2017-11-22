'use strict';

angular.module('portailApp')
  .component('portail',
  {
    controller: ['$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Tiles', 'APP_PATH', 'CACHE_BUSTER', 'User', 'Annuaire', 'URL_ENT', 'Popups',
      function($sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Tiles, APP_PATH, CACHE_BUSTER, User, Annuaire, URL_ENT, Popups) {
        let ctrl = this;

        ctrl.$onInit = function() {
          currentUser.get(true)
            .then(function(user) {
              ctrl.user = user;

              ctrl.prefix = APP_PATH;
              ctrl.COULEURS = COULEURS;
              ctrl.CACHE_BUSTER = CACHE_BUSTER;

              ctrl.get_tile_template = function(taxonomy) {
                let tiles_templates = {
                  app: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                  back: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                  regroupement: 'app/views/tile_regroupement.html?v=' + CACHE_BUSTER,
                  eleve: 'app/views/tile_eleve.html?v=' + CACHE_BUSTER,
                  rn: 'app/views/tile_rn.html?v=' + CACHE_BUSTER,
                  ccn: 'app/views/tile_ccn.html?v=' + CACHE_BUSTER
                };

                return tiles_templates[taxonomy];
              };

              ctrl.filter_criteria = {};

              let go_to_root_tile = {
                index: 0,
                taxonomy: 'back',
                name: '← Retour',
                description: 'Retour',
                color: 'gris3',
                action: function() {
                  ctrl.tree = ctrl.tiles;
                  ctrl.parent = null;
                }
              };

              let save_unsaved_tiles = function() {
                return $q.all(_.chain(ctrl.tree.tiles)
                  .select(function(tile) { return _(tile).has('configure') && tile.configure; })
                  .map(function(tile) {
                    return Tiles.update(tile).$promise;
                  }));
              };

              let tool_tile = function(node) {
                let go_to_parent_tile = function(parent) {
                  let back_to_parent = angular.copy(go_to_root_tile);
                  back_to_parent.action = parent.action;

                  return back_to_parent;
                };

                let default_filter = function() {
                  return function(tile) {
                    return true;
                  };
                };

                let app_specific = {
                  MAIL: {
                    modify: function(node) {
                      currentUser.recent_mail()
                        .then(function(response) {
                          node.notifications = response.data;
                        });
                      return node;
                    }
                  },
                  CCNUM: {
                    action: function() {
                      if (ctrl.modification) { return; }
                      ctrl.tree = {
                        configurable: false,
                        filter: default_filter,
                        aside_template: 'app/views/aside_CCNUM.html?v=' + CACHE_BUSTER,
                        tiles: Utils.pad_tiles_tree([go_to_root_tile]
                          .concat(CCN.query()
                            .map(function(ccn, index) {
                              ccn.taxonomy = 'ccn';
                              ccn.index = index + 1;

                              if (_(ccn).has('leaves')) {
                                ccn.action = function() {
                                  ctrl.tree = {
                                    configurable: false,
                                    filter: default_filter,
                                    aside_template: 'app/views/aside_CCNUM_archives.html?v=' + CACHE_BUSTER,
                                    tiles: [go_to_parent_tile(node)].concat(ccn.leaves.map(function(ccn, index) {
                                      ccn.taxonomy = 'ccn';
                                      ccn.index = index + 1;

                                      return ccn;
                                    }))
                                  };
                                  ctrl.parent = ccn;
                                };
                              }
                              return ccn;
                            })))
                      };
                      ctrl.parent = node;
                    }
                  },
                  GAR: {
                    action: function() {
                      if (ctrl.modification) { return; }
                      currentUser.ressources().then(function(response) {
                        ctrl.tree = {
                          configurable: false,
                          filter: default_filter,
                          aside_template: 'app/views/aside_RN.html?v=' + CACHE_BUSTER,
                          tiles: Utils.pad_tiles_tree([go_to_root_tile].concat(response.map(function(rn, index) {
                            rn.taxonomy = 'rn';
                            rn.index = index + 1;
                            rn.icon = APP_PATH + '/app/node_modules/laclasse-common-client/images/' + (rn.type === 'MANUEL' ? '05_validationcompetences.svg' : (rn.type === 'AUTRE' ? '07_blogs.svg' : '08_ressources.svg'));
                            rn.color = CASES[index % 16].color;
                            rn.action = function() { Utils.log_and_open_link('GAR', rn.url); };

                            return rn;
                          })))
                        };
                        ctrl.parent = node;
                      });
                    }
                  },
                  TROMBI: {
                    action: function() {
                      if (ctrl.modification) { return; }
                      ctrl.filter_criteria = {
                        show_classes: true,
                        show_groupes_eleves: true,
                        show_groupes_libres: true,
                        text: ''
                      };
                      ctrl.get_structure = function(structure_id) {
                        return Annuaire.get_structure(structure_id)
                          .then(function(response) {
                            return response.data;
                          });
                      };

                      currentUser.groups().then(function(response) {
                        ctrl.tree = {
                          configurable: false,
                          filter: function() {
                            return function(tile) {
                              return tile.taxonomy === 'back'
                                || (tile.taxonomy !== 'regroupement'
                                  || (_(ctrl.filter_criteria).has('show_classes') && ctrl.filter_criteria.show_classes && tile.type === 'CLS')
                                  || (_(ctrl.filter_criteria).has('show_groupes_eleves') && ctrl.filter_criteria.show_groupes_eleves && tile.type === 'GRP')
                                  || (_(ctrl.filter_criteria).has('show_groupes_libres') && ctrl.filter_criteria.show_groupes_libres && tile.type === 'GPL'))
                                && ((!_(tile).has('name')
                                  || _(ctrl.filter_criteria.text).isEmpty()
                                  || tile.name.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase()))
                                  || (!_(tile).has('structure')
                                    || _(ctrl.filter_criteria.text).isEmpty()
                                    || tile.structure.name.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase())));
                            };
                          },
                          aside_template: 'app/views/aside_TROMBI_regroupements.html?v=' + CACHE_BUSTER,
                          tiles: Utils.pad_tiles_tree([go_to_root_tile].concat(response.map(function(regroupement, index) {
                            regroupement.taxonomy = 'regroupement';
                            regroupement.index = index + 1;
                            switch (regroupement.type) {
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

                              Annuaire.get_users(_(regroupement.users).pluck('user_id'))
                                .then(function(response) {
                                  ctrl.tree = {
                                    configurable: false,
                                    filter: function() {
                                      return function(tile) {
                                        return tile.taxonomy !== 'eleve'
                                          || _(ctrl.filter_criteria.text).isEmpty()
                                          || tile.lastname.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase())
                                          || tile.firstname.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase());
                                      };
                                    },
                                    aside_template: 'app/views/aside_TROMBI_people.html?v=' + CACHE_BUSTER,
                                    tiles: Utils.pad_tiles_tree([go_to_parent_tile(node)].concat(response.data.map(function(eleve, index) {
                                      eleve.taxonomy = 'eleve';
                                      eleve.index = index + 1;
                                      eleve.color = 'jaune';
                                      eleve.color += index % 2 === 0 ? '' : '-moins';
                                      eleve.avatar = (_(eleve.avatar.match(/^(user|http)/)).isNull() ? URL_ENT + '/' : '') + eleve.avatar;

                                      return eleve;
                                    })))
                                  };
                                  ctrl.parent = node;
                                });
                            };

                            return regroupement;
                          })))
                        };
                        ctrl.parent = node;
                      });
                    }
                  }
                };

                node.configure = false;
                node.toggle_configure = function() {
                  console.log('before')
                  console.log(node.configure)

                  save_unsaved_tiles();

                  console.log('after')
                  console.log(node.configure)

                  if (node.configure) {
                    console.log('setting .configure to false')
                    node.configure = false;
                  } else {
                    ctrl.tree.tiles.forEach(function(tile) {
                      tile.configure = tile === node ? !tile.configure : false;
                    });
                    console.log('setting .configure to true')
                    node.configure = true;
                  }

                  console.log('after bis')
                  console.log(node.configure)
                };

                node.update = function() {
                  Tiles.update(node);
                };

                node.remove = function() {
                  Tiles.delete(node).$promise.then(function(response) {
                    retrieve_tiles_tree();
                  });;
                };

                if (!_(app_specific[node.application_id]).isUndefined() && _(app_specific[node.application_id]).has('action')) {
                  node.action = app_specific[node.application_id].action;
                } else {
                  node.action = function() {
                    if (ctrl.modification) { return; }
                    if (node.type !== 'EXTERNAL' && !_(node.application_id).isNull() && node.application_id !== 'PRONOTE') {
                      $state.go('app', { appid: node.application_id });
                    } else {
                      Utils.log_and_open_link(node.application_id === 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url);
                    }
                  };
                }

                if (!_(app_specific[node.application_id]).isUndefined() && _(app_specific[node.application_id]).has('modify')) {
                  node = app_specific[node.application_id].modify(node);
                }

                return node;
              };

              let retrieve_tiles_tree = function() {
                currentUser.tiles()
                  .then(function(response) {
                    response.forEach(function(app) { app.taxonomy = 'app'; });

                    let tiles = _(response)
                      .select(function(app) {
                        let now = moment();
                        let is_it_summer = now.month() == 7;

                        return (!is_it_summer
                          || (app.summer
                            || (!_(ctrl.user.profiles).isEmpty()
                              && !_(['ELV', 'TUT']).includes(ctrl.user.active_profile().type))))
                          && (!ctrl.user.profiles || !ctrl.user.active_profile() || (ctrl.user.is_admin() || !_(app.hidden).includes(ctrl.user.active_profile().type)))
                          && (app.application_id === 'MAIL' ? _.chain(ctrl.user.emails).pluck('type').includes('Ent').value() : true);
                      })
                      .map(tool_tile);

                    tiles = Utils.fill_empty_tiles(tiles);
                    tiles = _(tiles).sortBy(function(tile) { return tile.index; });
                    tiles = Utils.pad_tiles_tree(tiles);

                    ctrl.tiles = {
                      configurable: true,
                      aside_template: 'app/views/aside_news.html?v=' + CACHE_BUSTER,
                      tiles: tiles
                    };

                    go_to_root_tile.action();
                  });
              };

              // Edition
              ctrl.modification = false;

              ctrl.edit_tiles = function() {
                ctrl.modification = true;
              };

              ctrl.exit_tiles_edition = function() {
                ctrl.modification = false;

                save_unsaved_tiles()
                  .then(function(responses) {
                    retrieve_tiles_tree();
                  });
              };

              ctrl.sortable_options = {
                accept: function(sourceItemHandleScope, destSortableScope) { return true; },
                longTouch: true,
                dragEnd: function(event) {
                  _(ctrl.tree.tiles).map(function(tile, i) {
                    if (_(tile).has('id')) {
                      tile.index = i;
                      tile.update();
                    }
                  });
                },
                containment: '.damier',
                containerPositioning: 'relative',
                additionalPlaceholderClass: 'col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case',
                clone: false,
                allowDuplicates: false
              };

              ctrl.add_tile = function(tiles) {
                Popups.add_tiles(tiles,
                  function success(new_tiles) {
                    let recipients_indexes = _.chain(tiles).reject(function(tile) { return _(tile).has('taxonomy'); }).pluck('index').sort().value();

                    _(new_tiles).each(function(new_tile) {
                      new_tile.structure_id = ctrl.user.active_profile().structure_id;

                      let index;
                      if (recipients_indexes.length < 1) {
                        index = tiles.length;
                        tiles.push({ index: index });
                      } else {
                        index = recipients_indexes.shift();
                      }

                      new_tile.index = index;

                      Tiles.save({}, new_tile).$promise.then(function(response) {
                        retrieve_tiles_tree();
                      });
                    });
                  }, function error() { });
              };

              // Action!
              retrieve_tiles_tree();
            });
        };
      }],
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

                                                              <li ng:repeat="tile in $ctrl.tree.tiles | filter:$ctrl.tree.filter()"
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
                                                                  ng:if="$ctrl.modification"
                                                                  ng:click="$ctrl.exit_tiles_edition()"></span>

                                                            <span class="floating-button small action1 add-app gris1"
                                                                  ng:if="$ctrl.modification"
                                                                  ng:click="$ctrl.add_tile( $ctrl.tree.tiles )"></span>
                                                          </div>

                                                        </div>
                                                      </div>
`
  });
