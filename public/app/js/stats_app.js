'use strict';
angular.module('statsApp', [
    'ui.bootstrap',
    'nvd3',
    'angularMoment'
])
    .run(['amMoment', function (amMoment) { amMoment.changeLocale('fr'); }])
    .config(['$httpProvider', function (provider) { provider.defaults.withCredentials = true; }])
    .component("loaderSpinner", {
    template: "\n<style>\n.loader,\n.loader:before,\n.loader:after {\nborder-radius: 50%;\n}\n.loader {\ncolor: #1aaacc;\nfont-size: 11px;\ntext-indent: -99999em;\nmargin: 55px auto;\nposition: relative;\nwidth: 10em;\nheight: 10em;\nbox-shadow: inset 0 0 0 1em;\n-webkit-transform: translateZ(0);\n-ms-transform: translateZ(0);\ntransform: translateZ(0);\n}\n.loader:before,\n.loader:after {\nposition: absolute;\ncontent: '';\n}\n.loader:before {\nwidth: 5.2em;\nheight: 10.2em;\nbackground: #ffffff;\nborder-radius: 10.2em 0 0 10.2em;\ntop: -0.1em;\nleft: -0.1em;\n-webkit-transform-origin: 5.2em 5.1em;\ntransform-origin: 5.2em 5.1em;\n-webkit-animation: load2 2s infinite ease 1.5s;\nanimation: load2 2s infinite ease 1.5s;\n}\n.loader:after {\nwidth: 5.2em;\nheight: 10.2em;\nbackground: #ffffff;\nborder-radius: 0 10.2em 10.2em 0;\ntop: -0.1em;\nleft: 5.1em;\n-webkit-transform-origin: 0px 5.1em;\ntransform-origin: 0px 5.1em;\n-webkit-animation: load2 2s infinite ease;\nanimation: load2 2s infinite ease;\n}\n@-webkit-keyframes load2 {\n0% {\n-webkit-transform: rotate(0deg);\ntransform: rotate(0deg);\n}\n100% {\n-webkit-transform: rotate(360deg);\ntransform: rotate(360deg);\n}\n}\n@keyframes load2 {\n0% {\n-webkit-transform: rotate(0deg);\ntransform: rotate(0deg);\n}\n100% {\n-webkit-transform: rotate(360deg);\ntransform: rotate(360deg);\n}\n}\n</style>\n<div class=\"loader\">Loading...</div>\n"
})
    .component('stats', {
    controller: ['$http', '$locale', '$q', 'moment', 'URL_ENT',
        function ($http, $locale, $q, moment, URL_ENT) {
            var ctrl = this;
            ctrl.allowed = false;
            ctrl.loading = false;
            ctrl.period = {
                decr: function () {
                    ctrl.debut.subtract(1, ctrl.period_types.selected + "s");
                    ctrl.retrieve_data();
                },
                incr: function () {
                    ctrl.debut.add(1, ctrl.period_types.selected + "s");
                    ctrl.retrieve_data();
                },
                reset: function () {
                    ctrl.debut = moment().startOf(ctrl.period_types.selected);
                    ctrl.retrieve_data();
                }
            };
            ctrl.types_labels = {
                structure_id: 'Établissements',
                application_id: 'Tuiles',
                profil_id: 'Profils',
                user_id: 'Utilisateurs',
                weekday: 'Jours',
                hour: 'Heures',
                url: 'URLs'
            };
            ctrl.period_types = {
                list: [
                    { label: 'journée', value: 'day' },
                    { label: 'semaine', value: 'week' },
                    { label: 'mois', value: 'month' },
                    { label: 'année', value: 'year' }
                ],
                selected: 'week'
            };
            ["cities", "structures_types", "profiles_types", "structures", "applications"]
                .forEach(function (key) { ctrl[key] = { list: [], selected: [] }; });
            ctrl.multibarchart_options = {
                chart: {
                    type: 'multiBarChart',
                    x: function (d) { return d.x; },
                    y: function (d) { return d.y; },
                    valueFormat: function (v) { return v; },
                    height: 256,
                    width: 1050,
                    margin: {
                        left: 50,
                        top: 20,
                        bottom: 100,
                        right: 20
                    },
                    showControls: false,
                    showValues: true,
                    showLegend: true,
                    stacked: false,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    rotateLabels: -25,
                    reduceXTicks: false,
                    yAxis: {
                        tickFormat: function (v) { return d3.format(',.0f')(v); }
                    },
                    xAxis: {}
                }
            };
            ctrl.multibarhorizontalchart_options = angular.copy(ctrl.multibarchart_options);
            ctrl.multibarhorizontalchart_options.chart.type = 'multiBarHorizontalChart';
            ctrl.multibarhorizontalchart_options.chart.height = 512;
            ctrl.multibarhorizontalchart_options.chart.margin = {
                left: 250,
                top: 20,
                bottom: 20,
                right: 50
            };
            ctrl.chart_options = function (type, data) {
                switch (type) {
                    case "structure_id":
                    case "profil_id":
                        var left_margin = _.chain(data[0].values).pluck('x').map(function (label) { return label.length; }).max().value() * 8;
                        left_margin = left_margin > 250 ? 250 : left_margin;
                        ctrl.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                        ctrl.multibarhorizontalchart_options.chart.margin.left = left_margin;
                        ctrl.multibarhorizontalchart_options.chart.xAxis.orient = "left";
                        ctrl.multibarhorizontalchart_options.chart.showXAxis = true;
                        return ctrl.multibarhorizontalchart_options;
                    case "url":
                        ctrl.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                        ctrl.multibarhorizontalchart_options.chart.xAxis.orient = "right";
                        ctrl.multibarhorizontalchart_options.chart.margin.left = 10;
                        return ctrl.multibarhorizontalchart_options;
                    default:
                        return ctrl.multibarchart_options;
                }
            };
            ctrl.labels = {
                weekday: _.memoize(function (nb) {
                    var week_days = angular.copy($locale.DATETIME_FORMATS.DAY);
                    week_days.push(week_days.shift());
                    return nb + " " + week_days[nb];
                }),
                hour: function (h) {
                    if (h < 10) {
                        h = "0" + h;
                    }
                    return h + ":00 - " + h + ":59";
                },
                url: angular.identity,
            };
            ctrl.process_data = function (data) {
                ctrl.logs = _(data).map(function (log) {
                    log.timestamp = moment(log.timestamp);
                    log.weekday = log.timestamp.day();
                    log.hour = log.timestamp.hour();
                    return log;
                });
                ctrl.logs_SSO = _(ctrl.logs).where({ application_id: "SSO" });
                var session_cutoff = moment().subtract(4, "hours");
                ctrl.totals = {
                    clicks: ctrl.logs.length,
                    users: _.chain(ctrl.logs).countBy(function (log) { return log.user_id; }).size().value(),
                    connections: ctrl.logs_SSO.length,
                    active_connections: _(ctrl.logs_SSO).select(function (connection) { return connection.timestamp.isAfter(session_cutoff); }).length,
                };
                ctrl.logs = _(ctrl.logs).reject(function (logline) { return logline.application_id == "SSO"; });
                ctrl.log_structures = _.chain(ctrl.logs).pluck("structure_id").uniq().map(function (structure_id) { return _(ctrl.structures).findWhere({ id: structure_id }); }).value();
                ctrl.log_applications = _.chain(ctrl.logs).pluck("application_id").uniq().map(function (application_id) { return _(ctrl.applications).findWhere({ id: application_id }); }).value();
                ctrl.log_profiles_types = _.chain(ctrl.logs).pluck("profil_id").uniq().map(function (profile_id) { return _(ctrl.profiles_types).findWhere({ id: profile_id }); }).value();
                ctrl.stats = _.chain(['structure_id', 'application_id', 'profil_id', 'weekday', 'hour', 'url'])
                    .map(function (key) {
                    var values = _.chain(ctrl.logs).select(function (logline) { return key != "url" || logline[key].match(/^http.*/) != null; }).countBy(key).value();
                    return [
                        key,
                        [{
                                key: "clicks",
                                values: _.chain(values)
                                    .keys()
                                    .map(function (subkey) {
                                    return {
                                        key: key,
                                        value: subkey,
                                        x: ctrl.labels[key](subkey),
                                        y: values[subkey]
                                    };
                                })
                                    .sortBy(function (record) {
                                    switch (key) {
                                        case 'structure_id':
                                        case 'profil_id':
                                        case 'url':
                                            return record.y * -1;
                                        default:
                                            return record.x;
                                    }
                                })
                                    .value()
                            }]
                    ];
                })
                    .object()
                    .value();
                var count_unique_x_per_key = function (logs, x, key) {
                    return _.chain(logs)
                        .groupBy(function (line) { return line[key]; })
                        .map(function (loglines, id) {
                        return {
                            x: ctrl.labels[key](id),
                            y: _.chain(loglines).pluck(x).uniq().value().length
                        };
                    }).value();
                };
                ['structure_id', 'application_id', 'profil_id', 'weekday', 'hour'].forEach(function (key) {
                    ctrl.stats[key].push({
                        key: 'utilisateurs uniques',
                        values: count_unique_x_per_key(ctrl.logs, 'user_id', key)
                    });
                });
                ctrl.stats.structure_id.push({
                    key: 'apps',
                    values: count_unique_x_per_key(ctrl.logs, 'application_id', "structure_id")
                });
            };
            ctrl.filter_data = function (data) {
                return _(data)
                    .select(function (logline) {
                    return (ctrl.structures_types.selected.length == 0 ||
                        _.chain(ctrl.structures.list)
                            .select(function (structure) { return _.chain(ctrl.structures_types.selected).pluck("id").contains(structure.type).value(); })
                            .pluck("id")
                            .contains(logline.structure_id)
                            .value()) &&
                        (ctrl.cities.selected.length == 0 ||
                            _.chain(ctrl.structures.list)
                                .select(function (structure) { return _.chain(ctrl.cities.selected).pluck("zip_code").contains(structure.zip_code).value(); })
                                .pluck("id")
                                .contains(logline.structure_id)
                                .value()) &&
                        (ctrl.applications.selected.length == 0 || _.chain(ctrl.applications.selected).pluck("id").contains(logline.application_id).value()) &&
                        (ctrl.structures.selected.length == 0 || _.chain(ctrl.structures.selected).pluck("id").contains(logline.structure_id).value()) &&
                        (ctrl.profiles_types.selected.length == 0 || _.chain(ctrl.profiles_types.selected).pluck("id").contains(logline.profil_id).value());
                });
            };
            ctrl.retrieve_data = function () {
                ctrl.loading = true;
                ctrl.fin = ctrl.debut.clone().endOf(ctrl.period_types.selected);
                ctrl.raw_logs = [];
                $http.get(URL_ENT + "/api/logs", {
                    params: {
                        'timestamp>': ctrl.debut.clone().toDate(),
                        'timestamp<': ctrl.fin.clone().toDate()
                    }
                })
                    .then(function (response) {
                    ctrl.raw_logs = response.data;
                    if (ctrl.raw_logs.length > 0) {
                        $http.get(URL_ENT + "/api/structures", { params: { expand: false, "id[]": _.chain(ctrl.raw_logs).pluck("structure_id").uniq().value() } })
                            .then(function (response) {
                            ctrl.structures.list = response.data;
                            ctrl.labels.structure_id = function (uai) {
                                var label = '';
                                var structure = _(ctrl.structures.list).findWhere({ id: uai });
                                if (structure != undefined) {
                                    label = structure.name;
                                }
                                return label + " (" + uai + ")";
                            };
                            ctrl.cities.list = _.chain(ctrl.structures.list).map(function (structure) { return { zip_code: structure.zip_code, city: structure.city }; }).uniq(function (city) { return city.zip_code; }).reject(function (city) { return city.zip_code == null || city.zip_code == ""; }).value();
                            return $http.get(URL_ENT + "/api/structures_types", { params: { "id[]": _.chain(ctrl.structures.list).pluck("type").uniq().value() } });
                        })
                            .then(function (response) {
                            ctrl.structures_types.list = response.data;
                        })
                            .then(function () {
                            ctrl.process_data(ctrl.filter_data(ctrl.raw_logs));
                            ctrl.loading = false;
                        });
                    }
                    else {
                        ctrl.loading = false;
                    }
                });
            };
            ctrl.download_json = function (data, name) {
                var a = document.createElement('a');
                a.href = "data:application/json;charset=utf-8," + JSON.stringify(data);
                a.setAttribute('download', name + ".json");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            $http.get(URL_ENT + "/api/users/current")
                .then(function success(response) {
                ctrl.allowed = _.chain(response.data.profiles)
                    .pluck('type')
                    .intersection(['DIR', 'ADM'])
                    .value().length > 0;
                if (ctrl.allowed) {
                    var promises = [
                        $http.get(URL_ENT + "/api/profiles_types")
                            .then(function (response) {
                            ctrl.profiles_types.list = response.data;
                            ctrl.labels.profil_id = _.memoize(function (profile_type) {
                                var label = profile_type;
                                var profile = _(ctrl.profiles_types.list).findWhere({ id: profile_type });
                                if (profile != undefined) {
                                    label = profile.name;
                                }
                                return label;
                            });
                        }),
                        $http.get(URL_ENT + "/api/applications")
                            .then(function (response) {
                            ctrl.applications.list = response.data;
                            ctrl.labels.application_id = _.memoize(function (application_id) {
                                var label = application_id;
                                var app = _(ctrl.applications.list).findWhere({ id: application_id });
                                if (app != undefined) {
                                    label = app.name;
                                }
                                return label;
                            });
                        })
                    ];
                    $q.all(promises)
                        .then(function (responses) {
                        ctrl.period.reset();
                    });
                }
            });
        }
    ],
    template: "\n    <div class=\"container\" ng:if=\"$ctrl.allowed\">\n      <div class=\"col-md-12\" style=\"text-align: center;\">\n        <div class=\"controls pull-right\">\n          <select ng:options=\"period_type.value as period_type.label for period_type in $ctrl.period_types.list\"\n                  ng:model=\"$ctrl.period_types.selected\"\n                  ng:change=\"$ctrl.period.reset()\"></select>\n          <button class=\"btn btn-warning\" ng:click=\"$ctrl.period.reset()\"> \u2715 </button>\n          <button class=\"btn btn-success\" ng:click=\"$ctrl.period.decr()\"> \u25C0 </button>\n          <button class=\"btn btn-success\" ng:click=\"$ctrl.period.incr()\"> \u25B6 </button>\n        </div>\n        <h2>\n          {{ $ctrl.debut | amDateFormat:'Do MMMM YYYY' }} - {{ $ctrl.fin | amDateFormat:'Do MMMM YYYY' }}\n        </h2>\n      </div>\n      <h1 style=\"text-align: center;\" ng:if=\"$ctrl.raw_logs.length == 0 && !$ctrl.loading\">\n        <span class=\"label label-primary\">Aucune donn\u00E9e disponible pour la p\u00E9riode donn\u00E9e.</span>\n      </h1>\n      <h1 style=\"text-align: center;\" ng:if=\"$ctrl.raw_logs.length == 0 && $ctrl.loading\">\n        <span class=\"label label-warning\">Chargement et traitement des donn\u00E9es en cours...</span>\n        <loader-spinner></loader-spinner>\n      </h1>\n      <div ng:if=\"$ctrl.raw_logs.length > 0 && !$ctrl.loading\">\n        <div class=\"col-md-12\">\n\n          <div class=\"col-md-3\">\n            <div class=\"panel panel-default\">\n              <div class=\"panel-heading\">\n                Communes <button class=\"btn btn-xs btn-warning pull-right\" ng:click=\"$ctrl.cities.selected = []; $ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"> \u2715 </button>\n              </div>\n              <div class=\"panel-body\" style=\"padding: 0;\">\n                <select multiple style=\"width: 100%;\"\n                        ng:options=\"city as city.zip_code + ' : ' + city.city for city in $ctrl.cities.list | orderBy:'zip_code'\"\n                        ng:model=\"$ctrl.cities.selected\"\n                        ng:change=\"$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"></select>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"col-md-3\">\n            <div class=\"panel panel-default\">\n              <div class=\"panel-heading\">\n                \u00C9tablissements <button class=\"btn btn-xs btn-warning pull-right\" ng:click=\"$ctrl.structures.selected = []; $ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"> \u2715 </button>\n              </div>\n              <div class=\"panel-body\" style=\"padding: 0;\">\n                <select multiple style=\"width: 100%;\"\n                        ng:options=\"structure as structure.name for structure in $ctrl.structures.list | orderBy:'name'\"\n                        ng:model=\"$ctrl.structures.selected\"\n                        ng:change=\"$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"></select>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"col-md-2\">\n            <div class=\"panel panel-default\">\n              <div class=\"panel-heading\">\n                Structures <button class=\"btn btn-xs btn-warning pull-right\" ng:click=\"$ctrl.structures_types.selected = []; $ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"> \u2715 </button>\n              </div>\n              <div class=\"panel-body\" style=\"padding: 0;\">\n                <select multiple style=\"width: 100%;\"\n                        ng:options=\"st as '' + st.name for st in $ctrl.structures_types.list | orderBy:'name'\"\n                        ng:model=\"$ctrl.structures_types.selected\"\n                        ng:change=\"$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"></select>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"col-md-2\">\n            <div class=\"panel panel-default\">\n              <div class=\"panel-heading\">\n                Profils <button class=\"btn btn-xs btn-warning pull-right\" ng:click=\"$ctrl.profiles_types.selected = []; $ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"> \u2715 </button>\n              </div>\n              <div class=\"panel-body\" style=\"padding: 0;\">\n                <select multiple style=\"width: 100%;\"\n                        ng:options=\"pt as pt.name for pt in $ctrl.profiles_types.list | orderBy:'name'\"\n                        ng:model=\"$ctrl.profiles_types.selected\"\n                        ng:change=\"$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"></select>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"col-md-2\">\n            <div class=\"panel panel-default\">\n              <div class=\"panel-heading\">\n                Tuiles <button class=\"btn btn-xs btn-warning pull-right\" ng:click=\"$ctrl.applications.selected = []; $ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"> \u2715 </button>\n              </div>\n              <div class=\"panel-body\" style=\"padding: 0;\">\n                <select multiple style=\"width: 100%;\"\n                        ng:options=\"app as app.name for app in $ctrl.applications.list | orderBy:'name'\"\n                        ng:model=\"$ctrl.applications.selected\"\n                        ng:change=\"$ctrl.process_data($ctrl.filter_data($ctrl.raw_logs));\"></select>\n              </div>\n            </div>\n          </div>\n\n        </div>\n\n        <div class=\"col-md-12\">\n          <em class=\"col-md-3 label label-default\">{{$ctrl.totals.clicks}} clicks</em>\n          <em class=\"col-md-3 label label-primary\">{{$ctrl.totals.users}} utilisateurs uniques</em>\n          <em class=\"col-md-3 label label-success\">{{$ctrl.totals.connections}} connexions</em>\n          <em class=\"col-md-3 label label-info\">{{$ctrl.totals.active_connections}} connexions actives</em>\n        </div>\n\n        <uib-tabset>\n          <uib-tab index=\"$index + 1\"\n                   ng:repeat=\"(key, stat) in $ctrl.stats\">\n            <uib-tab-heading>\n              <em class=\"badge\">{{stat[0].values.length}}</em> {{$ctrl.types_labels[key]}} <button class=\"btn btn-xs btn-primary\" ng:click=\"$ctrl.download_json(stat, key)\"><span class=\"glyphicon glyphicon-save\"></span></button>\n            </uib-tab-heading>\n            <nvd3 data=\"stat\"\n                  options=\"$ctrl.chart_options( key, stat )\">\n            </nvd3>\n          </uib-tab>\n        </uib-tabset>\n      </div>\n    </div>\n"
});
