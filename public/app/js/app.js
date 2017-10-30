'use strict';
angular.module('portailApp', ['ngResource',
    'ui.router',
    'ui.bootstrap',
    'as.sortable',
    'ui.checkbox',
    'ngTouch',
    'angularMoment',
    'ngColorPicker',
    'angular-carousel',
    'ngFitText',
    'zxcvbn',
    'toastr'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'APP_PATH',
    function ($stateProvider, $urlRouterProvider, $locationProvider, APP_PATH) {
        $stateProvider
            .state('portail', {
            url: '/',
            component: 'portail'
        })
            .state('app', {
            url: '/app/:appid',
            component: 'appWrapper',
            resolve: {
                appId: ['$transition$',
                    function ($transition$) {
                        return $transition$.params().appid;
                    }]
            }
        });
        $urlRouterProvider.otherwise('/');
    }
])
    .config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.interceptors.push(['$q', '$window',
            function ($q, $window) {
                return {
                    'responseError': function (rejection) {
                        if (rejection.status === 401) {
                            $window.location.href = '/sso/login?ticket=false&service=' + encodeURIComponent($window.location.href);
                        }
                        return rejection;
                    }
                };
            }]);
    }])
    .run(['$rootScope', 'log',
    function ($rootScope, log) {
        $rootScope.modification = false;
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            log.add((toState.name == 'app') ? toParams.appid : 'PORTAIL', null, null);
        });
    }
]);
angular.module('portailApp')
    .constant('CASES', [{ color: 'bleu' },
    { color: 'jaune' },
    { color: 'violet' },
    { color: 'vert' },
    { color: 'rouge' },
    { color: 'vert' },
    { color: 'bleu' },
    { color: 'jaune' },
    { color: 'violet' },
    { color: 'bleu' },
    { color: 'jaune' },
    { color: 'rouge' },
    { color: 'jaune' },
    { color: 'rouge' },
    { color: 'vert' },
    { color: 'violet' }])
    .constant('COULEURS', ['#1aa1cc',
    '#80ba66',
    '#eb5454',
    '#9c75ab',
    '#e8c254'])
    .factory('RANDOM_IMAGES', ['APP_PATH',
    function (APP_PATH) {
        return [APP_PATH + '/app/node_modules/laclasse-common-client/images/logolaclasse.svg',
            APP_PATH + '/app/node_modules/laclasse-common-client/images/random/20150116_102448.jpg',
            APP_PATH + '/app/node_modules/laclasse-common-client/images/random/20150204_152946.jpg'];
    }]);
