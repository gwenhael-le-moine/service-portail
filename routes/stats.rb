# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Stats
      def self.registered( app )
        app.get '/stats/?' do
          halt 401, 'Accès interdit' unless user_is_admin?

          erb :stats, layout: false
        end
      end
    end
  end
end
