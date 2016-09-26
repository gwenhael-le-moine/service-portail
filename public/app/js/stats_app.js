         'use strict';

// Declare app level module which depends on filters, and services
angular.module( 'statsApp',
                [ 'ui.bootstrap',
                  'nvd3',
                  'angularMoment',
                  'angular-loading-bar' ] )
    .run( [ 'amMoment', function( amMoment ) { amMoment.changeLocale( 'fr' ); } ] )
    .service( 'Annuaire',
              [ '$http', 'APP_PATH',
                function( $http, APP_PATH ) {
                    this.get_stats = function( params ) {
                        return $http.get( APP_PATH + '/api/log/stats', { params: params } );
                    };

                    this.get_profils = function( params ) {
                        return $http.get( '/api/app/profils', { params: params } );
                    };

                    this.get_etablissements = function( params ) {
                        return $http.get( '/api/app/etablissements', { params: params } );
                    };

                    this.get_default_applications = function( params ) {
                        return $http.get( '/api/portail/entree/applications', { params: params } );
                    };
                }
              ] )
    .controller( 'StatsCtrl',
                 [ '$scope', '$http', 'moment', 'APP_PATH', 'Annuaire',
                   function ( $scope, $http, moment, APP_PATH, Annuaire ) {
                       $scope.types_labels = { global: 'Statistiques globales',
                                               uai: 'Établissements',
                                               app: 'Tuiles',
                                               user_type: 'Profils utilisateurs' };
                       $scope.period_types = { list: [ { label: 'jour', value: 'day' },
                                                       { label: 'semaine', value: 'week' },
                                                       { label: 'mois', value: 'month' },
                                                       { label: 'année', value: 'year' } ],
                                               selected: 'week' };
                       $scope.multibarchart_options = { chart: { type: 'multiBarChart',
                                                                 height: 256,
                                                                 width: 550,
                                                                 margin: { left: 50,
                                                                           top: 20,
                                                                           bottom: 100,
                                                                           right: 20 },
                                                                 showControls: false,
                                                                 showValues: true,
                                                                 showLegend: true,
                                                                 stacked: false,
                                                                 duration: 500,
                                                                 labelThreshold: 0.01,
                                                                 labelSunbeamLayout: true
                                                               }
                                                      };
                       $scope.multibarhorizontalchart_options = angular.copy( $scope.multibarchart_options );
                       $scope.multibarhorizontalchart_options.chart.type = 'multiBarHorizontalChart';
                       $scope.multibarhorizontalchart_options.chart.margin = { left: 150,
                                                                               top: 20,
                                                                               bottom: 20,
                                                                               right: 50 };

                       $scope.retrieve_data = function( from ) {
                           $scope.fin = $scope.debut.clone().endOf( $scope.period_types.selected );

                           var params = { from: $scope.debut.clone().toDate(),
                                          until: $scope.fin.clone().toDate() };

                           Annuaire.get_etablissements({}).then( function( response ) {
                               $scope.etablissements = response;
                           } );

                           Annuaire.get_profils({}).then( function( response ) {
                               $scope.profils = response;
                           } );

                           Annuaire.get_default_applications({}).then( function( response ) {
                               $scope.default_applications = response;
                           } );

                           Annuaire.get_stats( params )
                               .then( function ( response ) {
                                   var ignored_uai = _([ '0699990Z', '069BACAS', '069DANE' ]);
                                   var keys = [ 'uai', 'app', 'user_type' ];

                                   var stats_to_nvd3_data = function( key, values ) {
                                       return [ { key: key,
                                                  values: _(values).keys().map( function( key ) {
                                                      return { key: key,
                                                               x: key,
                                                               y: values[ key ] };
                                                  } ) } ];
                                   };

                                   var extract_stats = function( logs, keys ) {
                                       return _.chain(keys)
                                           .map( function( key ) {
                                               return [ key, stats_to_nvd3_data( key, _(logs).countBy( key ) ) ];
                                           } )
                                           .object()
                                           .value();
                                   };

                                   $scope.logs = _(response.data).reject( function( logline ) { return ignored_uai.contains( logline.uai ); });
                                   $scope.filters = {};

                                   $scope.stats = {};
                                   $scope.stats.global = extract_stats( $scope.logs, keys );
                                   keys.forEach( function( key ) {
                                       $scope.stats[ key ] = _.chain($scope.stats.global[ key ][0].values)
                                           .pluck( 'x' )
                                           .map( function( value ) {
                                               return [ value, extract_stats( _($scope.logs).select( function( logline ) { return logline[ key ] === value; } ),
                                                                              _(keys).difference( [ key ] ) ) ];
                                           } )
                                           .object()
                                           .value();
                                   } );
                               } );
                       };

                       $scope.decr_period = function() {
                           $scope.debut.subtract( 1, $scope.period_types.selected + 's' );
                           $scope.retrieve_data( $scope.debut );
                       };
                       $scope.incr_period = function() {
                           $scope.debut.add( 1, $scope.period_types.selected + 's' );
                           $scope.retrieve_data( $scope.debut );
                       };
                       $scope.reset_period = function() {
                           $scope.debut = moment().startOf( $scope.period_types.selected );
                           $scope.retrieve_data( $scope.debut );
                       };

                       $scope.reset_period();
                   }
                 ] );
