'use strict';

// Declare app level module which depends on filters, and services
angular.module( 'statsApp',
                [ 'ui.bootstrap',
                  'nvd3',
                  'angularMoment',
                  'angular-loading-bar' ] )
    .run( [ 'amMoment', function( amMoment ) { amMoment.changeLocale( 'fr' ); } ] )
    .config( [ '$httpProvider', function( provider ) { provider.defaults.withCredentials = true; } ] )
    .service( 'Annuaire',
              [ '$http', 'URL_ENT',
                function( $http, URL_ENT ) {
                    this.get_stats = function( params ) {
                        return $http.get( URL_ENT + '/api/app/v2/log/stats', { params: params } );
                    };

                    this.get_profils = function( params ) {
                        return $http.get( URL_ENT + '/api/app/profils', { params: params } );
                    };

                    this.get_etablissements = function( params ) {
                        return $http.get( URL_ENT + '/api/app/etablissements', { params: params } );
                    };

                    this.get_default_applications = function( params ) {
                        return $http.get( URL_ENT + '/api/portail/entree/applications', { params: params } );
                    };
                }
              ] )
    .controller( 'StatsCtrl',
                 [ '$scope', '$http', '$locale', 'moment', 'Annuaire',
                   function ( $scope, $http, $locale, moment, Annuaire ) {
                       $scope.types_labels = { global: 'Statistiques globales',
                                               uai: 'Établissements',
                                               app: 'Tuiles',
                                               user_type: 'Profils utilisateurs',
                                               uid: 'Utilisateurs',
                                               week_day: 'Jour de la semaine'};

                       $scope.period_types = { list: [ { label: 'jour', value: 'day' },
                                                       { label: 'semaine', value: 'week' },
                                                       { label: 'mois', value: 'month' },
                                                       { label: 'année', value: 'year' } ],
                                               selected: 'week' };

                       $scope.multibarchart_options = { chart: { type: 'multiBarChart',
                                                                 height: 256,
                                                                 width: 1050,
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
                                                                 labelSunbeamLayout: true,
                                                                 rotateLabels: -25,
                                                                 reduceXTicks: false
                                                               }
                                                      };
                       $scope.multibarhorizontalchart_options = angular.copy( $scope.multibarchart_options );
                       $scope.multibarhorizontalchart_options.chart.type = 'multiBarHorizontalChart';
                       $scope.multibarhorizontalchart_options.chart.height = 512;
                       $scope.multibarhorizontalchart_options.chart.margin = { left: 250,
                                                                               top: 20,
                                                                               bottom: 20,
                                                                               right: 50 };

                       $scope.chart_options = function( type, data ) {
                           switch( type ) {
                           case 'uai':
                           case 'user_type':
                               $scope.multibarhorizontalchart_options.chart.height = 24 * data.length * data[0].values.length + 40;
                               $scope.multibarhorizontalchart_options.chart.margin.left = _.chain(data[0].values).pluck('x').map( function(label) { return label.length; } ).max().value() * 8;
                               return $scope.multibarhorizontalchart_options;
                           default:
                               return $scope.multibarchart_options;
                           }
                       };

                       $scope.retrieve_data = function( from ) {
                           var started_at = moment();

                           $scope.fin = $scope.debut.clone().endOf( $scope.period_types.selected );

                           $scope.labels = {};
                           $scope.labels.week_day = angular.copy($locale.DATETIME_FORMATS.DAY);
                           $scope.labels.week_day.push( $scope.labels.week_day.shift() );

                           Annuaire.get_profils({}).then( function( response ) {
                               $scope.labels.user_type = _.chain(response.data).map( function( profil ) { return [ profil.id, profil.description ]; } ).object().value();
                           } );

                           Annuaire.get_default_applications({}).then( function( response ) {
                               $scope.labels.app = _.chain(response.data).map( function( app ) { return [ app.id, app.libelle ]; } ).object().value();
                           } );


                           Annuaire.get_etablissements({}).then( function( response ) {
                               $scope.labels.uai = _.chain(response.data).map( function( etab ) { return [ etab.code_uai, etab.nom ]; } ).object().value();

                               Annuaire.get_stats( { from: $scope.debut.clone().toDate(),
                                                     until: $scope.fin.clone().toDate(),
                                                     "uais[]": _.chain($scope.labels.uai)
                                                     .keys()
                                                     .reject( function( uai ) {
                                                         var ignored_uai = _([ '0699990Z', '069BACAS', '069DANEZ' ]);
                                                         return ignored_uai.contains( uai );
                                                     } )
                                                     .value()
                                                   } )
                                   .then( function ( response ) {
                                       var keys = [ 'uai', 'app', 'user_type', 'week_day' ];

                                       var stats_to_nvd3_data = function( key, values ) {
                                           var data = [ { key: key,
                                                          values: _.chain(values).keys().map( function( subkey ) {
                                                              return { key: key,
                                                                       value: subkey,
                                                                       x: $scope.labels[key][subkey],
                                                                       y: values[ subkey ] };
                                                          } )
                                                          .sortBy( function( record ) {
                                                              switch( key ) {
                                                              case 'uai':
                                                              case 'user_type':
                                                                  return record.y * -1;
                                                                  break;
                                                              case 'week_day':
                                                                  return true;
                                                                  break;
                                                              default:
                                                                  return record.x;
                                                              }
                                                          } )
                                                          .value() } ];
                                           console.log( ( ( moment() - started_at ) / 1000.0 ) + 's : extracted ' + key )

                                           return data;
                                       };

                                       var extract_stats = function( logs, keys ) {
                                           return _.chain(keys)
                                               .map( function( key ) {
                                                   return [ key, stats_to_nvd3_data( key, _(logs).countBy( key ) ) ];
                                               } )
                                               .object()
                                               .value();
                                       };

                                       $scope.logs = response.data;
                                       $scope.filters = {};

                                       $scope.stats = {};
                                       $scope.stats.global = extract_stats( $scope.logs, keys );

                                       keys.forEach( function( key ) {
                                           if ( key !== 'week_day' ) {
                                               $scope.stats[ key ] = _.chain($scope.stats.global[ key ][0].values)
                                                   .pluck( 'value' )
                                                   .map( function( value ) {
                                                       return [ value, extract_stats( _($scope.logs).select( function( logline ) { return logline[ key ] === value; } ),
                                                                                      _(keys).difference( [ key ] ) ) ];
                                                   } )
                                                   .object()
                                                   .value();
                                           }
                                       } );

                                       $scope.stats.global.uai.push( { key: 'utilisateurs uniques',
                                                                       values: _.chain($scope.logs)
                                                                       .groupBy( function( line ) { return line.uai; } )
                                                                       .map( function( loglines, uai ) {
                                                                           return { key: 'utilisateurs uniques',
                                                                                    x: $scope.labels.uai[uai],
                                                                                    y: _.chain(loglines).pluck('uid').uniq().value().length };
                                                                       } ).value()
                                                                     } );
                                       $scope.stats.global.uai.push( { key: 'apps',
                                                                       values: _.chain($scope.logs)
                                                                       .groupBy( function( line ) { return line.uai; } )
                                                                       .map( function( loglines, uai ) {
                                                                           return { key: 'apps',
                                                                                    x: $scope.labels.uai[uai],
                                                                                    y: _.chain(loglines).pluck('app').uniq().value().length };
                                                                       } ).value()
                                                                     } );
                                       $scope.stats.global.user_type.push( { key: 'utilisateurs uniques',
                                                                             values: _.chain($scope.logs)
                                                                             .groupBy( function( line ) { return line.user_type; } )
                                                                             .map( function( loglines, user_type ) {
                                                                                 return { key: 'utilisateurs uniques',
                                                                                          x: $scope.labels.user_type[user_type],
                                                                                          y: _.chain(loglines).pluck('uid').uniq().value().length };
                                                                             } ).value()
                                                                           } );

                                       _($scope.stats.uai).each( function( etab, uai ) {
                                           etab.user_type.push( { key: 'utilisateurs uniques',
                                                                  values: _.chain($scope.logs)
                                                                  .where({ uai: uai })
                                                                  .groupBy( function( line ) { return line.user_type; } )
                                                                  .map( function( loglines, user_type ) {
                                                                      return { key: 'utilisateurs uniques',
                                                                               x: $scope.labels.user_type[user_type],
                                                                               y: _.chain(loglines).pluck('uid').uniq().value().length };
                                                                  } ).value()
                                                                } );
                                       } );

                                       console.log( ( ( moment() - started_at ) / 1000.0 ) + 's : all data received and treated' )
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
