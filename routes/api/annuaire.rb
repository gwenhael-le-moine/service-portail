# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module Annuaire
        def self.registered( app )
          app.get "#{APP_PATH}/api/annuaire/profils/?" do
            json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_profils, '', {} )
          end

          app.get "#{APP_PATH}/api/annuaire/etablissements/?" do
            json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_etablissement, '', {} )
          end

          app.get "#{APP_PATH}/api/annuaire/applications/?" do
            json Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_entree, '/applications', {} )
          end
        end
      end
    end
  end
end
