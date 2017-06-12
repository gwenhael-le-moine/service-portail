'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { edition: '<' },
                  templateUrl: 'app/js/components/news.html',
                  controller: [ '$sce', '$uibModal', '$http', 'URL_ENT', 'RANDOM_IMAGES', 'currentUser', 'User',
                                function( $sce, $uibModal, $http, URL_ENT, RANDOM_IMAGES, currentUser, User ) {
                                    var ctrl = this;

                                    ctrl.newsfeed = [];

                                    ctrl.retrieve_news = function( force_reload ) {
                                        $http.get( URL_ENT + '/api/users/' + ctrl.current_user.id + '/news' )
                                            .then( function( response ) {
                                                ctrl.newsfeed = _(response.data).map( function( item, index ) {
                                                    item.id = index;
                                                    item.trusted_content = $sce.trustAsHtml( item.content );
                                                    item.no_image = _(item.image).isNull();
                                                    item.pubDate = moment( new Date( item.pubDate ) ).toDate();

                                                    if ( item.no_image ) {
                                                        if ( item.title == 'Publipostage' ) {
                                                            item.image =  'app/node_modules/laclasse-common-client/images/11_publipostage.svg';
                                                        } else {
                                                            item.image = _(RANDOM_IMAGES).sample();
                                                        }
                                                    }

                                                    return item;
                                                });

                                                ctrl.carouselIndex = 0;
                                            });
                                    };

                                    ctrl.config_news_fluxes = function() {
                                        $uibModal.open( { templateUrl: 'app/views/popup_config_news_fluxes.html',
                                                          controller: 'PopupConfigNewsFluxesCtrl' } )
                                            .result.then( function() {
                                                ctrl.retrieve_news( true );
                                            } );
                                    };

                                    ctrl.$onInit = function() {
                                        currentUser.get().then( function( user ) {
                                            ctrl.current_user = user;

                                            ctrl.retrieve_news( false );

                                        } );
                                    };
                                } ]
                } );
