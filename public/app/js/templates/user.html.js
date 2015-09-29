'use strict';
angular.module( 'portailApp' )
  .run( [ '$templateCache',
    function( $templateCache ) {
      $templateCache.put( 'views/user.html',
                          '<div class="row user-profil">    <header>	<h3>Profil utilisateur</h3>	<h1 data-ng-cloak>{{current_user.prenom}} {{current_user.nom}}</h1>	<h2 data-ng-cloak>{{current_user.profil_actif.etablissement}}</h2>	<h2 data-ng-cloak>{{current_user.profil_actif.nom}}</h2>    </header>    <div class="form">	<accordion close-others="false">	    <accordion-group data-is-open="groups[ 0 ].ouvert" data-ng-if="groups[ 0 ].enabled">		<accordion-heading>			<span class="glyphicon" ng-class="{\'glyphicon-chevron-down\': groups[ 0 ].ouvert, \'glyphicon-chevron-right\': !groups[ 0 ].ouvert}"></span> Informations		</accordion-heading>		<div class="row">			<div class="avatar"				data-ng-class="{\'operation-on-avatar whirl bar\': operation_on_avatar}"				data-flow-init				data-flow-file-added="new_avatar( $file )">				<div flow-drop					flow-drag-enter="style={background: \'green\'}"					flow-drag-leave="style={}"					data-ng-style="style"					data-ng-class="{ \'reset\': current_user.reset_avatar }">					<img draggable="false" class="svg" data-ng-src="{{current_user.avatar}}" data-ng-if="!$flow.files.length" />					<img draggable="false" flow-img="$flow.files[0]" data-ng-if="$flow.files.length" />					<br>					<button class="btn btn-default" flow-btn>changer de photo</button>				</div>				<!-- <button class="btn btn-default" data-ng-click="reset_avatar()">supprimer</button> -->			</div>			<div class="form-group">				<label>Nom :</label>				<input type="text" class="form-control"					data-ng-disabled="!current_user.editable"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.nom">			</div>			<div class="form-group">				<label>Prénom :</label>				<input type="text" class="form-control"					data-ng-disabled="!current_user.editable"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.prenom">			</div>			<div class="form-group">				<label>Date de naissance :</label>				<span dropdown class="dropdown form-control date-naissance">					<a dropdown-toggle class="dropdown-toggle" role="button" data-toggle="dropdown" data-target="#" href="" data-ng-cloak>{{current_user.date_naissance | amDateFormat: \'LL\'}}</a>					<div dropdown-menu class="dropdown-menu" role="menu" ng-click="$event.stopPropagation()">						<datepicker datepicker-options="datepicker_options"							data-ng-disabled="!current_user.editable"							data-ng-change="mark_as_dirty()"							data-ng-model="current_user.date_naissance"							data-ng-required="true"></datepicker>					</div>				</span>			</div>			<div class="form-group">				<label>Adresse :</label>				<input type="text" class="form-control"					data-ng-disabled="!current_user.editable"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.adresse">			</div>			<div class="form-group">				<label>Code postal :</label>				<input type="text" class="form-control"					data-ng-disabled="!current_user.editable"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.code_postal">			</div>			<div class="form-group">				<label>Ville :</label>				<input type="text" class="form-control"					data-ng-disabled="!current_user.editable"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.ville">			</div>			<div class="form-group">				<label>Courriel principal :</label>				<input type="text" class="form-control"					data-ng-disabled="true"					data-ng-change="mark_as_dirty()"					data-ng-model="current_user.info.MailAdressePrincipal">			</div>		</div>	    </accordion-group>	    <accordion-group data-is-open="groups[ 1 ].ouvert" data-ng-if="groups[ 1 ].enabled && password.changeable">		    <accordion-heading>			    <span class="glyphicon" ng-class="{\'glyphicon-chevron-down\': groups[ 1 ].ouvert, \'glyphicon-chevron-right\': !groups[ 1 ].ouvert}"></span> Mot de passe		    </accordion-heading>		    <div class="row">			    <div class="form-group">				    <label for="oldpasswd">Ancien mot de passe :</label>				    <input type="password" class="form-control" id="oldpasswd"					    data-ng-model="password.old">			    </div>			    <div class="form-group">				    <label for="newpasswd1">Nouveau mot de passe :</label>				    <input type="password" class="form-control" id="newpasswd1"					    data-ng-model="password.new1">			    </div>			    <div class="form-group">				    <label for="newpasswd2">Confirmer le nouveau mot de passe :</label>				    <input type="password" class="form-control" id="newpasswd2"					    data-ng-model="password.new2">			    </div>		    </div>	    </accordion-group>	    <accordion-group data-is-open="groups[ 2 ].ouvert" data-ng-if="groups[ 2 ].enabled">		    <accordion-heading>			    <span class="glyphicon" ng-class="{\'glyphicon-chevron-down\': groups[ 2 ].ouvert, \'glyphicon-chevron-right\': !groups[ 2 ].ouvert}"></span> droits		    </accordion-heading>		    <p>The body of the accordion group grows to fit the contents</p>	    </accordion-group>	    <accordion-group data-is-open="groups[ 3 ].ouvert" data-ng-if="groups[ 3 ].enabled">		    <accordion-heading>			    <span class="glyphicon" ng-class="{\'glyphicon-chevron-down\': groups[ 3 ].ouvert, \'glyphicon-chevron-right\': !groups[ 3 ].ouvert}"></span> statistiques		    </accordion-heading>		    <p>The body of the accordion group grows to fit the contents</p>	    </accordion-group>	</accordion>    </div>    <footer>	    <button data-ng-click="fermer( false )">Annuler</button>	    <button data-ng-click="fermer( true )">Enregistrer</button>    </footer></div>' );     } ] );