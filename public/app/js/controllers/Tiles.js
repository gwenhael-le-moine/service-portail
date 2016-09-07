'use strict';

angular.module( 'portailApp' )
    .controller( 'TilesCtrl',
                 [ '$scope', '$rootScope', '$uibModal', '$log', '$q', '$http', '$window', 'current_user', 'apps', 'Apps', 'APP_PATH', 'CASES', 'COULEURS', 'log',
                   function( $scope, $rootScope, $uibModal, $log, $q, $http, $window, current_user, apps, Apps, APP_PATH, CASES, COULEURS, log ) {
                       $scope.prefix = APP_PATH;
                       $scope.couleurs = COULEURS;
                       var apps_indexes_changed = false;
                       var sortable_callback = function( event ) {
                           apps_indexes_changed = true;
                           _($scope.cases).each( function( c, i ) {
                               c.index = i;
                           } );
                       };
                       $scope.sortable_options = {
                           accept: function( sourceItemHandleScope, destSortableScope ) {
                               return true;
                           },
                           longTouch: true,
                           itemMoved: sortable_callback,
                           orderChanged: sortable_callback,
                           containment: '.damier',
                           containerPositioning: 'relative',
                           additionalPlaceholderClass: 'col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case',
                           clone: false,
                           allowDuplicates: false
                       };

                       var tool_app = function( app ) {
                           app.configure = false;
                           app.dirty = false;
                           app.to_delete = false;
                           app.portail = app.url.match( /^app\..*/ ) !== null;
                           app.external = ( app.type == 'EXTERNAL' ) || ( app.application_id !== 'BLOGS' && app.url.match( /^http.*/ ) !== null );
                           app.show = !_(app.hidden).includes( $rootScope.current_user.profil_actif.profil_id ) && ( app.application_id !== 'MAIL' || !_.chain(current_user.emails).findWhere({type: 'Ent'}).isUndefined().value() );
                           app.highlight = app.application_id == 'CCNUM' && $rootScope.current_user.profil_actif.profil_id != 'TUT' && $rootScope.current_user.profil_actif.profil_id != 'ELV';

                           app.status = { app_id: app.application_id,
                                          app_version: '',
                                          available: false,
                                          rack_env: '',
                                          reason: '',
                                          status: 'KO' };

                           if ( app.external || app.portail || app.application_id == 'MAIL' || app.application_id == 'BLOGS' ) {
                               app.status.status = 'OK';
                               app.status.available = true;
                           } else if ( !app.show ) {
                               app.status.reason = 'Application non affichée.';
                           } else {
                               var save_response = function( response ) {
                                   switch ( response.status ) {
                                   case 200:
                                       app.status = response.data;
                                       break;
                                   case 404:
                                       app.status.reason = 'Serveur de l\'application introuvable (' + response.status + ').';
                                       break;
                                   case 500:
                                       app.status.reason = 'Serveur de l\'application en erreur (' + response.status + ').';
                                       break;
                                   default:
                                       app.status.reason = 'Erreur non qualifiée (' + response.status + ').';
                                   }
                               };

                               $http.get( app.url + 'status' ).then( save_response,
                                                                     save_response );
                           }

                           app.toggle_configure = function() {
                               _.chain($scope.cases)
                                   .select( function( c ) { return _(c).has( 'app' ); } )
                                   .each( function( c ) {
                                       if ( c.app === app ) {
                                           app.configure = !app.configure;
                                       } else  {
                                           c.app.configure = false;
                                       }
                                   } );
                           };
                           app.is_dirty = function() { app.dirty = true; };
                           app.remove = function() {
                               app.active = false;
                               app.toggle_configure();
                               app.is_dirty();
                               app.to_delete = true;
                           };
                           app.colorize = function() {
                               return ( app.color ) ? { 'background-color': app.color } : {};
                           };

                           return app;
                       };

                       $scope.add_tile = function() {
                           $uibModal.open( {
                               templateUrl: 'views/popup_ajout_app.html',
                               controller: 'PopupAjoutAppCtrl',
                               resolve: {
                               current_apps: function () {
                                   return _.chain($scope.cases)
                                       .map( function( c ) {
                                           return c.app;
                                       } )
                                       .compact()
                                       .value();
                               }
                           }
                       } )
                           .result.then( function( new_apps ) {
                               var empty_tiles = _($scope.cases).select( function( c ) { return !_(c.app).has( 'libelle' ) || c.app.to_delete; } );

                               _(new_apps).each( function( new_app ) {
                                   var recipient = null;
                                   if ( _(empty_tiles).isEmpty() ) {
                                       recipient = { index: $scope.cases.length,
                                                     couleur: 'gris2' };
                                       $scope.cases.push( recipient );
                                   } else {
                                       recipient = empty_tiles.shift();
                                   }

                                   new_app.index = recipient.index;
                                   new_app.dirty = true;
                                   new_app.configure = true;
                                   new_app.active = true;
                                   new_app.to_delete = false;

                                   new_app.$save().then( function() {
                                       recipient.app = tool_app( new_app );
                                   } );
                               } );
                           } );

                   };

                   $scope.toggle_modification = function( save ) {
                       $rootScope.modification = !$rootScope.modification;
                       $scope.sortable_options.disabled = !$scope.sortable_options.disabled;
                       if ( !$scope.modification ) {
                           var promesses = [];

                           if ( save && apps_indexes_changed ) {
                               // mise à jour de l'annuaire avec les nouveaux index des apps suite au déplacement
                               _($scope.cases).each( function( c, i ) {
                                   if ( _(c.app).has( 'id' ) ) {
                                       c.app.index = i;
                                       promesses.push( c.app.$update() );
                                   }
                               } );
                           }

                           _($scope.cases).each( function( c ) {
                               if ( _(c).has( 'app' ) ) {
                                   c.app.configure = false;
                                   if ( save && c.app.dirty ) {
                                       if ( c.app.to_delete ) {
                                           promesses.push( c.app.$delete() );
                                           delete c.app;

                                           if ( $scope.cases.length > 16 ) {
                                               $scope.cases = $scope.cases.splice( _($scope.cases).findLastIndex( function(c) {return !_(c).has('app'); } ), 1 );
                                           }
                                       } else {
                                           promesses.push( c.app.$update() );
                                           c.app = tool_app( c.app );
                                       }
                                   }
                               }
                           } );


                           $q.all( promesses ).then( retrieve_apps( true ) );
                       }
                   };

                   var retrieve_apps = function( force_reload ) {
                       $scope.cases = _(CASES).map( function( c, i ) {
                           c.index = i;

                           return c;
                       } );

                       apps.query( force_reload )
                           .then( function( response ) {
                               $scope.current_apps = response;

                               _.chain($scope.current_apps)
                                   .sortBy( function( app ) { return !app.active; } )
                                   .each( function( app ) {
                                       if ( !_($scope.cases[ app.index ]).isUndefined() ) {
                                           $scope.cases[ app.index ].app = tool_app( app );
                                       } else {
                                           $scope.cases.push( { app: tool_app( app ),
                                                                index: app.index,
                                                                couleur: CASES[ app.index % ( CASES.length - 1 ) ].couleur } );
                                       }
                                   } );
                           } );
                   };

                   $scope.log_and_open_link = function( app ) {
                       log.add( app.application_id == 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', app.url, null );
                       $window.open( app.url, 'laclasseexterne' );
                   };

                   current_user.$promise.then( function() { retrieve_apps( false ); } );
                 } ] );