angular.module('portailApp')
    .component('appWrapper', {
    bindings: { appId: '<' },
    controller: ['$stateParams', '$sce', 'currentUser', 'Annuaire', 'Tiles', 'Utils',
        function ($stateParams, $sce, currentUser, Annuaire, Tiles, Utils) {
            var ctrl = this;
            ctrl.$onInit = function () {
                currentUser.get(true)
                    .then(function (user) {
                    ctrl.user = user;
                    var apps_list;
                    if (_(ctrl.user.profiles).isEmpty()) {
                        apps_list = Annuaire.query_applications();
                    }
                    else {
                        apps_list = Tiles.query({ structure_id: ctrl.user.active_profile().structure_id }).$promise;
                    }
                    apps_list.then(function (response) {
                        ctrl.app = _(response).findWhere({ application_id: ctrl.appId });
                        if (_(ctrl.app).isUndefined()) {
                            Utils.go_home();
                        }
                        ctrl.app.url = $sce.trustAsResourceUrl(ctrl.app.url);
                    });
                });
            };
        }
    ],
    template: "\n<div id=\"app-wrapper\">\n    <div class=\"en-tete container gris4\" role=\"navigation\">\n        <logo class=\"petit logolaclasse gris4 pull-left\"\n              user=\"$ctrl.user\"></logo>\n\n        <span class=\"hidden-xs hidden-sm titre\" ng:cloak>{{$ctrl.app.name}}</span>\n\n        <profilactif class=\"gris4 profil-select-wrapper\"\n                     ng:if=\"$ctrl.user.profiles\"\n                     user=\"$ctrl.user\"></profilactif>\n    </div>\n\n    <appiframe url=\"$ctrl.app.url\"\n               class=\"appiframe\"></appiframe>\n</div>\n"
});
angular.module('portailApp')
    .component('appiframe', {
    bindings: { url: '<' },
    controller: [function () {
            var ctrl = this;
            ctrl.$onInit = function () {
                ctrl.iOS = (navigator.userAgent.match(/iPad/i) !== null) || (navigator.userAgent.match(/iPhone/i) !== null);
            };
        }
    ],
    template: "\n<div class=\"iframe\" ng:class=\"{'ios': $ctrl.iOS}\">\n    <iframe id=\"iframe\" frameBorder=\"0\"\n            scrolling=\"{{$ctrl.iOS ? 'no': 'yes'}}\"\n            ng:src=\"{{$ctrl.url}}\">\n    </iframe>\n</div>\n"
});
angular.module('portailApp')
    .directive('fileChanged', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('change', scope.$eval(attrs.fileChanged));
        }
    };
})
    .component('avatar', {
    controller: ['currentUser', 'URL_ENT', 'User',
        function (currentUser, URL_ENT, User) {
            var ctrl = this;
            ctrl.URL_ENT = URL_ENT;
            ctrl.processing = false;
            var blobToDataURL = function (blob, callback) {
                var a = new FileReader();
                a.onload = function (e) { callback(e.target.result); };
                a.readAsDataURL(blob);
            };
            var dataURItoBlob = function (dataURI) {
                var byteString = (dataURI.split(',')[0].indexOf('base64') >= 0) ? atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1]);
                var mimeString = dataURI.split(',')[0]
                    .split(':')[1]
                    .split(';')[0];
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ia], { type: mimeString });
            };
            var processFile = function (file) {
                ctrl.processing = true;
                var max_height = 256;
                var max_width = 256;
                blobToDataURL(file, function (dataURL) {
                    var img = new Image();
                    ctrl.user.new_avatar.image = dataURL;
                    img.onload = function () {
                        ctrl.user.new_avatar.height = img.height;
                        ctrl.user.new_avatar.width = img.width;
                        var factor = 1;
                        if (ctrl.user.new_avatar.width > max_width) {
                            factor = max_width / img.width;
                            ctrl.user.new_avatar.width = max_width;
                            ctrl.user.new_avatar.height = img.height * factor;
                        }
                        if (ctrl.user.new_avatar.height > max_height) {
                            factor = max_height / img.height;
                            ctrl.user.new_avatar.height = max_height;
                            ctrl.user.new_avatar.width = img.width * factor;
                        }
                        var canvas = document.createElement('canvas');
                        canvas.width = ctrl.user.new_avatar.width;
                        canvas.height = ctrl.user.new_avatar.height;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, ctrl.user.new_avatar.width, ctrl.user.new_avatar.height);
                        ctrl.user.new_avatar.image = canvas.toDataURL();
                        ctrl.user.new_avatar.blob = dataURItoBlob(ctrl.user.new_avatar.image);
                    };
                    img.src = ctrl.user.new_avatar.image;
                    ctrl.processing = false;
                });
            };
            ctrl.onChange = function (event) {
                processFile(event.target.files[0]);
            };
            var reset_new_avatar = function () {
                ctrl.user.new_avatar = {
                    image: null,
                    blob: null,
                    width: 0,
                    height: 0
                };
            };
            ctrl.upload_avatar = function () {
                ctrl.user.$upload_avatar()
                    .then(function (response) {
                    reset_new_avatar();
                });
            };
            ctrl.delete = function () {
                ctrl.user.avatar = 'empty';
                ctrl.user.$update();
            };
            ctrl.$onInit = function () {
                currentUser.get(false).then(function (user) {
                    ctrl.user = user;
                    reset_new_avatar();
                });
            };
        }],
    template: "\n<div class=\"avatar\">\n    <img draggable=\"false\" class=\"svg\"\n         ng:src=\"{{$ctrl.user.new_avatar.image ? $ctrl.user.new_avatar.image : $ctrl.URL_ENT + '/' + $ctrl.user.avatar}}\" />\n    <button style=\"position: absolute; top: 0; right: 0;\"\n            title=\"Supprimer l'avatar existant\"\n            ng:if=\"!$ctrl.user.new_avatar.blob\"\n            ng:click=\"$ctrl.delete()\">\n        <span class=\"glyphicon glyphicon-remove\"\n              style=\"color: red;\" ></span>\n    </button>\n\n    <input type=\"file\" file-changed=\"$ctrl.onChange\" ng:if=\"!$ctrl.processing\"/>\n    <span ng:if=\"$ctrl.processing\"><i class=\"fa fa-spinner fa-pulse\"></i> traitement</span>\n    <footer>\n        <button ng:disabled=\"!$ctrl.user.new_avatar.blob\"\n                ng:click=\"$ctrl.upload_avatar()\">Valider l'avatar</button>\n    </footer>\n</div>\n"
});
angular.module('portailApp')
    .component('helpIcon', {
    bindings: { user: '<' },
    controller: ['CONFIG',
        function (CONFIG) {
            var ctrl = this;
            ctrl.$onInit = function () {
                ctrl.help_links = _(CONFIG.help_links)
                    .select(function (link) {
                    return !_(ctrl.user.profiles).isEmpty()
                        && _(link.profils).intersection(_(ctrl.user.profiles).pluck('type')).length > 0;
                });
            };
        }],
    template: "\n<div uib-dropdown\n     keyboard-nav\n     ng:if=\"$ctrl.help_links.length > 0\">\n    <a class=\"uib-dropdown-toggle\" uib-dropdown-toggle><h2>?</h2> </a>\n    <ul class=\"dropdown-menu\" uib-dropdown-menu role=\"menu\" aria-labelledby=\"simple-btn-keyboard-nav\">\n        <li ng:repeat=\"link in $ctrl.help_links\">\n            <a ng:href=\"{{link.url}}\" target=\"_blank\">{{link.title}}</a>\n        </li>\n    </ul>\n</div>\n"
});
angular.module('portailApp')
    .component('logo', {
    bindings: { user: '=' },
    controller: ['Utils', 'APP_PATH',
        function (Utils, APP_PATH) {
            var ctrl = this;
            ctrl.prefix = APP_PATH;
            ctrl.go_home = function () {
                ctrl.user.edit_profile = false;
                Utils.go_home();
            };
        }],
    template: '<a ng:click="$ctrl.go_home()">' +
        '    <img draggable="false" ng:src="{{$ctrl.prefix}}/app/node_modules/laclasse-common-client/images/logolaclasse.svg" />' +
        '    <h3 class="hidden-xs hidden-sm ent-name">laclasse.com</h3>' +
        '</a>'
});
angular.module('portailApp')
    .component('news', {
    bindings: { edition: '<' },
    controller: ['$sce', 'Popups', '$http', '$q', 'URL_ENT', 'RANDOM_IMAGES', 'currentUser',
        function ($sce, Popups, $http, $q, URL_ENT, RANDOM_IMAGES, currentUser) {
            var ctrl = this;
            ctrl.newsfeed = [];
            ctrl.retrieve_news = function (force_reload) {
                var one_month_ago = moment().subtract(1, 'months').toDate().toISOString();
                $http.get(URL_ENT + '/api/news', {
                    params: {
                        user_id: ctrl.user.id,
                        'pubDate>': one_month_ago
                    }
                })
                    .then(function (response) {
                    ctrl.newsfeed = _(response.data).map(function (item, index) {
                        item.trusted_content = $sce.trustAsHtml(item.description);
                        item.no_image = _(item.image).isNull();
                        item.pubDate = moment(new Date(item.pubDate)).toDate();
                        item.image = 'app/node_modules/laclasse-common-client/images/11_publipostage.svg';
                        return item;
                    });
                    ctrl.carouselIndex = 0;
                    if (_(ctrl.user.profiles).isEmpty()) {
                        return $q.resolve({ data: [] });
                    }
                    else {
                        return $http.get(URL_ENT + '/api/structures/' + ctrl.user.active_profile().structure_id + '/rss', { params: { 'pubDate>': one_month_ago } });
                    }
                })
                    .then(function (response) {
                    ctrl.newsfeed = ctrl.newsfeed.concat(_(response.data).map(function (item, index) {
                        item.trusted_content = $sce.trustAsHtml(item.content);
                        item.no_image = _(item.image).isNull();
                        item.pubDate = moment(new Date(item.pubDate)).toDate();
                        if (_(item.image).isNull()) {
                            item.image = _(RANDOM_IMAGES).sample();
                        }
                        return item;
                    }));
                });
            };
            ctrl.config_news_fluxes = function () {
                Popups.manage_fluxes(function () {
                    ctrl.retrieve_news(true);
                }, function error() { });
            };
            ctrl.$onInit = function () {
                currentUser.get(false).then(function (user) {
                    ctrl.user = user;
                    ctrl.retrieve_news(false);
                });
            };
        }],
    template: "\n<ul class=\"noir\" rn-carousel rn-carousel-buffered rn-carousel-auto-slide=\"6\" rn-carousel-index=\"$ctrl.carouselIndex\">\n    <li ng:repeat=\"slide in $ctrl.newsfeed | orderBy:'pubDate':true\" active=\"slide.active\"\n        ng:class=\"{'publipostage': slide.title == 'Publipostage', 'no-image': slide.no_image}\">\n        <div class=\"carousel-image\"\n             ng:style=\"{'background-image': 'url(' + slide.image + ')'}\"></div>\n        <div class=\"carousel-caption\">\n            <span class=\"pub-date\" ng:cloak>{{ slide.pubDate | date:'medium' }}</span>\n            <a href=\"{{ slide.link }}\" target=\"_blank\" ng:if=\"slide.link != 'notYetImplemented'\">\n                <h6 ng:cloak>{{ slide.title }}</h6>\n            </a>\n            <h6 ng:if=\"slide.link == 'notYetImplemented'\">{{ slide.title }}</h6>\n            <p ng:bind-html=\"slide.trusted_content\"></p>\n        </div>\n    </li>\n    <div class=\"hidden-xs hidden-sm angular-carousel-indicators\"\n         rn-carousel-indicators\n         slides=\"$ctrl.newsfeed\"\n         rn-carousel-index=\"$ctrl.carouselIndex\">\n    </div>\n    <span class=\"hidden-xs hidden-sm floating-button big toggle bouton-config-news blanc\"\n          ng:if=\"$ctrl.user.is_admin() && $ctrl.edition\"\n          ng:click=\"$ctrl.config_news_fluxes()\"></span>\n</ul>\n"
});
angular.module('portailApp')
    .component('portail', {
    controller: ['$sce', '$state', '$uibModal', '$q', 'CASES', 'COULEURS', 'currentUser', 'Utils', 'CCN', 'Tiles', 'APP_PATH', 'CACHE_BUSTER', 'User', 'Annuaire', 'URL_ENT', 'Popups',
        function ($sce, $state, $uibModal, $q, CASES, COULEURS, currentUser, Utils, CCN, Tiles, APP_PATH, CACHE_BUSTER, User, Annuaire, URL_ENT, Popups) {
            var ctrl = this;
            ctrl.$onInit = function () {
                currentUser.get(true)
                    .then(function (user) {
                    ctrl.user = user;
                    ctrl.prefix = APP_PATH;
                    ctrl.COULEURS = COULEURS;
                    ctrl.CACHE_BUSTER = CACHE_BUSTER;
                    ctrl.get_tile_template = function (taxonomy) {
                        var tiles_templates = {
                            app: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                            back: 'app/views/tile_app.html?v=' + CACHE_BUSTER,
                            regroupement: 'app/views/tile_regroupement.html?v=' + CACHE_BUSTER,
                            eleve: 'app/views/tile_eleve.html?v=' + CACHE_BUSTER,
                            rn: 'app/views/tile_rn.html?v=' + CACHE_BUSTER,
                            ccn: 'app/views/tile_ccn.html?v=' + CACHE_BUSTER
                        };
                        return tiles_templates[taxonomy];
                    };
                    ctrl.filter_criteria = {};
                    var go_to_root_tile = {
                        index: 0,
                        taxonomy: 'back',
                        name: '← Retour',
                        description: 'Retour',
                        color: 'gris3',
                        action: function () {
                            ctrl.tree = ctrl.tiles;
                            ctrl.parent = null;
                        }
                    };
                    var tool_tile = function (node) {
                        var go_to_parent_tile = function (parent) {
                            var back_to_parent = angular.copy(go_to_root_tile);
                            back_to_parent.action = parent.action;
                            return back_to_parent;
                        };
                        var default_filter = function () {
                            return function (tile) {
                                return true;
                            };
                        };
                        var app_specific = {
                            CCNUM: {
                                action: function () {
                                    if (ctrl.modification) {
                                        return;
                                    }
                                    ctrl.tree = {
                                        configurable: false,
                                        filter: default_filter,
                                        aside_template: 'app/views/aside_CCNUM.html?v=' + CACHE_BUSTER,
                                        tiles: Utils.pad_tiles_tree([go_to_root_tile]
                                            .concat(CCN.query()
                                            .map(function (ccn, index) {
                                            ccn.taxonomy = 'ccn';
                                            ccn.index = index + 1;
                                            if (_(ccn).has('leaves')) {
                                                ccn.action = function () {
                                                    ctrl.tree = {
                                                        configurable: false,
                                                        filter: default_filter,
                                                        aside_template: 'app/views/aside_CCNUM_archives.html?v=' + CACHE_BUSTER,
                                                        tiles: [go_to_parent_tile(node)].concat(ccn.leaves.map(function (ccn, index) {
                                                            ccn.taxonomy = 'ccn';
                                                            ccn.index = index + 1;
                                                            return ccn;
                                                        }))
                                                    };
                                                    ctrl.parent = ccn;
                                                };
                                            }
                                            return ccn;
                                        })))
                                    };
                                    ctrl.parent = node;
                                }
                            },
                            GAR: {
                                action: function () {
                                    if (ctrl.modification) {
                                        return;
                                    }
                                    currentUser.ressources().then(function (response) {
                                        ctrl.tree = {
                                            configurable: false,
                                            filter: default_filter,
                                            aside_template: 'app/views/aside_RN.html?v=' + CACHE_BUSTER,
                                            tiles: Utils.pad_tiles_tree([go_to_root_tile].concat(response.map(function (rn, index) {
                                                rn.taxonomy = 'rn';
                                                rn.index = index + 1;
                                                rn.icon = APP_PATH + '/app/node_modules/laclasse-common-client/images/' + (rn.type === 'MANUEL' ? '05_validationcompetences.svg' : (rn.type === 'AUTRE' ? '07_blogs.svg' : '08_ressources.svg'));
                                                rn.color = CASES[index % 16].color;
                                                rn.action = function () { Utils.log_and_open_link('GAR', rn.url); };
                                                return rn;
                                            })))
                                        };
                                        ctrl.parent = node;
                                    });
                                }
                            },
                            TROMBI: {
                                action: function () {
                                    if (ctrl.modification) {
                                        return;
                                    }
                                    ctrl.filter_criteria = {
                                        show_classes: true,
                                        show_groupes_eleves: true,
                                        show_groupes_libres: true,
                                        text: ''
                                    };
                                    ctrl.get_structure = function (structure_id) {
                                        return Annuaire.get_structure(structure_id)
                                            .then(function (response) {
                                            return response.data;
                                        });
                                    };
                                    currentUser.groups().then(function (response) {
                                        ctrl.tree = {
                                            configurable: false,
                                            filter: function () {
                                                return function (tile) {
                                                    return tile.taxonomy === 'back'
                                                        || (tile.taxonomy !== 'regroupement'
                                                            || (_(ctrl.filter_criteria).has('show_classes') && ctrl.filter_criteria.show_classes && tile.type === 'CLS')
                                                            || (_(ctrl.filter_criteria).has('show_groupes_eleves') && ctrl.filter_criteria.show_groupes_eleves && tile.type === 'GRP')
                                                            || (_(ctrl.filter_criteria).has('show_groupes_libres') && ctrl.filter_criteria.show_groupes_libres && tile.type === 'GPL'))
                                                            && ((!_(tile).has('name')
                                                                || _(ctrl.filter_criteria.text).isEmpty()
                                                                || tile.name.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase()))
                                                                || (!_(tile).has('structure')
                                                                    || _(ctrl.filter_criteria.text).isEmpty()
                                                                    || tile.structure.name.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase())));
                                                };
                                            },
                                            aside_template: 'app/views/aside_TROMBI_regroupements.html?v=' + CACHE_BUSTER,
                                            tiles: Utils.pad_tiles_tree([go_to_root_tile].concat(response.map(function (regroupement, index) {
                                                regroupement.taxonomy = 'regroupement';
                                                regroupement.index = index + 1;
                                                switch (regroupement.type) {
                                                    case 'CLS':
                                                        regroupement.color = 'vert';
                                                        break;
                                                    case 'GRP':
                                                        regroupement.color = 'bleu';
                                                        break;
                                                    default:
                                                        regroupement.color = 'jaune';
                                                }
                                                regroupement.color += index % 2 === 0 ? '' : '-moins';
                                                regroupement.action = function () {
                                                    ctrl.filter_criteria.text = '';
                                                    Annuaire.get_users(_(regroupement.users).pluck('user_id'))
                                                        .then(function (response) {
                                                        ctrl.tree = {
                                                            configurable: false,
                                                            filter: function () {
                                                                return function (tile) {
                                                                    return tile.taxonomy !== 'eleve'
                                                                        || _(ctrl.filter_criteria.text).isEmpty()
                                                                        || tile.lastname.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase())
                                                                        || tile.firstname.toUpperCase().includes(ctrl.filter_criteria.text.toUpperCase());
                                                                };
                                                            },
                                                            aside_template: 'app/views/aside_TROMBI_people.html?v=' + CACHE_BUSTER,
                                                            tiles: Utils.pad_tiles_tree([go_to_parent_tile(node)].concat(response.data.map(function (eleve, index) {
                                                                eleve.taxonomy = 'eleve';
                                                                eleve.index = index + 1;
                                                                eleve.color = 'jaune';
                                                                eleve.color += index % 2 === 0 ? '' : '-moins';
                                                                eleve.avatar = (_(eleve.avatar.match(/^(user|http)/)).isNull() ? URL_ENT + '/' : '') + eleve.avatar;
                                                                return eleve;
                                                            })))
                                                        };
                                                        ctrl.parent = node;
                                                    });
                                                };
                                                return regroupement;
                                            })))
                                        };
                                        ctrl.parent = node;
                                    });
                                }
                            }
                        };
                        node.configure = false;
                        node.toggle_configure = function () {
                            ctrl.tree.tiles.forEach(function (tile) {
                                tile.configure = tile.index === node.index ? !tile.configure : false;
                            });
                        };
                        node.dirty = {};
                        node.is_dirty = function (field) {
                            node.dirty[field] = true;
                        };
                        node.to_delete = false;
                        node.remove = function () {
                            node.to_delete = !node.to_delete;
                            node.dirty = node.dirty || node.to_delete;
                            node.configure = false;
                        };
                        if (!_(app_specific[node.application_id]).isUndefined() && _(app_specific[node.application_id]).has('action')) {
                            node.action = app_specific[node.application_id].action;
                        }
                        else {
                            node.action = function () {
                                if (ctrl.modification) {
                                    return;
                                }
                                if (node.type !== 'EXTERNAL' && !_(node.application_id).isNull() && node.application_id !== 'PRONOTE') {
                                    $state.go('app', { appid: node.application_id });
                                }
                                else {
                                    Utils.log_and_open_link(node.application_id === 'PRONOTE' ? 'PRONOTE' : 'EXTERNAL', node.url);
                                }
                            };
                        }
                        return node;
                    };
                    var retrieve_tiles_tree = function () {
                        currentUser.tiles()
                            .then(function (response) {
                            response.forEach(function (app) { app.taxonomy = 'app'; });
                            var tiles = _(response)
                                .select(function (app) {
                                var now = moment();
                                var is_it_summer = now.month() == 7;
                                return (!is_it_summer
                                    || (app.summer
                                        || (!_(ctrl.user.profiles).isEmpty()
                                            && !_(['ELV', 'TUT']).includes(ctrl.user.active_profile().type))))
                                    && (!ctrl.user.profiles || !ctrl.user.active_profile() || (ctrl.user.is_admin() || !_(app.hidden).includes(ctrl.user.active_profile().type)))
                                    && (app.application_id === 'MAIL' ? _.chain(ctrl.user.emails).pluck('type').includes('Ent').value() : true);
                            })
                                .map(tool_tile);
                            tiles = Utils.fill_empty_tiles(tiles);
                            tiles = _(tiles).sortBy(function (tile) { return tile.index; });
                            tiles = Utils.pad_tiles_tree(tiles);
                            ctrl.tiles = {
                                configurable: true,
                                aside_template: 'app/views/aside_news.html?v=' + CACHE_BUSTER,
                                tiles: tiles
                            };
                            go_to_root_tile.action();
                        });
                    };
                    ctrl.modification = false;
                    ctrl.edit_tiles = function () {
                        ctrl.modification = true;
                    };
                    ctrl.exit_tiles_edition = function () {
                        ctrl.modification = false;
                        retrieve_tiles_tree();
                    };
                    var sortable_callback = function (event) {
                        _(ctrl.tree.tiles).each(function (tile, i) {
                            tile.index = i;
                            if (!_(tile).has('dirty')) {
                                tile.dirty = {};
                            }
                            tile.dirty.index = true;
                        });
                    };
                    ctrl.sortable_options = {
                        accept: function (sourceItemHandleScope, destSortableScope) { return true; },
                        longTouch: true,
                        itemMoved: sortable_callback,
                        orderChanged: sortable_callback,
                        containment: '.damier',
                        containerPositioning: 'relative',
                        additionalPlaceholderClass: 'col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case',
                        clone: false,
                        allowDuplicates: false
                    };
                    ctrl.add_tile = function (tiles) {
                        Popups.add_tiles(tiles, function success(new_tiles) {
                            $q.all(_(new_tiles).map(function (new_tile) {
                                var recipient_index = _(tiles).findIndex(function (tile) { return !_(tile).has('taxonomy'); });
                                if (recipient_index === -1) {
                                    recipient_index = tiles.length;
                                    tiles.push({ index: recipient_index });
                                }
                                tiles[recipient_index] = tool_tile(new_tile);
                                tiles[recipient_index].index = recipient_index;
                                if (!_(new_tile).has('id')) {
                                    tiles[recipient_index].to_create = true;
                                }
                            }));
                        }, function error() { });
                    };
                    ctrl.save_tiles_edition = function (should_save) {
                        var promises = [];
                        promises.concat(_.chain(ctrl.tree.tiles)
                            .where({ to_delete: true })
                            .map(function (tile) {
                            switch (tile.taxonomy) {
                                case 'app':
                                    return Tiles.delete({ id: tile.id }).$promise;
                                case 'rn':
                                default:
                                    console.log(tile);
                                    return null;
                            }
                        }));
                        promises.concat(_.chain(ctrl.tree.tiles)
                            .select(function (tile) {
                            return _(tile).has('id')
                                && !_(tile).has('to_create')
                                && _(tile).has('dirty')
                                && !_(tile.dirty).isEmpty();
                        })
                            .map(function (tile) {
                            switch (tile.taxonomy) {
                                case 'app':
                                    var updated_fields = {};
                                    _.chain(tile.dirty)
                                        .keys()
                                        .each(function (field) {
                                        updated_fields[field] = tile[field];
                                    });
                                    return Tiles.update({ id: tile.id }, updated_fields);
                                case 'rn':
                                default:
                                    console.log(tile);
                                    return null;
                            }
                        }));
                        promises.concat(_.chain(ctrl.tree.tiles)
                            .where({ to_create: true })
                            .map(function (tile) {
                            switch (tile.taxonomy) {
                                case 'app':
                                    tile.structure_id = ctrl.user.active_profile().structure_id;
                                    return Tiles.save({}, tile).$promise;
                                case 'rn':
                                default:
                                    console.log(tile);
                                    return null;
                            }
                        }));
                        $q.all(promises).then(function (response) {
                            ctrl.tree.tiles = Utils.fill_empty_tiles(_(ctrl.tree.tiles).reject(function (tile) { return tile.to_delete; }));
                        });
                        ctrl.modification = false;
                        ctrl.tree.tiles.forEach(function (tile) {
                            if (_(tile).has('configure')) {
                                tile.configure = false;
                            }
                        });
                    };
                    retrieve_tiles_tree();
                });
            };
        }],
    template: "\n<div class=\"row portail\"\n     ng:if=\"$ctrl.user\">\n    <div class=\"col-xs-12 col-sm-12 col-md-4 col-lg-4 aside\">\n        <help-icon class=\"btn-group hidden-xs help-icon\"\n                   user=\"$ctrl.user\"></help-icon>\n\n        <logo class=\"col-xs-1 col-sm-1 col-md-6 col-lg-6 logolaclasse gris4\"\n              user=\"$ctrl.user\"></logo>\n\n        <user-tile user=\"$ctrl.user\"></user-tile>\n\n        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 hidden-xs hidden-sm aside-bottom\"\n             ng:include=\"$ctrl.user.edit_profile ? 'app/views/aside_news.html?v=' + $ctrl.CACHE_BUSTER : $ctrl.tree.aside_template\"></div>\n    </div>\n\n    <div class=\"col-xs-12 col-sm-12 col-md-8 col-lg-8\">\n        <div class=\"row user-profil\"\n             ng:if=\"$ctrl.user.edit_profile\">\n            <user-profile user=\"$ctrl.user\"></user-profile>\n        </div>\n\n        <div class=\"row damier gris4\"\n             ng:class=\"{'modification': $ctrl.modification}\"\n             ng:if=\"!$ctrl.user.edit_profile\">\n\n            <ul data-as-sortable=\"$ctrl.sortable_options\"\n                data-is-disabled=\"!$ctrl.modification\"\n                ng:model=\"$ctrl.tree.tiles\">\n\n                <li ng:repeat=\"tile in $ctrl.tree.tiles | filter:$ctrl.tree.filter() | orderBy:'index'\"\n                    class=\"col-xs-6 col-sm-4 col-md-3 col-lg-3 petite case animate scale-fade-in {{tile.color}}\"\n                    data-as-sortable-item\n                    ng:class=\"{ 'empty hidden-xs': !tile.taxonomy }\">\n                    <div ng:include=\"$ctrl.get_tile_template( tile.taxonomy )\"></div>\n                </li>\n            </ul>\n\n            <!-- Mode normal -->\n            <span class=\"hidden-xs hidden-sm floating-button toggle big off blanc\"\n                  ng:if=\"$ctrl.tree.configurable && $ctrl.user.is_admin() && !$ctrl.modification\"\n                  ng:click=\"$ctrl.edit_tiles()\"></span>\n\n            <!-- Mode modification -->\n            <span class=\"hidden-xs hidden-sm floating-button toggle big on gris4\"\n                  ng:if=\"$ctrl.modification\"></span>\n            <span class=\"floating-button small cancel gris3\"\n                  ng:if=\"$ctrl.modification\"\n                  ng:click=\"$ctrl.exit_tiles_edition()\"></span>\n            <span class=\"floating-button small save gris1\"\n                  ng:if=\"$ctrl.modification\"\n                  ng:click=\"$ctrl.save_tiles_edition()\"></span>\n\n            <span class=\"floating-button small action1 add-app gris1\"\n                  ng:if=\"$ctrl.modification\"\n                  ng:click=\"$ctrl.add_tile( $ctrl.tree.tiles )\"></span>\n        </div>\n\n    </div>\n</div>\n"
});
angular.module('portailApp')
    .component('profilactif', {
    bindings: { user: '<' },
    controller: ['Annuaire', '$state', '$stateParams', 'currentUser',
        function (Annuaire, $state, $stateParams, currentUser) {
            var ctrl = this;
            ctrl.apply_change = function () {
                currentUser.activate_profile(ctrl.current_profile.id)
                    .then(function () {
                    $state.transitionTo($state.current, $stateParams, { reload: true, inherit: true, notify: true });
                });
            };
            ctrl.$onInit = function () {
                ctrl.user.profiles.forEach(function (profile) {
                    Annuaire.get_structure(profile.structure_id)
                        .then(function (response) {
                        profile.structure = response.data;
                    });
                    Annuaire.get_profile_type(profile.type)
                        .then(function (response) {
                        profile.profile = response.data;
                    });
                });
                ctrl.current_profile = ctrl.user.active_profile();
            };
        }],
    template: "\n<select ng:disabled=\"$ctrl.user.profiles.length <= 1\"\n        ng:model=\"$ctrl.current_profile\"\n        ng:change=\"$ctrl.apply_change()\"\n        ng:options=\"profile as profile.structure.name + ' : ' + profile.profile.name group by profile.structure.name for profile in $ctrl.user.profiles track by profile.id\" >\n</select>\n"
});
angular.module('portailApp')
    .component('userProfile', {
    bindings: { user: '=' },
    controller: ['toastr', 'currentUser', 'APP_PATH', 'Utils', 'User',
        function (toastr, currentUser, APP_PATH, Utils, User) {
            var ctrl = this;
            ctrl.dirty = {};
            ctrl.min_password_strength = 1;
            ctrl.prefix = APP_PATH;
            ctrl.groups = [{
                    ouvert: true,
                    enabled: true
                },
                {
                    ouvert: true,
                    enabled: true
                }];
            ctrl.password = {
                new1: '',
                new2: ''
            };
            ctrl.open_datepicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            };
            ctrl.mark_as_dirty = function (key) {
                ctrl.dirty[key] = true;
            };
            ctrl.filter_emails = function () {
                return function (email) {
                    return (ctrl.user.active_profile().type !== 'TUT'
                        || email.type !== 'Ent')
                        && _(email.asdress.match(email.user_id)).isNull();
                };
            };
            ctrl.save = function () {
                if (!_(ctrl.dirty).isEmpty()) {
                    var mod_user_1 = {};
                    var bad_password = false;
                    _(ctrl.dirty).keys().forEach(function (key) {
                        mod_user_1[key] = ctrl.user[key];
                    });
                    if (ctrl.dirty.password && !_(ctrl.password.new1).isEmpty() && ctrl.password.new1 === ctrl.password.new2 && ctrl.passwordStrength.score > ctrl.min_password_strength) {
                        mod_user_1.password = ctrl.password.new1;
                    }
                    else {
                        delete mod_user_1.password;
                        bad_password = ctrl.dirty.password && (ctrl.password.new1 != ctrl.password.new2 || ctrl.passwordStrength.score <= ctrl.min_password_strength);
                    }
                    if (bad_password) {
                        if (ctrl.password.new1 != ctrl.password.new2) {
                            alert('Confirmation de mot de passe incorrecte.');
                        }
                        else if (ctrl.passwordStrength.score <= ctrl.min_password_strength) {
                            alert('Mot de passe trop faible.');
                        }
                    }
                    else if (!_(mod_user_1).isEmpty()) {
                        User.update({ id: ctrl.user.id }, mod_user_1).$promise
                            .then(function success(response) {
                            toastr.success('Mise à jour effectuée.');
                        }, function error(response) { });
                    }
                }
            };
            ctrl.$onInit = function () {
                ctrl.user.editable = _(ctrl.user.aaf_jointure_id).isNull();
                ctrl.user.birthdate = new Date(ctrl.user.birthdate);
            };
        }],
    template: "\n                                                        <header>\n                                                          <h3>Profil utilisateur</h3>\n                                                          <h1>{{$ctrl.user.firstname}} {{$ctrl.user.lastname}}</h1>\n                                                        </header>\n                                                        <div class=\"form\">\n                                                          <form>\n                                                            <div class=\"avatar-container form-group col-md-4 col-xs-12 pull-right\">\n                                                              <label>Avatar :</label>\n                                                              <avatar></avatar>\n                                                            </div>\n\n                                                            <accordion close-others=\"false\" class=\"col-md-8 col-xs-12 pull-left\">\n\n                                                              <accordion-group data-is-open=\"$ctrl.groups[ 0 ].ouvert\" ng:if=\"$ctrl.groups[ 0 ].enabled\">\n                                                                <accordion-heading>\n                                                                  <span class=\"glyphicon\" ng:class=\"{'glyphicon-chevron-down': $ctrl.groups[ 0 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 0 ].ouvert}\"></span> Informations\n                                                                </accordion-heading>\n                                                                <div class=\"row\">\n\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"nom\">Nom :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"nom\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"!$ctrl.user.editable\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'lastname' )\"\n                                                                           ng:model=\"$ctrl.user.lastname\">\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"prenom\">Pr\u00E9nom :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"prenom\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"!$ctrl.user.editable\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'firstname' )\"\n                                                                           ng:model=\"$ctrl.user.firstname\">\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"datenaissance\">Date de naissance :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"date_naissance\"\n                                                                           class=\"form-control\"\n                                                                           disabled\n                                                                           value=\"{{$ctrl.user.birthdate | amDateFormat: 'LL'}}\"\n                                                                           ng:if=\"!$ctrl.user.editable\" />\n                                                                    <div uib-dropdown\n                                                                         id=\"datenaissance\"\n                                                                         class=\"dropdown form-control date-naissance\"\n                                                                         ng:if=\"$ctrl.user.editable\">\n                                                                      <a uib-dropdown-toggle\n                                                                         class=\"dropdown-toggle\"\n                                                                         role=\"button\"\n                                                                         data-toggle=\"uib-dropdown\"\n                                                                         data-target=\"#\"\n                                                                         href>{{$ctrl.user.birthdate | amDateFormat: 'LL'}}</a>\n                                                                      <div uib-dropdown-menu\n                                                                           class=\"dropdown-menu\"\n                                                                           role=\"menu\"\n                                                                           ng:click=\"$event.stopImmediatePropagation()\">\n                                                                        <div uib-datepicker\n                                                                             datepicker-options=\"datepicker_options\"\n                                                                             ng:disabled=\"!$ctrl.user.editable\"\n                                                                             ng:change=\"$ctrl.mark_as_dirty( 'birthdate' )\"\n                                                                             ng:model=\"$ctrl.user.birthdate\"\n                                                                             ng:required=\"true\">\n                                                                        </div>\n                                                                      </div>\n                                                                    </div>\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"adresse\">Adresse :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"adresse\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"!$ctrl.user.editable\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'address' )\"\n                                                                           ng:model=\"$ctrl.user.address\">\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"codepostal\">Code postal :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"codepostal\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"!$ctrl.user.editable\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'zip_code' )\"\n                                                                           ng:model=\"$ctrl.user.zip_code\">\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"ville\">Ville :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"ville\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"!$ctrl.user.editable\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'city' )\"\n                                                                           ng:model=\"$ctrl.user.city\">\n                                                                  </div>\n\n                                                                  <div class=\"form-group col-md-6 col-xs-12\"\n                                                                       ng:repeat=\"email in $ctrl.user.emails | orderBy:'primary':true | filter:filter_emails()\">\n                                                                    <label for=\"courriel\">Courriel <span ng:if=\"email.primary\">principal</span> :</label>\n                                                                    <input type=\"text\"\n                                                                           id=\"courriel\"\n                                                                           class=\"form-control\"\n                                                                           ng:disabled=\"true\"\n                                                                           ng:model=\"email.address\">\n                                                                  </div>\n                                                                </div>\n\n                                                              </accordion-group>\n\n                                                              <accordion-group data-is-open=\"$ctrl.groups[ 1 ].ouvert\" ng:if=\"$ctrl.groups[ 1 ].enabled\">\n                                                                <accordion-heading>\n                                                                  <span class=\"glyphicon\" ng:class=\"{'glyphicon-chevron-down': $ctrl.groups[ 1 ].ouvert, 'glyphicon-chevron-right': !$ctrl.groups[ 1 ].ouvert}\"></span> Mot de passe<span style=\"font-weight: bold; color: rgba(235,84,84,0.75)\" ng:if=\"$ctrl.user.default_password\">, pensez \u00E0 le changer...</span>\n                                                                </accordion-heading>\n                                                                <div class=\"row\">\n                                                                  <div class=\"form-group col-md-6 col-xs-12\">\n                                                                    <label for=\"newpasswd1\">Nouveau mot de passe :</label>\n                                                                    <input type=\"password\" class=\"form-control\" id=\"newpasswd1\"\n                                                                           ng:change=\"$ctrl.mark_as_dirty( 'password' )\"\n                                                                           ng:model=\"$ctrl.password.new1\"\n                                                                           zxcvbn=\"$ctrl.passwordStrength\"\n                                                                           zx-min-score=\"$ctrl.min_password_strength\">\n                                                                    <div class=\"password-strength\"\n                                                                         ng:if=\"$ctrl.dirty.password && $ctrl.password.new1 !== ''\">\n                                                                      <label>Qualit\u00E9 du mot de passe :</label>\n                                                                      <uib-progressbar style=\"margin-bottom: 0;\" max=\"5\" value=\"$ctrl.passwordStrength.score + 1\"\n                                                                                       type=\"{{ ( $ctrl.passwordStrength.score < 2 ) ? 'danger' : ( ( $ctrl.passwordStrength.score < 3 ) ? 'warning' : ( ( $ctrl.passwordStrength.score < 4 ) ? 'primary' : 'success' ) ) }}\">\n                                                                        <span ng:switch=\"$ctrl.passwordStrength.score\">\n                                                                          <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"0\">Trop faible</span>\n                                                                          <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"1\">Faible</span>\n                                                                          <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"2\">Moyen</span>\n                                                                          <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"3\">Bon</span>\n                                                                          <span style=\"color:white; white-space:nowrap;\" ng:switch-when=\"4\">Excellent</span>\n                                                                        </span>\n                                                                      </uib-progressbar>\n                                                                      <uib-progressbar max=\"5\" value=\"$ctrl.min_password_strength + 1\"\n                                                                                       type=\"primary\">\n                                                                        <span style=\"color:white; white-space:nowrap;\">Minimum acc\u00E9pt\u00E9</span>\n                                                                      </uib-progressbar>\n                                                                    </div>\n                                                                  </div>\n                                                                  <div class=\"form-group col-md-6 col-xs-12\"\n                                                                       ng:class=\"{'has-error': $ctrl.password.new1 !== $ctrl.password.new2 }\">\n                                                                    <label for=\"newpasswd2\">Confirmer le nouveau mot de passe :</label>\n                                                                    <input type=\"password\" class=\"form-control\" id=\"newpasswd2\"\n                                                                           ng:model=\"$ctrl.password.new2\">\n                                                                  </div>\n                                                                </div>\n                                                              </accordion-group>\n\n                                                              <footer>\n                                                                <button ng:click=\"$ctrl.save()\">Enregistrer</button>\n                                                              </footer>\n                                                            </accordion>\n                                                          </form>\n                                                        </div>\n"
});
angular.module('portailApp')
    .component('userTile', {
    bindings: { user: '<' },
    controller: ['APP_PATH', 'URL_ENT',
        function (APP_PATH, URL_ENT) {
            var ctrl = this;
            ctrl.APP_PATH = APP_PATH;
            ctrl.change_password_message = 'Pensez à changer votre mot de passe...';
            ctrl.edit_profile = function () {
                ctrl.user.edit_profile = !ctrl.user.edit_profile;
            };
            ctrl.$onInit = function () {
                ctrl.url_avatar = URL_ENT + '/' + ctrl.user.avatar;
            };
        }],
    template: "\n<div class=\"col-xs-11 col-sm-11 col-md-6 col-lg-6 user\"\n     ng:style=\"{ 'background-image': 'url(' + $ctrl.url_avatar + ')' }\">\n    <div class=\"user-info-bg\">\n        <span class=\"user-info\">\n            <a href style=\"text-decoration: none;\" ng:click=\"$ctrl.edit_profile()\">\n                <h4 class=\"hidden-xs hidden-sm full-name\">{{$ctrl.user.firstname}} {{$ctrl.user.lastname}}\n                    <sup ng:if=\"$ctrl.user.default_password\"><span class=\"glyphicon glyphicon-alert default-password\" aria-hidden=\"true\" data-descr=\"{{$ctrl.change_password_message}}\"></span></sup>\n                </h4>\n                <h4 class=\"hidden-md hidden-lg initiales\">{{$ctrl.user.firstname[0]}}{{$ctrl.user.lastname[0]}}</h4>\n            </a>\n            <profilactif class=\"gris4\"\n                         ng:if=\"$ctrl.user.profiles\"\n                         user=\"$ctrl.user\"></profilactif>\n            <a class=\"btn hidden-xs hidden-sm logout\" ng:href=\"/sso/logout\" title=\"D\u00E9connexion de Laclasse.com\">se d\u00E9connecter</a>\n        </span>\n    </div>\n</div>\n"
});
angular.module('portailApp')
    .factory('Flux', ['$resource', 'URL_ENT',
    function ($resource, URL_ENT) {
        return $resource(URL_ENT + '/api/flux/:id', {
            id: '@id',
            structure_id: '@structure_id',
            url: '@url',
            name: '@name'
        }, {
            get: { isArray: true },
            update: { method: 'PUT' }
        });
    }]);
