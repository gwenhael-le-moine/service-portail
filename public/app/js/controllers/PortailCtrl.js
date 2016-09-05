/*
 * Controleur de la page publique
 */
'use strict';

angular.module( 'portailApp' )
    .controller( 'PortailCtrl',
                 [ '$scope', '$rootScope', '$sce', '$state', '$uibModal', 'moment', 'toastr', 'currentUser', 'current_user', 'APP_PATH', 'RANDOM_IMAGES', 'news',
                   function( $scope, $rootScope, $sce, $state, $uibModal, moment, toastr, currentUser, current_user, APP_PATH, RANDOM_IMAGES, news ) {
                       $scope.prefix = APP_PATH;

                       $scope.go_home = function() {
                           $state.go( 'portail.logged' );
                       };

                       currentUser.help_links().then( function( response ) {
                           $scope.help_links = response;
                       } );

                       // TODO : faire une factory et un service pour les annonces.
                       // L'idée est d'aller lire le flux twitter @laclasse avec le hash #sys
                       $scope.annonce = ""; //"En moment sur Laclasse.com : La version 3 sort des cartons !";
                       $scope.newsfeed = [];

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
                           $uibModal.open( {
                               templateUrl: 'views/popup_config_news_fluxes.html',
                               controller: 'PopupConfigNewsFluxesCtrl'
                           } )
                               .result.then( function() {
                                   retrieve_news( true );
                               } );
                       };

                       retrieve_news( false );

                       if ( $rootScope.current_user.default_password ) {
                           $uibModal.open( {
                               templateUrl: 'views/popup_change_password.html',
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
                               keyboard: false
                           } )
                               .result.then( function( scope_popup ) {
                                   $rootScope.current_user = scope_popup.current_user;
                               } );
                       }
                   }
                 ] );
