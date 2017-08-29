'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { edition: '<' },
                  templateUrl: 'app/js/components/news.html',
                  controller: [ '$sce', '$uibModal', '$http', '$q', 'URL_ENT', 'RANDOM_IMAGES', 'currentUser',
                                function( $sce, $uibModal, $http, $q, URL_ENT, RANDOM_IMAGES, currentUser ) {
                                    var ctrl = this;

                                    ctrl.newsfeed = [];

                                    ctrl.retrieve_news = function( force_reload ) {
                                        var one_month_ago = moment().subtract( 1, 'months' ).toDate().toISOString();

                                        $http.get( URL_ENT + '/api/news', { params: { user_id: ctrl.user.id,
                                                                                      'pubDate>': one_month_ago } } )
                                            .then( function( response ) {
                                                ctrl.newsfeed = _(response.data).map( function( item, index ) {
                                                    item.trusted_content = $sce.trustAsHtml( item.description );
                                                    item.no_image = _(item.image).isNull();
                                                    item.pubDate = moment( new Date( item.pubDate ) ).toDate();
                                                    item.image =  'app/node_modules/laclasse-common-client/images/11_publipostage.svg';

                                                    return item;
                                                });

                                                ctrl.carouselIndex = 0;

                                                if ( _(ctrl.user.profiles).isEmpty() ) {
                                                    return $q.resolve({ data: [] });
                                                } else {
                                                    return $http.get( URL_ENT + '/api/structures/' + ctrl.user.active_profile().structure_id + '/rss', { params: { 'pubDate>': one_month_ago } } );
                                                }
                                            })
                                            .then( function( response ) {
                                                ctrl.newsfeed = ctrl.newsfeed.concat( _(response.data).map( function( item, index ) {
                                                    item.trusted_content = $sce.trustAsHtml( item.content );
                                                    item.no_image = _(item.image).isNull();
                                                    item.pubDate = moment( new Date( item.pubDate ) ).toDate();

                                                    if ( _(item.image).isNull() ) {
                                                        item.image = _(RANDOM_IMAGES).sample();
                                                    }

                                                    return item;
                                                }) );
                                            });
                                    };

                                        ctrl.config_news_fluxes = function() {
                                            $uibModal.open( { templateUrl: 'app/views/popup_config_news_fluxes.html',
                                                              controller: 'PopupConfigNewsFluxesCtrl',
                                                              backdrop: 'static'  } )
                                                .result.then( function() {
                                                    ctrl.retrieve_news( true );
                                                } );
                                        };

                                        ctrl.$onInit = function() {
                                            currentUser.get( false ).then( function( user ) {
                                                ctrl.user = user;

                                                ctrl.retrieve_news( false );
                                            } );
                                        };
                                } ]
                } );