angular.module('portailApp')
    .factory('RessourceNumerique', ['$resource', 'URL_ENT',
    function ($resource, URL_ENT) {
        return $resource(URL_ENT + 'api/structures/:id/ressources/:ressource_id', {
            id: '@id',
            ressource_id: '@ressource_id',
            ressource_num_id: '@ressource_num_id',
            date_deb_abon: '@date_deb_abon',
            date_fin_abon: '@date_fin_abon'
        }, {
            query_default: {
                methode: 'GET',
                url: URL_ENT + 'api/ressources/',
                isArray: true
            }
        });
    }]);
angular.module('portailApp')
    .factory('Tiles', ['$resource', 'URL_ENT', 'CONFIG',
    function ($resource, URL_ENT, CONFIG) {
        var Tile = $resource(URL_ENT + '/api/tiles/:id', {
            id: '@id',
            structure_id: '@structure_id',
            application_id: '@application_id',
            index: '@index',
            type: '@type',
            name: '@name',
            description: '@description',
            url: '@url',
            icon: '@icon',
            color: '@color'
        }, {
            update: { method: 'PUT' },
            query: {
                method: 'GET',
                cache: false,
                isArray: true,
                transformResponse: function (response, _headers_getters) {
                    return _(angular.fromJson(response))
                        .map(function (app) {
                        if (!_(CONFIG.apps.default[app.application_id]).isUndefined()) {
                            return _(CONFIG.apps.default[app.application_id]).extend(app);
                        }
                        else {
                            return app;
                        }
                    });
                }
            }
        });
        return Tile;
    }]);
