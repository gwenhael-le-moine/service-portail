# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Api
      module Log
        def self.registered( app )
          app.get "#{APP_PATH}/api/log/?" do
            params[:askeruid] = user[:uid]

            Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_logs, '', params ).to_json
          end

          app.get "#{APP_PATH}/api/log/stats/?" do
            params['uid'] = user[:uid]

            Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_v2_logs, 'stats', params ).to_json
          end
        end
      end
    end
  end
end
