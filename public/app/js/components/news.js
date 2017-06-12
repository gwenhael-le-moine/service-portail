'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { edition: '<' },
                  templateUrl: 'app/js/components/news.html',
                  controller: [ '$sce', '$uibModal', '$http', 'URL_ENT', 'RANDOM_IMAGES', 'currentUser',
                                function( $sce, $uibModal, $http, URL_ENT, RANDOM_IMAGES, currentUser ) {
                                    var ctrl = this;

                                    ctrl.newsfeed = [];

                                    ctrl.retrieve_news = function( force_reload ) {
                                        $http.get( URL_ENT + '/api/users/' + ctrl.user.id + '/news' )
                                            .then( function( response ) {
                                                ctrl.newsfeed = _(response.data).map( function( item, index ) {
                                                    item.trusted_content = $sce.trustAsHtml( item.description );
                                                    item.no_image = _(item.image).isNull();
                                                    item.pubDate = moment( new Date( item.pubDate ) ).toDate();

                                                    if ( item.title === 'Publipostage' ) {
                                                        item.image =  'app/node_modules/laclasse-common-client/images/11_publipostage.svg';
                                                    } else if ( _(item.image).isNull() ) {
                                                        item.image = _(RANDOM_IMAGES).sample();
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
                                            ctrl.user = user;

                                            ctrl.retrieve_news( false );

                                        } );
                                    };
                                } ]
                } );