angular.module('portailApp')
    .factory('User', ['$resource', 'URL_ENT',
    function ($resource, URL_ENT) {
        var User = $resource(URL_ENT + '/api/users/:id', {
            id: '@id',
            firstname: '@firstname',
            lastname: '@lastname',
            gender: '@gender',
            birthdate: '@birthdate',
            address: '@address',
            zip_code: '@zip_code',
            city: '@city',
            password: '@password'
        }, {
            get: { cache: false },
            update: { method: 'PUT' },
            upload_avatar: {
                method: 'POST',
                url: URL_ENT + '/api/users/:id/upload/avatar',
                transformRequest: function (request) {
                    var fd = new FormData();
                    fd.append('image', request.new_avatar.blob, 'new_avatar.png');
                    fd.append('fileFormDataName', 'image');
                    delete request.new_avatar;
                    return fd;
                },
                headers: { 'Content-Type': undefined }
            }
        });
        User.prototype.active_profile = function () {
            return _(this.profiles).findWhere({ active: true });
        };
        User.prototype.is_admin = function () {
            return (_(this).has('super_admin') && this.super_admin)
                || (!_(this.profiles).isEmpty() && (!_.chain(this.profiles).findWhere({ structure_id: this.active_profile().structure_id, type: 'DIR' }).isUndefined().value()
                    || !_.chain(this.profiles).findWhere({ structure_id: this.active_profile().structure_id, type: 'ADM' }).isUndefined().value()));
        };
        return User;
    }]);
