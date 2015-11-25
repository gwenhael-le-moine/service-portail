# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Stats
      def self.registered( app )
        app.get "#{APP_PATH}/stats/?" do
          erb :stats, layout: false
        end
      end
    end
  end
end
