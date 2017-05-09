'use strict';

angular.module( 'portailApp' )
    .service('news',
	     [ '$http', 'URL_ENT', 'UID',
	       function( $http, URL_ENT, UID ) {
		   var news = null;
		   this.get = function( force_reload ) {
		       if ( _(news).isNull() || force_reload ) {
			   news = $http.get( URL_ENT + '/api/users/' + UID + '/news' );
		       }

		       return news;
		   };
	       } ] );
