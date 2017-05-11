'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { user: '<',
                              edition: '<' },
                  templateUrl: 'app/js/components/news.html',
                  controller: [ '$sce', '$uibModal', 'news', 'RANDOM_IMAGES',
                                function( $sce, $uibModal, news, RANDOM_IMAGES ) {
                                    var ctrl = this;

                                    ctrl.newsfeed = [];

                                    ctrl.retrieve_news = function( force_reload ) {
                                        news.get( force_reload )
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
                                        ctrl.retrieve_news( false );
                                    };
                                } ]
                } );
