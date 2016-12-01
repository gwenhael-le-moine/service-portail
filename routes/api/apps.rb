# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module Apps
        def self.registered( app )
          #
          # Service liste des applications
          #

          # app.get "#{APP_PATH}/api/apps/:id" do
          #   content_type :json
          #   param :id, Integer, required: true

          #   json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", {} )
          # end

          # app.post "#{APP_PATH}/api/apps/?" do
          #   content_type :json
          #   param :index, Integer, required: true
          #   param :type, String, required: true, in: %w(INTERNAL EXTERNAL)
          #   param :active, TrueClass, required: false
          #   param :application_id, String, required: false
          #   param :color, String, required: false
          #   param :description, String, required: false
          #   param :icon, String, required: false
          #   param :libelle, String, required: false
          #   param :url, String, required: false

          #   params.delete('splat')
          #   params.delete('captures')

          #   params['etab_code_uai'] = user[:user_detailed]['profil_actif']['etablissement_code_uai']
          #   json Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_entree, '', {}, params )
          # end

          # app.put "#{APP_PATH}/api/apps/:id" do
          #   content_type :json
          #   param :id, Integer, required: true
          #   param :active, TrueClass, required: false
          #   param :color, String, required: false
          #   param :description, String, required: false
          #   param :icon, String, required: false
          #   param :index, Integer, required: false
          #   param :libelle, String, required: false
          #   param :url, String, required: false

          #   params.delete('splat')
          #   params.delete('captures')

          #   json Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", params )
          # end

          # app.delete "#{APP_PATH}/api/apps/:id" do
          #   content_type :json
          #   param :id, Integer, required: true

          #   params.delete('splat')
          #   params.delete('captures')

          #   json Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_portail_entree, "/#{params[:id]}", {} )
          # end
        end
      end
    end
  end
end
