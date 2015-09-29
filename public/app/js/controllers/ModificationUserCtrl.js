'use strict';

angular.module( 'portailApp' )
    .controller( 'ModificationUserCtrl',
		 [ '$scope', '$state', '$q', 'toastr', 'current_user', 'currentUser', 'apps', 'APP_PATH',
		   function( $scope, $state, $q, toastr, current_user, currentUser, apps, APP_PATH ) {
		       var dirty = false;

		       $scope.prefix = APP_PATH;
		       $scope.groups = [ { ouvert: true,
					   enabled: true },
					 { ouvert: true,
					   enabled: true },
					 { ouvert: false,
					   enabled: false },
					 { ouvert: false,
					   enabled: false } ];

		       $scope.operation_on_avatar = false;

		       $scope.open_datepicker = function( $event ) {
			   $event.preventDefault();
			   $event.stopPropagation();

			   $scope.opened = true;
		       };

		       $scope.password = { old: '',
					   new1: '',
					   new2: '',
					   changeable: false };

		       $scope.mark_as_dirty = function() {
			   dirty = true;
		       };

		       apps.query( false )
			   .then( function( response ) {
			       $scope.password.changeable = _.chain(response).find({application_id: 'TELESRV'}).isUndefined().value();
			   } );
		       $scope.uploaded_avatar = null;

		       $scope.current_user = current_user;
		       $scope.apply_reset_avatar = false;
		       $scope.current_user.editable = _($scope.current_user.id_jointure_aaf).isNull();

		       $scope.current_user.date_naissance = new Date( $scope.current_user.date_naissance );

		       $scope.new_avatar = function( flowFile ) {
			   $scope.apply_reset_avatar = false;
			   $scope.current_user.new_avatar = flowFile.file;
			   $scope.uploaded_avatar = flowFile.file;
			   $scope.mark_as_dirty();
		       };

		       $scope.reset_avatar = function() {
			   $scope.apply_reset_avatar = true;
		       };

		       $scope.check_password = function( password ) {
			   currentUser.check_password( password ).then( function( response ) {
			       return response.valid;
			   } );
		       };

		       $scope.fermer = function( sauvegarder ) {
			   if ( sauvegarder && dirty ) {
			       var password_confirmed = true;
			       if ( !_($scope.password.old).isEmpty() && !_($scope.password.new1).isEmpty() ) {
				   if ( $scope.password.new1 == $scope.password.new2 ) {
				       $scope.current_user.previous_password = $scope.password.old;
				       $scope.current_user.new_password = $scope.password.new1;
				   } else {
				       password_confirmed = false;
				       toastr.error( 'Confirmation de mot de passe incorrecte.',
						     'Erreur',
						     { timeout: 100000 } );
				   }
			       }

			       if ( password_confirmed ) {
				   $scope.current_user.$update().then( function() {
				       currentUser.reset_cache();

				       if ( !_($scope.uploaded_avatar).isNull() &&
					    $scope.uploaded_avatar.type != "" &&
					    !_($scope.uploaded_avatar.type.match( "image/.*" )).isNull() ) {
					   $scope.operation_on_avatar = true;
					   currentUser.avatar.upload( $scope.uploaded_avatar )
					       .then( function( response ) {
						   $scope.operation_on_avatar = false;
						   currentUser.reset_cache();
						   $state.go( 'portail.logged' );
						   $state.reload();
					       } );
				       } else if ( $scope.apply_reset_avatar ) {
					   $scope.operation_on_avatar = true;
					   currentUser.avatar.delete()
					       .then( function( response ) {
						   $scope.operation_on_avatar = false;
						   currentUser.reset_cache();
						   $state.go( 'portail.logged' );
						   $state.reload();
					       } );
				       } else {
					   currentUser.reset_cache();
					   $state.go( 'portail.logged' );
					   $state.reload();
				       }
				   } );
			       }
			   } else {
			       $state.go( 'portail.logged' );
			   }
		       };
		   } ] );