angular.module('portailApp')
    .service('CCN', ['Utils', 'currentUser',
    function (Utils, currentUser) {
        var service = this;
        service.query = function () {
            var ccns = [{
                    nom: '14-18',
                    description: '14-18',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_14-18.svg',
                    color: 'jaune',
                    action: function () { Utils.log_and_open_link('CCN', 'http://14-18.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'Zérogaspi',
                    description: 'Zérogaspi',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_zero-gaspi.svg',
                    color: 'bleu',
                    action: function () { Utils.log_and_open_link('CCN', 'http://zerogaspi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'AIR',
                    description: 'Assises du Roman',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_air-2014.svg',
                    color: 'jaune',
                    action: function () { Utils.log_and_open_link('CCN', 'http://air.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'Habiter',
                    description: 'Représentations cartographiques de l\'espace vécu',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_habiter.svg',
                    color: 'vert',
                    action: function () { Utils.log_and_open_link('CCN', 'http://habiter.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'Code',
                    description: 'Mener un projet de code créatif avec sa classe et réaliser un jeu en réseau',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_code.svg',
                    color: 'orange-brillant',
                    action: function () { Utils.log_and_open_link('CCN', 'http://code.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'Polar / Krimi',
                    description: 'Ecrire un roman illustré franco-allemand avec un auteur de polar et un illustrateur, en collaboration avec des collégiens allemands',
                    icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_krimi.svg',
                    color: 'bleu-fonce',
                    action: function () { Utils.log_and_open_link('CCN', 'http://krimi.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                },
                {
                    nom: 'Projets archivés',
                    description: 'Projets archivés',
                    icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                    color: 'gris1',
                    leaves: [{
                            nom: 'Théâtre',
                            description: 'Théâtre',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_theatre.svg',
                            color: 'rouge',
                            action: function () { Utils.log_and_open_link('CCN', 'http://theatre.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            nom: 'Philo',
                            description: 'Philo',
                            action: function () { Utils.log_and_open_link('CCN', 'http://philo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); },
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_philo.svg',
                            color: 'violet'
                        },
                        {
                            color: 'gris2',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_miam.svg',
                            nom: 'Miam',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://miam.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'bleu',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_odysseespatiale.svg',
                            nom: 'Odyssée spatiale',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://novaterra.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'jaune',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_archeologie.svg',
                            nom: 'Archéologie',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://archeologies.laclasse.com/'); }
                        },
                        {
                            color: 'orange',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_bd.svg',
                            nom: 'BD',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://bd.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'violet',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cine.svg',
                            nom: 'Ciné',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://cine.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'vert',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_cluemo.svg',
                            nom: 'Cluémo',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://cluemo.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'rouge',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_etudiantsvoyageurs.svg',
                            nom: 'Etudiants voyageurs',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://etudiantsvoyageurs.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'vert',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_finisterrae.svg',
                            nom: 'Finisterrae',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://finisterrae.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'gris4',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_dechetmatiere.svg',
                            nom: 'Le déchet matière',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://ledechetmatiere.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'violet',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_maisondeladanse.svg',
                            nom: 'Maison de la danse',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://maisondeladanse.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'bleu',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_musique.svg',
                            nom: 'Musique',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://musique.laclasse.com/'); }
                        },
                        {
                            color: 'jaune',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_science.svg',
                            nom: 'Science',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://science.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        },
                        {
                            color: 'orange',
                            icon: '/app/node_modules/laclasse-common-client/images/thematiques/icon_picture.svg',
                            nom: 'Picture',
                            titre: '',
                            action: function () { Utils.log_and_open_link('CCN', 'http://picture.laclasse.com/?url=spip.php%3Fpage%3Dsommaire&cicas=oui'); }
                        }]
                }];
            currentUser.get(false)
                .then(function (user) {
                if (['DIR', 'ENS', 'DOC'].includes(user.active_profile().type)) {
                    ccns.push({
                        nom: 'Projets 2017-2018',
                        description: '',
                        icon: '/app/node_modules/laclasse-common-client/images/06_thematiques.svg',
                        color: 'bleu-plus',
                        action: function () { Utils.log_and_open_link('inscription_CCN', 'https://www.laclasse.com/portail/inscription_CCN/index.html'); }
                    });
                }
            });
            return ccns;
        };
    }
]);
angular.module('portailApp')
    .service('Annuaire', ['$http', 'URL_ENT', 'CONFIG',
    function ($http, URL_ENT, CONFIG) {
        var service = this;
        service.get_structure = _.memoize(function (structure_id) {
            return $http.get(URL_ENT + '/api/structures/' + structure_id, { params: { expand: false } });
        });
        service.get_structures = _.memoize(function (structures_ids) {
            return $http.get(URL_ENT + '/api/structures/', { params: { 'id[]': structures_ids, expand: false } });
        });
        service.get_structure_tiles = _.memoize(function (structure_id) {
            return $http.get(URL_ENT + '/api/tiles/', { params: { structure_id: structure_id } });
        });
        service.query_applications = _.memoize(function (structure_id) {
            return $http.get(URL_ENT + '/api/applications/')
                .then(function (response) {
                return _.chain(response.data)
                    .reject(function (app) {
                    var apps_to_hide = ['ANNUAIRE', 'ANN_ENT', 'PORTAIL', 'SSO', 'STARTBOX'];
                    return _(apps_to_hide).includes(app.id);
                })
                    .map(function (app) {
                    if (_(CONFIG.apps.default[app.id])) {
                        app.type = 'INTERNAL';
                        app.application_id = app.id;
                        delete app.id;
                        return _(app).extend(CONFIG.apps.default[app.application_id]);
                    }
                    else {
                        return null;
                    }
                })
                    .compact()
                    .value();
            });
        });
        service.get_profile_type = _.memoize(function (type) {
            return $http.get(URL_ENT + '/api/profiles_types/' + type);
        });
        service.get_structure_resources = function (structure_id) {
            return $http.get(URL_ENT + '/api/resources/', { params: { 'structures.structure_id': structure_id } });
        };
        service.get_resource = function (id) {
            return $http.get(URL_ENT + '/api/resources/' + id);
        };
        service.get_users = _.memoize(function (users_ids) {
            return $http.get(URL_ENT + '/api/users/', { params: { 'id[]': users_ids } });
        });
    }]);
angular.module('portailApp')
    .service('currentUser', ['$http', '$resource', '$q', 'URL_ENT', 'User', 'Tiles', 'Annuaire',
    function ($http, $resource, $q, URL_ENT, User, Tiles, Annuaire) {
        var service = this;
        var current_user = undefined;
        service.get = function (force_reload) {
            if (_(current_user).isUndefined() || force_reload) {
                current_user = $http.get(URL_ENT + '/api/users/current')
                    .then(function (response) {
                    return new User(response.data);
                });
            }
            return current_user;
        };
        service.activate_profile = function (profile_id) {
            return service.get(false)
                .then(function success(user) {
                return $http({
                    method: 'PUT',
                    url: URL_ENT + '/api/users/' + user.id + '/profiles/' + profile_id,
                    data: { active: true }
                });
            });
        };
        service.ressources = function () {
            return service.get(false)
                .then(function success(user) {
                return Annuaire.get_structure_resources(user.active_profile().structure_id)
                    .then(function (response) {
                    return response.data;
                });
            });
        };
        service.tiles = function () {
            return service.get(false)
                .then(function success(user) {
                if (_(user.profiles).isEmpty()) {
                    return Annuaire.query_applications()
                        .then(function (tiles) {
                        var no_profile_tiles = _.chain(tiles)
                            .select(function (tile) {
                            return _(['MAIL', 'DOC']).includes(tile.application_id);
                        })
                            .map(function (tile) {
                            tile.summer = true;
                            return tile;
                        })
                            .value();
                        return $q.resolve(no_profile_tiles);
                    });
                }
                else {
                    return Tiles.query({ structure_id: user.active_profile().structure_id }).$promise;
                }
            });
        };
        service.groups = function () {
            return service.get(false)
                .then(function success(user) {
                var structures_ids = _.chain(user.profiles).pluck('structure_id').uniq().value();
                var structures = Annuaire.get_structures(structures_ids);
                var user_groups_ids = _(user.groups).pluck('group_id');
                var user_groups = _(user_groups_ids).isEmpty() ? $q.resolve([]) : $http.get(URL_ENT + '/api/groups/', { params: { 'id[]': user_groups_ids } })
                    .then(function (response) {
                    return response.data;
                });
                var structures_groups = $q.resolve([]);
                if (_.chain(user.profiles).pluck('type').intersection(['DIR', 'ADM', 'CPE']).value().length > 0) {
                    structures_groups = $http.get(URL_ENT + '/api/groups/', { params: { 'structure_id[]': structures_ids } })
                        .then(function (response) {
                        return response.data;
                    });
                }
                return $q.all([user_groups, structures_groups, structures])
                    .then(function success(responses) {
                    var structures = responses.pop().data;
                    return _.chain(responses)
                        .flatten()
                        .uniq('id')
                        .map(function (group) {
                        group.structure = _(structures).findWhere({ id: group.structure_id });
                        return group;
                    })
                        .value();
                });
            });
        };
    }]);
angular.module('portailApp')
    .service('log', ['$http', '$state', 'URL_ENT', 'APP_PATH', 'currentUser',
    function ($http, $state, URL_ENT, APP_PATH, currentUser) {
        this.add = function (app, url, params) {
            currentUser.get(false)
                .then(function (user) {
                $http.post(URL_ENT + '/api/logs', {
                    application_id: app,
                    user_id: user.id,
                    structure_id: user.active_profile() ? user.active_profile().structure_id : 'none',
                    profil_id: user.active_profile() ? user.active_profile().type : 'none',
                    url: _(url).isNull() ? APP_PATH + $state.current.url : url,
                    parameters: _(params).isNull() ? _($state.params).map(function (value, key) { return key + '=' + value; }).join('&') : params
                });
            });
        };
    }
]);
angular.module('portailApp')
    .service('Popups', ['$uibModal',
    function ($uibModal) {
        var Popups = this;
        Popups.add_tiles = function (current_tiles, callback_success, callback_error) {
            $uibModal.open({
                controller: ['$scope', '$uibModalInstance', 'APP_PATH', 'Tiles', 'currentUser', 'Annuaire',
                    'current_tiles',
                    function ($scope, $uibModalInstance, APP_PATH, Tiles, currentUser, Annuaire, current_tiles) {
                        $scope.prefix = APP_PATH;
                        $scope.available_tiles = [];
                        $scope.tiles_selected = false;
                        $scope.add_empty_link_tile = function () {
                            $scope.available_tiles.push(new Tiles({
                                creation: true,
                                present: false,
                                type: 'EXTERNAL',
                                name: '',
                                description: '',
                                url: 'http://',
                                color: '',
                                selected: true,
                                taxonomy: 'app'
                            }));
                        };
                        $scope.keep_tile_selected = function (event, app) {
                            app.selected = false;
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
                backdrop: 'static'
            })
                .result.then(callback_success, callback_error);
        };
        Popups.manage_fluxes = function (callback_success, callback_error) {
            $uibModal.open({
                template: "\n<div class=\"modal-header\">\n    <h3 class=\"modal-title\">G\u00E9rer les flux RSS affich\u00E9s sur le portail de l'\u00E9tablissement</h3>\n</div>\n<div class=\"modal-body config-fluxes\">\n    <ul>\n        <li ng:repeat=\"flux in $ctrl.current_flux\">\n            <label>titre <input type=\"text\"\n                                ng:model=\"flux.name\"\n                                ng:change=\"$ctrl.dirtify( flux )\" /></label>\n            <label>url <input type=\"text\"\n                              ng:model=\"flux.url\"\n                              ng:change=\"$ctrl.dirtify( flux )\" /></label>\n\n            <div class=\"controls\">\n                <button class=\"btn-default delete\"\n                        ng:click=\"$ctrl.delete( flux )\"><span class=\"glyphicon glyphicon-trash\"></span></button>\n                <button class=\"btn-primary save\"\n                        ng:if=\"flux.dirty\"\n                        ng:click=\"$ctrl.save( flux )\"><span class=\"glyphicon glyphicon-ok-sign\"></span></button>\n            </div>\n            <div class=\"clearfix\"></div>\n        </li>\n    </ul>\n    <div class=\"clearfix\"></div>\n\n    <button style=\"right: 4em;\"\n            ng:click=\"$ctrl.add_default_flux()\"><span class=\"glyphicon glyphicon-cloud-download\"></span></button>\n    <button ng:click=\"$ctrl.add_flux()\"><span class=\"glyphicon glyphicon-plus-sign\"></span></button>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-default\" ng:click=\"$ctrl.close()\">\n        <span class=\"glyphicon glyphicon-remove-sign\"></span> Fermer\n    </button>\n</div>\n",
                controller: ['$scope', '$uibModalInstance', 'currentUser', 'Flux', 'CONFIG',
                    function ($scope, $uibModalInstance, currentUser, Flux, CONFIG) {
                        var ctrl = $scope;
                        ctrl.$ctrl = ctrl;
                        ctrl.nb_articles = _.range(1, 11);
                        ctrl.current_flux = [];
                        ctrl.delete = function (flux) {
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
                            ctrl.current_flux.push(new Flux({
                                name: '',
                                url: '',
                                icon: ''
                            }));
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
                backdrop: 'static'
            })
                .result.then(callback_success, callback_error);
        };
    }
]);
angular.module('portailApp')
    .service('Utils', ['$state', '$window', 'CASES', 'log',
    function ($state, $window, CASES, log) {
        this.pad_tiles_tree = function (tiles_tree) {
            var suffix = '-moins';
            return tiles_tree.concat(_(CASES.slice(tiles_tree.length, CASES.length))
                .map(function (c, i) {
                return {
                    index: i + tiles_tree.length,
                    color: c.color + suffix
                };
            }));
        };
        this.fill_empty_tiles = function (tiles_tree) {
            var indexes = tiles_tree.map(function (tile) { return tile.index; });
            _.chain(indexes)
                .max()
                .range()
                .difference(indexes)
                .each(function (index) {
                tiles_tree.push({
                    index: index,
                    color: CASES[index % CASES.length].color + '-moins'
                });
            });
            return tiles_tree;
        };
        this.log_and_open_link = function (context, url) {
            log.add(context, url, null);
            $window.open(url);
        };
        this.go_home = function () {
            $state.go('portail', {}, { reload: true, inherit: true, notify: true });
        };
    }
]);
