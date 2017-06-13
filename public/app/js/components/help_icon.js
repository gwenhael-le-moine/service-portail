'use strict';

angular.module( 'portailApp' )
    .component( 'helpIcon',
                { bindings: { user: '<' },
                  templateUrl: 'app/js/components/help_icon.html',
                  controller: [ 'CONFIG',
                                function( CONFIG ) {
                                    var ctrl = this;

                                    ctrl.$onInit = function() {
                                        ctrl.help_links = _(CONFIG.help_links)
                                            .select( function( link ) {
                                                return !_(ctrl.user.profiles).isEmpty()
                                                    && _(link.profils).intersection( _(ctrl.user.profiles).pluck('type') ).length > 0;
                                            } );
                                    };
                                } ]
                } );
