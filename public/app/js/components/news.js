'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { user: '<',
                              edition: '<' },
                  template: '<ul class="noir" rn-carousel rn-carousel-buffered rn-carousel-auto-slide="6" rn-carousel-index="$ctrl.carouselIndex">' +
                  '  <li ng:repeat="slide in $ctrl.newsfeed | orderBy:\'pubDate\':true" active="slide.active"' +
                  '      ng:class="{\'publipostage\': slide.title == \'Publipostage\', \'no-image\': slide.no_image}">' +
                  '    <div class="carousel-image"' +
                  '         ng:style="{\'background-image\': \'url(\' + slide.image + \')\'}"></div>' +
                  '    <div class="carousel-caption">' +
                  '        <span class="pub-date" ng:cloak>{{ slide.pubDate | date:\'medium\' }}</span>' +
                  '        <a href="{{ slide.link }}" target="_blank" ng:if="slide.link != \'notYetImplemented\'">' +
                  '            <h6 ng:cloak>{{ slide.title }}</h6>' +
                  '        </a>' +
                  '        <h6 ng:if="slide.link == \'notYetImplemented\'">{{ slide.title }}</h6>' +
                  '        <p ng:bind-html="slide.trusted_content"></p>' +
                  '    </div>' +
                  '  </li>' +
                  '  <div class="hidden-xs hidden-sm angular-carousel-indicators"' +
                  '       rn-carousel-indicators' +
                  '       slides="$ctrl.newsfeed"' +
                  '       rn-carousel-index="$ctrl.carouselIndex">' +
                  '  </div>' +
                  '  <span class="hidden-xs hidden-sm floating-button big toggle bouton-config-news blanc"' +
                  '        ng:if="$ctrl.user.is_admin() && $ctrl.edition"' +
                  '        ng:click="$ctrl.config_news_fluxes()"></span>' +
                  '</ul>',
                  controller: [ '$sce', '$uibModal', 'news', 'APP_PATH', 'RANDOM_IMAGES',
                                function( $sce, $uibModal, news, APP_PATH, RANDOM_IMAGES ) {
                                    var ctrl = this;
                                    ctrl.newsfeed = [];

                                    this.retrieve_news = function( force_reload ) {
                                        news.get( force_reload )
                                            .then( function( response ) {
                                                ctrl.newsfeed = _(response.data).map( function( item, index ) {
                                                    item.id = index;
                                                    item.trusted_content = $sce.trustAsHtml( item.content );
                                                    item.no_image = _(item.image).isNull();
                                                    item.pubDate = moment( new Date( item.pubDate ) ).toDate();

                                                    if ( item.no_image ) {
                                                        if ( item.title == 'Publipostage' ) {
                                                            item.image =  APP_PATH + '/app/node_modules/laclasse-common-client/images/11_publipostage.svg';
                                                        } else if ( ctrl.user.profil_actif && !_(ctrl.user.profil_actif.etablissement_logo).isNull() ) {
                                                            item.image = ctrl.user.profil_actif.etablissement_logo;
                                                        } else {
                                                            item.image = _(RANDOM_IMAGES).sample();
                                                        }
                                                    }

                                                    return item;
                                                });

                                                ctrl.carouselIndex = 0;
                                            });
                                    };

                                    this.config_news_fluxes = function() {
                                        $uibModal.open( { templateUrl: 'views/popup_config_news_fluxes.html',
                                                          controller: 'PopupConfigNewsFluxesCtrl' } )
                                            .result.then( function() {
                                                ctrl.retrieve_news( true );
                                            } );
                                    };

                                    this.retrieve_news( false );

                                } ]
                } );
