'use strict';

angular.module( 'portailApp' )
    .component( 'helpIcon',
                { bindings: { user: '<' },
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
                                } ],
                  template: `
<div uib-dropdown
     keyboard-nav
     ng:if="$ctrl.help_links.length > 0">
    <a class="uib-dropdown-toggle" uib-dropdown-toggle><h2>?</h2> </a>
    <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="simple-btn-keyboard-nav">
        <li ng:repeat="link in $ctrl.help_links">
            <a ng:href="{{link.url}}" target="_blank">{{link.title}}</a>
        </li>
    </ul>
</div>
`
                } );
