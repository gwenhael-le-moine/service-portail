'use strict';

angular.module( 'portailApp' )
    .component( 'news',
                { bindings: { edition: '<' },
                  controller: [ '$sce', 'Popups', '$http', '$q', 'URL_ENT', 'RANDOM_IMAGES', 'currentUser',
                                function( $sce, Popups, $http, $q, URL_ENT, RANDOM_IMAGES, currentUser ) {
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
                                            Popups.manage_fluxes( function() {
                                                ctrl.retrieve_news( true );
                                            }, function error() {} );
                                        };

                                    ctrl.$onInit = function() {
                                        currentUser.get( false ).then( function( user ) {
                                            ctrl.user = user;

                                            ctrl.retrieve_news( false );
                                        } );
                                    };
                                } ],
                  template: `
<ul class="noir" rn-carousel rn-carousel-buffered rn-carousel-auto-slide="6" rn-carousel-index="$ctrl.carouselIndex">
    <li ng:repeat="slide in $ctrl.newsfeed | orderBy:'pubDate':true" active="slide.active"
        ng:class="{'publipostage': slide.title == 'Publipostage', 'no-image': slide.no_image}">
        <div class="carousel-image"
             ng:style="{'background-image': 'url(' + slide.image + ')'}"></div>
        <div class="carousel-caption">
            <span class="pub-date" ng:cloak>{{ slide.pubDate | date:'medium' }}</span>
            <a href="{{ slide.link }}" target="_blank" ng:if="slide.link != 'notYetImplemented'">
                <h6 ng:cloak>{{ slide.title }}</h6>
            </a>
            <h6 ng:if="slide.link == 'notYetImplemented'">{{ slide.title }}</h6>
            <p ng:bind-html="slide.trusted_content"></p>
        </div>
    </li>
    <div class="hidden-xs hidden-sm angular-carousel-indicators"
         rn-carousel-indicators
         slides="$ctrl.newsfeed"
         rn-carousel-index="$ctrl.carouselIndex">
    </div>
    <span class="hidden-xs hidden-sm floating-button big toggle bouton-config-news blanc"
          ng:if="$ctrl.user.is_admin() && $ctrl.edition"
          ng:click="$ctrl.config_news_fluxes()"></span>
</ul>
`
                } );
