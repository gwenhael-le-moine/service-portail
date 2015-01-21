'use strict';

angular.module( 'portailApp' )
    .controller( 'TrombinoscopeCtrl',
		 [ '$scope', '$state', 'currentUser', 'UserRegroupements', 'COULEURS',
		   function( $scope, $state, currentUser, UserRegroupements, COULEURS ) {
		       var randomize_colors = function( ary, couleurs ) {
			   _(ary).each( function( item ) {
			       item.color = couleurs[ _.random( 0, couleurs.length - 1 ) ];
			   } );
		       };

		       currentUser.regroupements().then( function ( response ) {
			   $scope.mes_regroupements = response;
			   randomize_colors( $scope.mes_regroupements, COULEURS );

			   $scope.showElevesRegroupement = function( regroupement ){
			       $scope.regroupement = regroupement;
			       UserRegroupements.get( { id: regroupement.cls_id } ).$promise
				   .then( function( response ) {
				       $scope.eleves = response;
				       randomize_colors( $scope.eleves, COULEURS );
				   } );
			   };

			   $scope.retour = function() {
			       $scope.eleves = undefined;
			       $scope.regroupement = undefined;
			   };
		       });
		   }
		 ]
	       );
