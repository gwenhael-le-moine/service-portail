'use strict';
angular.module('portailApp')
    .service('Popups', ['$uibModal',
    function ($uibModal) {
        var Popups = this;
        Popups.add_tiles = function (current_tiles, callback_success, callback_error) {
            $uibModal.open({ controller: ['$scope', '$uibModalInstance', 'APP_PATH', 'Tiles', 'currentUser', 'Annuaire',
                    'current_tiles',
                    function ($scope, $uibModalInstance, APP_PATH, Tiles, currentUser, Annuaire, current_tiles) {
                        $scope.prefix = APP_PATH;
                        $scope.available_tiles = [];
                        $scope.tiles_selected = false;
                        $scope.add_empty_link_tile = function () {
                            $scope.available_tiles.push(new Tiles({ creation: true,
                                present: false,
                                type: 'EXTERNAL',
                                name: '',
                                description: '',
                                url: 'http://',
                                color: '',
                                selected: true,
                                taxonomy: 'app' }));
                        };
                        $scope.keep_tile_selected = function (event, app) {
                            app.selected = false; // opposite of what we want
                            $scope.selected(app);
                            event.stopImmediatePropagation();
                        };
                        $scope.selected = function (tile) {
                            tile.selected = !tile.selected;
                            $scope.tiles_selected = _($scope.available_tiles).select({ selected: true }).length > 0;
                        };
                        $scope.ok = function () {
                            $uibModalInstance.close(_($scope.available_tiles).select({ selected: true }));
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        Annuaire.query_applications()
                            .then(function (response) {
                            $scope.available_tiles = $scope.available_tiles.concat(_.chain(response)
                                .uniq(function (app) { return app.application_id; })
                                .each(function (app) {
                                app.taxonomy = 'app';
                                app.available = function () {
                                    return !_.chain(current_tiles)
                                        .reject(function (a) {
                                        return a.to_delete;
                                    })
                                        .pluck('application_id')
                                        .contains(app.application_id)
                                        .value();
                                };
                            })
                                .value());
                            _($scope.available_tiles).each(function (tile) { tile.selected = false; });
                        });
                    }],
                resolve: { current_tiles: function () { return current_tiles; } },
                template: "\n<div class=\"modal-header\">\n    <h3 class=\"modal-title\">Ajouter une tuile</h3>\n</div>\n<div class=\"modal-body available-apps\">\n    <ul>\n        <li class=\"new-app\"\n            ng:repeat=\"tile in available_tiles\"\n            ng:if=\"tile.available() || tile.creation\"\n            ng:class=\"{'selected': tile.selected, 'creation': tile.creation, 'pronote': tile.application_id == 'PRONOTE'}\"\n            ng:click=\"selected( tile )\">\n\n            <a ng:if=\"!tile.creation\"\n               title=\"{{ tile.description }}\"\n               ng:style=\"{'background-color': tile.color }\">\n                <img draggable=\"false\" class=\"icone\" ng:src=\"{{prefix}}/{{tile.icon}}\"\n                     ng:if=\"tile.icon\"/>\n                <span class=\"app-name\" ng:cloak>{{ tile.name }}</span>\n                <label ng:if=\"tile.application_id == 'PRONOTE'\">lien <input type=\"text\" ng:model=\"tile.url\" ng:click=\"keep_tile_selected( $event, tile )\"/></label>\n            </a>\n\n            <fieldset ng:if=\"tile.creation\">\n                <legend>lien libre</legend>\n\n                <label>libell\u00E9 <input type=\"text\" ng:model=\"tile.name\" ng:click=\"keep_tile_selected( $event, tile )\" /></label>\n                <label>lien <input type=\"text\" ng:model=\"tile.url\" ng:click=\"keep_tile_selected( $event, tile )\" /></label>\n            </fieldset>\n        </li>\n    </ul>\n    <div class=\"clearfix\"></div>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary pull-left\" ng:click=\"add_empty_link_tile()\">\n        <span class=\"glyphicon glyphicon-plus-sign\"></span> Ajouter un lien libre\n    </button>\n\n    <button class=\"btn btn-default\" ng:click=\"cancel()\">\n        <span class=\"glyphicon glyphicon-remove-sign\"></span> <span ng:if=\"tiles_selected\">Annuler</span><span ng:if=\"!tiles_selected\">Fermer</span>\n    </button>\n    <button class=\"btn btn-success\"\n            ng:click=\"ok()\"\n            ng:disabled=\"!tiles_selected\">\n        <span class=\"glyphicon glyphicon-ok-sign\"></span> Valider\n    </button>\n</div>\n",
                backdrop: 'static' })
                .result.then(callback_success, callback_error);
        };
        Popups.manage_fluxes = function (callback_success, callback_error) {
            $uibModal.open({ template: "\n<div class=\"modal-header\">\n    <h3 class=\"modal-title\">G\u00E9rer les flux RSS affich\u00E9s sur le portail de l'\u00E9tablissement</h3>\n</div>\n<div class=\"modal-body config-fluxes\">\n    <ul>\n        <li ng:repeat=\"flux in $ctrl.current_flux\">\n            <label>titre <input type=\"text\"\n                                ng:model=\"flux.name\"\n                                ng:change=\"$ctrl.dirtify( flux )\" /></label>\n            <label>url <input type=\"text\"\n                              ng:model=\"flux.url\"\n                              ng:change=\"$ctrl.dirtify( flux )\" /></label>\n\n            <div class=\"controls\">\n                <button class=\"btn-default delete\"\n                        ng:click=\"$ctrl.delete( flux )\"><span class=\"glyphicon glyphicon-trash\"></span></button>\n                <button class=\"btn-primary save\"\n                        ng:if=\"flux.dirty\"\n                        ng:click=\"$ctrl.save( flux )\"><span class=\"glyphicon glyphicon-ok-sign\"></span></button>\n            </div>\n            <div class=\"clearfix\"></div>\n        </li>\n    </ul>\n    <div class=\"clearfix\"></div>\n\n    <button style=\"right: 4em;\"\n            ng:click=\"$ctrl.add_default_flux()\"><span class=\"glyphicon glyphicon-cloud-download\"></span></button>\n    <button ng:click=\"$ctrl.add_flux()\"><span class=\"glyphicon glyphicon-plus-sign\"></span></button>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-default\" ng:click=\"$ctrl.close()\">\n        <span class=\"glyphicon glyphicon-remove-sign\"></span> Fermer\n    </button>\n</div>\n",
                controller: ['$scope', '$uibModalInstance', 'currentUser', 'Flux', 'CONFIG',
                    function ($scope, $uibModalInstance, currentUser, Flux, CONFIG) {
                        var ctrl = $scope;
                        ctrl.$ctrl = ctrl;
                        ctrl.nb_articles = _.range(1, 11);
                        ctrl.current_flux = [];
                        ctrl["delete"] = function (flux) {
                            flux.$delete();
                            ctrl.current_flux = _(ctrl.current_flux).difference([flux]);
                        };
                        ctrl.save = function (flux) {
                            flux.structure_id = ctrl.user.active_profile().structure_id;
                            return _(flux).has('id') ? flux.$update() : flux.$save();
                        };
                        ctrl.dirtify = function (flux) {
                            flux.dirty = true;
                        };
                        ctrl.add_flux = function () {
                            ctrl.current_flux.push(new Flux({ name: '',
                                url: '',
                                icon: '' }));
                        };
                        ctrl.add_default_flux = function () {
                            _(CONFIG.news_feed).each(function (flux) {
                                ctrl.dirtify(flux);
                                ctrl.current_flux.push(new Flux(flux));
                            });
                        };
                        ctrl.close = function () {
                            $uibModalInstance.close();
                        };
                        ctrl.$onInit = function () {
                            currentUser.get(false).then(function (user) {
                                ctrl.user = user;
                                Flux.get({ structure_id: ctrl.user.active_profile().structure_id }).$promise
                                    .then(function (response) {
                                    ctrl.current_flux = _(response).map(function (flux) {
                                        flux.dirty = false;
                                        return flux;
                                    });
                                });
                            });
                        };
                        ctrl.$onInit();
                    }],
                backdrop: 'static' })
                .result.then(callback_success, callback_error);
        };
    }
]);
