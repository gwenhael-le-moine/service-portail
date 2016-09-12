/*
 * Controleur de la page publique
 */
'use strict';

angular.module( 'portailApp' )
    .controller( 'PortailCtrl',
                 [ '$scope', '$rootScope', '$sce', '$state', '$uibModal', 'moment', 'toastr', 'currentUser', 'current_user', 'APP_PATH', 'RANDOM_IMAGES', 'news', 'Utils',
                   function( $scope, $rootScope, $sce, $state, $uibModal, moment, toastr, currentUser, current_user, APP_PATH, RANDOM_IMAGES, news, Utils ) {
                       $scope.prefix = APP_PATH;

                       if ( $rootScope.current_user.default_password ) {
                           $uibModal.open( { templateUrl: 'views/popup_change_password.html',
                                             resolve: { current_user: function() { return current_user; } },
                                             controller: [ '$scope', '$uibModalInstance', 'current_user',
                                                           function( $scope, $uibModalInstance, current_user ) {
                                                               $rootScope.current_user = current_user;
                                                               $scope.password = { old: '',
                                                                                   new1: '',
                                                                                   new2: '' };

                                                               $scope.fermer = function( sauvegarder ) {
                                                                   var password_confirmed = true;
                                                                   if ( !_($scope.password.old).isEmpty() && !_($scope.password.new1).isEmpty() ) {
                                                                       if ( $scope.password.new1 == $scope.password.new2 ) {
                                                                           $rootScope.current_user.previous_password = $scope.password.old;
                                                                           $rootScope.current_user.new_password = $scope.password.new1;
                                                                       } else {
                                                                           password_confirmed = false;
                                                                           toastr.error( 'Confirmation de mot de passe incorrecte.',
                                                                                         'Erreur',
                                                                                         { timeout: 100000 } );
                                                                       }
                                                                   }

                                                                   if ( password_confirmed ) {
                                                                       $rootScope.current_user.$update()
                                                                           .then( function() {
                                                                               $uibModalInstance.close( $scope );
                                                                           } );
                                                                   }
                                                               };
                                                           } ],
                                             backdrop: 'static',
                                             keyboard: false } )
                               .result.then( function( scope_popup ) {
                                   $rootScope.current_user = scope_popup.current_user;
                               } );
                       }

                       $scope.go_home = function() {
                           Utils.go_home();
                       };

                       currentUser.help_links().then( function( response ) {
                           $scope.help_links = response;
                       } );

                       var retrieve_news = function( force_reload ) {
                           news.get( force_reload )
                               .then( function( response ) {
                                   $scope.newsfeed = _(response.data).map( function( item, index ) {
                                       item.id = index;
                                       item.trusted_description = $sce.trustAsHtml( item.description );
                                       item.no_image = _(item.image).isNull();
                                       item.pubDate = moment( item.pubDate ).toDate();

                                       if ( item.no_image ) {
                                           if ( item.title == 'Publipostage' ) {
                                               item.image =  APP_PATH + '/app/node_modules/laclasse-common-client/images/11_publipostage.svg';
                                           } else if ( !_($rootScope.current_user.profil_actif.etablissement_logo).isNull() ) {
                                               item.image = $rootScope.current_user.profil_actif.etablissement_logo;
                                           } else {
                                               item.image = _(RANDOM_IMAGES).sample();
                                           }
                                       }

                                       return item;
                                   });

                                   $scope.carouselIndex = 0;
                               });
                       };

                       $scope.config_news_fluxes = function() {
                           $uibModal.open( { templateUrl: 'views/popup_config_news_fluxes.html',
                                             controller: 'PopupConfigNewsFluxesCtrl' } )
                               .result.then( function() {
                                   retrieve_news( true );
                               } );
                       };

                       retrieve_news( false );
                   }
                 ] );
