# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module Flux
        def self.registered( app )
          #
          # Service liste des applications
          #
          app.get "#{APP_PATH}/api/flux/?" do
            content_type :json

            return [] unless logged?

            fluxes = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_flux, "/etablissement/#{user[:user_detailed]['profil_actif']['etablissement_code_uai']}", {} )

            if fluxes.empty? || fluxes.nil?
              fluxes = config[:news_feed]
              fluxes.each do |flux|
                flux[:default] = true
              end
            end

            json fluxes
          end

          app.get "#{APP_PATH}/api/flux/:id" do
            content_type :json
            param :id, Integer, required: true

            return [] unless logged?

            json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_flux, "/#{params[:id]}", {} )
          end

          app.post "#{APP_PATH}/api/flux/?" do
            content_type :json
            param :nb, Integer, required: true
            param :icon, String, required: true
            param :flux, String, required: true
            param :title, String, required: true

            params['etab_code_uai'] = user[:user_detailed]['profil_actif']['etablissement_code_uai']
            json Laclasse::CrossApp::Sender.post_request_signed( :service_annuaire_portail_flux, '', {}, params )
          end

          app.put "#{APP_PATH}/api/flux/:id" do
            content_type :json
            param :id, Integer, required: true
            param :nb, Integer, required: true
            param :icon, String, required: true
            param :flux, String, required: true
            param :title, String, required: true

            json Laclasse::CrossApp::Sender.put_request_signed( :service_annuaire_portail_flux, "/#{params[:id]}", params )
          end

          app.delete "#{APP_PATH}/api/flux/:id" do
            content_type :json
            param :id, Integer, required: true

            json Laclasse::CrossApp::Sender.delete_request_signed( :service_annuaire_portail_flux, "/#{params[:id]}", {} )
          end
        end
      end
    end
  end
end
