# encoding: utf-8
# -*- coding: utf-8 -*-

require 'base64'
require 'cgi'
require 'openssl'

require 'laclasse/cross_app/sender'

require_relative '../config/options'
require_relative './utils'

# Module d'interfaçage avec l'annuaire
# Ce module s'appuye sur la gem de signature et de communicationavec l'annuaire.
#
module AnnuaireWrapper
  # fonctions relatives au profil utilisateur
  module User
    module_function

    # Service Utilisateur : init de la session et de son environnement
    def get( uid )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_user, uid.to_s, 'expand' => 'true' )
    end

    def check_password( login, password )
      correct = false
      begin
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_sso,
                                                        '',
                                                        login: login,
                                                        password: password )

        correct = true
      rescue RuntimeError
        LOGGER.info 'Wrong password'
      end

      correct
    end

    # Modification des données de l'utilisateur connecté
    def put( uid, params )
      params = normalize( params )
      Laclasse::CrossApp::Sender.put_request_signed(:service_annuaire_user, uid.to_s, params )
    end

    # Modification du profil actif de l'utilisateur connecté
    def put_profil_actif( uid, profil_id, code_uai )
      Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_user,
                                                     "#{uid}/profil_actif",
                                                     uai: code_uai,
                                                     profil_id: profil_id )
    end

    module Ressources
      module_function

      # Service Utilisateur : récupération des ressources numériques de l'utilisateur
      def query( uid )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_user, "#{uid}/ressources", 'expand' => 'true' )
      end
    end

    module Regroupements
      module_function

      # Liste des regroupements de l'utilisateur connecté
      def query( uid )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_user, "#{uid}/regroupements", 'expand' => 'true' )
      end
    end

    module Avatar
      module_function

      # Modification avatar
      def update( uid, image )
        [] if image.empty?

        new_filename = "#{image[:tempfile].path}_#{image[:filename]}"
        File.rename image[:tempfile], new_filename

        response = Laclasse::CrossApp::Sender.post_raw_request_signed( :service_annuaire_user, "#{uid}/upload/avatar",
                                                                       {},
                                                                       image: File.open( new_filename ) )

        File.delete new_filename

        response
      end

      # Suppression avatar
      def delete( uid )
        Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_user, "#{uid}/avatar", {} )
      end
    end

    # Generate signed user's news url
    module News
      module_function

      def query( uid )
        Laclasse::CrossApp::Sender.sign( :service_annuaire_portail_news, '/' + uid, {} )
      end
    end

    # Emails
    module Emails
      module_function

      def query( uid )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_user, "#{uid}/emails/", {} )
      end

      def new( uid, params )
        params = normalize( params )
        Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_user, "#{uid}/emails", params )
      end

      def update( uid, id, params )
        params = normalize( params )
        Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_user, "#{uid}/emails/#{id}", {}, params )
      end

      def delete( uid, id )
        Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_user, "#{uid}/emails/#{id}", {} )
      end
    end
  end

  # fonctions relatives à l'établissement
  module Etablissement
    module_function

    # Liste des personnels d'un etablissement
    def get( uai )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_personnel, uai.to_s, 'expand' => 'true' )
    end

    # Liste des regroupements d'un établissement
    def get_regroupements( uai )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_personnel, "#{uai}/users", 'expand' => 'true' )
    end

    # detail d'un regroupement
    def regroupement_detail( uid )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_regroupement, uid.to_s, 'expand' => 'true' )
    end

    # Module d'interfaçage Annuaire relatif aux flux RSS affichés sur le portail
    module Flux
      module_function

      def query_etablissement( uai )
        Laclasse::CrossApp::Sender.send_request_signed :service_annuaire_portail_flux, "/etablissement/#{uai}", {}
      end

      def get( id )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_flux, "/#{id}", {} )
      end

      def create( uai, definition )
        definition[ 'etab_code_uai' ] = uai
        Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_flux, '', {}, definition )
      end

      def update( id, definition )
        definition.delete( 'splat' ) # WTF
        definition.delete( 'captures' ) # WTF
        Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_flux, "/#{id}", definition )
      end

      def delete( id )
        Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_portail_flux, "/#{id}", {} )
      end
    end

    # Module d'interfaçage Annuaire relatif aux applications affichées sur le portail
    module Apps
      module_function

      # Liste des apps d'un établissement
      def query_etablissement( uai )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, "/etablissement/#{uai}", {} )
      end

      def get( id )
        Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, "/#{id}", {} )
      end

      def create( uai, definition )
        definition[ 'etab_code_uai' ] = uai
        Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_entree, '', {}, definition )
      end

      def update( id, definition )
        definition.delete( 'splat' ) # WTF
        definition.delete( 'captures' ) # WTF
        Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_entree, "/#{id}", definition )
      end

      def delete( id )
        Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_portail_entree, "/#{id}", {} )
      end
    end
  end

  # Module d'interfaçage Annuaire relatif aux applications affichées sur le portail
  module Apps
    module_function

    def query_defaults
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, '/applications', {} )
    end
  end

  module Log
    module_function

    def add( entry )
      Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_v2_logs, '', entry, {} )
    end

    def query( params )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_logs, '', params )
    end

    def stats( params )
      Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_logs, '/stats', params )
    end
  end
end
