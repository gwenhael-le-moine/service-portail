# -*- coding: utf-8 -*-

require 'rss'

require_relative '../../lib/utils'

module Portail
  module Routes
    module Api
      module News
        def self.registered( app )
          #
          # Agrégateur RSS
          #
          app.get "#{APP_PATH}/api/news/?" do
            content_type :json, charset: 'utf-8'

            news = []

            fluxes = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_flux, "/etablissement/#{user[:user_detailed]['profil_actif']['etablissement_code_uai']}", {} ) unless user[:user_detailed]['profil_actif'].nil?
            fluxes = config[:news_feed] if fluxes.nil? || fluxes.empty?

            # Add user news
            fluxes << { nb: 5,
                        icon: '',
                        flux: Laclasse::CrossApp::Sender.sign( :service_annuaire_portail_news, "/#{user[:uid]}", {} ),
                        title: 'News de l\'utilisateur' }

            fluxes.each do |feed|
              feed = Hash[ feed.map { |k, v| [k.to_sym, v] } ]
              begin
                parsed_feed = RSS::Parser.parse( feed[:flux], false )

                news << parsed_feed
                          .items
                          .sort_by { |article| Portail::Utils::RSS.date( article ) }
                          .reverse
                          .first( feed[:nb] )
                          .map { |article| Portail::Utils::RSS.rationalize( article ) }

              rescue => e
                LOGGER.debug e.message
                LOGGER.error e.backtrace
                LOGGER.warn "impossible d'ouvrir #{feed[:flux]}"
              end
            end

            json news
                   .flatten
                   .uniq { |article| article[:content] }
          end
        end
      end
    end
  end
end
