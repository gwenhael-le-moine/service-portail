'use strict';

angular.module( 'portailApp' )
    .component( 'helpicon',
                { templateUrl: 'app/js/components/help_icon.html',
                  controller: [ 'CONFIG', 'currentUser', 'User',
                                function( CONFIG, currentUser, User ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        currentUser.get().then( function( user ) {
                                            ctrl.help_links = _(CONFIG.help_links)
                                                .select( function( link ) {
                                                    return !_(user.profiles).isEmpty() && _(link.profils).includes( user.active_profile().type );
                                                } );
                                        } );
                                    };
                                } ]
                } );
